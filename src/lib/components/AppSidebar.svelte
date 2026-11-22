<script lang="ts">
	import { CalendarDays, Check, ChevronLeft, ChevronRight, Heart, Home, LineChart, LogOut, Menu, Moon, NotebookPen, Settings, Sparkles, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	type NavItem = { label: string; href: string; icon: typeof Home };
	let { active = 'Dashboard' }: { active?: string } = $props();
	let menuOpen = $state(false);
	let collapsed = $state(false);
	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/', icon: Home },
		{ label: 'Ibadah tracker', href: '/ibadah-tracker', icon: Check },
		{ label: 'Calendar', href: '/calendar', icon: CalendarDays },
		{ label: 'My hajat', href: '/my-hajat', icon: Heart },
		{ label: 'Journal', href: '/journal', icon: NotebookPen },
		{ label: 'Analytics', href: '/analytics', icon: LineChart },
		{ label: 'Settings', href: '/settings', icon: Settings }
	];
</script>

{#if menuOpen}<button class="mobile-scrim" aria-label="Close navigation" onclick={() => (menuOpen = false)}></button>{/if}
<button class="mobile-menu-trigger" aria-label="Open navigation" onclick={() => (menuOpen = true)}><Menu size={21} /></button>
<aside class:open={menuOpen} class:collapsed class="sidebar">
	<div class="brand"><div class="brand-mark"><Moon size={17} strokeWidth={2.2} /></div><div class="brand-copy"><strong>Jalur Langit</strong><span>Personal space</span></div><button class="collapse-button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onclick={() => (collapsed = !collapsed)}>{#if collapsed}<ChevronRight size={16} />{:else}<ChevronLeft size={16} />{/if}</button><button class="mobile-close" aria-label="Close menu" onclick={() => (menuOpen = false)}><X size={18} /></button></div>
	<nav class="primary-nav" aria-label="Main navigation"><p class="eyebrow nav-label">Workspace</p>{#each navItems as item}<a class:active={active === item.label} href={item.href} title={collapsed ? item.label : undefined} onclick={() => (menuOpen = false)}><item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{#if active === item.label}<span class="nav-dot"></span>{/if}</a>{/each}</nav>
	<div class="sidebar-bottom"><div class="sidebar-prompt"><Sparkles size={16} /><p><strong>Pelan-pelan, tapi terus.</strong><br />Konsistensi kecil hari ini berarti.</p></div><form method="POST" action="/logout" use:enhance><button type="submit"><LogOut size={17} /><span>Logout</span></button></form></div>
</aside>
