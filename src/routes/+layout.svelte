<script lang="ts">
	import './layout.css';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

{@render children()}
<Toaster position="bottom-right" richColors closeButton />
