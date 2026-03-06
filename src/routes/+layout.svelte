<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	let { children } = $props();

	const nav = [
		{ href: '/stories', label: 'Stories' },
		{ href: '/about', label: 'About' },
		{ href: '/support', label: 'Support' }
	];

	const isStoryPage = $derived(
		$page.url.pathname.match(/^\/\d{4}\/\d{2}\//) !== null
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="container header-inner">

		<!-- Left: animated cube -->
		<div class="header-left">
			<a href="/" class="cube-link" aria-label="pointzerofive home">
				<img src="/cube.gif" alt="" class="cube-gif" aria-hidden="true" />
			</a>
		</div>

		<!-- Centre: wordmark -->
		<a href="/" class="site-wordmark">
			<span class="wm-text">pointzerofive</span><span class="wm-dot">.</span>
		</a>

		<!-- Right: nav -->
		<nav class="site-nav" aria-label="Main navigation">
			{#each nav as { href, label }}
				<a {href} class="nav-link" class:active={$page.url.pathname.startsWith(href)}>
					{label}
				</a>
			{/each}
		</nav>

	</div>
</header>

<main class:light-page={isStoryPage}>
	{@render children()}
</main>

<footer class="site-footer">
	<div class="container footer-inner">
		<a href="/" class="footer-wordmark">
			pointzerofive<span class="wm-dot">.</span>
		</a>
		<p class="footer-text">Data stories, carefully made.</p>
	</div>
</footer>

<style>
	/* ── Header ── */
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--shell-bg);
		border-bottom: 1px solid var(--shell-border);
		padding-block: 1rem;
	}

	/* 3-column: [motto | logo | nav] */
	.header-inner {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
	}

	/* ── Wordmark (centre) ── */
	.site-wordmark {
		grid-column: 2;
		justify-self: center;
		display: inline-flex;
		align-items: baseline;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1.35rem;
		letter-spacing: -0.01em;
		text-decoration: none;
		color: var(--shell-text);
		position: relative;
		padding: 0.15em 0.35em;
		border-radius: 2px;
		isolation: isolate;
	}

	/* Red sweep on hover */
	.site-wordmark::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 2px;
		background: var(--shell-accent);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
		z-index: -1;
	}
	.site-wordmark:hover::before  { transform: scaleX(1); }
	.site-wordmark:hover          { color: #fff; }
	.site-wordmark:hover .wm-dot  { color: #fff; }

	.wm-dot {
		color: var(--shell-accent);
		transition: color 0.2s ease;
	}

	/* ── Cube (left) ── */
	.header-left {
		justify-self: start;
	}

	.cube-link {
		display: inline-block;
		line-height: 0;
		opacity: 0.82;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.cube-link:hover {
		opacity: 1;
		transform: scale(1.08);
	}

	.cube-gif {
		width: 48px;
		height: 48px;
		display: block;
	}

	/* ── Nav (right) ── */
	.site-nav {
		justify-self: end;
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--shell-muted);
		transition: color var(--transition);
		position: relative;
	}

	.nav-link:hover,
	.nav-link.active { color: var(--shell-text); }

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0; right: 0;
		height: 1px;
		background: var(--shell-accent);
	}

	/* ── Footer ── */
	.site-footer {
		padding-block: var(--space-md);
		border-top: 1px solid var(--shell-border);
		background: var(--shell-bg);
	}

	.footer-inner {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.footer-wordmark {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1rem;
		color: var(--shell-muted);
		text-decoration: none;
		letter-spacing: -0.01em;
		transition: color var(--transition);
	}
	.footer-wordmark:hover { color: var(--shell-text); }

	.footer-text {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-muted);
		letter-spacing: 0.04em;
	}

	/* ── Mobile ── */
	@media (max-width: 680px) {
		.header-inner { grid-template-columns: auto auto 1fr; }
		.site-nav { gap: 1.25rem; }
		.nav-link { font-size: 0.65rem; }
		.site-wordmark { font-size: 1.1rem; grid-column: 2; justify-self: start; }
		.cube-gif { width: 36px; height: 36px; }
		.footer-inner { flex-direction: column; gap: 0.5rem; }
	}
</style>
