<!-- Story #001: Crosswalks of Italy — horizontal dot plot thumbnail -->
<!-- 14 cities mapped by crosswalk density score (0-60) -->
<svg viewBox="0 0 200 120" class="thumb" aria-hidden="true">
	<!-- Baseline -->
	<line x1="14" y1="72" x2="188" y2="72" stroke="rgba(255,255,255,0.18)" stroke-width="1" />

	<!-- National average tick -->
	<line x1="90" y1="64" x2="90" y2="80" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-dasharray="3 2" />

	<!-- City dots (x = 14 + score/60 * 174) -->
	<!-- Dimmed middle cities -->
	<circle cx="150" cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Trento 45.2 -->
	<circle cx="118" cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Milano 34.8 -->
	<circle cx="113" cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Bologna 33.1 -->
	<circle cx="108" cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Firenze 31.2 -->
	<circle cx="97"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Torino 28.6 -->
	<circle cx="90"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Venezia 26.4 -->
	<circle cx="75"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Roma 21.1 -->
	<circle cx="72"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Bari 19.8 -->
	<circle cx="57"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Napoli 14.8 -->
	<circle cx="52"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Palermo 12.9 -->
	<circle cx="47"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Catania 11.2 -->
	<circle cx="42"  cy="72" r="4" fill="rgba(255,255,255,0.25)" /> <!-- Reggio C 9.6 -->

	<!-- Crotone – worst (red) -->
	<circle cx="35" cy="72" r="5.5" fill="#c0392b" />
	<text x="35" y="91" text-anchor="middle" class="label muted">7.4</text>

	<!-- Bolzano – best (bright white) -->
	<circle cx="184" cy="72" r="6" fill="white" />
	<text x="184" y="60" text-anchor="middle" class="label bold">58.4</text>

	<!-- Axis label -->
	<text x="14" y="108" class="label muted">0</text>
	<text x="101" y="108" text-anchor="middle" class="label muted">crossings / 10k pop.</text>
	<text x="188" y="108" text-anchor="end" class="label muted">60</text>
</svg>

<style>
	.thumb {
		width: 100%;
		height: 100%;
		display: block;
	}
	.label {
		font-family: system-ui, sans-serif;
		font-size: 9px;
		fill: rgba(255,255,255,0.45);
	}
	.label.bold {
		fill: rgba(255,255,255,0.9);
		font-weight: 700;
	}
	.label.muted {
		fill: rgba(255,255,255,0.35);
	}
</style>
