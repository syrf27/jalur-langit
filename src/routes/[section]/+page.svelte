<script lang="ts">
	import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, Heart, LineChart, NotebookPen, Plus, Settings, Sparkles, Target } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showActivityForm = $state(false);
	let checkedActivities = $state<Record<string, boolean>>({});
	const meta: Record<string, { title: string; eyebrow: string; description: string; icon: typeof CalendarDays }> = {
		'ibadah-tracker': { title: 'Ibadah tracker', eyebrow: 'Your practice', description: 'Catat ibadah harian dengan tenang dan lihat konsistensimu dari waktu ke waktu.', icon: Check },
		calendar: { title: 'Calendar', eyebrow: 'Look back gently', description: 'Satu tempat untuk melihat ritme ibadah, journaling, dan perjalananmu.', icon: CalendarDays },
		'my-hajat': { title: 'My hajat', eyebrow: 'Keep hope close', description: 'Dokumentasikan doa, harapan, dan langkah kecil yang sedang kamu usahakan.', icon: Heart },
		journal: { title: 'Journal', eyebrow: 'Make space', description: 'Tulis refleksi pribadi dan simpan momen yang ingin kamu ingat.', icon: NotebookPen },
		analytics: { title: 'Analytics', eyebrow: 'Reflect, don’t judge', description: 'Gunakan data sebagai cermin untuk memahami pola, bukan sebagai penilaian.', icon: LineChart },
		settings: { title: 'Settings', eyebrow: 'Your preferences', description: 'Atur tampilan, aktivitas, dan pengelolaan data Jalur Langit.', icon: Settings }
	};
	const section = $derived(meta[data.section] ?? meta.calendar);
	const isTracker = $derived(data.section === 'ibadah-tracker');
	const isCalendar = $derived(data.section === 'calendar');
	const isAnalytics = $derived(data.section === 'analytics');
	const isHajat = $derived(data.section === 'my-hajat');
	const isJournal = $derived(data.section === 'journal');
	const activities = $derived(data.activities ?? []);
	const categories = $derived(data.categories ?? []);
	const hajats = $derived(data.hajats ?? []);
	const entries = $derived(data.entries ?? []);
	const byDate = $derived(data.byDate ?? {});
	const calendarDays = $derived.by(() => {
		if (!data.year || !data.month) return [] as Array<number | null>;
		const total = new Date(data.year, data.month, 0).getDate();
		const firstDay = new Date(data.year, data.month - 1, 1).getDay();
		return [...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null), ...Array.from({ length: total }, (_, index) => index + 1)];
	});
	const monthLabel = $derived(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(data.year ?? 2026, (data.month ?? 11) - 1, 1)));
	function categoryName(category: unknown): string {
		if (typeof category === 'string') return category;
		if (Array.isArray(category)) {
			const first = category[0];
			return first && typeof first === 'object' && 'name' in first ? String(first.name) : 'Ibadah';
		}
		return category && typeof category === 'object' && 'name' in category ? String(category.name) : 'Ibadah';
	}
	function toggleActivity(id: string) {
		checkedActivities = { ...checkedActivities, [id]: !checkedActivities[id] };
	}
	onMount(() => {
		const stored = localStorage.getItem('jalur-langit-tracker');
		if (stored) {
			try { checkedActivities = JSON.parse(stored) as Record<string, boolean>; } catch { localStorage.removeItem('jalur-langit-tracker'); }
		}
	});
	$effect(() => {
		if (typeof window !== 'undefined' && isTracker) localStorage.setItem('jalur-langit-tracker', JSON.stringify(checkedActivities));
	});
</script>

<svelte:head><title>{section.title} · Jalur Langit</title></svelte:head>
<div class="module-page">
	<div class="module-top"><a href="/" class="back-link"><ArrowLeft size={16} /> Back to dashboard</a><div class="module-logo"><Sparkles size={15} /> Jalur Langit</div></div>
	<section class="module-hero"><div class="module-icon"><section.icon size={24} /></div><p class="eyebrow">{section.eyebrow}</p><h1>{section.title}</h1><p>{section.description}</p></section>
	{#if isTracker}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">November 2026</p><h2>Daily tracker</h2></div><button class="text-button" onclick={() => (showActivityForm = !showActivityForm)}><Plus size={15} /> Add activity</button></div>{#if form?.error}<div class="notice error">{form.error}</div>{/if}{#if form?.success}<div class="notice success">Activity saved.</div>{/if}{#if !data.dbReady}<div class="notice">Showing starter activities. Apply the Supabase migration and configure the Supabase service-role key to persist your tracker.</div>{/if}<div class="notice success tracker-local-note">Checklist changes are saved on this device.</div>{#if showActivityForm}<form class="inline-create" method="POST" use:enhance><input type="hidden" name="intent" value="create-activity" /><input name="name" placeholder="Activity name" required /><select name="category_id" required><option value="">Choose category</option>{#each categories as category}<option value={category.id}>{category.name}</option>{/each}</select><button class="save-button" type="submit">Save</button></form>{/if}<div class="tracker-table"><div class="tracker-head"><span>Activity</span><span>Today</span><span>Goal</span></div>{#each activities as activity}<div class="tracker-row"><span><strong>{activity.name}</strong><small>{categoryName(activity.category)}</small></span><button class:checked={checkedActivities[String(activity.id)]} class="tracker-check" aria-label={`Complete ${activity.name}`} onclick={() => toggleActivity(String(activity.id))}>{#if checkedActivities[String(activity.id)]}<Check size={15} />{/if}</button><span class="tracker-goal">{checkedActivities[String(activity.id)] ? '1' : '0'} / 30 days</span></div>{/each}</div></section>
	{:else if isCalendar}
		<section class="workspace-panel panel calendar-workspace"><div class="section-heading"><div><p class="eyebrow">Activity history</p><h2>{monthLabel}</h2></div><div class="calendar-legend"><span><i class="heat low"></i> Quiet</span><span><i class="heat mid"></i> In rhythm</span><span><i class="heat high"></i> Full day</span></div></div>{#if !data.dbReady}<div class="notice">No activity logs are available yet. Complete activities after connecting your Supabase service-role key.</div>{/if}<div class="calendar-grid weekdays">{#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}<span>{day}</span>{/each}</div><div class="calendar-grid">{#each calendarDays as day}{#if day}<div class:has-log={Boolean(byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`])} class="calendar-day"><strong>{day}</strong>{#if byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`]}<small>{byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`]} done</small>{/if}</div>{:else}<div class="calendar-day empty"></div>{/if}{/each}</div><div class="calendar-summary"><div><strong>{data.recordedDays ?? 0}</strong><span>days with activity</span></div><div><strong>{data.completedCount ?? 0}</strong><span>completed this month</span></div><div><strong>{data.recordedDays ? Math.round((data.recordedDays / (new Date().getDate())) * 100) : 0}%</strong><span>days in rhythm</span></div></div></section>
	{:else if isAnalytics}
		<section class="workspace-panel panel analytics-workspace"><div class="section-heading"><div><p class="eyebrow">Monthly reflection</p><h2>{monthLabel}</h2></div><span class="muted-label">Reflect, don’t judge</span></div><div class="analytics-stats"><div><span>Total completed</span><strong>{data.completedCount ?? 0}</strong><small>activity logs</small></div><div><span>Recorded days</span><strong>{data.recordedDays ?? 0}</strong><small>days this month</small></div><div><span>Consistency</span><strong>{data.recordedDays ? Math.round((data.recordedDays / new Date().getDate()) * 100) : 0}%</strong><small>of elapsed days</small></div></div>{#if !data.completedCount}<div class="empty-analytics"><LineChart size={24} /><strong>Your insights will appear here</strong><span>Complete a few activities and return to see your personal rhythm.</span></div>{:else}<div class="category-chart"><div class="section-heading"><div><p class="eyebrow">By category</p><h2>Where your energy went</h2></div></div>{#each Object.entries(data.byCategory ?? {}) as [category, count]}<div class="category-row"><span>{category}</span><div class="category-track"><i style={`width: ${Math.min(100, Number(count) * 10)}%`}></i></div><strong>{count}</strong></div>{/each}</div>{/if}</section>
	{:else if isHajat}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">Personal hopes</p><h2>My hajat</h2></div></div>{#if form?.error}<div class="notice error">{form.error}</div>{/if}{#if form?.success}<div class="notice success">Hajat saved. Keep it close and keep walking.</div>{/if}<form class="create-form" method="POST" use:enhance><input type="hidden" name="intent" value="create-hajat" /><label>Title<input name="title" placeholder="e.g. Mendapatkan pekerjaan yang baik" required /></label><label>Category<select name="category"><option>Pribadi</option><option>Keluarga</option><option>Karier</option><option>Pendidikan</option><option>Kesehatan</option><option>Akhirat</option></select></label><label>Description<textarea name="description" rows="3" placeholder="Tulis sedikit tentang hajat ini..."></textarea></label><label>Target date<input type="date" name="target_date" /></label><button class="save-button" type="submit"><Plus size={15} /> Save hajat</button></form><div class="records">{#if hajats.length === 0}<p class="empty-state">Belum ada hajat tersimpan. Mulai dengan menuliskan satu harapan.</p>{:else}{#each hajats as hajat}<article class="record-card"><span class="record-icon"><Heart size={16} /></span><div><strong>{hajat.title}</strong><small>{hajat.category ?? 'Pribadi'} · {hajat.status}</small>{#if hajat.description}<p>{hajat.description}</p>{/if}</div></article>{/each}{/if}</div></section>
	{:else if isJournal}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">Personal reflections</p><h2>Journal</h2></div></div>{#if form?.error}<div class="notice error">{form.error}</div>{/if}{#if form?.success}<div class="notice success">Reflection saved.</div>{/if}<form class="create-form" method="POST" use:enhance><input type="hidden" name="intent" value="create-journal" /><label>Title<input name="title" placeholder="What is on your heart today?" required /></label><div class="form-grid"><label>Category<select name="category"><option>Daily Reflection</option><option>Doa dan Harapan</option><option>Muhasabah</option><option>Gratitude</option><option>Personal Notes</option></select></label><label>Mood<input name="mood" placeholder="Calm, hopeful..." /></label></div><label>Entry<textarea name="content" rows="6" placeholder="Write freely..."></textarea></label><label>Date<input type="date" name="entry_date" /></label><button class="save-button" type="submit"><NotebookPen size={15} /> Save reflection</button></form><div class="records">{#if entries.length === 0}<p class="empty-state">Belum ada journal entry. Beri ruang untuk isi hati hari ini.</p>{:else}{#each entries as entry}<article class="record-card"><span class="record-icon sage"><BookOpen size={16} /></span><div><strong>{entry.title}</strong><small>{entry.category ?? 'Daily Reflection'} · {entry.entry_date}</small><p>{entry.content}</p></div></article>{/each}{/if}</div></section>
	{:else}
		<section class="module-grid">{#each ['Overview', 'This month', 'Activity insights'] as action, index}<a class="module-card" href={data.section === 'settings' ? '#settings' : '/ibadah-tracker'}><span class="module-card-icon">{#if index === 0}<Target size={18} />{:else if index === 1}<BookOpen size={18} />{:else}<ArrowUpRight size={18} />{/if}</span><span><strong>{action}</strong><small>Open this workspace</small></span><ArrowUpRight size={16} /></a>{/each}</section>
	{/if}
	<div class="coming-soon"><Sparkles size={15} /><span>Private by design · your journey stays behind the app password.</span></div>
</div>
