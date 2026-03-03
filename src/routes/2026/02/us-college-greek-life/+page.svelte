<script lang="ts">
	import Scrolly from '$lib/scrolly/Scrolly.svelte';
	import ScrollyStep from '$lib/scrolly/ScrollyStep.svelte';
	import CollegeGreekScatter from '$lib/components/CollegeGreekScatter.svelte';
	import type { PageData } from './$types';

	interface University {
		name: string;
		applicants: number;
		admit_rate: number;
		greek_rate: number;
		control: string;
	}

	interface StoryData {
		meta: {
			source: string;
			updated: string;
			caveat: string;
		};
		summary: {
			universities_analyzed: number;
			total_applicants: number;
			applicant_median: number;
			average_greek_rate: number;
			correlation_applicants_greek: number;
			mega_applicant_cutoff: number;
			greek_heavy_cutoff: number;
			mega_applicant_schools: string[];
			mega_low_greek_schools: string[];
			greek_heavy_schools: string[];
			no_greek_schools: string[];
			top_greek_school: string;
			top_greek_rate: number;
		};
		regression: {
			slope: number;
			intercept: number;
		};
		universities: University[];
	}

	let { data }: { data: PageData } = $props();
	const storyData = $derived(data.storyData as StoryData);

	let activeStep = $state(0);

	const megaCount = $derived(storyData.summary.mega_applicant_schools.length);
	const megaLowCount = $derived(storyData.summary.mega_low_greek_schools.length);
	const heavyCount = $derived(storyData.summary.greek_heavy_schools.length);
	const noGreekCount = $derived(storyData.summary.no_greek_schools.length);
	const megaLowExamples = $derived(storyData.summary.mega_low_greek_schools.slice(0, 5).join(', '));
	const greekHeavyExamples = $derived(storyData.summary.greek_heavy_schools.slice(0, 5).join(', '));
	const noGreekExamples = $derived(storyData.summary.no_greek_schools.slice(0, 5).join(', '));

	const steps = $derived([
		{
			id: 0,
			label: 'The question',
			headline: 'Do giant applicant pools dilute Greek life?',
			caption:
				'As selective admissions scales nationally, fraternities and sororities are not growing at the same pace everywhere. Some campuses still anchor social life around Greek organizations, others barely register them.'
		},
		{
			id: 1,
			label: 'The dataset',
			headline: `${storyData.summary.total_applicants.toLocaleString('en-US')} applicants across ${storyData.summary.universities_analyzed} universities.`,
			caption: `We mapped Common Data Set applicants (section C1) against each school's reported fraternity/sorority participation. The sample median is ${Math.round(storyData.summary.applicant_median / 1000)}k applicants.`
		},
		{
			id: 2,
			label: 'Mega-applicant schools',
			headline: `${megaCount} universities crossed ${Math.round(storyData.summary.mega_applicant_cutoff / 1000)}k applicants.`,
			caption: `${megaLowCount} of them sit at 15% Greek participation or lower. The largest applicant engines in this sample mostly cluster in low-Greek territory.`
		},
		{
			id: 3,
			label: 'Greek-heavy campuses',
			headline: `${heavyCount} campuses still run at ${storyData.summary.greek_heavy_cutoff}%+ Greek participation.`,
			caption: `${storyData.summary.top_greek_school} leads the sample at ${storyData.summary.top_greek_rate}%. Size does not erase campus culture: it redistributes where that culture dominates.`
		},
		{
			id: 4,
			label: 'The pattern',
			headline: `Applicants and Greek participation move in opposite directions (r = ${storyData.summary.correlation_applicants_greek}).`,
			caption: `${noGreekCount} schools in this sample report essentially no Greek membership. The broad trend is clear, but outliers still matter: admissions scale and social structure are related, not identical.`
		}
	]);

	function onStepEnter(index: number) {
		activeStep = index;
	}
</script>

<svelte:head>
	<title>Admissions Arms Race, Greek Life Divide - pointzerofive</title>
	<meta
		name="description"
		content="A scrollytelling analysis of US university applicants and fraternity/sorority participation rates."
	/>
</svelte:head>

<header class="story-header container">
	<p class="story-meta">
		<time datetime="2026-02-27">February 2026</time>
		<span>.</span>
		<span>Education data</span>
		<span>.</span>
		<span>{storyData.summary.universities_analyzed} universities</span>
	</p>
	<h1 class="story-title">Admissions Arms Race, Greek Life Divide</h1>
	<p class="story-dek">
		US universities are attracting record applicant volumes, but Greek participation tells a different
		story. At scale, applicants rise while fraternity and sorority footprints often shrink.
	</p>
</header>

<section class="scrolly-section" aria-label="Scrollytelling: admissions and Greek life">
	<Scrolly bind:activeStep>
		{#snippet graphic()}
			<div class="graphic-inner">
				<p class="graphic-step-label">Step {activeStep + 1} / {steps.length}</p>

				<CollegeGreekScatter
					universities={storyData.universities}
					applicantMedian={storyData.summary.applicant_median}
					greekAverage={storyData.summary.average_greek_rate}
					megaCutoff={storyData.summary.mega_applicant_cutoff}
					greekHeavyCutoff={storyData.summary.greek_heavy_cutoff}
					regression={storyData.regression}
					{activeStep}
				/>

					<div class="graphic-dots" aria-hidden="true">
						{#each steps as step, i (step.id)}
							<span class="progress-dot" class:active={activeStep === i}></span>
						{/each}
					</div>
				</div>
			{/snippet}

			{#each steps as step (step.id)}
				<ScrollyStep index={step.id} active={activeStep === step.id} onEnter={onStepEnter}>
					<p class="step-label">{step.label}</p>
				<h2 class="step-headline">{step.headline}</h2>
				<p class="step-caption">{step.caption}</p>
			</ScrollyStep>
		{/each}
	</Scrolly>
</section>

<section class="story-body container prose">
	<h2>How to read this chart</h2>
	<p>
		Each dot is one institution. The x-axis is applicant volume and the y-axis is combined fraternity +
		sorority participation. The guide lines mark the sample median for applicants and the sample average
		for Greek participation, so each quadrant has a plain-language meaning: large-and-low, large-and-high,
		small-and-low, small-and-high.
	</p>
	<p>
		The plot is deliberately descriptive. It tells us where institutional models cluster, not why they
		cluster there. A public flagship with 90k applicants and a private campus with 11k applicants can be
		serving very different local housing markets, student demographics, and social calendars.
	</p>

	<h3>What stands out in this sample</h3>
	<p>
		{megaCount} institutions pass the mega-applicant threshold. Of those, {megaLowCount} are at or below
		15% Greek participation. In other words: scale does not automatically erase Greek life, but it very
		often coincides with low Greek penetration. Representative large-and-low names in this file include
		{megaLowExamples}.
	</p>
	<p>
		At the same time, {heavyCount} institutions remain above the Greek-heavy threshold. These schools show
		that social organization can stay intensely chapter-based even without giant applicant pools. In this
		dataset, examples include {greekHeavyExamples}.
	</p>
	<p>
		Finally, {noGreekCount} institutions report effectively no Greek participation. That group includes
		{noGreekExamples}. Those campuses matter because they keep the right side of the chart honest: the
		bottom edge is not a statistical accident; it is a real institutional model.
	</p>

	<h3>Interpretation, not verdict</h3>
	<p>
		The overall relationship is negative (r = {storyData.summary.correlation_applicants_greek}), but this
		is still not a causal estimate. Applicant growth and campus social structure are both outcomes of many
		other factors: admissions policy, housing supply, commuter share, athletics culture, and local norms.
	</p>
	<p>
		What the chart does provide is a clear editorial baseline: when applications scale quickly, Greek-life
		participation often does not scale in parallel. That tension is a useful reporting lead, especially for
		stories about student belonging, social access, and campus governance.
	</p>

	<h3>Where to report next</h3>
	<p>
		A stronger next step is time-series tracking by campus instead of a single cut. The right question is
		not just “who is high vs low,” but “who is moving and in which direction” after policy changes,
		housing expansions, or shifts in admissions strategy.
	</p>
	<p>
		Another useful extension is disaggregation: chapter membership by class year, on-campus residency, and
		first-generation status. Those splits would show whether declining Greek share reflects institutional
		choice, changing student preferences, or simple denominator growth from larger applicant pools.
	</p>
	<p class="source-note">
		Data source: {storyData.meta.source} - Last updated: {storyData.meta.updated}<br />
		Method note: {storyData.meta.caveat}
	</p>
</section>

<style>
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
		max-width: 16ch;
		margin-bottom: 1.25rem;
	}

	.story-dek {
		font-size: var(--size-lg);
		color: var(--color-muted);
		max-width: 60ch;
		line-height: var(--leading-loose);
	}

	.scrolly-section {
		border-bottom: 1px solid var(--color-border);
	}

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
</style>
