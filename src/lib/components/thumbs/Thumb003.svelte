<!-- Story #003: Applicant Surge Era — rising line chart thumbnail -->
<!-- 2001-2022 balanced panel, applicants tripling over 21 years -->
<svg viewBox="0 0 200 120" class="thumb" aria-hidden="true">
	<!-- Grid lines -->
	<line x1="18" y1="25"  x2="186" y2="25"  stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
	<line x1="18" y1="55"  x2="186" y2="55"  stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
	<line x1="18" y1="85"  x2="186" y2="85"  stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

	<!-- Axes -->
	<line x1="18" y1="100" x2="186" y2="100" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
	<line x1="18" y1="20"  x2="18"  y2="100" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>

	<!-- Area fill under main line (subtle) -->
	<path
		d="M18,92 L32,89 L50,85 L68,80 L86,73 L104,64 L122,53 L140,43 L154,36 L168,30 L186,25 L186,100 L18,100 Z"
		fill="rgba(255,255,255,0.06)"
	/>

	<!-- "All schools" faint background line -->
	<path
		d="M18,90 L32,87 L50,82 L68,77 L86,69 L104,60 L122,50 L140,40 L154,33 L168,27 L186,22"
		fill="none"
		stroke="rgba(255,255,255,0.18)"
		stroke-width="1.2"
		stroke-dasharray="3 2"
	/>

	<!-- Main bold line (balanced panel) -->
	<path
		d="M18,92 L32,89 L50,85 L68,80 L86,73 L104,64 L122,53 L140,43 L154,36 L168,30 L186,25"
		fill="none"
		stroke="white"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>

	<!-- Start dot -->
	<circle cx="18"  cy="92" r="3.5" fill="rgba(255,255,255,0.6)"/>
	<!-- End dot (bright) -->
	<circle cx="186" cy="25" r="4.5" fill="white"/>

	<!-- Admit rate line (declining, accent colour) -->
	<path
		d="M18,30 L50,33 L86,37 L122,46 L154,58 L186,72"
		fill="none"
		stroke="#c0392b"
		stroke-width="1.5"
		stroke-linecap="round"
		opacity="0.75"
	/>

	<!-- Labels -->
	<text x="18"  y="111" class="label muted">2001</text>
	<text x="186" y="111" text-anchor="end" class="label muted">2022</text>
	<text x="192" y="28"  class="label bold">apps ↑</text>
	<text x="192" y="74"  class="label accent">admit ↓</text>
</svg>

<style>
	.thumb { width: 100%; height: 100%; display: block; }
	.label {
		font-family: system-ui, sans-serif;
		font-size: 8px;
		fill: rgba(255,255,255,0.3);
	}
	.label.bold   { fill: rgba(255,255,255,0.85); font-weight: 700; font-size: 9px; }
	.label.accent { fill: #c0392b; font-weight: 600; }
	.label.muted  { fill: rgba(255,255,255,0.25); }
</style>
