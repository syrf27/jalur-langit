<script lang="ts">
	import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, Heart, LineChart, NotebookPen, Pencil, Plus, Settings, Sparkles, Target, Trash2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import { defaultActivities, readActivities, readHajats, readJournals, writeActivities, writeHajats, writeJournals, type LocalActivity, type LocalHajat, type LocalJournal } from '$lib/client/storage';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showActivityForm = $state(false);
	let checkedActivities = $state<Record<string, boolean>>({});
	let localActivities = $state<LocalActivity[]>(defaultActivities);
	let localHajats = $state<LocalHajat[]>([]);
	let localJournals = $state<LocalJournal[]>([]);
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
	const activities = $derived(isTracker ? localActivities : (data.activities ?? []));
	const categories = $derived(data.categories ?? []);
	const hajats = $derived(localHajats);
	const entries = $derived(localJournals);
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
	function activityDone(activity: unknown): boolean { return Boolean(activity && typeof activity === 'object' && 'done' in activity && activity.done); }
	function toggleActivity(id: string) {
		checkedActivities = { ...checkedActivities, [id]: !checkedActivities[id] };
		localActivities = localActivities.map((activity) => activity.id === id ? { ...activity, done: !activity.done } : activity);
		writeActivities(localActivities);
	}
	onMount(() => {
		localActivities = readActivities();
		localHajats = readHajats();
		localJournals = readJournals();
		const stored = localStorage.getItem('jalur-langit-tracker');
		if (stored) {
			try { checkedActivities = JSON.parse(stored) as Record<string, boolean>; } catch { localStorage.removeItem('jalur-langit-tracker'); }
		}
	});
	$effect(() => {
		if (typeof window !== 'undefined' && isTracker) localStorage.setItem('jalur-langit-tracker', JSON.stringify(checkedActivities));
	});
	function addTrackerActivity(event: SubmitEvent) {
		event.preventDefault();
		const form = new FormData(event.currentTarget as HTMLFormElement);
		const name = String(form.get('name') ?? '').trim();
		const category = String(form.get('category') ?? 'Ibadah');
		if (!name) return;
		localActivities = [...localActivities, { id: crypto.randomUUID(), name, category, time: 'Anytime', done: false }];
		writeActivities(localActivities);
		showActivityForm = false;
	}
	function editActivity(id: string) { const current = localActivities.find((activity) => activity.id === id); const name = window.prompt('Activity name', current?.name); if (name?.trim()) { localActivities = localActivities.map((activity) => activity.id === id ? { ...activity, name: name.trim() } : activity); writeActivities(localActivities); } }
	function deleteActivity(id: string) { if (window.confirm('Delete this activity?')) { localActivities = localActivities.filter((activity) => activity.id !== id); writeActivities(localActivities); } }
	function addHajat(event: SubmitEvent) { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const title = String(form.get('title') ?? '').trim(); if (!title) return; const item = { id: crypto.randomUUID(), title, description: String(form.get('description') ?? ''), category: String(form.get('category') ?? 'Pribadi'), status: 'active', targetDate: String(form.get('target_date') ?? '') }; localHajats = [item, ...localHajats]; writeHajats(localHajats); (event.currentTarget as HTMLFormElement).reset(); }
	function editHajat(id: string) { const current = localHajats.find((item) => item.id === id); const title = window.prompt('Hajat title', current?.title); if (title?.trim()) { localHajats = localHajats.map((item) => item.id === id ? { ...item, title: title.trim() } : item); writeHajats(localHajats); } }
	function deleteHajat(id: string) { if (window.confirm('Delete this hajat?')) { localHajats = localHajats.filter((item) => item.id !== id); writeHajats(localHajats); } }
	function addJournal(event: SubmitEvent) { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const title = String(form.get('title') ?? '').trim(); if (!title) return; const item = { id: crypto.randomUUID(), title, content: String(form.get('content') ?? ''), category: String(form.get('category') ?? 'Daily Reflection'), mood: String(form.get('mood') ?? ''), entryDate: String(form.get('entry_date') || new Date().toISOString().slice(0, 10)) }; localJournals = [item, ...localJournals]; writeJournals(localJournals); (event.currentTarget as HTMLFormElement).reset(); }
	function editJournal(id: string) { const current = localJournals.find((item) => item.id === id); const title = window.prompt('Journal title', current?.title); if (title?.trim()) { localJournals = localJournals.map((item) => item.id === id ? { ...item, title: title.trim() } : item); writeJournals(localJournals); } }
	function deleteJournal(id: string) { if (window.confirm('Delete this journal entry?')) { localJournals = localJournals.filter((item) => item.id !== id); writeJournals(localJournals); } }
</script>

<svelte:head><title>{section.title} · Jalur Langit</title></svelte:head>
<div class="module-page">
	<div class="module-top"><a href="/" class="back-link"><ArrowLeft size={16} /> Back to dashboard</a><div class="module-logo"><Sparkles size={15} /> Jalur Langit</div></div>
	<section class="module-hero"><div class="module-icon"><section.icon size={24} /></div><p class="eyebrow">{section.eyebrow}</p><h1>{section.title}</h1><p>{section.description}</p></section>
	{#if isTracker}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">November 2026</p><h2>Daily tracker</h2></div><button class="text-button" onclick={() => (showActivityForm = !showActivityForm)}><Plus size={15} /> Add activity</button></div>{#if !data.dbReady}<div class="notice">Showing your local tracker. Cloud sync will activate after Supabase service-role setup.</div>{/if}<div class="notice success tracker-local-note">Checklist, edit, and delete changes are saved on this device.</div>{#if showActivityForm}<form class="inline-create" onsubmit={addTrackerActivity}><input name="name" placeholder="Activity name" required /><select name="category"><option>Shalat wajib</option><option>Shalat Sunnah</option><option>Al-Qur’an</option><option>Dzikir & doa</option><option>Amal kebaikan</option></select><button class="save-button" type="submit">Save</button></form>{/if}<div class="tracker-table"><div class="tracker-head"><span>Activity</span><span>Today</span><span>Goal</span></div>{#each activities as activity}<div class="tracker-row"><span><strong>{activity.name}</strong><small>{categoryName(activity.category)}</small></span><button class:checked={activityDone(activity) || checkedActivities[String(activity.id)]} class="tracker-check" aria-label={`Complete ${activity.name}`} onclick={() => toggleActivity(String(activity.id))}>{#if activityDone(activity) || checkedActivities[String(activity.id)]}<Check size={15} />{/if}</button><span class="tracker-goal">{activityDone(activity) || checkedActivities[String(activity.id)] ? '1' : '0'} / 30 days</span><span class="record-actions"><button aria-label="Edit activity" onclick={() => editActivity(String(activity.id))}><Pencil size={13} /></button><button aria-label="Delete activity" onclick={() => deleteActivity(String(activity.id))}><Trash2 size={13} /></button></span></div>{/each}</div></section>
	{:else if isCalendar}
		<section class="workspace-panel panel calendar-workspace"><div class="section-heading"><div><p class="eyebrow">Activity history</p><h2>{monthLabel}</h2></div><div class="calendar-legend"><span><i class="heat low"></i> Quiet</span><span><i class="heat mid"></i> In rhythm</span><span><i class="heat high"></i> Full day</span></div></div>{#if !data.dbReady}<div class="notice">No activity logs are available yet. Complete activities after connecting your Supabase service-role key.</div>{/if}<div class="calendar-grid weekdays">{#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}<span>{day}</span>{/each}</div><div class="calendar-grid">{#each calendarDays as day}{#if day}<div class:has-log={Boolean(byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`])} class="calendar-day"><strong>{day}</strong>{#if byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`]}<small>{byDate[`${data.year}-${String(data.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`]} done</small>{/if}</div>{:else}<div class="calendar-day empty"></div>{/if}{/each}</div><div class="calendar-summary"><div><strong>{data.recordedDays ?? 0}</strong><span>days with activity</span></div><div><strong>{data.completedCount ?? 0}</strong><span>completed this month</span></div><div><strong>{data.recordedDays ? Math.round((data.recordedDays / (new Date().getDate())) * 100) : 0}%</strong><span>days in rhythm</span></div></div></section>
	{:else if isAnalytics}
		<section class="workspace-panel panel analytics-workspace"><div class="section-heading"><div><p class="eyebrow">Monthly reflection</p><h2>{monthLabel}</h2></div><span class="muted-label">Reflect, don’t judge</span></div><div class="analytics-stats"><div><span>Total completed</span><strong>{data.completedCount ?? 0}</strong><small>activity logs</small></div><div><span>Recorded days</span><strong>{data.recordedDays ?? 0}</strong><small>days this month</small></div><div><span>Consistency</span><strong>{data.recordedDays ? Math.round((data.recordedDays / new Date().getDate()) * 100) : 0}%</strong><small>of elapsed days</small></div></div>{#if !data.completedCount}<div class="empty-analytics"><LineChart size={24} /><strong>Your insights will appear here</strong><span>Complete a few activities and return to see your personal rhythm.</span></div>{:else}<div class="category-chart"><div class="section-heading"><div><p class="eyebrow">By category</p><h2>Where your energy went</h2></div></div>{#each Object.entries(data.byCategory ?? {}) as [category, count]}<div class="category-row"><span>{category}</span><div class="category-track"><i style={`width: ${Math.min(100, Number(count) * 10)}%`}></i></div><strong>{count}</strong></div>{/each}</div>{/if}</section>
	{:else if isHajat}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">Personal hopes</p><h2>My hajat</h2></div></div><form class="create-form" onsubmit={addHajat}><label>Title<input name="title" placeholder="e.g. Mendapatkan pekerjaan yang baik" required /></label><label>Category<select name="category"><option>Pribadi</option><option>Keluarga</option><option>Karier</option><option>Pendidikan</option><option>Kesehatan</option><option>Akhirat</option></select></label><label>Description<textarea name="description" rows="3" placeholder="Tulis sedikit tentang hajat ini..."></textarea></label><label>Target date<input type="date" name="target_date" /></label><button class="save-button" type="submit"><Plus size={15} /> Save hajat</button></form><div class="records">{#if hajats.length === 0}<p class="empty-state">Belum ada hajat tersimpan. Mulai dengan menuliskan satu harapan.</p>{:else}{#each hajats as hajat}<article class="record-card"><span class="record-icon"><Heart size={16} /></span><div><strong>{hajat.title}</strong><small>{hajat.category} · {hajat.status}</small>{#if hajat.description}<p>{hajat.description}</p>{/if}</div><span class="record-actions"><button aria-label="Edit hajat" onclick={() => editHajat(hajat.id)}><Pencil size={13} /></button><button aria-label="Delete hajat" onclick={() => deleteHajat(hajat.id)}><Trash2 size={13} /></button></span></article>{/each}{/if}</div></section>
	{:else if isJournal}
		<section class="workspace-panel panel"><div class="section-heading"><div><p class="eyebrow">Personal reflections</p><h2>Journal</h2></div></div><form class="create-form" onsubmit={addJournal}><label>Title<input name="title" placeholder="What is on your heart today?" required /></label><div class="form-grid"><label>Category<select name="category"><option>Daily Reflection</option><option>Doa dan Harapan</option><option>Muhasabah</option><option>Gratitude</option><option>Personal Notes</option></select></label><label>Mood<input name="mood" placeholder="Calm, hopeful..." /></label></div><label>Entry<textarea name="content" rows="6" placeholder="Write freely..."></textarea></label><label>Date<input type="date" name="entry_date" /></label><button class="save-button" type="submit"><NotebookPen size={15} /> Save reflection</button></form><div class="records">{#if entries.length === 0}<p class="empty-state">Belum ada journal entry. Beri ruang untuk isi hati hari ini.</p>{:else}{#each entries as entry}<article class="record-card"><span class="record-icon sage"><BookOpen size={16} /></span><div><strong>{entry.title}</strong><small>{entry.category} · {entry.entryDate}</small><p>{entry.content}</p></div><span class="record-actions"><button aria-label="Edit journal" onclick={() => editJournal(entry.id)}><Pencil size={13} /></button><button aria-label="Delete journal" onclick={() => deleteJournal(entry.id)}><Trash2 size={13} /></button></span></article>{/each}{/if}</div></section>
	{:else}
		<section class="module-grid">{#each ['Overview', 'This month', 'Activity insights'] as action, index}<a class="module-card" href={data.section === 'settings' ? '#settings' : '/ibadah-tracker'}><span class="module-card-icon">{#if index === 0}<Target size={18} />{:else if index === 1}<BookOpen size={18} />{:else}<ArrowUpRight size={18} />{/if}</span><span><strong>{action}</strong><small>Open this workspace</small></span><ArrowUpRight size={16} /></a>{/each}</section>
	{/if}
	<div class="coming-soon"><Sparkles size={15} /><span>Private by design · your journey stays behind the app password.</span></div>
</div>
