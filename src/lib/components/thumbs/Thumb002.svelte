<!-- Story #002: How Popular Is Greek Life? -->
<!-- Combined thumbnail: scatter (left) + rising applications line (right) -->
<svg viewBox="0 0 200 120" class="thumb" aria-hidden="true">

	<!-- Left half: scatter plot -->
	<!-- Axes -->
	<line x1="10" y1="108" x2="92" y2="108" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
	<line x1="10" y1="20"  x2="10"  y2="108" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
	<!-- Grid -->
	<line x1="10" y1="64" x2="92" y2="64" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
	<!-- Regression line (negative slope) -->
	<line x1="10" y1="30" x2="92" y2="96" stroke="rgba(192,57,43,0.5)" stroke-width="1.5" stroke-dasharray="4 2.5"/>
	<!-- Regular dots -->
	<circle cx="38"  cy="84"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="32"  cy="81"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="29"  cy="84"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="36"  cy="88"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="16"  cy="60"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="24"  cy="66"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="20"  cy="68"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="18"  cy="70"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="26"  cy="96"  r="3" fill="rgba(255,255,255,0.28)"/>
	<circle cx="22"  cy="62"  r="3" fill="rgba(255,255,255,0.28)"/>
	<!-- Mega-applicant schools (red) -->
	<circle cx="64"  cy="101" r="4.5" fill="#c0392b" opacity="0.9"/>
	<circle cx="75"  cy="103" r="4.5" fill="#c0392b" opacity="0.9"/>
	<circle cx="88"  cy="103" r="5.5" fill="#c0392b" opacity="1"/>
	<!-- Labels -->
	<text x="88"  y="97"  text-anchor="middle" class="label bold">UCLA</text>
	<text x="16"  y="55"  text-anchor="middle" class="label accent">72%</text>
	<!-- Axis label -->
	<text x="51"  y="116" text-anchor="middle" class="label muted">applicants →</text>

	<!-- Divider -->
	<line x1="100" y1="14" x2="100" y2="112" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

	<!-- Right half: 20-year line chart (2001→2022) -->
	<!-- Axes -->
	<line x1="108" y1="100" x2="194" y2="100" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
	<line x1="108" y1="20"  x2="108" y2="100" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
	<!-- Grid -->
	<line x1="108" y1="55" x2="194" y2="55" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
	<!-- Area fill -->
	<path
		d="M108,92 L122,89 L136,84 L151,78 L165,70 L178,60 L190,50 L194,46 L194,100 L108,100 Z"
		fill="rgba(255,255,255,0.06)"
	/>
	<!-- Main rising line (applications) -->
	<path
		d="M108,92 L122,89 L136,84 L151,78 L165,70 L178,60 L190,50 L194,46"
		fill="none"
		stroke="white"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<!-- Admit-rate declining line -->
	<path
		d="M108,30 L136,34 L165,40 L178,50 L194,64"
		fill="none"
		stroke="#c0392b"
		stroke-width="1.5"
		stroke-linecap="round"
		opacity="0.75"
	/>
	<!-- Dots -->
	<circle cx="108" cy="92" r="3" fill="rgba(255,255,255,0.6)"/>
	<circle cx="194" cy="46" r="4" fill="white"/>
	<!-- Labels -->
	<text x="108" y="111" class="label muted">2001</text>
	<text x="194" y="111" text-anchor="end" class="label muted">2022</text>
	<text x="197" y="48"  class="label bold">apps ↑</text>
	<text x="197" y="67"  class="label accent">admit ↓</text>

</svg>

<style>
	.thumb { width: 100%; height: 100%; display: block; }
	.label {
		font-family: system-ui, sans-serif;
		font-size: 7.5px;
		fill: rgba(255,255,255,0.3);
	}
	.label.bold   { fill: rgba(255,255,255,0.85); font-weight: 700; font-size: 8.5px; }
	.label.accent { fill: #c0392b; font-weight: 600; }
	.label.muted  { fill: rgba(255,255,255,0.25); }
</style>
