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
	const marginTop = 30;
	const marginBottom = 40;
	const innerW = W - marginLeft - marginRight;
	const innerH = H - marginTop - marginBottom;

	// Hover state
	let hoveredUni = $state<University | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let svgEl = $state<SVGSVGElement | null>(null);

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
			'Washington and Lee University': 'Wash & Lee',
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
		if (activeStep === 2) return university.applicants >= megaCutoff ? 'highlight' : 'muted';
		if (activeStep === 3) return university.greek_rate >= greekHeavyCutoff ? 'highlight' : 'muted';
		if (activeStep >= 4) return outlierNames.has(university.name) ? 'highlight' : 'muted';
		return 'normal';
	}

	function showLabel(university: University): boolean {
		if (activeStep === 0) return false;
		if (activeStep === 1) {
			return ['University of California Los Angeles', 'Washington and Lee University', 'Vanderbilt University', 'University of Notre Dame'].includes(university.name);
		}
		if (activeStep === 2) return university.applicants >= megaCutoff;
		if (activeStep === 3) return university.greek_rate >= greekHeavyCutoff;
		return outlierNames.has(university.name);
	}

	const showGuides    = $derived(activeStep >= 4);
	const showRegression = $derived(activeStep >= 4);

	const regY0   = $derived(clamp(regression.intercept, 0, maxGreek));
	const regYMax = $derived(clamp(regression.slope * maxApplicants + regression.intercept, 0, maxGreek));

	// Dot radius by state
	function dotRadius(state: string): number {
		return state === 'highlight' ? 8 : 5.5;
	}

	// Tooltip: convert SVG coords from pointer event
	function handleDotEnter(e: PointerEvent, uni: University) {
		hoveredUni = uni;
		updateTooltipPos(e);
	}

	function handleDotMove(e: PointerEvent) {
		if (hoveredUni) updateTooltipPos(e);
	}

	function updateTooltipPos(e: PointerEvent) {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const scaleX = W / rect.width;
		const scaleY = H / rect.height;
		tooltipX = (e.clientX - rect.left) * scaleX;
		tooltipY = (e.clientY - rect.top) * scaleY;
	}

	function handleDotLeave() {
		hoveredUni = null;
	}

	// Tooltip box dimensions
	const TW = 160;
	const TH = 64;
</script>

<svg
	bind:this={svgEl}
	viewBox={`0 0 ${W} ${H}`}
	role="img"
	aria-label="Scatter plot: applications versus fraternity and sorority participation rates"
	class="scatter"
	onpointermove={handleDotMove}
>
	<!-- Editorial title that changes with active step -->
	<text x={marginLeft} y={16} class="axis-title">
		{#if activeStep <= 1}As applicants grow…{:else if activeStep === 2}Mega-applicant schools cluster low{:else if activeStep === 3}Greek-heavy campuses stay small{:else}…Greek participation falls (r = {regression.slope < 0 ? '−' : '+'}{Math.abs(regression.slope * 10000).toFixed(1)} per 10k apps){/if}
	</text>

	<g transform={`translate(${marginLeft}, ${marginTop})`}>
		<!-- Guide lines -->
		{#if showGuides}
			<line x1={xScale(applicantMedian)} x2={xScale(applicantMedian)} y1={0} y2={innerH} class="ref-line" stroke-dasharray="4 3" />
			<line x1={0} x2={innerW} y1={yScale(greekAverage)} y2={yScale(greekAverage)} class="ref-line" stroke-dasharray="4 3" />
			<text x={xScale(applicantMedian) + 6} y={12} class="ref-label">median {Math.round(applicantMedian / 1000)}k</text>
			<text x={6} y={yScale(greekAverage) - 6} class="ref-label">avg {greekAverage}%</text>
		{/if}

		<!-- Regression line -->
		{#if showRegression}
			<line x1={xScale(0)} x2={xScale(maxApplicants)} y1={yScale(regY0)} y2={yScale(regYMax)} class="trend-line" />
		{/if}

		<!-- Dots -->
		{#each universities as university, i (university.name)}
			{@const state = getState(university)}
			{@const cx = xScale(university.applicants)}
			{@const cy = yScale(university.greek_rate)}
			{@const r = dotRadius(state)}
			{@const isHovered = hoveredUni?.name === university.name}

			<circle
				{cx} {cy} {r}
				class={`dot ${state}`}
				class:hovered={isHovered}
				style="--delay: {i * 18}ms"
				role="button"
				tabindex="0"
				aria-label="{shortName(university.name)}: {university.applicants.toLocaleString()} applicants, {university.greek_rate}% Greek"
				onpointerenter={(e) => handleDotEnter(e, university)}
				onpointerleave={handleDotLeave}
			/>

			{#if showLabel(university)}
				{@const rightSide = cx > innerW * 0.72}
				<text
					x={rightSide ? cx - r - 4 : cx + r + 4}
					y={cy - r - 3}
					text-anchor={rightSide ? 'end' : 'start'}
					class={`point-label ${state}`}
					style="--delay: {i * 18 + 200}ms"
				>
					{shortName(university.name)}
				</text>
			{/if}
		{/each}

		<!-- Tooltip (rendered on top) -->
		{#if hoveredUni}
			{@const tx = tooltipX - marginLeft > innerW * 0.6 ? tooltipX - marginLeft - TW - 12 : tooltipX - marginLeft + 12}
			{@const ty = tooltipY - marginTop < 80 ? tooltipY - marginTop + 10 : tooltipY - marginTop - TH - 10}
			<g class="tooltip-group" transform="translate({tx},{ty})">
				<rect x={0} y={0} width={TW} height={TH} rx={4} class="tooltip-bg" />
				<text x={10} y={20} class="tooltip-name">{shortName(hoveredUni.name)}</text>
				<text x={10} y={38} class="tooltip-stat">{hoveredUni.applicants.toLocaleString()} applicants</text>
				<text x={10} y={54} class="tooltip-stat">{hoveredUni.greek_rate}% Greek</text>
			</g>
		{/if}
	</g>

	<!-- X axis -->
	<g transform={`translate(${marginLeft}, ${marginTop + innerH + 10})`}>
		<line x1={0} x2={innerW} y1={0} y2={0} class="axis" />
		{#each xTicks() as tick (tick)}
			<line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={5} class="tick" />
			<text x={xScale(tick)} y={17} text-anchor="middle" class="tick-label">{Math.round(tick / 1000)}k</text>
		{/each}
	</g>

	<!-- Y axis -->
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

	.axis, .tick {
		stroke: var(--color-border);
		stroke-width: 1;
	}

	.axis-title {
		font-size: 11px;
		fill: var(--color-text);
		letter-spacing: 0.03em;
		font-style: italic;
		transition: fill 0.4s ease;
	}

	.tick-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.ref-line {
		stroke: var(--color-muted);
		stroke-width: 1;
		opacity: 0.5;
	}

	.ref-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.trend-line {
		stroke: var(--color-accent);
		stroke-width: 1.8;
		opacity: 0.7;
		stroke-dasharray: 6 3;
	}

	/* Dots with entrance animation */
	@keyframes dotIn {
		from { opacity: 0; transform: scale(0); }
		to   { opacity: 1; transform: scale(1); }
	}

	.dot {
		transform-origin: center;
		transform-box: fill-box;
		animation: dotIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
		animation-delay: var(--delay, 0ms);
		transition:
			fill 320ms ease,
			opacity 320ms ease,
			r 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: pointer;
	}

	.dot.normal   { fill: #3f5b78; opacity: 0.85; }
	.dot.highlight { fill: var(--color-accent); opacity: 1; }
	.dot.muted    { fill: #b0bac4; opacity: 0.25; }
	.dot.dimmed   { fill: #c5c0bb; opacity: 0.35; }

	.dot.hovered  {
		filter: drop-shadow(0 0 4px rgba(192, 57, 43, 0.5));
		opacity: 1 !important;
	}

	/* Labels */
	@keyframes labelIn {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.point-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.02em;
		animation: labelIn 0.35s ease backwards;
		animation-delay: var(--delay, 0ms);
		transition: fill 320ms ease, opacity 320ms ease;
		pointer-events: none;
	}

	.point-label.normal,
	.point-label.highlight { fill: var(--color-text); opacity: 1; }
	.point-label.muted,
	.point-label.dimmed    { fill: var(--color-muted); opacity: 0.4; }

	/* Tooltip */
	.tooltip-group {
		pointer-events: none;
	}

	.tooltip-bg {
		fill: var(--color-text);
		opacity: 0.94;
	}

	.tooltip-name {
		font-size: 11px;
		font-weight: 700;
		fill: var(--color-bg);
		letter-spacing: 0.02em;
	}

	.tooltip-stat {
		font-size: 10px;
		fill: rgba(255,255,255,0.7);
	}

	/* Light context overrides */
	:global(.light-page) .tooltip-bg {
		fill: #1a1a18;
	}
</style>
