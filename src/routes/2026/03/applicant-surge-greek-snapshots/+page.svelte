<script lang="ts">
	import AdmissionsGreekTimeline from '$lib/components/AdmissionsGreekTimeline.svelte';
	import GreekRankStrip from '$lib/components/GreekRankStrip.svelte';
	import Scrolly from '$lib/scrolly/Scrolly.svelte';
	import ScrollyStep from '$lib/scrolly/ScrollyStep.svelte';
	import type { PageData } from './$types';

	interface SourceLink {
		name: string;
		url: string;
	}

	interface YearPoint {
		year: number;
		reportingSchoolCount: number;
		balancedSchoolCount: number;
		applicantsAll: number;
		applicantsBalanced: number;
		top50Applicants: number;
		restApplicants: number;
		admitRate: number;
		balancedShareOfAll: number;
	}

	interface GreekPoint {
		snapshotDate: string;
		snapshotYear: number;
		snapshotLabel: string;
		snapshotSource: string;
		totalSchools: number;
		matchedSchools: number;
		usableSchools: number;
		averageGreekTotal: number;
		top50GreekTotal: number;
		restGreekTotal: number;
	}

	interface LatestSchoolPoint {
		unitid: number;
		institutionName: string;
		stateAbbr: string;
		rank2022: number;
		applicants2022: number;
		greekTotal: number;
		pctFraternity: number;
		pctSorority: number;
		top50: boolean;
	}

	interface CoverageCheckPoint {
		snapshotDate: string;
		reportedMatches: number;
		computedMatches: number;
		matchesAgree: boolean;
	}

	interface StoryPayload {
		meta: {
			updated: string;
			admissionsLimitNote: string;
			greekLimitNote: string;
			sources: SourceLink[];
		};
		scope: {
			top200Count: number;
			requestedAdmissionsStartYear: number;
			requestedAdmissionsEndYear: number;
			availableAdmissionsStartYear: number;
			availableAdmissionsEndYear: number;
			balancedSchoolCount: number;
			latestGreekSnapshotDate: string | null;
		};
		series: {
			yearly: YearPoint[];
			greekSnapshots: GreekPoint[];
			latestSchools: LatestSchoolPoint[];
		};
		highlights: {
			totalGrowthMultiple: number;
			top50GrowthMultiple: number;
			restGrowthMultiple: number;
			top50ShareFrom: number;
			top50ShareTo: number;
			admitRateFrom: number;
			admitRateTo: number;
			admitRatePandemicJump: number | null;
			latestGreekTop50: number;
			latestGreekRest: number;
			latestGreekUsable: number;
			latestGreekMatched: number;
			latestGreekTotal: number;
		};
		checks: {
			admissionsRowsExpected: number;
			admissionsRowsActual: number;
			admissionsRowsAgree: boolean;
			coverageChecks: CoverageCheckPoint[];
			coverageChecksAgree: boolean;
			balancedPanelShareInLatestYear: number;
		};
	}

	let { data }: { data: PageData } = $props();
	const story = $derived(data.story as StoryPayload);

	let activeStep = $state(0);

	const yearly = $derived(story.series.yearly);
	const greekSnapshots = $derived(story.series.greekSnapshots);
	const latestSchools = $derived(story.series.latestSchools);

	const firstYear = $derived(yearly[0]);
	const lastYear = $derived(yearly[yearly.length - 1]);

	const steps = $derived([
		{
			id: 0,
			label: 'Balanced panel',
			headline: `${story.scope.balancedSchoolCount} universities report complete admissions data from ${story.scope.availableAdmissionsStartYear} to ${story.scope.availableAdmissionsEndYear}.`,
			caption:
				'We keep this panel fixed across time. That avoids fake trend breaks created by schools appearing only in later years.'
		},
		{
			id: 1,
			label: 'Application surge',
			headline: `Applications rose from ${formatInt(firstYear?.applicantsBalanced ?? 0)} to ${formatInt(lastYear?.applicantsBalanced ?? 0)}.`,
			caption: `That is a ${story.highlights.totalGrowthMultiple.toFixed(2)}x increase in a like-for-like panel.`
		},
		{
			id: 2,
			label: 'Concentration',
			headline: `Top-50 magnets grew ${story.highlights.top50GrowthMultiple.toFixed(2)}x, while ranks 51-200 grew ${story.highlights.restGrowthMultiple.toFixed(2)}x.`,
			caption: `Top-50 share moved from ${formatPct(story.highlights.top50ShareFrom * 100)} to ${formatPct(story.highlights.top50ShareTo * 100)}.`
		},
		{
			id: 3,
			label: 'Selectivity',
			headline: `Admit rate fell from ${formatPct(story.highlights.admitRateFrom * 100)} to ${formatPct(story.highlights.admitRateTo * 100)}.`,
			caption:
				story.highlights.admitRatePandemicJump !== null
					? `There is a temporary pandemic jump in 2020 (+${formatPct(story.highlights.admitRatePandemicJump * 100)} points vs 2019), but the long-run direction still points down.`
					: 'Admit rates tighten over the long run in this panel.'
		},
		{
			id: 4,
			label: 'Greek snapshots',
			headline: `Latest snapshot: top-50 average ${formatPct(story.highlights.latestGreekTop50)} vs ${formatPct(story.highlights.latestGreekRest)} for ranks 51-200.`,
			caption: `${story.highlights.latestGreekUsable}/${story.highlights.latestGreekTotal} schools have usable Greek-rate values in the latest cut (${story.highlights.latestGreekMatched} matched by ID/name).`
		}
	]);

	const qualityCards = $derived([
		{
			label: 'Admissions rows',
			value: `${formatInt(story.checks.admissionsRowsActual)} / ${formatInt(story.checks.admissionsRowsExpected)}`,
			note: story.checks.admissionsRowsAgree ? 'Shape check passed' : 'Shape mismatch'
		},
		{
			label: 'Balanced share in latest year',
			value: formatPct(story.checks.balancedPanelShareInLatestYear * 100),
			note: 'Portion of 2022 applicants covered by the fixed panel'
		},
		{
			label: 'Greek match checks',
			value: story.checks.coverageChecksAgree ? 'All snapshots agree' : 'Mismatch found',
			note: 'Reported snapshot matches vs panel recomputation'
		}
	]);

	const coverageCheckByDate = $derived(
		Object.fromEntries(story.checks.coverageChecks.map((point) => [point.snapshotDate, point]))
	);

	function onStepEnter(index: number) {
		activeStep = index;
	}

	function formatInt(value: number): string {
		return Math.round(value).toLocaleString('en-US');
	}

	function formatPct(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	function formatSnapshotDate(value: string | null): string {
		if (!value) return 'n/a';
		return new Date(value).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>The Applicant Surge Era - pointzerofive</title>
	<meta
		name="description"
		content="Top-200 US university admissions from 2000-2022 and Greek-life snapshot coverage, with transparent data checks."
	/>
</svelte:head>

<header class="story-header container">
	<p class="story-meta">
		<time datetime="2026-03-03">March 2026</time>
		<span>.</span>
		<span>Education data</span>
		<span>.</span>
		<span>{story.scope.top200Count} universities ranked by 2022 applicants</span>
	</p>
	<h1 class="story-title">The Applicant Surge Era</h1>
	<p class="story-dek">
		Application volume grew fast, but not evenly. This piece tracks a fixed admissions panel from
		2001-2022, then compares it with Greek-life snapshots to show where scale and campus social structure
		move together and where they do not.
	</p>

	<div class="quick-stats" aria-label="Story quick stats">
		<div class="stat-card">
			<p class="stat-kicker">Balanced panel</p>
			<p class="stat-value">{story.scope.balancedSchoolCount}</p>
			<p class="stat-note">schools with full 2001-2022 admissions</p>
		</div>
		<div class="stat-card">
			<p class="stat-kicker">Application growth</p>
			<p class="stat-value">{story.highlights.totalGrowthMultiple.toFixed(2)}x</p>
			<p class="stat-note">{story.scope.availableAdmissionsStartYear} to {story.scope.availableAdmissionsEndYear}</p>
		</div>
		<div class="stat-card">
			<p class="stat-kicker">Latest Greek coverage</p>
			<p class="stat-value">{story.highlights.latestGreekUsable}/{story.highlights.latestGreekTotal}</p>
			<p class="stat-note">schools with usable rate values</p>
		</div>
	</div>
</header>

<section class="scrolly-section" aria-label="Scrollytelling: applicant surge and Greek snapshots">
	<Scrolly bind:activeStep>
		{#snippet graphic()}
			<div class="graphic-inner">
				<p class="graphic-step-label">Step {activeStep + 1} / {steps.length}</p>

				<AdmissionsGreekTimeline {yearly} {greekSnapshots} {activeStep} />

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

<section class="rank-section container">
	<div class="rank-section-head">
		<h2>Where the latest snapshot breaks expectations</h2>
		<p>
			Each dot is one university with a usable Greek-rate value in the latest snapshot. X-axis is
			applicant rank (2022, 1 = largest applicant pool). Y-axis is fraternity + sorority participation.
		</p>
	</div>

	<GreekRankStrip schools={latestSchools} />

	<p class="rank-footnote">
		Latest snapshot date: {formatSnapshotDate(story.scope.latestGreekSnapshotDate)}. Red band marks ranks
		1-50. Dashed lines mark Top-50 and 51-200 means.
	</p>
</section>

<section class="story-body container prose">
	<h2>What we checked before plotting</h2>
	<p>
		This is a structural read, not a claim about causality. Applicant demand, admissions policy, housing,
		and student life are driven by different factors. To keep the chart honest, we run explicit shape and
		coverage checks before any aggregation.
	</p>

	<div class="quality-grid" aria-label="Data quality checks">
		{#each qualityCards as card (card.label)}
			<article class="quality-card">
				<p class="quality-label">{card.label}</p>
				<p class="quality-value">{card.value}</p>
				<p class="quality-note">{card.note}</p>
			</article>
		{/each}
	</div>

	<h3>Greek snapshot coverage by cut</h3>
	<div class="coverage-wrap">
		<table class="coverage-table">
			<thead>
				<tr>
					<th scope="col">Snapshot</th>
					<th scope="col">Source</th>
					<th scope="col">Matched</th>
					<th scope="col">Usable rates</th>
					<th scope="col">Match check</th>
				</tr>
			</thead>
			<tbody>
				{#each greekSnapshots as snapshot (snapshot.snapshotDate)}
					{@const coverageCheck = coverageCheckByDate[snapshot.snapshotDate]}
					<tr>
						<td>{snapshot.snapshotYear}</td>
						<td>{snapshot.snapshotSource === 'live' ? 'Live page' : 'Wayback archive'}</td>
						<td>{snapshot.matchedSchools}/{snapshot.totalSchools}</td>
						<td>{snapshot.usableSchools}/{snapshot.totalSchools}</td>
						<td class={coverageCheck?.matchesAgree ? 'ok-check' : 'warn-check'}>
							{coverageCheck?.matchesAgree ? 'ok' : 'mismatch'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h3>Method notes</h3>
	<p>
		Requested admissions range is {story.scope.requestedAdmissionsStartYear}-
		{story.scope.requestedAdmissionsEndYear}. Source-backed admissions years are
		{story.scope.availableAdmissionsStartYear}-{story.scope.availableAdmissionsEndYear}.
	</p>
	<p>{story.meta.admissionsLimitNote}</p>
	<p>{story.meta.greekLimitNote}</p>
	<p>
		Greek percentages are taken from published values where present. If a row marks a category as
		"No" and uses a dash, we treat that rate as 0 for aggregation. "Not Reported" remains missing.
	</p>
	<p class="source-note">Updated: {story.meta.updated}</p>

	<h3>Sources</h3>
	<ul class="sources-list">
		{#each story.meta.sources as source (source.url)}
			<li>
				<strong>{source.name}</strong><br />
				<code>{source.url}</code>
			</li>
		{/each}
	</ul>
</section>

<style>
	.story-header {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background:
			radial-gradient(circle at 84% 8%, rgba(192, 57, 43, 0.12), transparent 44%),
			linear-gradient(180deg, rgba(250, 249, 247, 0.95), rgba(250, 249, 247, 1));
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
		max-width: 12ch;
		margin-bottom: 1.25rem;
	}

	.story-dek {
		font-size: var(--size-lg);
		color: var(--color-muted);
		max-width: 60ch;
		line-height: var(--leading-loose);
		margin-bottom: 1.6rem;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
		max-width: 980px;
	}

	.stat-card {
		background: #f2efea;
		border: 1px solid #e4ddd4;
		padding: 0.9rem 1rem;
	}

	.stat-kicker {
		font-size: var(--size-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.stat-value {
		font-size: clamp(1.2rem, 2.6vw, 1.9rem);
		line-height: 1.15;
		font-family: var(--font-display);
		margin-top: 0.2rem;
	}

	.stat-note {
		font-size: var(--size-sm);
		color: var(--color-muted);
		margin-top: 0.2rem;
	}

	.scrolly-section {
		border-bottom: 1px solid var(--color-border);
		background:
			linear-gradient(180deg, rgba(232, 226, 215, 0.22), rgba(250, 249, 247, 0)),
			var(--color-bg);
	}

	.rank-section {
		padding-top: var(--space-md);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background:
			linear-gradient(180deg, rgba(245, 241, 233, 0.85), rgba(250, 249, 247, 0.98));
	}

	.rank-section-head {
		max-width: 68ch;
		margin-bottom: 1rem;
	}

	.rank-section-head h2 {
		font-size: var(--size-xl);
		margin-bottom: 0.7rem;
	}

	.rank-section-head p {
		font-size: var(--size-base);
		color: var(--color-muted);
		line-height: var(--leading-loose);
	}

	.rank-footnote {
		font-size: var(--size-sm);
		color: var(--color-muted);
		margin-top: 0.8rem;
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

	.story-body h2,
	.story-body h3 {
		margin-bottom: 1rem;
	}

	.story-body h3 {
		margin-top: 2.2rem;
		font-size: 1.45rem;
	}

	.quality-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.quality-card {
		border: 1px solid var(--color-border);
		background: #f4f1eb;
		padding: 0.85rem 0.9rem;
	}

	.quality-label {
		font-size: var(--size-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.quality-value {
		font-family: var(--font-display);
		font-size: 1.26rem;
		margin-top: 0.15rem;
	}

	.quality-note {
		font-size: var(--size-sm);
		color: var(--color-muted);
		margin-top: 0.22rem;
	}

	.coverage-wrap {
		overflow-x: auto;
	}

	.coverage-table {
		border-collapse: collapse;
		width: 100%;
		min-width: 520px;
		font-family: var(--font-ui);
		font-size: var(--size-sm);
	}

	.coverage-table th,
	.coverage-table td {
		border-bottom: 1px solid var(--color-border);
		padding: 0.5rem 0.45rem;
		text-align: left;
	}

	.coverage-table th {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.coverage-table .ok-check {
		color: #2f6c47;
	}

	.coverage-table .warn-check {
		color: var(--color-accent);
	}

	.source-note {
		font-size: var(--size-xs);
		color: var(--color-muted);
		letter-spacing: 0.03em;
		margin-top: 1.6rem;
	}

	.sources-list {
		margin-top: 0.5rem;
		padding-left: 1.1rem;
		font-size: var(--size-sm);
		font-family: var(--font-ui);
	}

	.sources-list li + li {
		margin-top: 0.32rem;
	}

	.sources-list code {
		font-size: 0.78rem;
		color: var(--color-muted);
	}

	@media (max-width: 960px) {
		.quick-stats,
		.quality-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
