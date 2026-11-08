import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbErrorMessage, supabase } from '$lib/server/db';
import { todayIso } from '$lib/server/date';

type CategoryRef = { name: string | null } | { name: string | null }[] | null;

export const load: PageServerLoad = async () => {
	const [activitiesResult, categoriesResult, logsResult] = await Promise.all([
		supabase
			.from('ibadah_activities')
			.select('id,name,category:ibadah_categories(name)')
			.eq('is_active', true)
			.order('sort_order'),
		supabase.from('ibadah_categories').select('id,name').order('sort_order'),
		supabase.from('ibadah_logs').select('activity_id').eq('activity_date', todayIso()).eq('status', 'completed')
	]);
	const error = activitiesResult.error ?? categoriesResult.error ?? logsResult.error;
	return {
		dbReady: !error,
		dbError: error ? error.message : null,
		activities: (activitiesResult.data ?? []) as { id: string; name: string; category: CategoryRef }[],
		categories: (categoriesResult.data ?? []) as { id: string; name: string }[],
		completedToday: ((logsResult.data ?? []) as { activity_id: string }[]).map((log) => log.activity_id)
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
			if (!activityId) return fail(400, { success: false, error: 'Activity is required.' });
			const { data: existing, error: readError } = await supabase
				.from('ibadah_logs')
				.select('id')
				.eq('activity_id', activityId)
				.eq('activity_date', activityDate)
				.maybeSingle();
			if (readError) return fail(400, { success: false, error: dbErrorMessage(readError) });
			const { error } = existing
				? await supabase.from('ibadah_logs').delete().eq('id', existing.id)
				: await supabase.from('ibadah_logs').insert({
						activity_id: activityId,
						activity_date: activityDate,
						status: 'completed'
					});
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
