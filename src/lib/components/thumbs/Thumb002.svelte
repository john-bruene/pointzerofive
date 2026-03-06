<!-- Story #002: Greek Life Divide — scatter plot thumbnail -->
<!-- x = applicants (0-150k), y = greek % (0-80%) -->
<!-- xS(v) = 18 + v/150000*164   yS(v) = 108 - v/80*88 -->
<svg viewBox="0 0 200 120" class="thumb" aria-hidden="true">
	<!-- Grid lines -->
	<line x1="18" y1="20" x2="182" y2="20" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
	<line x1="18" y1="53" x2="182" y2="53" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
	<line x1="18" y1="86" x2="182" y2="86" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
	<!-- Axes -->
	<line x1="18" y1="108" x2="182" y2="108" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
	<line x1="18" y1="20"  x2="18"  y2="108" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

	<!-- Regression line (negative slope) -->
	<line x1="18" y1="32" x2="182" y2="98" stroke="rgba(192,57,43,0.55)" stroke-width="1.5" stroke-dasharray="5 3"/>

	<!-- Regular dots (white, muted) -->
	<circle cx="74"  cy="87"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Michigan 65k,17% -->
	<circle cx="62"  cy="84"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Penn St 57k,12% -->
	<circle cx="56"  cy="87"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- UTAustin 53k,9% -->
	<circle cx="70"  cy="91"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Florida 48k,17% -->
	<circle cx="26"  cy="63"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- WashLee 2.5k,72% -->
	<circle cx="40"  cy="68"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Vanderbilt 30k,42% -->
	<circle cx="34"  cy="71"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Tulane 22k,40% -->
	<circle cx="31"  cy="72"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- WakeForest 18k,38% -->
	<circle cx="45"  cy="99"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Alabama 40k,0% -->
	<circle cx="35"  cy="66"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- OleMiss 14k,45% -->
	<circle cx="50"  cy="108" r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- NotreDame 25k,0% -->
	<circle cx="60"  cy="108" r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- BostonC 35k,0% -->
	<circle cx="103" cy="98"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- USC 78k,9% -->
	<circle cx="113" cy="99"  r="3.5" fill="rgba(255,255,255,0.28)"/> <!-- Michigan 65k duplicate -->

	<!-- Mega-applicant schools (red, right cluster) -->
	<circle cx="136" cy="103" r="5"   fill="#c0392b" opacity="0.9"/> <!-- NYU 105k,5% -->
	<circle cx="153" cy="105" r="5"   fill="#c0392b" opacity="0.9"/> <!-- UCBerkeley 125k,4% -->
	<circle cx="175" cy="105" r="6"   fill="#c0392b" opacity="1"/> <!-- UCLA 146k,4% -->

	<!-- Labels -->
	<text x="175" y="99" text-anchor="middle" class="label bold">UCLA</text>
	<text x="26"  y="58" text-anchor="middle" class="label accent">72%</text>

	<!-- Axis labels -->
	<text x="18"  y="116" class="label muted">0</text>
	<text x="100" y="116" text-anchor="middle" class="label muted">applicants →</text>
	<text x="182" y="116" text-anchor="end" class="label muted">150k</text>
</svg>

<style>
	.thumb { width: 100%; height: 100%; display: block; }
	.label {
		font-family: system-ui, sans-serif;
		font-size: 8px;
		fill: rgba(255,255,255,0.35);
	}
	.label.bold  { fill: rgba(255,255,255,0.85); font-weight: 700; font-size: 9px; }
	.label.accent { fill: rgba(255,255,255,0.8); font-weight: 700; }
	.label.muted { fill: rgba(255,255,255,0.25); }
</style>
