import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbErrorMessage, supabase } from '$lib/server/db';
import { todayIso } from '$lib/server/date';

type CategoryRef = { name: string | null } | { name: string | null }[] | null;
type ActivityRow = { id: string; name: string; category: CategoryRef };
type CategoryRow = { id: string; name: string };
type LogRow = { activity_date: string; status: string; activity: { category: CategoryRef } | { category: CategoryRef }[] | null };
type HajatRow = {
	id: string;
	title: string;
	description: string | null;
	category: string | null;
	status: string | null;
	target_date: string | null;
};
type JournalRow = {
	id: string;
	title: string;
	content: string | null;
	category: string | null;
	mood: string | null;
	entry_date: string;
};

function writeFailed(error: { code?: string; message: string }) {
	return fail(400, { success: false, error: dbErrorMessage(error) });
}

export const load: PageServerLoad = async ({ params }) => {
	const section = params.section;
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
	const nextMonthStart = new Date(year, month + 1, 1).toISOString().slice(0, 10);

	const result = {
		section,
		dbReady: true,
		dbError: null as string | null,
		year,
		month: month + 1,
		byDate: {} as Record<string, number>,
		completedCount: 0,
		recordedDays: 0,
		byCategory: {} as Record<string, number>,
		activities: [] as ActivityRow[],
		categories: [] as CategoryRow[],
		completedToday: [] as string[],
		hajats: [] as HajatRow[],
		entries: [] as JournalRow[]
	};

	function markError(error: { message: string } | null) {
		if (!error) return;
		result.dbReady = false;
		result.dbError = error.message;
	}

	if (section === 'calendar' || section === 'analytics') {
		const { data, error } = await supabase
			.from('ibadah_logs')
			.select('activity_date,status,activity:ibadah_activities(name,category:ibadah_categories(name))')
			.gte('activity_date', monthStart)
			.lt('activity_date', nextMonthStart);
		markError(error);
		const logs = (data ?? []) as LogRow[];
		const completedLogs = logs.filter((log) => log.status === 'completed');
		result.byDate = logs.reduce<Record<string, number>>((acc, log) => {
			if (log.status === 'completed') acc[log.activity_date] = (acc[log.activity_date] ?? 0) + 1;
			return acc;
		}, {});
		result.byCategory = completedLogs.reduce<Record<string, number>>((acc, log) => {
			const activity = Array.isArray(log.activity) ? log.activity[0] : log.activity;
			const category = activity && typeof activity === 'object' && 'category' in activity ? activity.category : null;
			const categoryRecord = category as { name?: string } | { name?: string }[] | null;
			const name = Array.isArray(categoryRecord) ? categoryRecord[0]?.name ?? 'Other' : categoryRecord?.name ?? 'Other';
			acc[String(name)] = (acc[String(name)] ?? 0) + 1;
			return acc;
		}, {});
		result.completedCount = completedLogs.length;
		result.recordedDays = Object.keys(result.byDate).length;
	}

	if (section === 'ibadah-tracker') {
		const [activitiesResult, categoriesResult, logsResult] = await Promise.all([
			supabase.from('ibadah_activities').select('id,name,category:ibadah_categories(name)').eq('is_active', true).order('sort_order'),
			supabase.from('ibadah_categories').select('id,name').order('sort_order'),
			supabase
				.from('ibadah_logs')
				.select('activity_id')
				.eq('activity_date', todayIso())
				.eq('status', 'completed')
		]);
		markError(activitiesResult.error ?? categoriesResult.error ?? logsResult.error);
		result.activities = (activitiesResult.data ?? []) as ActivityRow[];
		result.categories = (categoriesResult.data ?? []) as CategoryRow[];
		result.completedToday = (logsResult.data ?? []).map((log: { activity_id: string }) => log.activity_id);
	}

	if (section === 'my-hajat') {
		const { data, error } = await supabase
			.from('hajats')
			.select('id,title,description,category,status,target_date,created_at')
			.order('created_at', { ascending: false });
		markError(error);
		result.hajats = (data ?? []) as HajatRow[];
	}

	if (section === 'journal') {
		const { data, error } = await supabase
			.from('journal_entries')
			.select('id,title,content,category,mood,is_pinned,entry_date,updated_at')
			.order('entry_date', { ascending: false });
		markError(error);
		result.entries = (data ?? []) as JournalRow[];
	}

	return result;
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const intent = String(form.get('intent') ?? '');
		const text = (key: string) => String(form.get(key) ?? '').trim();

		if (params.section === 'ibadah-tracker' && intent === 'toggle-log') {
			const activityId = text('activity_id');
			const activityDate = text('date') || todayIso();
			if (!activityId) return fail(400, { success: false, error: 'Activity is required.' });
			const { data: existing, error: readError } = await supabase
				.from('ibadah_logs')
				.select('id')
				.eq('activity_id', activityId)
				.eq('activity_date', activityDate)
				.maybeSingle();
			if (readError) return writeFailed(readError);
			const { error } = existing
				? await supabase.from('ibadah_logs').delete().eq('id', existing.id)
				: await supabase.from('ibadah_logs').insert({
						activity_id: activityId,
						activity_date: activityDate,
						status: 'completed'
					});
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'ibadah-tracker' && intent === 'create-activity') {
			const name = text('name');
			const categoryId = text('category_id');
			if (!name || !categoryId) return fail(400, { success: false, error: 'Activity name and category are required.' });
			const { error } = await supabase
				.from('ibadah_activities')
				.insert({ name, category_id: categoryId, sort_order: 99, is_active: true });
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'ibadah-tracker' && intent === 'update-activity') {
			const id = text('activity_id');
			const name = text('name');
			if (!id || !name) return fail(400, { success: false, error: 'Activity and name are required.' });
			const { error } = await supabase.from('ibadah_activities').update({ name }).eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'ibadah-tracker' && intent === 'delete-activity') {
			const id = text('activity_id');
			if (!id) return fail(400, { success: false, error: 'Activity is required.' });
			const { error } = await supabase.from('ibadah_activities').delete().eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'my-hajat' && intent === 'create-hajat') {
			const title = text('title');
			if (!title) return fail(400, { success: false, error: 'Title is required.' });
			const { error } = await supabase.from('hajats').insert({
				title,
				description: text('description'),
				category: text('category') || 'Pribadi',
				status: 'active',
				target_date: text('target_date') || null
			});
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'my-hajat' && intent === 'update-hajat') {
			const id = text('id');
			if (!id) return fail(400, { success: false, error: 'Hajat is required.' });
			const patch: Record<string, string | null> = {};
			if (form.has('title')) patch.title = text('title');
			if (form.has('description')) patch.description = text('description');
			if (form.has('category')) patch.category = text('category');
			if (form.has('status')) patch.status = text('status');
			if (form.has('target_date')) patch.target_date = text('target_date') || null;
			if (patch.title === '') return fail(400, { success: false, error: 'Title is required.' });
			if (Object.keys(patch).length === 0) return fail(400, { success: false, error: 'Nothing to update.' });
			const { error } = await supabase.from('hajats').update(patch).eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'my-hajat' && intent === 'delete-hajat') {
			const id = text('id');
			if (!id) return fail(400, { success: false, error: 'Hajat is required.' });
			const { error } = await supabase.from('hajats').delete().eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'journal' && intent === 'create-journal') {
			const title = text('title');
			if (!title) return fail(400, { success: false, error: 'Title is required.' });
			const { error } = await supabase.from('journal_entries').insert({
				title,
				content: text('content'),
				category: text('category') || 'Daily Reflection',
				mood: text('mood'),
				entry_date: text('entry_date') || todayIso()
			});
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'journal' && intent === 'update-journal') {
			const id = text('id');
			if (!id) return fail(400, { success: false, error: 'Journal entry is required.' });
			const patch: Record<string, string> = {};
			if (form.has('title')) patch.title = text('title');
			if (form.has('content')) patch.content = text('content');
			if (form.has('category')) patch.category = text('category');
			if (form.has('mood')) patch.mood = text('mood');
			if (form.has('entry_date')) patch.entry_date = text('entry_date');
			if (patch.title === '') return fail(400, { success: false, error: 'Title is required.' });
			if (Object.keys(patch).length === 0) return fail(400, { success: false, error: 'Nothing to update.' });
			const { error } = await supabase.from('journal_entries').update(patch).eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		if (params.section === 'journal' && intent === 'delete-journal') {
			const id = text('id');
			if (!id) return fail(400, { success: false, error: 'Journal entry is required.' });
			const { error } = await supabase.from('journal_entries').delete().eq('id', id);
			if (error) return writeFailed(error);
			return { success: true };
		}

		return fail(400, { success: false, error: 'Unsupported action.' });
	}
};
