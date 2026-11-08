<script lang="ts">
	import { ArrowUpRight, CalendarDays, Check, ChevronRight, CircleHelp, Clock3, Feather, Heart, Home, LineChart, LogOut, Menu, Moon, NotebookPen, Plus, Settings, Sparkles, Target, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	type Habit = { name: string; category: string; time: string; done: boolean };
	type NavItem = { label: string; icon: typeof Home; active?: boolean };
	let menuOpen = $state(false);
	let showHabitForm = $state(false);
	let newHabitName = $state('');
	let newHabitCategory = $state('Al-Qur’an');
	let newHabitTime = $state('');
	let activeFilter = $state('All');
	let habits = $state<Habit[]>([
		{ name: 'Shalat Subuh', category: 'Shalat wajib', time: '04:35', done: true },
		{ name: 'Dzikir pagi', category: 'Dzikir & doa', time: '05:10', done: true },
		{ name: 'Membaca Al-Qur’an', category: 'Al-Qur’an', time: '06:30', done: false },
		{ name: 'Shalat Dzuhur', category: 'Shalat wajib', time: '12:00', done: false },
		{ name: 'Shalat Ashar', category: 'Shalat wajib', time: '15:15', done: false },
		{ name: 'Shalat Maghrib', category: 'Shalat wajib', time: '17:55', done: false }
	]);
	const navItems: NavItem[] = [
		{ label: 'Dashboard', icon: Home, active: true }, { label: 'Ibadah tracker', icon: Check }, { label: 'Calendar', icon: CalendarDays },
		{ label: 'My hajat', icon: Heart }, { label: 'Journal', icon: NotebookPen }, { label: 'Analytics', icon: LineChart }
	];
	const week = [
		{ day: 'Sen', date: '2', value: 78 }, { day: 'Sel', date: '3', value: 92 }, { day: 'Rab', date: '4', value: 64 },
		{ day: 'Kam', date: '5', value: 86 }, { day: 'Jum', date: '6', value: 100 }, { day: 'Sab', date: '7', value: 72 }, { day: 'Min', date: '8', value: 33, today: true }
	];
	const filters = ['All', 'Shalat wajib', 'Sunnah', 'Al-Qur’an'];
	const filteredHabits = $derived(activeFilter === 'All' ? habits : habits.filter((habit) => habit.category === activeFilter));
	const completed = $derived(habits.filter((habit) => habit.done).length);
	const progress = $derived(Math.round((completed / habits.length) * 100));
	function toggleHabit(name: string) { habits = habits.map((habit) => habit.name === name ? { ...habit, done: !habit.done } : habit); }
	function addHabit() {
		if (!newHabitName.trim()) return;
		habits = [...habits, { name: newHabitName.trim(), category: newHabitCategory, time: newHabitTime || 'Anytime', done: false }];
		newHabitName = '';
		newHabitTime = '';
		showHabitForm = false;
	}
</script>

<svelte:head><title>Dashboard · Jalur Langit</title><meta name="description" content="Ruang pribadi untuk menjaga konsistensi ibadah dan refleksi." /></svelte:head>

<div class="app-shell">
	{#if menuOpen}<button class="mobile-scrim" aria-label="Close navigation" onclick={() => (menuOpen = false)}></button>{/if}
	<aside class:open={menuOpen} class="sidebar">
		<div class="brand"><div class="brand-mark"><Moon size={17} strokeWidth={2.2} /></div><div><strong>Jalur Langit</strong><span>Personal space</span></div><button class="mobile-close" aria-label="Close menu" onclick={() => (menuOpen = false)}><X size={18} /></button></div>
		<nav class="primary-nav" aria-label="Main navigation"><p class="eyebrow nav-label">Workspace</p>{#each navItems as item}<a class:active={item.active} href={item.active ? '/' : `/${item.label.toLowerCase().replaceAll(' ', '-')}`} onclick={() => (menuOpen = false)}><item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{#if item.active}<span class="nav-dot"></span>{/if}</a>{/each}</nav>
		<div class="sidebar-bottom"><div class="sidebar-prompt"><Sparkles size={16} /><p><strong>Pelan-pelan, tapi terus.</strong><br />Konsistensi kecil hari ini berarti.</p></div><a href="#settings"><Settings size={17} /> Settings</a><form method="POST" action="/logout" use:enhance><button type="submit"><LogOut size={17} /> Logout</button></form></div>
	</aside>
	<main class="main-content">
		<header class="topbar"><button class="menu-button" aria-label="Open navigation" onclick={() => (menuOpen = true)}><Menu size={21} /></button><div class="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Dashboard</strong></div><div class="topbar-actions"><button class="icon-button" aria-label="Help"><CircleHelp size={18} /></button><div class="avatar">A</div></div></header>
		<div class="content-wrap">
			<section class="welcome-row"><div><p class="eyebrow">Sabtu, 8 November 2026 · 15 Jumadil Awal 1448</p><h1>Assalamu’alaikum, Alfian <span>✦</span></h1><p class="intro">Semoga hari ini menjadi kesempatan untuk memperbaiki diri<br class="desktop-only" /> dan mendekatkan hati kepada Allah.</p></div><a class="date-link" href="/calendar"><CalendarDays size={16} /> View calendar</a></section>
			<section class="overview-grid"><div class="progress-card panel"><div class="section-heading"><div><p class="eyebrow">Daily progress</p><h2>Hari ini</h2></div><span class="muted-label">{completed} of {habits.length} complete</span></div><div class="progress-body"><div class="progress-ring" style={`--progress: ${progress * 3.6}deg`}><div><strong>{progress}%</strong><span>complete</span></div></div><div class="progress-copy"><p>“Amalan yang paling dicintai Allah adalah yang paling konsisten, walaupun sedikit.”</p><span>— HR. Bukhari & Muslim</span></div></div><div class="progress-track"><span style={`width: ${progress}%`}></span></div></div><div class="focus-card panel"><div class="focus-icon"><Target size={19} /></div><p class="eyebrow">Your focus</p><h2>Build a gentle<br /><em>morning ritual.</em></h2><p>Mulai dengan satu hal kecil yang bermakna.</p><a href="#tracker">See tracker <ArrowUpRight size={15} /></a></div></section>
			<div class="dashboard-grid"><section class="panel habits-panel" id="tracker"><div class="section-heading"><div><p class="eyebrow">Daily habits</p><h2>Aktivitas hari ini</h2></div><button class="text-button" onclick={() => (showHabitForm = true)}><Plus size={15} /> Add habit</button></div><div class="filter-row">{#each filters as filter}<button class:chosen={activeFilter === filter} onclick={() => (activeFilter = filter)}>{filter}</button>{/each}</div><div class="habit-list">{#each filteredHabits as habit}<button class:completed={habit.done} class="habit-row" onclick={() => toggleHabit(habit.name)} aria-label={`Mark ${habit.name} ${habit.done ? 'not complete' : 'complete'}`}><span class="check-box">{#if habit.done}<Check size={14} strokeWidth={2.5} />{/if}</span><span class="habit-name"><strong>{habit.name}</strong><small>{habit.category}</small></span><span class="habit-time"><Clock3 size={14} /> {habit.time}</span><ChevronRight class="habit-arrow" size={16} /></button>{/each}</div><a class="view-all" href="/ibadah-tracker">View all activities <ArrowUpRight size={15} /></a></section>
				<section class="panel week-panel"><div class="section-heading"><div><p class="eyebrow">This week</p><h2>Ritme yang terjaga</h2></div><a class="small-link" href="#analytics">Details <ArrowUpRight size={14} /></a></div><div class="week-chart">{#each week as item}<div class="day-bar" class:today={item.today}><div class="bar-track"><span style={`height: ${item.value}%`}></span></div><strong>{item.value}%</strong><small>{item.day}</small><small class="date">{item.date}</small></div>{/each}</div><div class="week-footer"><span><i class="legend-dot"></i> Daily completion</span><span class="trend"><ArrowUpRight size={14} /> 12% vs last week</span></div></section>
				<section class="panel quick-panel"><div class="section-heading"><div><p class="eyebrow">Make space</p><h2>Quick actions</h2></div></div><a class="action-row" href="/journal"><span class="action-icon sage"><NotebookPen size={17} /></span><span><strong>Write a reflection</strong><small>Capture what’s on your mind</small></span><ArrowUpRight size={16} /></a><a class="action-row" href="/my-hajat"><span class="action-icon gold"><Heart size={17} /></span><span><strong>Add a hajat</strong><small>Keep a hope close to heart</small></span><ArrowUpRight size={16} /></a><a class="action-row" href="/calendar"><span class="action-icon blue"><CalendarDays size={17} /></span><span><strong>Open calendar</strong><small>Look back with kindness</small></span><ArrowUpRight size={16} /></a></section></div>
			<footer><span><Feather size={14} /> A private space for your journey.</span><span>Last synced just now</span></footer>
		</div>
	</main>
	{#if showHabitForm}
		<div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (showHabitForm = false)}>
			<form class="habit-form panel" onsubmit={(event) => { event.preventDefault(); addHabit(); }}>
				<div class="section-heading"><div><p class="eyebrow">Daily habits</p><h2>Add a habit</h2></div><button type="button" class="icon-button" aria-label="Close" onclick={() => (showHabitForm = false)}><X size={18} /></button></div>
				<label>Habit name<input bind:value={newHabitName} placeholder="e.g. Read Surah Al-Kahf" required /></label>
				<div class="form-grid"><label>Category<select bind:value={newHabitCategory}>{#each filters.slice(1) as filter}<option value={filter}>{filter}</option>{/each}<option value="Dzikir & doa">Dzikir & doa</option><option value="Amal kebaikan">Amal kebaikan</option></select></label><label>Time<input type="time" bind:value={newHabitTime} /></label></div>
				<div class="form-actions"><button type="button" class="cancel-button" onclick={() => (showHabitForm = false)}>Cancel</button><button type="submit" class="save-button">Add habit</button></div>
			</form>
		</div>
	{/if}
</div>
