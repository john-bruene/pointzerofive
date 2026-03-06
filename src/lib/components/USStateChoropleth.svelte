<script lang="ts">
	import { geoAlbersUsa, geoPath } from 'd3-geo';
	import { feature } from 'topojson-client';
	import statesTopo from 'us-atlas/states-10m.json';

	interface StateMetricPoint {
		stateAbbr: string;
		schoolsInTop200: number;
		applicants2022: number;
		latestGreekUsableSchools: number;
		latestGreekAverage: number | null;
	}

	interface StateFeature {
		id: string | number;
		geometry: unknown;
		type: string;
	}

	interface Props {
		stateMetrics: StateMetricPoint[];
	}

	let { stateMetrics }: Props = $props();

	type MetricKey = 'schoolsInTop200' | 'applicants2022' | 'latestGreekAverage';
	const metricOptions: Array<{ key: MetricKey; label: string }> = [
		{ key: 'schoolsInTop200', label: 'Top-200 schools' },
		{ key: 'applicants2022', label: 'Applicants (2022)' },
		{ key: 'latestGreekAverage', label: 'Avg Greek % (latest)' }
	];

	const W = 920;
	const H = 540;
	const margin = { top: 16, right: 16, bottom: 16, left: 16 };
	const innerW = W - margin.left - margin.right;
	const innerH = H - margin.top - margin.bottom;

	let activeMetric = $state<MetricKey>('schoolsInTop200');
	let hoveredState = $state<string | null>(null);
	let pinnedState = $state<string | null>(null);

	const fipsToState: Record<number, string> = {
		1: 'AL',
		2: 'AK',
		4: 'AZ',
		5: 'AR',
		6: 'CA',
		8: 'CO',
		9: 'CT',
		10: 'DE',
		11: 'DC',
		12: 'FL',
		13: 'GA',
		15: 'HI',
		16: 'ID',
		17: 'IL',
		18: 'IN',
		19: 'IA',
		20: 'KS',
		21: 'KY',
		22: 'LA',
		23: 'ME',
		24: 'MD',
		25: 'MA',
		26: 'MI',
		27: 'MN',
		28: 'MS',
		29: 'MO',
		30: 'MT',
		31: 'NE',
		32: 'NV',
		33: 'NH',
		34: 'NJ',
		35: 'NM',
		36: 'NY',
		37: 'NC',
		38: 'ND',
		39: 'OH',
		40: 'OK',
		41: 'OR',
		42: 'PA',
		44: 'RI',
		45: 'SC',
		46: 'SD',
		47: 'TN',
		48: 'TX',
		49: 'UT',
		50: 'VT',
		51: 'VA',
		53: 'WA',
		54: 'WV',
		55: 'WI',
		56: 'WY'
	};

	const stateNames: Record<string, string> = {
		AL: 'Alabama',
		AK: 'Alaska',
		AZ: 'Arizona',
		AR: 'Arkansas',
		CA: 'California',
		CO: 'Colorado',
		CT: 'Connecticut',
		DE: 'Delaware',
		DC: 'District of Columbia',
		FL: 'Florida',
		GA: 'Georgia',
		HI: 'Hawaii',
		ID: 'Idaho',
		IL: 'Illinois',
		IN: 'Indiana',
		IA: 'Iowa',
		KS: 'Kansas',
		KY: 'Kentucky',
		LA: 'Louisiana',
		ME: 'Maine',
		MD: 'Maryland',
		MA: 'Massachusetts',
		MI: 'Michigan',
		MN: 'Minnesota',
		MS: 'Mississippi',
		MO: 'Missouri',
		MT: 'Montana',
		NE: 'Nebraska',
		NV: 'Nevada',
		NH: 'New Hampshire',
		NJ: 'New Jersey',
		NM: 'New Mexico',
		NY: 'New York',
		NC: 'North Carolina',
		ND: 'North Dakota',
		OH: 'Ohio',
		OK: 'Oklahoma',
		OR: 'Oregon',
		PA: 'Pennsylvania',
		RI: 'Rhode Island',
		SC: 'South Carolina',
		SD: 'South Dakota',
		TN: 'Tennessee',
		TX: 'Texas',
		UT: 'Utah',
		VT: 'Vermont',
		VA: 'Virginia',
		WA: 'Washington',
		WV: 'West Virginia',
		WI: 'Wisconsin',
		WY: 'Wyoming'
	};

	function loadStateFeatures(): StateFeature[] {
		const topology = statesTopo as unknown as { objects: { states: unknown } };
		const collection = feature(
			topology as never,
			topology.objects.states as never
		) as unknown as { features: StateFeature[] };
		return collection.features;
	}

	const mapFeatures = $derived(loadStateFeatures());

	const projection = $derived(
		geoAlbersUsa().fitSize(
			[innerW, innerH],
			{ type: 'FeatureCollection', features: mapFeatures } as never
		)
	);

	const geoPathFn = $derived(geoPath(projection));

	const metricByState = $derived(
		Object.fromEntries(stateMetrics.map((row) => [row.stateAbbr, row])) as Record<string, StateMetricPoint>
	);

	const mapStates = $derived(
		mapFeatures
			.map((shape) => {
				const fips = Number(shape.id);
				const stateAbbr = fipsToState[fips];
				if (!stateAbbr) return null;

				const metric = metricByState[stateAbbr] ?? {
					stateAbbr,
					schoolsInTop200: 0,
					applicants2022: 0,
					latestGreekUsableSchools: 0,
					latestGreekAverage: null
				};

				return {
					...metric,
					stateAbbr,
					stateName: stateNames[stateAbbr] ?? stateAbbr,
					path: geoPathFn(shape as never) ?? '',
					centroid: geoPathFn.centroid(shape as never)
				};
			})
			.filter((row): row is NonNullable<typeof row> => row !== null)
	);

	const metricValues = $derived(
		mapStates
			.map((state) => getMetricValue(state, activeMetric))
			.filter((value) => value !== null)
			.map((value) => value as number)
	);

	const metricMin = $derived(metricValues.length > 0 ? Math.min(...metricValues) : 0);
	const metricMax = $derived(metricValues.length > 0 ? Math.max(...metricValues) : 1);

	const activeState = $derived(
		(pinnedState ? mapStates.find((state) => state.stateAbbr === pinnedState) : null) ??
			(hoveredState ? mapStates.find((state) => state.stateAbbr === hoveredState) : null) ??
			null
	);

	const topStates = $derived(
		[...mapStates]
			.sort(
				(a, b) =>
					(getMetricValue(b, activeMetric) ?? -Infinity) -
					(getMetricValue(a, activeMetric) ?? -Infinity)
			)
			.slice(0, 8)
	);

	function getMetricValue(
		state: {
			schoolsInTop200: number;
			applicants2022: number;
			latestGreekAverage: number | null;
		},
		metric: MetricKey
	): number | null {
		if (metric === 'schoolsInTop200') return state.schoolsInTop200;
		if (metric === 'applicants2022') return state.applicants2022;
		return state.latestGreekAverage;
	}

	function colorFor(value: number | null): string {
		if (value === null) return '#efebe4';
		if (metricMax <= metricMin) return '#c0392b';
		const t = (value - metricMin) / (metricMax - metricMin);
		const clamped = Math.max(0, Math.min(1, t));

		const r0 = 238;
		const g0 = 230;
		const b0 = 219;
		const r1 = 192;
		const g1 = 57;
		const b1 = 43;

		const r = Math.round(r0 + (r1 - r0) * clamped);
		const g = Math.round(g0 + (g1 - g0) * clamped);
		const b = Math.round(b0 + (b1 - b0) * clamped);
		return `rgb(${r}, ${g}, ${b})`;
	}

	function formatValue(value: number | null, metric: MetricKey): string {
		if (value === null) return 'n/a';
		if (metric === 'schoolsInTop200') return `${Math.round(value)}`;
		if (metric === 'applicants2022') return Math.round(value).toLocaleString('en-US');
		return `${value.toFixed(1)}%`;
	}

	function onStateClick(stateAbbr: string) {
		pinnedState = pinnedState === stateAbbr ? null : stateAbbr;
	}

	function onMetricClick(metric: MetricKey) {
		activeMetric = metric;
	}

	function onStateKeydown(event: globalThis.KeyboardEvent, stateAbbr: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onStateClick(stateAbbr);
		}
	}
</script>

<div class="map-wrap">
	<div class="map-controls" role="group" aria-label="State metric selector">
		{#each metricOptions as option (option.key)}
			<button
				type="button"
				class:active={activeMetric === option.key}
				onclick={() => onMetricClick(option.key)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	<div class="map-grid">
		<svg viewBox={`0 0 ${W} ${H}`} class="us-map" role="img" aria-label="United States state map with story metrics">
			<g transform={`translate(${margin.left}, ${margin.top})`}>
				{#each mapStates as state (state.stateAbbr)}
					{@const current = getMetricValue(state, activeMetric)}
					<path
						d={state.path}
						fill={colorFor(current)}
						class="state-shape"
						class:hovered={hoveredState === state.stateAbbr}
						class:pinned={pinnedState === state.stateAbbr}
						onmouseenter={() => (hoveredState = state.stateAbbr)}
						onmouseleave={() => (hoveredState = null)}
						onclick={() => onStateClick(state.stateAbbr)}
						onkeydown={(event) => onStateKeydown(event, state.stateAbbr)}
						role="button"
						tabindex="0"
						aria-label={`${state.stateName}: ${formatValue(current, activeMetric)}`}
					>
						<title>{state.stateName}: {formatValue(current, activeMetric)}</title>
					</path>

					{#if activeMetric === 'schoolsInTop200' && state.schoolsInTop200 > 0}
						{@const x = state.centroid[0]}
						{@const y = state.centroid[1]}
						{#if Number.isFinite(x) && Number.isFinite(y)}
							<text x={x} y={y + 3} text-anchor="middle" class="state-number">
								{state.schoolsInTop200}
							</text>
						{/if}
					{/if}
				{/each}
			</g>
		</svg>

		<aside class="state-panel" aria-live="polite">
			{#if activeState}
				<h3>{activeState.stateName} ({activeState.stateAbbr})</h3>
				<p><strong>Top-200 schools:</strong> {activeState.schoolsInTop200}</p>
				<p><strong>Applicants (2022):</strong> {activeState.applicants2022.toLocaleString('en-US')}</p>
				<p><strong>Greek usable schools:</strong> {activeState.latestGreekUsableSchools}</p>
				<p>
					<strong>Greek average:</strong>
					{activeState.latestGreekAverage !== null ? `${activeState.latestGreekAverage.toFixed(1)}%` : 'n/a'}
				</p>
			{:else}
				<h3>Pick a state</h3>
				<p>Hover for quick values, click to pin detailed numbers.</p>
			{/if}

			<div class="legend">
				<p class="legend-label">Scale: {metricOptions.find((m) => m.key === activeMetric)?.label}</p>
				<div class="legend-bar" aria-hidden="true"></div>
				<div class="legend-values">
					<span>{formatValue(metricMin, activeMetric)}</span>
					<span>{formatValue(metricMax, activeMetric)}</span>
				</div>
			</div>
		</aside>
	</div>

	<div class="top-list-wrap">
		<h4>Top states by current metric</h4>
		<ol class="top-list">
			{#each topStates as state (state.stateAbbr)}
				<li>
					<span>{state.stateAbbr}</span>
					<span>{formatValue(getMetricValue(state, activeMetric), activeMetric)}</span>
				</li>
			{/each}
		</ol>
	</div>
</div>

<style>
	.map-wrap {
		display: grid;
		gap: 1rem;
	}

	.map-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.map-controls button {
		border: 1px solid var(--color-border);
		background: #f4efe8;
		color: var(--color-text);
		padding: 0.4rem 0.65rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
	}

	.map-controls button.active {
		border-color: var(--color-accent);
		background: #f2dfdb;
		color: #7e231a;
	}

	.map-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 240px;
		gap: 0.9rem;
		align-items: start;
	}

	.us-map {
		width: 100%;
		height: auto;
		background: linear-gradient(180deg, #f8f4ee, #f7f3ed);
		border: 1px solid var(--color-border);
	}

	.state-shape {
		stroke: #e8dfd2;
		stroke-width: 1;
		transition:
			stroke 140ms ease,
			stroke-width 140ms ease,
			filter 140ms ease;
		cursor: pointer;
	}

	.state-shape:hover,
	.state-shape.hovered,
	.state-shape.pinned {
		stroke: #5f5a52;
		stroke-width: 1.25;
		filter: brightness(0.98);
	}

	.state-number {
		fill: #1f1f1b;
		font-size: 8px;
		font-weight: 600;
		pointer-events: none;
	}

	.state-panel {
		border: 1px solid var(--color-border);
		background: #f7f2ea;
		padding: 0.7rem;
		font-family: var(--font-ui);
		font-size: 0.88rem;
	}

	.state-panel h3 {
		font-size: 1rem;
		margin-bottom: 0.42rem;
	}

	.state-panel p + p {
		margin-top: 0.35rem;
	}

	.legend {
		margin-top: 0.75rem;
	}

	.legend-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		margin-bottom: 0.25rem;
	}

	.legend-bar {
		height: 10px;
		border: 1px solid #decec7;
		background: linear-gradient(90deg, rgb(238, 230, 219), rgb(192, 57, 43));
	}

	.legend-values {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--color-muted);
		margin-top: 0.2rem;
	}

	.top-list-wrap {
		border: 1px solid var(--color-border);
		background: #f7f2ea;
		padding: 0.75rem;
	}

	.top-list-wrap h4 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.55rem;
		color: var(--color-muted);
	}

	.top-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.22rem;
		font-family: var(--font-ui);
		font-size: 0.86rem;
	}

	.top-list li {
		display: flex;
		justify-content: space-between;
		padding: 0.2rem 0;
		border-bottom: 1px solid #ece2d8;
	}

	@media (max-width: 980px) {
		.map-grid {
			grid-template-columns: 1fr;
		}

		.state-number {
			font-size: 7px;
		}
	}
</style>
