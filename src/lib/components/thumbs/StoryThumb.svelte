<script lang="ts">
	import Thumb001 from './Thumb001.svelte';
	import Thumb002 from './Thumb002.svelte';

	let { number }: { number: string } = $props();
</script>

{#if number === '001'}
	<Thumb001 />
{:else if number === '002'}
	<Thumb002 />
{/if}
