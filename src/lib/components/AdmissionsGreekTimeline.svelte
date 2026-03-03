<script lang="ts">
	interface YearPoint {
		year: number;
		reportingSchoolCount: number;
		balancedSchoolCount: number;
		applicantsAll: number;
		applicantsBalanced: number;
		top50Applicants: number;
		restApplicants: number;
		admitRate: number; // 0..1
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

	interface Props {
		yearly: YearPoint[];
		greekSnapshots: GreekPoint[];
		activeStep: number;
	}

	let { yearly, greekSnapshots, activeStep }: Props = $props();

	const W = 560;
	const H = 360;
	const marginLeft = 58;
	const marginRight = 62;
	const marginTop = 30;
	const marginBottom = 56;
	const innerW = W - marginLeft - marginRight;
	const innerH = H - marginTop - marginBottom;

	const sortedYearly = $derived([...yearly].sort((a, b) => a.year - b.year));
	const sortedGreek = $derived(
		[...greekSnapshots].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
	);

	const minYear = $derived(sortedYearly[0]?.year ?? 2001);
	const maxYear = $derived(sortedYearly[sortedYearly.length - 1]?.year ?? 2022);

	const maxApplicants = $derived(
		Math.max(
			1,
			...sortedYearly.map((point) =>
				Math.max(
					point.applicantsAll,
					point.applicantsBalanced,
					point.top50Applicants,
					point.restApplicants
				)
			)
		)
	);

	const maxGreek = $derived(
		Math.max(
			40,
			Math.ceil(
				Math.max(
					...sortedGreek.map((point) =>
						Math.max(point.averageGreekTotal, point.top50GreekTotal, point.restGreekTotal)
					),
					40
				) / 10
			) * 10
		)
	);

	const yearTicks = $derived(
		(() => {
			const seeds = [minYear, minYear + 5, minYear + 10, minYear + 15, maxYear];
			return [...new Set(seeds.filter((year) => year >= minYear && year <= maxYear))];
		})()
	);

	const applicantTicks = $derived(
		(() => {
			const maxMillions = Math.ceil(maxApplicants / 1_000_000);
			const step = maxMillions <= 5 ? 1 : 2;
			const values: number[] = [0];
			for (let million = step; million <= maxMillions; million += step) {
				values.push(million * 1_000_000);
			}
			return values;
		})()
	);

	const greekTicks = $derived(
		(() => {
			const values: number[] = [0];
			for (let tick = 10; tick <= maxGreek; tick += 10) values.push(tick);
			return values;
		})()
	);

	const showSplit = $derived(activeStep >= 2 && activeStep < 4);
	const showAdmit = $derived(activeStep >= 3 && activeStep < 4);
	const showGreek = $derived(activeStep >= 4);

	const firstPoint = $derived(sortedYearly[0] ?? null);
	const lastPoint = $derived(sortedYearly[sortedYearly.length - 1] ?? null);
	const minAdmitPoint = $derived(
		sortedYearly.length === 0
			? null
			: sortedYearly.reduce((lowest, point) =>
					point.admitRate < lowest.admitRate ? point : lowest
				)
	);

	const topShareFrom = $derived(
		firstPoint && firstPoint.applicantsBalanced > 0
			? (firstPoint.top50Applicants / firstPoint.applicantsBalanced) * 100
			: 0
	);
	const topShareTo = $derived(
		lastPoint && lastPoint.applicantsBalanced > 0
			? (lastPoint.top50Applicants / lastPoint.applicantsBalanced) * 100
			: 0
	);

	const greekGroupCount = $derived(sortedGreek.length);
	const greekGroupWidth = $derived(greekGroupCount > 0 ? innerW / greekGroupCount : innerW);
	const greekBarWidth = $derived(Math.min(24, greekGroupWidth * 0.3));

	function xScale(year: number): number {
		if (maxYear === minYear) return 0;
		return ((year - minYear) / (maxYear - minYear)) * innerW;
	}

	function yApplicants(value: number): number {
		return innerH - (value / maxApplicants) * innerH;
	}

	function yAdmit(value: number): number {
		return innerH - value * innerH;
	}

	function yGreek(value: number): number {
		return innerH - (value / maxGreek) * innerH;
	}

	function linePath(
		points: YearPoint[],
		selector: (point: YearPoint) => number,
		yMapper: (value: number) => number
	): string {
		if (points.length === 0) return '';
		return points
			.map((point, i) =>
				`${i === 0 ? 'M' : 'L'}${xScale(point.year).toFixed(2)} ${yMapper(selector(point)).toFixed(2)}`
			)
			.join(' ');
	}

	function formatMillions(value: number): string {
		if (value === 0) return '0';
		const inMillions = value / 1_000_000;
		return `${inMillions >= 10 ? inMillions.toFixed(0) : inMillions.toFixed(1)}M`;
	}

	function formatPct(value: number): string {
		return `${value.toFixed(1)}%`;
	}
</script>

<svg
	viewBox={`0 0 ${W} ${H}`}
	role="img"
	aria-label="Admissions timeline and Greek-life snapshot comparison"
	class="timeline-viz"
>
	{#if !showGreek}
		<text x={marginLeft} y={14} class="axis-title">
			Applications and admit rate, top-200 US universities
		</text>

		<g transform={`translate(${marginLeft}, ${marginTop})`}>
			{#each applicantTicks as tick (tick)}
				<line x1={0} x2={innerW} y1={yApplicants(tick)} y2={yApplicants(tick)} class="grid-line" />
			{/each}

			<path
				d={linePath(sortedYearly, (point) => point.applicantsAll, yApplicants)}
				class="line-all"
				fill="none"
			/>
			<path
				d={linePath(sortedYearly, (point) => point.applicantsBalanced, yApplicants)}
				class="line-balanced"
				fill="none"
			/>

			{#if showSplit}
				<path
					d={linePath(sortedYearly, (point) => point.top50Applicants, yApplicants)}
					class="line-top50"
					fill="none"
				/>
				<path
					d={linePath(sortedYearly, (point) => point.restApplicants, yApplicants)}
					class="line-rest"
					fill="none"
				/>
			{/if}

			{#if showAdmit}
				<path
					d={linePath(sortedYearly, (point) => point.admitRate, yAdmit)}
					class="line-admit"
					fill="none"
				/>
			{/if}

			{#if firstPoint && lastPoint}
				<circle cx={xScale(firstPoint.year)} cy={yApplicants(firstPoint.applicantsBalanced)} r="4" class="end-dot" />
				<circle cx={xScale(lastPoint.year)} cy={yApplicants(lastPoint.applicantsBalanced)} r="4" class="end-dot" />
			{/if}

			{#if activeStep === 1 && firstPoint && lastPoint}
				<text x={xScale(firstPoint.year) + 8} y={yApplicants(firstPoint.applicantsBalanced) - 8} class="anno-label">
					{formatMillions(firstPoint.applicantsBalanced)}
				</text>
				<text x={xScale(lastPoint.year) - 8} y={yApplicants(lastPoint.applicantsBalanced) - 8} text-anchor="end" class="anno-label strong">
					{formatMillions(lastPoint.applicantsBalanced)}
				</text>
			{/if}

			{#if activeStep === 2 && firstPoint && lastPoint}
				<text x={xScale(firstPoint.year) + 10} y={yApplicants(firstPoint.top50Applicants) - 10} class="anno-label">
					Top-50 share {formatPct(topShareFrom)}
				</text>
				<text x={xScale(lastPoint.year) - 8} y={yApplicants(lastPoint.top50Applicants) - 10} text-anchor="end" class="anno-label strong">
					Top-50 share {formatPct(topShareTo)}
				</text>
			{/if}

			{#if showAdmit && minAdmitPoint}
				<circle cx={xScale(minAdmitPoint.year)} cy={yAdmit(minAdmitPoint.admitRate)} r="3.6" class="admit-dot" />
				<text x={xScale(minAdmitPoint.year) + 8} y={yAdmit(minAdmitPoint.admitRate) - 8} class="anno-label">
					{minAdmitPoint.year}: low point {formatPct(minAdmitPoint.admitRate * 100)}
				</text>
			{/if}
		</g>

		<g transform={`translate(${marginLeft}, ${marginTop + innerH + 10})`}>
			<line x1={0} x2={innerW} y1={0} y2={0} class="axis-line" />
			{#each yearTicks as year (year)}
				<line x1={xScale(year)} x2={xScale(year)} y1={0} y2={5} class="axis-line" />
				<text x={xScale(year)} y={17} text-anchor="middle" class="tick-label">{year}</text>
			{/each}
		</g>

		<g transform={`translate(${marginLeft - 8}, ${marginTop})`}>
			<line x1={8} x2={8} y1={0} y2={innerH} class="axis-line" />
			{#each applicantTicks as tick (tick)}
				<line x1={8} x2={3} y1={yApplicants(tick)} y2={yApplicants(tick)} class="axis-line" />
				<text x={0} y={yApplicants(tick) + 4} text-anchor="end" class="tick-label">{formatMillions(tick)}</text>
			{/each}
		</g>

		{#if showAdmit}
			<g transform={`translate(${W - marginRight + 8}, ${marginTop})`}>
				<line x1={0} x2={0} y1={0} y2={innerH} class="axis-line" />
				{#each [0.4, 0.5, 0.6] as tick (tick)}
					<line x1={0} x2={5} y1={yAdmit(tick)} y2={yAdmit(tick)} class="axis-line" />
					<text x={10} y={yAdmit(tick) + 4} class="tick-label">{(tick * 100).toFixed(0)}%</text>
				{/each}
				<text x={0} y={-8} class="axis-note">Admit rate</text>
			</g>
		{/if}
	{:else}
		<text x={marginLeft} y={14} class="axis-title">
			Greek participation snapshots (fraternity + sorority %)
		</text>

		<g transform={`translate(${marginLeft}, ${marginTop})`}>
			{#each greekTicks as tick (tick)}
				<line x1={0} x2={innerW} y1={yGreek(tick)} y2={yGreek(tick)} class="grid-line" />
			{/each}

			{#each sortedGreek as snapshot, i (snapshot.snapshotDate)}
				{@const centerX = i * greekGroupWidth + greekGroupWidth / 2}
				{@const topX = centerX - greekBarWidth - 2}
				{@const restX = centerX + 2}
				{@const topY = yGreek(snapshot.top50GreekTotal)}
				{@const restY = yGreek(snapshot.restGreekTotal)}
				{@const avgY = yGreek(snapshot.averageGreekTotal)}
				{@const isLatest = i === sortedGreek.length - 1}

				<rect
					x={topX}
					y={topY}
					width={greekBarWidth}
					height={innerH - topY}
					class="bar top50"
					class:latest={isLatest}
				/>
				<rect
					x={restX}
					y={restY}
					width={greekBarWidth}
					height={innerH - restY}
					class="bar rest"
					class:latest={isLatest}
				/>
				<circle cx={centerX} cy={avgY} r="3.4" class="avg-dot" />
			{/each}
		</g>

		<g transform={`translate(${marginLeft}, ${marginTop + innerH + 10})`}>
			<line x1={0} x2={innerW} y1={0} y2={0} class="axis-line" />
			{#each sortedGreek as snapshot, i (snapshot.snapshotDate)}
				{@const centerX = i * greekGroupWidth + greekGroupWidth / 2}
				<text x={centerX} y={14} text-anchor="middle" class="tick-label">{snapshot.snapshotYear}</text>
				<text x={centerX} y={27} text-anchor="middle" class="tiny-label">
					{snapshot.usableSchools}/{snapshot.totalSchools}
				</text>
			{/each}
		</g>

		<g transform={`translate(${marginLeft - 8}, ${marginTop})`}>
			<line x1={8} x2={8} y1={0} y2={innerH} class="axis-line" />
			{#each greekTicks as tick (tick)}
				<line x1={8} x2={3} y1={yGreek(tick)} y2={yGreek(tick)} class="axis-line" />
				<text x={0} y={yGreek(tick) + 4} text-anchor="end" class="tick-label">{tick}%</text>
			{/each}
		</g>
	{/if}

	{#if !showGreek}
		<g transform={`translate(${marginLeft}, ${H - 12})`}>
			<text class="legend all" x="0" y="0">All reporting schools</text>
			<text class="legend balanced" x="136" y="0">Balanced panel</text>
			{#if showSplit}
				<text class="legend top50" x="254" y="0">Top 50</text>
				<text class="legend rest" x="314" y="0">Ranks 51-200</text>
			{/if}
			{#if showAdmit}
				<text class="legend admit" x="440" y="0">Admit rate</text>
			{/if}
		</g>
	{:else}
		<g transform={`translate(${marginLeft}, ${H - 12})`}>
			<text class="legend top50" x="0" y="0">Top 50</text>
			<text class="legend rest" x="62" y="0">Ranks 51-200</text>
			<text class="legend avg" x="170" y="0">Dot = overall average</text>
			<text class="legend tiny" x="332" y="0">Below year: usable schools / 200</text>
		</g>
	{/if}
</svg>

<style>
	.timeline-viz {
		width: 100%;
		height: 100%;
		max-height: 360px;
		overflow: visible;
		font-family: var(--font-ui);
	}

	.axis-line,
	.grid-line {
		stroke: #ddd8d0;
		stroke-width: 1;
	}

	.grid-line {
		opacity: 0.72;
	}

	.axis-title {
		font-size: 10px;
		fill: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.axis-note {
		font-size: 10px;
		fill: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.tick-label {
		font-size: 10px;
		fill: var(--color-muted);
	}

	.tiny-label {
		font-size: 9px;
		fill: var(--color-muted);
	}

	.line-all,
	.line-balanced,
	.line-top50,
	.line-rest,
	.line-admit {
		fill: none;
		stroke-width: 2.2;
	}

	.line-all {
		stroke: #a6aaa8;
		stroke-dasharray: 4 3;
		opacity: 0.9;
	}

	.line-balanced {
		stroke: #2b5d86;
	}

	.line-top50 {
		stroke: var(--color-accent);
	}

	.line-rest {
		stroke: #556570;
	}

	.line-admit {
		stroke: #7f5632;
		stroke-dasharray: 6 4;
	}

	.end-dot {
		fill: #2b5d86;
	}

	.admit-dot {
		fill: #7f5632;
	}

	.anno-label {
		font-size: 10px;
		fill: #5f5f5b;
	}

	.anno-label.strong {
		fill: var(--color-text);
	}

	.bar {
		opacity: 0.9;
	}

	.bar.top50 {
		fill: var(--color-accent);
	}

	.bar.rest {
		fill: #3f5f7e;
	}

	.bar.latest {
		stroke: #2f2f2a;
		stroke-width: 1;
	}

	.avg-dot {
		fill: #1f1f1c;
	}

	.legend {
		font-size: 10px;
		letter-spacing: 0.04em;
	}

	.legend.all {
		fill: #9da3a0;
	}

	.legend.balanced {
		fill: #2b5d86;
	}

	.legend.top50 {
		fill: var(--color-accent);
	}

	.legend.rest {
		fill: #3f5f7e;
	}

	.legend.admit {
		fill: #7f5632;
	}

	.legend.avg {
		fill: #1f1f1c;
	}

	.legend.tiny {
		fill: var(--color-muted);
	}
</style>
