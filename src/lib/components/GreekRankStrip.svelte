<script lang="ts">
	interface SchoolPoint {
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

	interface HighlightPoint {
		unitid: number;
		label: string;
		point: SchoolPoint;
	}

	interface Props {
		schools: SchoolPoint[];
	}

	let { schools }: Props = $props();

	const W = 740;
	const H = 320;
	const marginLeft = 54;
	const marginRight = 24;
	const marginTop = 24;
	const marginBottom = 56;
	const innerW = W - marginLeft - marginRight;
	const innerH = H - marginTop - marginBottom;

	const sortedSchools = $derived([...schools].sort((a, b) => a.rank2022 - b.rank2022));
	const maxGreek = $derived(
		Math.max(40, Math.ceil(Math.max(...sortedSchools.map((point) => point.greekTotal), 40) / 10) * 10)
	);

	const top50Average = $derived(
		(() => {
			const top50 = sortedSchools.filter((point) => point.top50).map((point) => point.greekTotal);
			if (top50.length === 0) return 0;
			return top50.reduce((sum, value) => sum + value, 0) / top50.length;
		})()
	);

	const restAverage = $derived(
		(() => {
			const rest = sortedSchools.filter((point) => !point.top50).map((point) => point.greekTotal);
			if (rest.length === 0) return 0;
			return rest.reduce((sum, value) => sum + value, 0) / rest.length;
		})()
	);

	const xTicks = [1, 25, 50, 100, 150, 200];
	const yTicks = $derived(
		(() => {
			const values: number[] = [0];
			for (let tick = 10; tick <= maxGreek; tick += 10) values.push(tick);
			return values;
		})()
	);

	const highlights = $derived(
		(() => {
			const top50 = sortedSchools.filter((point) => point.top50);
			const rest = sortedSchools.filter((point) => !point.top50);
			const rankOne = sortedSchools.find((point) => point.rank2022 === 1) ?? null;

			function maxBy(points: SchoolPoint[]): SchoolPoint | null {
				if (points.length === 0) return null;
				return points.reduce((best, point) => (point.greekTotal > best.greekTotal ? point : best));
			}

			function minBy(points: SchoolPoint[]): SchoolPoint | null {
				if (points.length === 0) return null;
				return points.reduce((best, point) => (point.greekTotal < best.greekTotal ? point : best));
			}

			const top50High = maxBy(top50);
			const top50Low = minBy(top50);
			const restHigh = maxBy(rest);
			const restLow = minBy(rest);

			const candidates: Array<HighlightPoint | null> = [
				rankOne
					? {
							unitid: rankOne.unitid,
							label: 'Most applicants',
							point: rankOne
						}
					: null,
				top50High
					? {
							unitid: top50High.unitid,
							label: 'Top-50 high',
							point: top50High
						}
					: null,
				top50Low
					? {
							unitid: top50Low.unitid,
							label: 'Top-50 low',
							point: top50Low
						}
					: null,
				restHigh
					? {
							unitid: restHigh.unitid,
							label: '51-200 high',
							point: restHigh
						}
					: null,
				restLow
					? {
							unitid: restLow.unitid,
							label: '51-200 low',
							point: restLow
						}
					: null
			];

			const seen: number[] = [];
			return candidates
				.filter((item): item is HighlightPoint => item !== null)
				.filter((item) => {
					if (seen.includes(item.unitid)) return false;
					seen.push(item.unitid);
					return true;
				});
		})()
	);

	const highlightById = $derived(Object.fromEntries(highlights.map((item) => [item.unitid, item])));

	function xScale(rank: number): number {
		if (rank <= 1) return 0;
		return ((rank - 1) / 199) * innerW;
	}

	function yScale(value: number): number {
		return innerH - (value / maxGreek) * innerH;
	}

	function shortName(value: string): string {
		return value
			.replace(/^University of\s+/i, '')
			.replace(/^The\s+/i, '')
			.replace(/\s+University$/i, '')
			.replace(/\s+-\s+/g, ' ')
			.trim();
	}

	function formatPct(value: number): string {
		return `${value.toFixed(1)}%`;
	}
</script>

<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Greek participation by 2022 applicant rank" class="strip-viz">
	<text x={marginLeft} y={14} class="axis-title">
		Latest snapshot: Greek participation by applicant rank (1 = most applicants)
	</text>

	<g transform={`translate(${marginLeft}, ${marginTop})`}>
		<rect x={xScale(1)} y={0} width={xScale(50)} height={innerH} class="top50-band" />

		{#each yTicks as tick (tick)}
			<line x1={0} x2={innerW} y1={yScale(tick)} y2={yScale(tick)} class="grid-line" />
		{/each}

		<line x1={0} x2={innerW} y1={yScale(top50Average)} y2={yScale(top50Average)} class="avg-line top50" />
		<line x1={0} x2={innerW} y1={yScale(restAverage)} y2={yScale(restAverage)} class="avg-line rest" />

		{#each sortedSchools as school (school.unitid)}
			{@const isHighlighted = highlightById[school.unitid] !== undefined}
			<circle
				cx={xScale(school.rank2022)}
				cy={yScale(school.greekTotal)}
				r={isHighlighted ? 4.9 : 2.9}
				class={`dot ${school.top50 ? 'top50' : 'rest'} ${isHighlighted ? 'highlight' : ''}`}
			/>
		{/each}

		{#each highlights as item, idx (item.unitid)}
			{@const point = item.point}
			{@const cx = xScale(point.rank2022)}
			{@const cy = yScale(point.greekTotal)}
			{@const labelRight = cx < innerW * 0.6}
			{@const labelX = labelRight ? cx + 8 : cx - 8}
			{@const labelY = cy - (idx % 2 === 0 ? 10 : 22)}

			<line x1={cx} x2={labelX + (labelRight ? 4 : -4)} y1={cy} y2={labelY + 2} class="callout" />
			<text x={labelX} y={labelY} text-anchor={labelRight ? 'start' : 'end'} class="point-label">
				{item.label}: {shortName(point.institutionName)} ({formatPct(point.greekTotal)})
			</text>
		{/each}
	</g>

	<g transform={`translate(${marginLeft}, ${marginTop + innerH + 10})`}>
		<line x1={0} x2={innerW} y1={0} y2={0} class="axis-line" />
		{#each xTicks as tick (tick)}
			<line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={5} class="axis-line" />
			<text x={xScale(tick)} y={16} text-anchor="middle" class="tick-label">{tick}</text>
		{/each}
	</g>

	<g transform={`translate(${marginLeft - 8}, ${marginTop})`}>
		<line x1={8} x2={8} y1={0} y2={innerH} class="axis-line" />
		{#each yTicks as tick (tick)}
			<line x1={8} x2={3} y1={yScale(tick)} y2={yScale(tick)} class="axis-line" />
			<text x={0} y={yScale(tick) + 4} text-anchor="end" class="tick-label">{tick}%</text>
		{/each}
	</g>

	<g transform={`translate(${marginLeft}, ${H - 12})`}>
		<text x="0" y="0" class="legend top50">Top-50 ranks</text>
		<text x="120" y="0" class="legend rest">Ranks 51-200</text>
		<text x="250" y="0" class="legend avg">Dashed lines: group means</text>
	</g>
</svg>

<style>
	.strip-viz {
		width: 100%;
		height: auto;
		font-family: var(--font-ui);
		overflow: visible;
	}

	.axis-title {
		font-size: 10px;
		fill: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.axis-line,
	.grid-line {
		stroke: #dfd9cf;
		stroke-width: 1;
	}

	.grid-line {
		opacity: 0.72;
	}

	.top50-band {
		fill: rgba(192, 57, 43, 0.08);
	}

	.avg-line {
		stroke-width: 1.2;
		stroke-dasharray: 4 3;
	}

	.avg-line.top50 {
		stroke: rgba(192, 57, 43, 0.9);
	}

	.avg-line.rest {
		stroke: rgba(43, 93, 134, 0.9);
	}

	.dot {
		transition: r 220ms ease;
	}

	.dot.top50 {
		fill: rgba(192, 57, 43, 0.68);
	}

	.dot.rest {
		fill: rgba(43, 93, 134, 0.62);
	}

	.dot.highlight {
		fill: #1e1e1a;
	}

	.callout {
		stroke: #44433f;
		stroke-width: 0.9;
	}

	.point-label {
		font-size: 9px;
		fill: #242420;
	}

	.tick-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.legend {
		font-size: 10px;
		letter-spacing: 0.04em;
	}

	.legend.top50 {
		fill: var(--color-accent);
	}

	.legend.rest {
		fill: #2b5d86;
	}

	.legend.avg {
		fill: var(--color-muted);
	}

	@media (max-width: 900px) {
		.point-label,
		.callout {
			display: none;
		}
	}
</style>
