<!--
  Crosswalks of Italy — story page
  /2026/02/crosswalks-italy

  Layout: scrollytelling skeleton
    • Left/top: sticky graphic that reacts to activeStep
    • Right/bottom: 5 scroll steps flowing downward
    • On mobile: graphic pins to top, steps scroll below

  Data proof-of-life: renders `summary.cities_analyzed`
  from data/example.json loaded via +page.server.ts
-->
<script lang="ts">
	import Scrolly from '$lib/scrolly/Scrolly.svelte';
	import ScrollyStep from '$lib/scrolly/ScrollyStep.svelte';
	import CityDotPlot from '$lib/components/CityDotPlot.svelte';
	import type { PageData } from './$types';

	interface CityRow {
		name: string;
		region: string;
		score: number;
	}

	const { data }: { data: PageData } = $props();
	const cities = $derived(data.storyData.cities as CityRow[]);
	const safestCity = $derived(cities[0]);
	const leastSafeCity = $derived(cities[cities.length - 1]);
	const topThreeCities = $derived(
		cities.slice(0, 3).map((city) => `${city.name} (${city.score})`).join(', ')
	);
	const bottomThreeCities = $derived(
		[...cities]
			.slice(-3)
			.map((city) => `${city.name} (${city.score})`)
			.join(', ')
	);
	const safetySpread = $derived(
		safestCity && leastSafeCity && leastSafeCity.score > 0
			? safestCity.score / leastSafeCity.score
			: 0
	);

	// Active step drives what the graphic shows
	let activeStep = $state(0);

	// The 5 narrative steps — $derived so data references stay reactive
	const steps = $derived([
		{
			id: 0,
			label: 'The question',
			headline: `This sample covers ${data.storyData.summary.cities_analyzed} provincial capitals.`,
			caption:
				'Each city manages its own street infrastructure. Even in this compact sample, crosswalk provision varies sharply from one urban system to another.'
		},
		{
			id: 1,
			label: 'The data',
			headline: `${data.storyData.summary.total_crosswalks.toLocaleString('en')} crossings mapped.`,
			caption:
				'Using OpenStreetMap data combined with ISTAT population figures, we computed a crosswalk density score for each city: crossings per 10 000 inhabitants.'
		},
		{
			id: 2,
			label: 'The north–south gap',
			headline: 'The north dominates.',
			caption: `${data.storyData.cities[0].name} leads with a score of ${data.storyData.cities[0].score} — about ${safetySpread.toFixed(1)} times higher than ${data.storyData.summary.least_safe_city} in this sample.`
		},
		{
			id: 3,
			label: 'The outliers',
			headline: 'Big cities underperform.',
			caption: `Roma scores just ${data.storyData.cities.find((c: { name: string }) => c.name === 'Roma')?.score} — well below the national average of ${data.storyData.summary.national_average}. Naples is even lower at ${data.storyData.cities.find((c: { name: string }) => c.name === 'Napoli')?.score}.`
		},
		{
			id: 4,
			label: 'The takeaway',
			headline: 'Infrastructure is policy.',
			caption:
				'Crosswalk density correlates with local investment and urban planning tradition. Where you live determines how safely you can cross the street.'
		}
	]);

	function onStepEnter(index: number) {
		activeStep = index;
	}
</script>

<svelte:head>
	<title>Crosswalks of Italy — pointzerofive</title>
	<meta
		name="description"
		content="How safe are pedestrian crossings across Italian cities? A scrollytelling investigation."
	/>
</svelte:head>

<!-- ── Story header ── -->
<header class="story-header container">
	<p class="story-meta">
		<time datetime="2026-02-27">February 2026</time>
		<span>·</span>
		<span>Urban data</span>
		<span>·</span>
		<span>{data.storyData.summary.cities_analyzed} cities</span>
	</p>
	<h1 class="story-title">Crosswalks of Italy</h1>
	<p class="story-dek">
		How safe are pedestrian crossings across Italian cities? A data investigation into
		infrastructure, risk, and the widening gap between north and south.
	</p>
</header>

<!-- ── Scrollytelling section ── -->
<section class="scrolly-section" aria-label="Scrollytelling: Crosswalks story">
	<Scrolly bind:activeStep>
		{#snippet graphic()}
			<div class="graphic-inner">
				<!-- Step counter -->
				<p class="graphic-step-label">Step {activeStep + 1} / {steps.length}</p>

				<!-- The actual chart -->
				<CityDotPlot
					cities={data.storyData.cities}
					nationalAvg={data.storyData.summary.national_average}
					{activeStep}
				/>

				<!-- Progress dots -->
					<div class="graphic-dots" aria-hidden="true">
						{#each steps as step, i (step.id)}
							<span class="progress-dot" class:active={activeStep === i}></span>
						{/each}
					</div>
				</div>
			{/snippet}

			<!-- 5 scroll steps -->
			{#each steps as step (step.id)}
				<ScrollyStep index={step.id} active={activeStep === step.id} onEnter={onStepEnter}>
					<p class="step-label">{step.label}</p>
					<h2 class="step-headline">{step.headline}</h2>
				<p class="step-caption">{step.caption}</p>
			</ScrollyStep>
		{/each}
	</Scrolly>
</section>

<!-- ── Post-scrolly body ── -->
<section class="story-body container prose">
	<h2>What the data shows</h2>
	<p>
		This is a per-capita infrastructure comparison, not a raw count leaderboard. A city with fewer total
		crossings can still rank high if it serves a smaller population well; a large metro can rank low even
		with thousands of crossings if provision does not keep pace with residents.
	</p>
	<p>
		In this sample, the spread is wide: {safestCity?.name} ({safestCity?.score}) to
		{leastSafeCity?.name} ({leastSafeCity?.score}), a ratio of roughly {safetySpread.toFixed(1)} to 1.
		That is large enough to change daily pedestrian experience, not just move a ranking table.
	</p>

	<h3>A compact sample, still a clear signal</h3>
	<p>
		The top three cities here are {topThreeCities}. The bottom three are {bottomThreeCities}. The overlap
		in geography and city size is limited, but the overall pattern is consistent with a long-standing
		planning divide: places with sustained street-level investment score better on basic walkability
		infrastructure.
	</p>
	<p>
		At the same time, this is not a “north always good, south always bad” claim. Individual municipal
		choices matter. Some cities outperform their regional neighbors; others underperform despite stronger
		economic context.
	</p>

	<h3>Why large cities can underperform</h3>
	<p>
		Roma and Napoli both sit below this sample's average. Big-city networks are harder to retrofit, and
		older street grids often prioritize vehicular throughput over pedestrian continuity. The policy lesson
		is practical: crosswalk density is less about city prestige and more about repeated, local execution.
	</p>

	<h3>Limits and next reporting step</h3>
	<p>
		This story is transparent by design: the current file covers {data.storyData.summary.cities_analyzed}
		cities, not all provincial capitals. It is a strong prototype for method and storytelling, but not yet
		a full national census.
	</p>
	<p>
		Next step is straightforward: scale the same pipeline to a broader city set and add neighborhood-level
		pedestrian injury context. That would let us test whether crossing density tracks safety outcomes, not
		just infrastructure presence.
	</p>
	<p class="source-note">
		Data source: {data.storyData.meta.source} · Last updated: {data.storyData.meta.updated}
	</p>
</section>

<style>
	/* ── Story header ── */
	.story-header {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.story-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		font-size: var(--size-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-bottom: 1.25rem;
	}

	.story-title {
		font-size: clamp(2.2rem, 5vw, 4rem);
		max-width: 18ch;
		margin-bottom: 1.25rem;
	}

	.story-dek {
		font-size: var(--size-lg);
		color: var(--color-muted);
		max-width: 58ch;
		line-height: var(--leading-loose);
	}

	/* ── Scrolly section wrapper ── */
	.scrolly-section {
		border-bottom: 1px solid var(--color-border);
	}

	/* ── Graphic interior ── */
	.graphic-inner {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.5rem 1rem 0.5rem;
		gap: 0.75rem;
	}

	.graphic-step-label {
		font-size: var(--size-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
		align-self: flex-start;
	}

	/* Progress dots */
	.graphic-dots {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.progress-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-border);
		transition: background var(--transition);
	}

	.progress-dot.active {
		background: var(--color-accent);
	}

	/* ── Step text ── */
	:global(.scrolly-step) .step-label {
		font-size: var(--size-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-bottom: 0.75rem;
	}

	:global(.scrolly-step) .step-headline {
		font-size: var(--size-xl);
		margin-bottom: 0.75rem;
		line-height: var(--leading-tight);
	}

	:global(.scrolly-step) .step-caption {
		font-size: var(--size-base);
		color: var(--color-muted);
		line-height: var(--leading-loose);
	}

	/* ── Post-scrolly body ── */
	.story-body {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-xl);
	}

	.story-body h2 {
		font-size: var(--size-xl);
		margin-bottom: 1.25rem;
	}

	.story-body h3 {
		font-size: 1.45rem;
		margin-top: 2rem;
		margin-bottom: 0.85rem;
	}

	.source-note {
		font-size: var(--size-xs);
		color: var(--color-muted);
		letter-spacing: 0.03em;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	/* ── Mobile adjustments ── */
	@media (max-width: 768px) {
		.story-title {
			font-size: 2rem;
		}

		.story-dek {
			font-size: var(--size-base);
		}
	}
</style>
