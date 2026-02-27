<!--
  CityDotPlot.svelte
  ─────────────────────────────────────────────────────────────
  SVG horizontal dot plot of Italian city crosswalk scores.
  Reacts to `activeStep` to highlight different subsets of cities.

  Step 0 — all dimmed, question framing
  Step 1 — all visible, scores shown
  Step 2 — north highlighted (Bolzano, Trento, Milano) vs Crotone
  Step 3 — big-city underperformers (Roma, Napoli) highlighted
  Step 4 — national average line prominent, all equal
  ─────────────────────────────────────────────────────────────
-->
<script lang="ts">
	interface City {
		name: string;
		region: string;
		score: number;
	}

	interface Props {
		cities: City[];
		nationalAvg: number;
		activeStep: number;
	}

	let { cities, nationalAvg, activeStep }: Props = $props();

	// Layout constants
	const W = 420;
	const H = 320;
	const marginLeft = 80;
	const marginRight = 32;
	const marginTop = 24;
	const marginBottom = 32;
	const innerW = W - marginLeft - marginRight;
	const innerH = H - marginTop - marginBottom;

	// Sort cities by score descending (top = best)
	const sorted = $derived([...cities].sort((a, b) => b.score - a.score));

	// Scales
	const maxScore = 65;
	const xScale = $derived((v: number) => (v / maxScore) * innerW);
	const yStep = $derived(innerH / (sorted.length - 1));
	const yScale = $derived((i: number) => i * yStep);

	// Which cities to highlight per step (empty = no highlights = all normal)
	const highlights: Record<number, string[]> = {
		0: [],
		1: [],
		2: ['Bolzano', 'Trento', 'Crotone'],
		3: ['Roma', 'Napoli'],
		4: []
	};

	function getCityState(
		name: string,
		step: number
	): 'highlight' | 'muted' | 'normal' | 'dimmed' {
		if (step === 0) return 'dimmed';
		if (step === 4) return 'normal';
		const hl = highlights[step] ?? [];
		if (hl.length === 0) return 'normal';
		return hl.includes(name) ? 'highlight' : 'muted';
	}

	const showAvgLine = $derived(activeStep === 4 || activeStep === 3);
	const showLabels = $derived(activeStep >= 1);
	const showScores = $derived(activeStep >= 1);
</script>

<svg
	viewBox="0 0 {W} {H}"
	role="img"
	aria-label="Dot plot: crosswalk density scores for Italian cities"
	class="dot-plot"
>
	<!-- Y-axis label -->
	<text x={marginLeft - 8} y={marginTop - 8} class="axis-title" text-anchor="end">
		cities
	</text>

	<!-- X-axis: score axis -->
	<g transform="translate({marginLeft},{marginTop + innerH + 10})">
		<line x1="0" x2={innerW} y1="0" y2="0" class="axis-line" />
		{#each [0, 20, 40, 60] as tick}
			<line x1={xScale(tick)} x2={xScale(tick)} y1="0" y2="5" class="axis-tick" />
			<text x={xScale(tick)} y="16" class="axis-label" text-anchor="middle">{tick}</text>
		{/each}
		<text x={innerW / 2} y="30" class="axis-title" text-anchor="middle">
			crossings per 10 000 inhabitants
		</text>
	</g>

	<!-- Main plot area -->
	<g transform="translate({marginLeft},{marginTop})">
		<!-- National average line -->
		{#if showAvgLine}
			<line
				x1={xScale(nationalAvg)}
				x2={xScale(nationalAvg)}
				y1={-8}
				y2={innerH + 4}
				class="avg-line"
				stroke-dasharray="4 3"
			/>
			<text
				x={xScale(nationalAvg)}
				y={-12}
				class="avg-label"
				text-anchor="middle"
			>
				avg {nationalAvg}
			</text>
		{/if}

		<!-- City rows -->
		{#each sorted as city, i}
			{@const state = getCityState(city.name, activeStep)}
			{@const cy = yScale(i)}
			{@const cx = xScale(city.score)}

			<!-- Horizontal guide line -->
			<line
				x1="0"
				x2={cx - 6}
				y1={cy}
				y2={cy}
				class="guide-line city-{state}"
			/>

			<!-- City name label -->
			{#if showLabels}
				<text
					x={-6}
					y={cy}
					dy="0.35em"
					text-anchor="end"
					class="city-label city-{state}"
				>
					{city.name}
				</text>
			{:else}
				<line
					x1={-6}
					x2={-40}
					y1={cy}
					y2={cy}
					class="city-placeholder city-{state}"
				/>
			{/if}

			<!-- Dot -->
			<circle
				cx={cx}
				cy={cy}
				r={state === 'highlight' ? 7 : 5}
				class="dot city-{state}"
			/>

			<!-- Score label -->
			{#if showScores && (state === 'highlight' || activeStep === 1 || activeStep === 4)}
				<text
					x={cx + 10}
					y={cy}
					dy="0.35em"
					class="score-label city-{state}"
				>
					{city.score}
				</text>
			{/if}
		{/each}
	</g>
</svg>

<style>
	.dot-plot {
		width: 100%;
		height: 100%;
		max-height: 320px;
		overflow: visible;
		font-family: var(--font-mono);
	}

	/* ---- Axis ---- */
	.axis-line {
		stroke: var(--color-border);
		stroke-width: 1;
	}

	.axis-tick {
		stroke: var(--color-border);
		stroke-width: 1;
	}

	.axis-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.axis-title {
		font-size: 9px;
		fill: var(--color-muted);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	/* ---- Average line ---- */
	.avg-line {
		stroke: var(--color-accent);
		stroke-width: 1.5;
		opacity: 0.7;
		transition: opacity 500ms ease;
	}

	.avg-label {
		font-size: 10px;
		fill: var(--color-accent);
	}

	/* ---- Guide lines ---- */
	.guide-line {
		stroke-width: 1;
		transition:
			stroke 400ms ease,
			opacity 400ms ease;
	}

	/* ---- City label ---- */
	.city-label {
		font-size: 11px;
		transition:
			fill 400ms ease,
			opacity 400ms ease;
	}

	.city-placeholder {
		stroke-width: 2;
		stroke-linecap: round;
		transition: opacity 400ms ease;
	}

	/* ---- Dot ---- */
	.dot {
		transition:
			cx 600ms ease,
			r 300ms ease,
			fill 400ms ease,
			opacity 400ms ease;
	}

	/* ---- Score ---- */
	.score-label {
		font-size: 10px;
		transition:
			fill 400ms ease,
			opacity 400ms ease;
	}

	/* ════════ State classes ════════ */

	/* dimmed: step 0, all grayed out */
	.city-dimmed.dot            { fill: var(--color-border); opacity: 0.6; }
	.city-dimmed.guide-line     { stroke: var(--color-border); opacity: 0.4; }
	.city-dimmed.city-label     { fill: var(--color-border); opacity: 0.5; }
	.city-dimmed.city-placeholder { stroke: var(--color-border); opacity: 0.4; }
	.city-dimmed.score-label    { fill: var(--color-border); }

	/* normal: visible, no special role */
	.city-normal.dot            { fill: var(--color-text); opacity: 0.6; }
	.city-normal.guide-line     { stroke: var(--color-border); opacity: 0.6; }
	.city-normal.city-label     { fill: var(--color-text); opacity: 0.7; }
	.city-normal.city-placeholder { stroke: var(--color-muted); opacity: 0.5; }
	.city-normal.score-label    { fill: var(--color-muted); }

	/* muted: step has highlights, this city is background */
	.city-muted.dot             { fill: var(--color-border); opacity: 0.5; }
	.city-muted.guide-line      { stroke: var(--color-border); opacity: 0.3; }
	.city-muted.city-label      { fill: var(--color-muted); opacity: 0.4; }
	.city-muted.city-placeholder { stroke: var(--color-border); opacity: 0.3; }
	.city-muted.score-label     { fill: var(--color-border); }

	/* highlight: the star of this step */
	.city-highlight.dot         { fill: var(--color-accent); opacity: 1; }
	.city-highlight.guide-line  { stroke: var(--color-accent); opacity: 0.3; }
	.city-highlight.city-label  { fill: var(--color-text); opacity: 1; font-weight: bold; }
	.city-highlight.city-placeholder { stroke: var(--color-accent); opacity: 0.6; }
	.city-highlight.score-label { fill: var(--color-accent); }
</style>
