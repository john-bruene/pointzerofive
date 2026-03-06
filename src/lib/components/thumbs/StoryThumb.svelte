<script lang="ts">
	import Thumb001 from './Thumb001.svelte';
	import Thumb002 from './Thumb002.svelte';
	import Thumb003 from './Thumb003.svelte';

	let { number }: { number: string } = $props();
</script>

{#if number === '001'}
	<Thumb001 />
{:else if number === '002'}
	<Thumb002 />
{:else if number === '003'}
	<Thumb003 />
{/if}
