<script lang="ts">
	interface University {
		name: string;
		applicants: number;
		greek_rate: number;
		admit_rate: number;
	}

	interface Regression {
		slope: number;
		intercept: number;
	}

	interface Props {
		universities: University[];
		activeStep: number;
		applicantMedian: number;
		greekAverage: number;
		megaCutoff: number;
		greekHeavyCutoff: number;
		regression: Regression;
	}

	let {
		universities,
		activeStep,
		applicantMedian,
		greekAverage,
		megaCutoff,
		greekHeavyCutoff,
		regression
	}: Props = $props();

	const W = 500;
	const H = 340;
	const marginLeft = 68;
	const marginRight = 20;
	const marginTop = 22;
	const marginBottom = 40;
	const innerW = W - marginLeft - marginRight;
	const innerH = H - marginTop - marginBottom;

	const maxApplicants = $derived(Math.max(...universities.map((u) => u.applicants)));
	const maxGreek = $derived(
		Math.max(80, Math.ceil(Math.max(...universities.map((u) => u.greek_rate)) / 10) * 10)
	);

	const xScale = $derived((value: number) => (value / maxApplicants) * innerW);
	const yScale = $derived((value: number) => innerH - (value / maxGreek) * innerH);

	const xTicks = $derived(() => {
		const base = [0, 40_000, 80_000, 120_000, maxApplicants];
		return [...new Set(base.filter((v) => v <= maxApplicants))];
	});

	const yTicks = [0, 20, 40, 60, 80];

	const megaLowGreekNames = $derived(
		universities
			.filter((u) => u.applicants >= megaCutoff && u.greek_rate <= 15)
			.map((u) => u.name)
	);

	const outlierNames = $derived(
		new Set([
			...megaLowGreekNames,
			...universities.filter((u) => u.greek_rate >= 50 || u.greek_rate === 0).map((u) => u.name)
		])
	);

	function shortName(name: string): string {
		const map: Record<string, string> = {
			'University of California Los Angeles': 'UCLA',
			'University of California Berkeley': 'UC Berkeley',
			'New York University': 'NYU',
			'University of Southern California': 'USC',
			'University of Texas at Austin': 'UT Austin',
			'University of Notre Dame': 'Notre Dame',
			'University of Mississippi': 'Ole Miss',
			'University of Alabama': 'Alabama',
			'University of Michigan': 'Michigan',
			'University of Florida': 'Florida',
			'Penn State University Park': 'Penn State',
			'Wake Forest University': 'Wake Forest',
			'Washington and Lee University': 'Washington & Lee',
			'Vanderbilt University': 'Vanderbilt',
			'Boston College': 'Boston College'
		};

		return map[name] ?? name;
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function getState(university: University): 'highlight' | 'muted' | 'normal' | 'dimmed' {
		if (activeStep === 0) return 'dimmed';
		if (activeStep === 1) return 'normal';
		if (activeStep === 2) {
			return university.applicants >= megaCutoff ? 'highlight' : 'muted';
		}
		if (activeStep === 3) {
			return university.greek_rate >= greekHeavyCutoff ? 'highlight' : 'muted';
		}
		if (activeStep >= 4) {
			return outlierNames.has(university.name) ? 'highlight' : 'muted';
		}
		return 'normal';
	}

	function showLabel(university: University): boolean {
		if (activeStep === 0) return false;
		if (activeStep === 1) {
			return [
				'University of California Los Angeles',
				'Washington and Lee University',
				'Vanderbilt University',
				'University of Notre Dame'
			].includes(university.name);
		}
		if (activeStep === 2) return university.applicants >= megaCutoff;
		if (activeStep === 3) return university.greek_rate >= greekHeavyCutoff;
		return outlierNames.has(university.name);
	}

	const showGuides = $derived(activeStep >= 4);
	const showRegression = $derived(activeStep >= 4);

	const regY0 = $derived(clamp(regression.intercept, 0, maxGreek));
	const regYMax = $derived(clamp(regression.slope * maxApplicants + regression.intercept, 0, maxGreek));
</script>

<svg
	viewBox={`0 0 ${W} ${H}`}
	role="img"
	aria-label="Scatter plot: applications versus fraternity and sorority participation rates"
	class="scatter"
>
	<text x={marginLeft} y={14} class="axis-title">Applicants (x) vs Greek participation (y)</text>

	<g transform={`translate(${marginLeft}, ${marginTop})`}>
		{#if showGuides}
			<line
				x1={xScale(applicantMedian)}
				x2={xScale(applicantMedian)}
				y1={0}
				y2={innerH}
				class="ref-line"
				stroke-dasharray="4 3"
			/>
			<line
				x1={0}
				x2={innerW}
				y1={yScale(greekAverage)}
				y2={yScale(greekAverage)}
				class="ref-line"
				stroke-dasharray="4 3"
			/>

			<text x={xScale(applicantMedian) + 6} y={12} class="ref-label">
				median {Math.round(applicantMedian / 1000)}k
			</text>
			<text x={6} y={yScale(greekAverage) - 6} class="ref-label">
				avg {greekAverage}%
			</text>
		{/if}

		{#if showRegression}
			<line
				x1={xScale(0)}
				x2={xScale(maxApplicants)}
				y1={yScale(regY0)}
				y2={yScale(regYMax)}
				class="trend-line"
			/>
		{/if}

		{#each universities as university (university.name)}
			{@const state = getState(university)}
			{@const cx = xScale(university.applicants)}
			{@const cy = yScale(university.greek_rate)}

			<circle cx={cx} cy={cy} r={state === 'highlight' ? 6.5 : 4.5} class={`dot ${state}`} />

			{#if showLabel(university)}
				{@const rightSide = cx > innerW * 0.72}
				<text
					x={rightSide ? cx - 8 : cx + 8}
					y={cy - 8}
					text-anchor={rightSide ? 'end' : 'start'}
					class={`point-label ${state}`}
				>
					{shortName(university.name)}
				</text>
			{/if}
		{/each}
	</g>

	<g transform={`translate(${marginLeft}, ${marginTop + innerH + 10})`}>
		<line x1={0} x2={innerW} y1={0} y2={0} class="axis" />
		{#each xTicks() as tick (tick)}
			<line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={5} class="tick" />
			<text x={xScale(tick)} y={17} text-anchor="middle" class="tick-label">
				{Math.round(tick / 1000)}k
			</text>
		{/each}
	</g>

	<g transform={`translate(${marginLeft - 8}, ${marginTop})`}>
		<line x1={8} x2={8} y1={0} y2={innerH} class="axis" />
		{#each yTicks as tick (tick)}
			<line x1={8} x2={3} y1={yScale(tick)} y2={yScale(tick)} class="tick" />
			<text x={0} y={yScale(tick) + 4} text-anchor="end" class="tick-label">{tick}%</text>
		{/each}
	</g>
</svg>

<style>
	.scatter {
		width: 100%;
		height: 100%;
		max-height: 340px;
		overflow: visible;
		font-family: var(--font-ui);
	}

	.axis,
	.tick {
		stroke: var(--color-border);
		stroke-width: 1;
	}

	.axis-title {
		font-size: 10px;
		fill: var(--color-muted);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.tick-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.ref-line {
		stroke: var(--color-muted);
		stroke-width: 1;
		opacity: 0.55;
	}

	.ref-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.trend-line {
		stroke: var(--color-accent);
		stroke-width: 1.6;
		opacity: 0.75;
	}

	.dot {
		transition:
			fill 320ms ease,
			opacity 320ms ease,
			r 320ms ease;
	}

	.dot.normal {
		fill: #3f5b78;
		opacity: 0.88;
	}

	.dot.highlight {
		fill: var(--color-accent);
		opacity: 1;
	}

	.dot.muted {
		fill: #98a4b0;
		opacity: 0.3;
	}

	.dot.dimmed {
		fill: #b7b1aa;
		opacity: 0.4;
	}

	.point-label {
		font-size: 10px;
		transition:
			fill 320ms ease,
			opacity 320ms ease;
	}

	.point-label.normal,
	.point-label.highlight {
		fill: var(--color-text);
		opacity: 0.95;
	}

	.point-label.muted,
	.point-label.dimmed {
		fill: var(--color-muted);
		opacity: 0.5;
	}
</style>
