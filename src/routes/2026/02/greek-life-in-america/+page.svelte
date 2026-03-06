<script lang="ts">
	import Scrolly from '$lib/scrolly/Scrolly.svelte';
	import ScrollyStep from '$lib/scrolly/ScrollyStep.svelte';
	import CollegeGreekScatter from '$lib/components/CollegeGreekScatter.svelte';
	import AdmissionsGreekTimeline from '$lib/components/AdmissionsGreekTimeline.svelte';
	import GreekRankStrip from '$lib/components/GreekRankStrip.svelte';
	import USStateChoropleth from '$lib/components/USStateChoropleth.svelte';
	import type { PageData } from './$types';

	// ─── Types ─────────────────────────────────────────────────────────────────

	interface University {
		name: string;
		applicants: number;
		admit_rate: number;
		greek_rate: number;
		control: string;
	}

	interface ScatterData {
		meta: { source: string; updated: string; caveat: string };
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
		regression: { slope: number; intercept: number };
		universities: University[];
	}

	interface SourceLink { name: string; url: string; }

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

	interface StateMetricPoint {
		stateAbbr: string;
		schoolsInTop200: number;
		applicants2022: number;
		latestGreekUsableSchools: number;
		latestGreekAverage: number | null;
	}

	interface CoverageCheckPoint {
		snapshotDate: string;
		reportedMatches: number;
		computedMatches: number;
		matchesAgree: boolean;
	}

	interface LongitudinalPayload {
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
			stateMetrics: StateMetricPoint[];
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

	// ─── Data ──────────────────────────────────────────────────────────────────

	let { data }: { data: PageData } = $props();
	const scatter = $derived(data.scatter as ScatterData);
	const story = $derived(data.longitudinal as LongitudinalPayload);

	// ─── Scrolly state ─────────────────────────────────────────────────────────

	let scatterStep = $state(0);
	let timelineStep = $state(0);

	// ─── Scatter-derived ───────────────────────────────────────────────────────

	const megaCount = $derived(scatter.summary.mega_applicant_schools.length);
	const megaLowCount = $derived(scatter.summary.mega_low_greek_schools.length);
	const heavyCount = $derived(scatter.summary.greek_heavy_schools.length);
	const noGreekCount = $derived(scatter.summary.no_greek_schools.length);
	const megaLowExamples = $derived(scatter.summary.mega_low_greek_schools.slice(0, 5).join(', '));
	const greekHeavyExamples = $derived(scatter.summary.greek_heavy_schools.slice(0, 5).join(', '));
	const noGreekExamples = $derived(scatter.summary.no_greek_schools.slice(0, 5).join(', '));

	// ─── Timeline-derived ──────────────────────────────────────────────────────

	const yearly = $derived(story.series.yearly);
	const greekSnapshots = $derived(story.series.greekSnapshots);
	const latestSchools = $derived(story.series.latestSchools);
	const stateMetrics = $derived(story.series.stateMetrics);
	const firstYear = $derived(yearly[0]);
	const lastYear = $derived(yearly[yearly.length - 1]);
	const top50ShareShiftPoints = $derived(
		(story.highlights.top50ShareTo - story.highlights.top50ShareFrom) * 100
	);
	const admitRateShiftPoints = $derived(
		(story.highlights.admitRateTo - story.highlights.admitRateFrom) * 100
	);
	const latestGreekCoveragePct = $derived(
		story.highlights.latestGreekTotal > 0
			? (story.highlights.latestGreekUsable / story.highlights.latestGreekTotal) * 100
			: 0
	);
	const coverageCheckByDate = $derived(
		Object.fromEntries(story.checks.coverageChecks.map((p) => [p.snapshotDate, p]))
	);

	// ─── Steps ─────────────────────────────────────────────────────────────────

	const scatterSteps = $derived([
		{
			id: 0,
			label: 'The question',
			headline: 'Do giant applicant pools crowd out Greek life?',
			caption:
				'As selective admissions scales nationally, fraternities and sororities are not growing at the same pace everywhere. Some campuses anchor social life around Greek organizations; others barely register them.'
		},
		{
			id: 1,
			label: 'The dataset',
			headline: `${scatter.summary.total_applicants.toLocaleString('en-US')} applicants across ${scatter.summary.universities_analyzed} universities.`,
			caption: `Common Data Set applicants (section C1) mapped against each school's reported fraternity/sorority participation. Sample median is ${Math.round(scatter.summary.applicant_median / 1000)}k applicants.`
		},
		{
			id: 2,
			label: 'Mega-applicant schools',
			headline: `${megaCount} universities crossed ${Math.round(scatter.summary.mega_applicant_cutoff / 1000)}k applicants.`,
			caption: `${megaLowCount} of them sit at 15% Greek participation or lower. The largest applicant engines in this sample mostly cluster in low-Greek territory.`
		},
		{
			id: 3,
			label: 'Greek-heavy campuses',
			headline: `${heavyCount} campuses still run at ${scatter.summary.greek_heavy_cutoff}%+ Greek participation.`,
			caption: `${scatter.summary.top_greek_school} leads at ${scatter.summary.top_greek_rate}%. Scale does not erase campus culture — it redistributes where that culture dominates.`
		},
		{
			id: 4,
			label: 'The correlation',
			headline: `Applicants and Greek participation move in opposite directions (r = ${scatter.summary.correlation_applicants_greek}).`,
			caption: `${noGreekCount} schools report essentially no Greek membership. The trend is clear, but outliers still matter: admissions scale and social structure are related, not identical.`
		}
	]);

	const timelineSteps = $derived([
		{
			id: 0,
			label: 'Balanced panel',
			headline: `${story.scope.balancedSchoolCount} universities with complete admissions data, ${story.scope.availableAdmissionsStartYear}–${story.scope.availableAdmissionsEndYear}.`,
			caption:
				'We keep this panel fixed across time to avoid fake trend breaks created by schools appearing only in later years.'
		},
		{
			id: 1,
			label: 'Application surge',
			headline: `Applications rose from ${formatInt(firstYear?.applicantsBalanced ?? 0)} to ${formatInt(lastYear?.applicantsBalanced ?? 0)}.`,
			caption: `That is a ${story.highlights.totalGrowthMultiple.toFixed(2)}x increase in a like-for-like panel over 21 years.`
		},
		{
			id: 2,
			label: 'Concentration',
			headline: `Top-50 magnets grew ${story.highlights.top50GrowthMultiple.toFixed(2)}x, ranks 51–200 grew ${story.highlights.restGrowthMultiple.toFixed(2)}x.`,
			caption: `Top-50 share of all applications moved from ${formatPct(story.highlights.top50ShareFrom * 100)} to ${formatPct(story.highlights.top50ShareTo * 100)} — the surge was not evenly distributed.`
		},
		{
			id: 3,
			label: 'Selectivity',
			headline: `Admit rate fell from ${formatPct(story.highlights.admitRateFrom * 100)} to ${formatPct(story.highlights.admitRateTo * 100)}.`,
			caption:
				story.highlights.admitRatePandemicJump !== null
					? `A temporary pandemic bump in 2020 (+${formatPct(story.highlights.admitRatePandemicJump * 100)} pts) does not reverse the long-run direction.`
					: 'Admit rates tightened over the full period in this panel.'
		},
		{
			id: 4,
			label: 'Greek across the surge',
			headline: `Latest snapshot: top-50 average ${formatPct(story.highlights.latestGreekTop50)} vs ${formatPct(story.highlights.latestGreekRest)} for ranks 51–200.`,
			caption: `${story.highlights.latestGreekUsable}/${story.highlights.latestGreekTotal} schools have usable Greek-rate values. Top-50 and lower-ranked schools show different Greek cultures even as both ride the same application wave.`
		}
	]);

	const qualityCards = $derived([
		{
			label: 'Admissions rows',
			value: `${formatInt(story.checks.admissionsRowsActual)} / ${formatInt(story.checks.admissionsRowsExpected)}`,
			note: story.checks.admissionsRowsAgree ? 'Shape check passed' : 'Shape mismatch'
		},
		{
			label: 'Balanced coverage in latest year',
			value: formatPct(story.checks.balancedPanelShareInLatestYear * 100),
			note: 'Of 2022 applicants captured by the fixed panel'
		},
		{
			label: 'Greek match checks',
			value: story.checks.coverageChecksAgree ? 'All snapshots agree' : 'Mismatch found',
			note: 'Reported snapshot matches vs panel recomputation'
		}
	]);

	function onScatterStep(index: number) { scatterStep = index; }
	function onTimelineStep(index: number) { timelineStep = index; }

	function formatInt(value: number): string {
		return Math.round(value).toLocaleString('en-US');
	}
	function formatPct(value: number): string {
		return `${value.toFixed(1)}%`;
	}
	function formatSnapshotDate(value: string | null): string {
		if (!value) return 'n/a';
		return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>How Popular Is Greek Life? — pointzerofive</title>
	<meta
		name="description"
		content="At the largest US universities, Greek participation often shrinks as applicant pools grow. We look at the correlation, the 20-year backdrop, and where the pattern breaks."
	/>
</svelte:head>

<!-- ──────────────────────── HEADER ──────────────────────── -->

<header class="story-header container">
	<p class="story-meta">
		<time datetime="2026-03-06">March 2026</time>
		<span>.</span>
		<span>Education data</span>
		<span>.</span>
		<span>{scatter.summary.universities_analyzed} universities · {story.scope.top200Count} in panel</span>
	</p>
	<h1 class="story-title">How Popular Is Greek Life?</h1>
	<p class="story-dek">
		As US campuses attract ever-larger applicant pools, fraternity and sorority participation often
		moves in the opposite direction. We map the cross-sectional correlation, trace it across two
		decades of application data, and find the schools that break the rule.
	</p>

	<div class="quick-stats" aria-label="Story quick stats">
		<div class="stat-card">
			<p class="stat-kicker">Correlation</p>
			<p class="stat-value">r = {scatter.summary.correlation_applicants_greek}</p>
			<p class="stat-note">applicants vs Greek rate, {scatter.summary.universities_analyzed} schools</p>
		</div>
		<div class="stat-card">
			<p class="stat-kicker">Application growth</p>
			<p class="stat-value">{story.highlights.totalGrowthMultiple.toFixed(2)}x</p>
			<p class="stat-note">{story.scope.availableAdmissionsStartYear}–{story.scope.availableAdmissionsEndYear}, balanced panel</p>
		</div>
		<div class="stat-card">
			<p class="stat-kicker">Greek-heavy campuses</p>
			<p class="stat-value">{heavyCount}</p>
			<p class="stat-note">still at {scatter.summary.greek_heavy_cutoff}%+ participation</p>
		</div>
		<div class="stat-card">
			<p class="stat-kicker">Mega-applicant, low Greek</p>
			<p class="stat-value">{megaLowCount}</p>
			<p class="stat-note">of {megaCount} mega-applicant schools at ≤15%</p>
		</div>
	</div>
</header>

<!-- ──────────────────── ACT 1: SCATTER SCROLLY ──────────────────── -->

<div class="act-label container">
	<span class="act-number">Part 1</span>
	<span class="act-title">The correlation</span>
</div>

<section class="scrolly-section" aria-label="Scrollytelling: applicants vs Greek life">
	<Scrolly bind:activeStep={scatterStep}>
		{#snippet graphic()}
			<div class="graphic-inner">
				<p class="graphic-step-label">Step {scatterStep + 1} / {scatterSteps.length}</p>
				<CollegeGreekScatter
					universities={scatter.universities}
					applicantMedian={scatter.summary.applicant_median}
					greekAverage={scatter.summary.average_greek_rate}
					megaCutoff={scatter.summary.mega_applicant_cutoff}
					greekHeavyCutoff={scatter.summary.greek_heavy_cutoff}
					regression={scatter.regression}
					activeStep={scatterStep}
				/>
				<div class="graphic-dots" aria-hidden="true">
					{#each scatterSteps as step, i (step.id)}
						<span class="progress-dot" class:active={scatterStep === i}></span>
					{/each}
				</div>
			</div>
		{/snippet}

		{#each scatterSteps as step (step.id)}
			<ScrollyStep index={step.id} active={scatterStep === step.id} onEnter={onScatterStep}>
				<p class="step-label">{step.label}</p>
				<h2 class="step-headline">{step.headline}</h2>
				<p class="step-caption">{step.caption}</p>
			</ScrollyStep>
		{/each}
	</Scrolly>
</section>

<section class="interlude container prose">
	<p>
		The negative relationship (r = {scatter.summary.correlation_applicants_greek}) is clear in the
		cross-section, but it is descriptive, not causal. A public flagship with 90k applicants and a
		private campus with 11k applicants serve different housing markets, student demographics, and
		social calendars.
	</p>
	<p>
		What the scatter does provide is a strong editorial baseline: when applications scale quickly,
		Greek-life participation often does not follow. To understand why that might be, we need to trace
		the surge over time.
	</p>
</section>

<!-- ──────────────────── ACT 2: TIMELINE SCROLLY ──────────────────── -->

<div class="act-label container">
	<span class="act-number">Part 2</span>
	<span class="act-title">The 20-year backdrop</span>
</div>

<section class="scrolly-section scrolly-section--light" aria-label="Scrollytelling: applicant surge 2001-2022">
	<Scrolly bind:activeStep={timelineStep}>
		{#snippet graphic()}
			<div class="graphic-inner">
				<p class="graphic-step-label">Step {timelineStep + 1} / {timelineSteps.length}</p>
				<AdmissionsGreekTimeline {yearly} {greekSnapshots} activeStep={timelineStep} />
				<div class="graphic-dots" aria-hidden="true">
					{#each timelineSteps as step, i (step.id)}
						<span class="progress-dot" class:active={timelineStep === i}></span>
					{/each}
				</div>
			</div>
		{/snippet}

		{#each timelineSteps as step (step.id)}
			<ScrollyStep index={step.id} active={timelineStep === step.id} onEnter={onTimelineStep}>
				<p class="step-label">{step.label}</p>
				<h2 class="step-headline">{step.headline}</h2>
				<p class="step-caption">{step.caption}</p>
			</ScrollyStep>
		{/each}
	</Scrolly>
</section>

<!-- ──────────────────── ACT 3: RANK STRIP ──────────────────── -->

<div class="act-label container">
	<span class="act-number">Part 3</span>
	<span class="act-title">Who breaks the pattern?</span>
</div>

<section class="rank-section container">
	<div class="rank-section-head">
		<h2>Greek rate by applicant rank</h2>
		<p>
			Each dot is one university with a usable Greek-rate value in the latest snapshot. X-axis is
			applicant rank (2022, 1 = largest pool). Y-axis is fraternity + sorority participation.
			The red band marks the top-50 schools — those that attract the most applicants — and you can
			see how they compare to the rest.
		</p>
	</div>
	<GreekRankStrip schools={latestSchools} />
	<p class="rank-footnote">
		Latest snapshot: {formatSnapshotDate(story.scope.latestGreekSnapshotDate)}. Red band marks ranks 1–50. Dashed lines mark group means.
	</p>
</section>

<!-- ──────────────────── ACT 4: STATE MAP ──────────────────── -->

<div class="act-label container">
	<span class="act-number">Part 4</span>
	<span class="act-title">The geography</span>
</div>

<section class="state-map-section container">
	<div class="state-map-head">
		<h2>Where the volume and Greek life sit</h2>
		<p>
			This map splits the top-200 panel by US state. Switch metrics to compare institutional count,
			total applicant weight, and latest Greek snapshot averages by state.
		</p>
	</div>
	<USStateChoropleth {stateMetrics} />
</section>

<!-- ──────────────────── METHODOLOGY ──────────────────── -->

<section class="story-body container prose">
	<h2>How to read this piece</h2>
	<p>
		The scatter chart uses a single cross-sectional snapshot of {scatter.summary.universities_analyzed}
		institutions. The timeline uses a fixed panel of {story.scope.balancedSchoolCount} schools
		that reported admissions every year from {story.scope.availableAdmissionsStartYear} to
		{story.scope.availableAdmissionsEndYear}, ensuring like-for-like comparisons.
	</p>
	<p>
		In this fixed panel, applications grew {story.highlights.totalGrowthMultiple.toFixed(2)}x. Growth
		was not evenly shared: top-50 magnets expanded faster, and their application share shifted by
		{formatPct(top50ShareShiftPoints)} percentage points. Selectivity tightened — the admit rate moved
		from {formatPct(story.highlights.admitRateFrom * 100)} to {formatPct(story.highlights.admitRateTo * 100)},
		a shift of {formatPct(admitRateShiftPoints)} points.
	</p>

	<h3>What the Greek overlay adds</h3>
	<p>
		Greek participation is not a federal annual series. We treat it as snapshot evidence. In the latest
		cut, {story.highlights.latestGreekUsable}/{story.highlights.latestGreekTotal} institutions
		({formatPct(latestGreekCoveragePct)}) have usable values. The rank strip separates two claims
		often mixed together: "application scale is concentrating" and "campus social organization is
		converging." The first is true in this panel. The second is not.
	</p>

	<h3>Data quality checks</h3>
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
					<th scope="col">Year</th>
					<th scope="col">Source</th>
					<th scope="col">Matched</th>
					<th scope="col">Usable rates</th>
					<th scope="col">Check</th>
				</tr>
			</thead>
			<tbody>
				{#each greekSnapshots as snapshot (snapshot.snapshotDate)}
					{@const cc = coverageCheckByDate[snapshot.snapshotDate]}
					<tr>
						<td>{snapshot.snapshotYear}</td>
						<td>{snapshot.snapshotSource === 'live' ? 'Live page' : 'Wayback archive'}</td>
						<td>{snapshot.matchedSchools}/{snapshot.totalSchools}</td>
						<td>{snapshot.usableSchools}/{snapshot.totalSchools}</td>
						<td class={cc?.matchesAgree ? 'ok-check' : 'warn-check'}>
							{cc?.matchesAgree ? 'ok' : 'mismatch'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h3>Method notes</h3>
	<p>
		Scatter data: {scatter.meta.source} — updated {scatter.meta.updated}.<br />
		Caveat: {scatter.meta.caveat}
	</p>
	<p>
		Admissions panel: requested {story.scope.requestedAdmissionsStartYear}–{story.scope.requestedAdmissionsEndYear};
		source-backed {story.scope.availableAdmissionsStartYear}–{story.scope.availableAdmissionsEndYear}.
	</p>
	<p>{story.meta.admissionsLimitNote}</p>
	<p>{story.meta.greekLimitNote}</p>
	<p class="source-note">Panel updated: {story.meta.updated}</p>

	<h3>Sources</h3>
	<ul class="sources-list">
		{#each story.meta.sources as source (source.url)}
			<li><strong>{source.name}</strong><br /><code>{source.url}</code></li>
		{/each}
	</ul>
</section>

<style>
	/* ── Story header ── */
	.story-header {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background:
			radial-gradient(circle at 80% 10%, rgba(192, 57, 43, 0.10), transparent 48%),
			linear-gradient(180deg, rgba(250, 249, 247, 0.96), rgba(250, 249, 247, 1));
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
		max-width: 64ch;
		line-height: var(--leading-loose);
		margin-bottom: 1.8rem;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.7rem;
		max-width: 980px;
	}

	.stat-card {
		background: #f2efea;
		border: 1px solid #e4ddd4;
		padding: 0.85rem 1rem;
	}

	.stat-kicker {
		font-size: var(--size-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.stat-value {
		font-size: clamp(1.1rem, 2.4vw, 1.75rem);
		line-height: 1.15;
		font-family: var(--font-display);
		margin-top: 0.2rem;
	}

	.stat-note {
		font-size: var(--size-sm);
		color: var(--color-muted);
		margin-top: 0.2rem;
	}

	/* ── Act labels ── */
	.act-label {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		padding-top: var(--space-md);
		padding-bottom: 0.5rem;
		border-top: 2px solid var(--color-accent);
	}

	.act-number {
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		font-family: var(--font-ui);
		font-weight: 600;
	}

	.act-title {
		font-size: var(--size-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
		font-family: var(--font-ui);
	}

	/* ── Scrolly sections ── */
	.scrolly-section {
		border-bottom: 1px solid var(--color-border);
	}

	.scrolly-section--light {
		background: linear-gradient(180deg, rgba(232, 226, 215, 0.22), rgba(250, 249, 247, 0));
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

	.progress-dot.active { background: var(--color-accent); }

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

	/* ── Interlude ── */
	.interlude {
		padding-top: var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border);
		max-width: 68ch;
	}

	/* ── Rank strip ── */
	.rank-section {
		padding-top: var(--space-md);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background: linear-gradient(180deg, rgba(245, 241, 233, 0.85), rgba(250, 249, 247, 0.98));
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

	/* ── State map ── */
	.state-map-section {
		padding-top: var(--space-md);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background: linear-gradient(180deg, rgba(250, 247, 242, 1), rgba(250, 249, 247, 0.98));
	}

	.state-map-head {
		max-width: 70ch;
		margin-bottom: 1rem;
	}

	.state-map-head h2 {
		font-size: var(--size-xl);
		margin-bottom: 0.7rem;
	}

	.state-map-head p {
		font-size: var(--size-base);
		color: var(--color-muted);
		line-height: var(--leading-loose);
	}

	/* ── Story body ── */
	.story-body {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-xl);
	}

	.story-body h2,
	.story-body h3 { margin-bottom: 1rem; }

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

	.coverage-wrap { overflow-x: auto; }

	.coverage-table {
		border-collapse: collapse;
		width: 100%;
		min-width: 480px;
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

	.coverage-table .ok-check { color: #2f6c47; }
	.coverage-table .warn-check { color: var(--color-accent); }

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

	.sources-list li + li { margin-top: 0.32rem; }

	.sources-list code {
		font-size: 0.78rem;
		color: var(--color-muted);
	}

	@media (max-width: 960px) {
		.quick-stats { grid-template-columns: repeat(2, 1fr); }
		.quality-grid { grid-template-columns: 1fr; }
	}

	@media (max-width: 560px) {
		.quick-stats { grid-template-columns: 1fr; }
	}
</style>
