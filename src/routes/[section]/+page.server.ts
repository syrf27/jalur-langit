import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/server/db';

const fallbackActivities = [
	{ id: 'subuh', name: 'Shalat Subuh', category: 'Shalat wajib' },
	{ id: 'dzuhur', name: 'Shalat Dzuhur', category: 'Shalat wajib' },
	{ id: 'ashar', name: 'Shalat Ashar', category: 'Shalat wajib' },
	{ id: 'maghrib', name: 'Shalat Maghrib', category: 'Shalat wajib' },
	{ id: 'isya', name: 'Shalat Isya', category: 'Shalat wajib' },
	{ id: 'quran', name: 'Membaca Al-Qur’an', category: 'Al-Qur’an' }
];

export const load: PageServerLoad = async ({ params }) => {
	const section = params.section;
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
	const nextMonthStart = new Date(year, month + 1, 1).toISOString().slice(0, 10);
	if (section === 'calendar' || section === 'analytics') {
		const { data, error } = await supabase
			.from('ibadah_logs')
			.select('activity_date,status,activity:ibadah_activities(name,category:ibadah_categories(name))')
			.gte('activity_date', monthStart)
			.lt('activity_date', nextMonthStart);
		const logs = error ? [] : data ?? [];
		const completedLogs = logs.filter((log) => log.status === 'completed');
		const byDate = logs.reduce<Record<string, number>>((acc, log) => {
			if (log.status === 'completed') acc[log.activity_date] = (acc[log.activity_date] ?? 0) + 1;
			return acc;
		}, {});
		const byCategory = completedLogs.reduce<Record<string, number>>((acc, log) => {
			const activity = Array.isArray(log.activity) ? log.activity[0] : log.activity;
			const category = activity && typeof activity === 'object' && 'category' in activity ? activity.category : null;
			const categoryRecord = category as { name?: string } | { name?: string }[] | null;
			const name = Array.isArray(categoryRecord) ? categoryRecord[0]?.name ?? 'Other' : categoryRecord?.name ?? 'Other';
			acc[String(name)] = (acc[String(name)] ?? 0) + 1;
			return acc;
		}, {});
		return { section, dbReady: !error, year, month: month + 1, byDate, completedCount: completedLogs.length, recordedDays: Object.keys(byDate).length, byCategory };
	}
	if (section === 'ibadah-tracker') {
		const [{ data, error }, { data: categories }] = await Promise.all([
			supabase.from('ibadah_activities').select('id,name,category:ibadah_categories(name)').eq('is_active', true).order('sort_order'),
			supabase.from('ibadah_categories').select('id,name').order('sort_order')
		]);
		return { section, dbReady: !error, activities: error ? fallbackActivities : data, categories: categories ?? [] };
	}
	if (section === 'my-hajat') {
		const { data, error } = await supabase.from('hajats').select('id,title,description,category,status,target_date,created_at').order('created_at', { ascending: false });
		return { section, dbReady: !error, hajats: error ? [] : data };
	}
	if (section === 'journal') {
		const { data, error } = await supabase.from('journal_entries').select('id,title,content,category,mood,is_pinned,entry_date,updated_at').order('entry_date', { ascending: false });
		return { section, dbReady: !error, entries: error ? [] : data };
	}
	return { section, dbReady: true, activities: [], hajats: [], entries: [] };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const intent = String(form.get('intent') ?? '');
		if (params.section === 'my-hajat' && intent === 'create-hajat') {
			const title = String(form.get('title') ?? '').trim();
			if (!title) return { success: false, error: 'Title is required.' };
			const { error } = await supabase.from('hajats').insert({ title, description: String(form.get('description') ?? ''), category: String(form.get('category') ?? 'Pribadi'), status: 'active', target_date: form.get('target_date') || null });
			return error ? { success: false, error: error.code === '42501' ? 'Supabase rejected the write because SUPABASE_SERVICE_ROLE_KEY is not configured.' : error.message } : { success: true };
		}
		if (params.section === 'ibadah-tracker' && intent === 'create-activity') {
			const name = String(form.get('name') ?? '').trim();
			const categoryId = String(form.get('category_id') ?? '');
			if (!name || !categoryId) return { success: false, error: 'Activity name and category are required.' };
			const { error } = await supabase.from('ibadah_activities').insert({ name, category_id: categoryId, sort_order: 99, is_active: true });
			return error ? { success: false, error: error.code === '42501' ? 'Supabase rejected the write because SUPABASE_SERVICE_ROLE_KEY is not configured.' : error.message } : { success: true };
		}
		if (params.section === 'journal' && intent === 'create-journal') {
			const title = String(form.get('title') ?? '').trim();
			if (!title) return { success: false, error: 'Title is required.' };
			const { error } = await supabase.from('journal_entries').insert({ title, content: String(form.get('content') ?? ''), category: String(form.get('category') ?? 'Daily Reflection'), mood: String(form.get('mood') ?? ''), entry_date: String(form.get('entry_date') || new Date().toISOString().slice(0, 10)) });
			return error ? { success: false, error: error.code === '42501' ? 'Supabase rejected the write because SUPABASE_SERVICE_ROLE_KEY is not configured.' : error.message } : { success: true };
		}
		return { success: false, error: 'Unsupported action.' };
	}
};
