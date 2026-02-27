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

	const { data }: { data: PageData } = $props();

	// Active step drives what the graphic shows
	let activeStep = $state(0);

	// The 5 narrative steps — $derived so data references stay reactive
	const steps = $derived([
		{
			id: 0,
			label: 'The question',
			headline: 'Italy has 107 provincial capitals.',
			caption:
				'Each one is responsible for its own street infrastructure — including the humble pedestrian crossing. How evenly distributed are they?'
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
			caption: `${data.storyData.cities[0].name} leads with a score of ${data.storyData.cities[0].score} — nearly eight times more crossings per capita than ${data.storyData.summary.least_safe_city} in Calabria.`
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
					{#each steps as _, i}
						<span class="progress-dot" class:active={activeStep === i}></span>
					{/each}
				</div>
			</div>
		{/snippet}

		<!-- 5 scroll steps -->
		{#each steps as step}
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
		The gap between Italy's best and worst-served cities is stark. Bolzano, with its strong
		tradition of urban planning inherited from Central European influences, offers nearly
		eight times as many crossings per capita as Crotone in Calabria.
	</p>
	<p>
		This isn't just about north versus south. Roma and Napoli — Italy's two largest cities —
		both fall below the national average, suggesting that size and historical density
		create their own infrastructure challenges.
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
