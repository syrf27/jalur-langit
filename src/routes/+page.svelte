<script lang="ts">
	import { ArrowUpRight, CalendarDays, Check, ChevronRight, CircleHelp, Feather, Heart, Home, LineChart, LogOut, Menu, Moon, NotebookPen, Plus, Settings, Sparkles, Target, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { categoryName } from '$lib/utils';
	import type { ActionData, PageData } from './$types';

	type NavItem = { label: string; icon: typeof Home; active?: boolean };
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let menuOpen = $state(false);
	let showHabitForm = $state(false);
	let actionIntent = $state('');
	let actionFields = $state<Record<string, string>>({});
	let actionForm = $state<HTMLFormElement | null>(null);
	let activeFilter = $state('All');
	const navItems: NavItem[] = [
		{ label: 'Dashboard', icon: Home, active: true }, { label: 'Ibadah tracker', icon: Check }, { label: 'Calendar', icon: CalendarDays },
		{ label: 'My hajat', icon: Heart }, { label: 'Journal', icon: NotebookPen }, { label: 'Analytics', icon: LineChart }
	];
	const week = [
		{ day: 'Sen', date: '2', value: 78 }, { day: 'Sel', date: '3', value: 92 }, { day: 'Rab', date: '4', value: 64 },
		{ day: 'Kam', date: '5', value: 86 }, { day: 'Jum', date: '6', value: 100 }, { day: 'Sab', date: '7', value: 72 }, { day: 'Min', date: '8', value: 33, today: true }
	];
	const habits = $derived(data.activities ?? []);
	const completedToday = $derived((data.completedToday ?? []).map(String));
	const filters = $derived(['All', ...(data.categories ?? []).map((category) => category.name)]);
	const filteredHabits = $derived(activeFilter === 'All' ? habits : habits.filter((habit) => categoryName(habit.category) === activeFilter));
	const completed = $derived(habits.filter((habit) => completedToday.includes(habit.id)).length);
	const progress = $derived(habits.length ? Math.round((completed / habits.length) * 100) : 0);
	async function submitAction(intent: string, fields: Record<string, string>) {
		actionIntent = intent;
		actionFields = fields;
		await tick();
		actionForm?.requestSubmit();
	}
	function toggleHabit(id: string) { submitAction('toggle-log', { activity_id: id }); }
</script>

<svelte:head><title>Dashboard · Jalur Langit</title><meta name="description" content="Ruang pribadi untuk menjaga konsistensi ibadah dan refleksi." /></svelte:head>

<div class="app-shell">
	<form method="POST" use:enhance bind:this={actionForm} hidden><input type="hidden" name="intent" value={actionIntent} />{#each Object.entries(actionFields) as [key, value]}<input type="hidden" name={key} value={value} />{/each}</form>
	{#if menuOpen}<button class="mobile-scrim" aria-label="Close navigation" onclick={() => (menuOpen = false)}></button>{/if}
	<aside class:open={menuOpen} class="sidebar">
		<div class="brand"><div class="brand-mark"><Moon size={17} strokeWidth={2.2} /></div><div><strong>Jalur Langit</strong><span>Personal space</span></div><button class="mobile-close" aria-label="Close menu" onclick={() => (menuOpen = false)}><X size={18} /></button></div>
		<nav class="primary-nav" aria-label="Main navigation"><p class="eyebrow nav-label">Workspace</p>{#each navItems as item}<a class:active={item.active} href={item.active ? '/' : `/${item.label.toLowerCase().replaceAll(' ', '-')}`} onclick={() => (menuOpen = false)}><item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{#if item.active}<span class="nav-dot"></span>{/if}</a>{/each}</nav>
		<div class="sidebar-bottom"><div class="sidebar-prompt"><Sparkles size={16} /><p><strong>Pelan-pelan, tapi terus.</strong><br />Konsistensi kecil hari ini berarti.</p></div><a href="#settings"><Settings size={17} /> Settings</a><form method="POST" action="/logout" use:enhance><button type="submit"><LogOut size={17} /> Logout</button></form></div>
	</aside>
	<main class="main-content">
		<header class="topbar"><button class="menu-button" aria-label="Open navigation" onclick={() => (menuOpen = true)}><Menu size={21} /></button><div class="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Dashboard</strong></div><div class="topbar-actions"><button class="icon-button" aria-label="Help"><CircleHelp size={18} /></button><div class="avatar">A</div></div></header>
		<div class="content-wrap">
			{#if form?.error}<div class="notice error">{form.error}</div>{/if}
			{#if data.dbError}<div class="notice error">Supabase: {data.dbError}</div>{/if}
			<section class="welcome-row"><div><p class="eyebrow">Sabtu, 8 November 2026 · 15 Jumadil Awal 1448</p><h1>Assalamu’alaikum, Alfian <span>✦</span></h1><p class="intro">Semoga hari ini menjadi kesempatan untuk memperbaiki diri<br class="desktop-only" /> dan mendekatkan hati kepada Allah.</p></div><a class="date-link" href="/calendar"><CalendarDays size={16} /> View calendar</a></section>
			<section class="overview-grid"><div class="progress-card panel"><div class="section-heading"><div><p class="eyebrow">Daily progress</p><h2>Hari ini</h2></div><span class="muted-label">{completed} of {habits.length} complete</span></div><div class="progress-body"><div class="progress-ring" style={`--progress: ${progress * 3.6}deg`}><div><strong>{progress}%</strong><span>complete</span></div></div><div class="progress-copy"><p>“Amalan yang paling dicintai Allah adalah yang paling konsisten, walaupun sedikit.”</p><span>— HR. Bukhari & Muslim</span></div></div><div class="progress-track"><span style={`width: ${progress}%`}></span></div></div><div class="focus-card panel"><div class="focus-icon"><Target size={19} /></div><p class="eyebrow">Your focus</p><h2>Build a gentle<br /><em>morning ritual.</em></h2><p>Mulai dengan satu hal kecil yang bermakna.</p><a href="#tracker">See tracker <ArrowUpRight size={15} /></a></div></section>
			<div class="dashboard-grid"><section class="panel habits-panel" id="tracker"><div class="section-heading"><div><p class="eyebrow">Daily habits</p><h2>Aktivitas hari ini</h2></div><button class="text-button" onclick={() => (showHabitForm = true)}><Plus size={15} /> Add habit</button></div><div class="filter-row">{#each filters as filter}<button class:chosen={activeFilter === filter} onclick={() => (activeFilter = filter)}>{filter}</button>{/each}</div><div class="habit-list">{#each filteredHabits as habit}<button class:completed={completedToday.includes(habit.id)} class="habit-row" onclick={() => toggleHabit(habit.id)} aria-label={`Mark ${habit.name} ${completedToday.includes(habit.id) ? 'not complete' : 'complete'}`}><span class="check-box">{#if completedToday.includes(habit.id)}<Check size={14} strokeWidth={2.5} />{/if}</span><span class="habit-name"><strong>{habit.name}</strong><small>{categoryName(habit.category)}</small></span><ChevronRight class="habit-arrow" size={16} /></button>{/each}</div><a class="view-all" href="/ibadah-tracker">View all activities <ArrowUpRight size={15} /></a></section>
				<section class="panel week-panel"><div class="section-heading"><div><p class="eyebrow">This week</p><h2>Ritme yang terjaga</h2></div><a class="small-link" href="#analytics">Details <ArrowUpRight size={14} /></a></div><div class="week-chart">{#each week as item}<div class="day-bar" class:today={item.today}><div class="bar-track"><span style={`height: ${item.value}%`}></span></div><strong>{item.value}%</strong><small>{item.day}</small><small class="date">{item.date}</small></div>{/each}</div><div class="week-footer"><span><i class="legend-dot"></i> Daily completion</span><span class="trend"><ArrowUpRight size={14} /> 12% vs last week</span></div></section>
				<section class="panel quick-panel"><div class="section-heading"><div><p class="eyebrow">Make space</p><h2>Quick actions</h2></div></div><a class="action-row" href="/journal"><span class="action-icon sage"><NotebookPen size={17} /></span><span><strong>Write a reflection</strong><small>Capture what’s on your mind</small></span><ArrowUpRight size={16} /></a><a class="action-row" href="/my-hajat"><span class="action-icon gold"><Heart size={17} /></span><span><strong>Add a hajat</strong><small>Keep a hope close to heart</small></span><ArrowUpRight size={16} /></a><a class="action-row" href="/calendar"><span class="action-icon blue"><CalendarDays size={17} /></span><span><strong>Open calendar</strong><small>Look back with kindness</small></span><ArrowUpRight size={16} /></a></section></div>
			<footer><span><Feather size={14} /> A private space for your journey.</span><span>Last synced just now</span></footer>
		</div>
	</main>
	{#if showHabitForm}
		<div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (showHabitForm = false)}>
			<form class="habit-form panel" method="POST" use:enhance={() => async ({ result, update }) => { await update({ reset: true }); if (result.type === 'success') showHabitForm = false; }}>
				<input type="hidden" name="intent" value="create-activity" />
				<div class="section-heading"><div><p class="eyebrow">Daily habits</p><h2>Add a habit</h2></div><button type="button" class="icon-button" aria-label="Close" onclick={() => (showHabitForm = false)}><X size={18} /></button></div>
				<label>Habit name<input name="name" placeholder="e.g. Read Surah Al-Kahf" required /></label>
				<div class="form-grid"><label>Category<select name="category_id" required>{#each data.categories as category}<option value={category.id}>{category.name}</option>{/each}</select></label></div>
				<div class="form-actions"><button type="button" class="cancel-button" onclick={() => (showHabitForm = false)}>Cancel</button><button type="submit" class="save-button">Add habit</button></div>
			</form>
		</div>
	{/if}
</div>
