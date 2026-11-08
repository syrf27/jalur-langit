<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
	<div class="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Jalur Langit</h1>
			<p class="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Personal Islamic Habit Tracker</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900">
					{form.error}
				</div>
			{/if}
			
			<div class="space-y-2">
				<label for="password" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					Access Password
				</label>
				<input class="h-9 w-full rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300" 
					type="password" 
					id="password" 
					name="password" 
					required 
					placeholder="Enter your password"
				/>
			</div>

			<Button type="submit" class="w-full">
				Enter Vault
			</Button>
		</form>
	</div>
</div>
