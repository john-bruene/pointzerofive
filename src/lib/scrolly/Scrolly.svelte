<!--
  Scrolly.svelte
  ─────────────────────────────────────────────────────────────
  A lightweight scrollytelling container.

  Usage:
    <Scrolly bind:activeStep>
      {#snippet graphic()}
        <YourStickyViz {activeStep} />
      {/snippet}

      {#each steps as step, i}
        <ScrollyStep index={i}>
          <p>{step.text}</p>
        </ScrollyStep>
      {/each}
    </Scrolly>

  How it works:
    - The graphic slot is pinned (CSS `position: sticky`).
    - Each ScrollyStep uses IntersectionObserver to report
      when it is in the "active zone" (center of the viewport).
    - `activeStep` is updated reactively via $bindable.
  ─────────────────────────────────────────────────────────────
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Index of the currently visible step (bindable) */
		activeStep?: number;
		/** Rendered in the sticky left/top column */
		graphic: Snippet;
		/** Step elements rendered in the scrolling right/bottom column */
		children?: Snippet;
	}

	let { activeStep = $bindable(0), graphic, children }: Props = $props();
</script>

<div class="scrolly">
	<!-- Sticky graphic panel -->
	<div class="scrolly-graphic" aria-hidden="true">
		{@render graphic()}
	</div>

	<!-- Scrolling steps column -->
	<div class="scrolly-steps">
		{@render children?.()}
	</div>
</div>

<style>
	.scrolly {
		position: relative;
		display: grid;
		/* Desktop: graphic left, steps right */
		grid-template-columns: 1fr 1fr;
		align-items: start;
		gap: 0;
	}

	/* ---- Sticky graphic ---- */
	.scrolly-graphic {
		position: sticky;
		top: 4rem; /* below the site header */
		height: calc(100svh - 5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow: hidden;
	}

	/* ---- Steps column ---- */
	.scrolly-steps {
		padding-block: 30svh; /* breathing room at top + bottom */
	}

	/* ---- Mobile: stack vertically ---- */
	@media (max-width: 768px) {
		.scrolly {
			grid-template-columns: 1fr;
		}

		/* On mobile the graphic sits at the top and is smaller */
		.scrolly-graphic {
			position: sticky;
			top: 3.5rem;
			height: 45svh;
			padding: 1rem;
		}

		.scrolly-steps {
			padding-block: 1rem 30svh;
		}
	}
</style>
