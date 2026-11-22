import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbErrorMessage, supabase } from '$lib/server/db';
import { todayIso } from '$lib/server/date';

type CategoryRef = { name: string | null } | { name: string | null }[] | null;

function shiftDate(iso: string, days: number) {
	const date = new Date(`${iso}T00:00:00`);
	date.setDate(date.getDate() + days);
	return todayIso(date);
}

export const load: PageServerLoad = async () => {
	const today = todayIso();
	const weekStart = shiftDate(today, -6);
	const previousWeekStart = shiftDate(today, -13);
	const [activitiesResult, categoriesResult, logsResult, hajatResult, journalResult] = await Promise.all([
		supabase
			.from('ibadah_activities')
			.select('id,name,category:ibadah_categories(name)')
			.eq('is_active', true)
			.order('sort_order'),
		supabase.from('ibadah_categories').select('id,name').order('sort_order'),
		supabase.from('ibadah_logs').select('activity_id,activity_date,status').gte('activity_date', previousWeekStart).lte('activity_date', today),
		supabase.from('hajats').select('id,title,category,status').order('created_at', { ascending: false }).limit(1),
		supabase.from('journal_entries').select('id,title,entry_date,category').order('entry_date', { ascending: false }).limit(1)
	]);
	const error = activitiesResult.error ?? categoriesResult.error ?? logsResult.error ?? hajatResult.error ?? journalResult.error;
	const logs = (logsResult.data ?? []) as { activity_id: string; activity_date: string; status: string }[];
	const weekly = Array.from({ length: 7 }, (_, index) => {
		const date = shiftDate(weekStart, index);
		const completed = logs.filter((log) => log.activity_date === date && log.status === 'completed').length;
		return { date, completed, previous: logs.filter((log) => log.activity_date === shiftDate(previousWeekStart, index) && log.status === 'completed').length };
	});
	return {
		dbReady: !error,
		dbError: error ? error.message : null,
		activities: (activitiesResult.data ?? []) as { id: string; name: string; category: CategoryRef }[],
		categories: (categoriesResult.data ?? []) as { id: string; name: string }[],
		completedToday: logs.filter((log) => log.activity_date === today && log.status === 'completed').map((log) => log.activity_id),
		weekly,
		weeklyCompleted: weekly.reduce((sum, day) => sum + day.completed, 0),
		previousWeeklyCompleted: weekly.reduce((sum, day) => sum + day.previous, 0),
		latestHajat: hajatResult.data?.[0] ?? null,
		latestJournal: journalResult.data?.[0] ?? null
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const intent = String(form.get('intent') ?? '');
		const text = (key: string) => String(form.get(key) ?? '').trim();

		if (intent === 'toggle-log') {
			const activityId = text('activity_id');
			const activityDate = text('date') || todayIso();
			const desiredStatus = text('status') || 'completed';
			if (!activityId) return fail(400, { success: false, error: 'Activity is required.' });
			const { error } = desiredStatus === 'completed'
				? await supabase.from('ibadah_logs').upsert({ activity_id: activityId, activity_date: activityDate, status: 'completed' }, { onConflict: 'activity_id,activity_date' })
				: await supabase.from('ibadah_logs').delete().eq('activity_id', activityId).eq('activity_date', activityDate);
			if (error) return fail(400, { success: false, error: dbErrorMessage(error) });
			return { success: true };
		}

		if (intent === 'create-activity') {
			const name = text('name');
			const categoryId = text('category_id');
			if (!name || !categoryId) return fail(400, { success: false, error: 'Habit name and category are required.' });
			const { error } = await supabase
				.from('ibadah_activities')
				.insert({ name, category_id: categoryId, sort_order: 99, is_active: true });
			if (error) return fail(400, { success: false, error: dbErrorMessage(error) });
			return { success: true };
		}

		return fail(400, { success: false, error: 'Unsupported action.' });
	}
};
