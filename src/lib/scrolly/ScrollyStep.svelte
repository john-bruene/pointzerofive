<!--
  ScrollyStep.svelte
  ─────────────────────────────────────────────────────────────
  A single step inside a <Scrolly> container.

  Attach an IntersectionObserver on mount. When ≥ 50% of this
  element enters the viewport, dispatch a "stepenter" event
  that Scrolly (or the parent page) can listen to.

  But because Svelte 5 events are different, the simpler
  approach used here is: the parent passes a callback via
  `onEnter` prop, which we call with our `index`.

  Usage (inside <Scrolly>):
    <ScrollyStep index={i} {onEnter}>
      <p>Step text here.</p>
    </ScrollyStep>
  ─────────────────────────────────────────────────────────────
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		index: number;
		active?: boolean;
		onEnter?: (index: number) => void;
		children?: Snippet;
	}

	let { index, active = false, onEnter, children }: Props = $props();

	let el: HTMLElement;

	onMount(() => {
		// Trigger when the step is at least 50% visible.
		// rootMargin pushes the activation zone toward the vertical center.
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						onEnter?.(index);
					}
				});
			},
			{
				rootMargin: '-30% 0px -30% 0px', // activate in the middle 40% of the viewport
				threshold: 0
			}
		);

		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div class="scrolly-step" class:active bind:this={el} data-step={index}>
	{@render children?.()}
</div>

<style>
	.scrolly-step {
		max-width: 44ch;
		margin-inline: auto;
		padding: 2rem 2rem 2rem 2.5rem;
		margin-bottom: 60svh; /* large gap creates scroll room between steps */
		background: var(--color-bg);
		border-left: 2px solid var(--color-border);
		opacity: 0.45;
		transition:
			opacity 400ms ease,
			border-color 400ms ease;
	}

	/* Last step shouldn't push all the way to the footer */
	.scrolly-step:last-child {
		margin-bottom: 0;
	}

	.scrolly-step.active {
		opacity: 1;
		border-left-color: var(--color-accent);
	}

	/* Mobile: full width, centered */
	@media (max-width: 768px) {
		.scrolly-step {
			max-width: 100%;
			margin-inline: 1rem;
			padding: 1.5rem;
			margin-bottom: 40svh;
		}
	}
</style>
