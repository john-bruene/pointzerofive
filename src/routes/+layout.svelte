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

	// Story pages get the light treatment; shell pages stay dark
	const isStoryPage = $derived(
		$page.url.pathname.match(/^\/\d{4}\/\d{2}\//) !== null
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="container header-inner">
		<!-- Left spacer (balances the nav on the right) -->
		<div class="header-left" aria-hidden="true"></div>

		<!-- Centered wordmark / logo -->
		<a href="/" class="site-wordmark">
			<span class="wm-text">pointzerofive</span><span class="wm-dot">.</span>
		</a>

		<!-- Nav (right-aligned) -->
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
		<p class="footer-text">
			Data stories, carefully made.
		</p>
	</div>
</footer>

<style>
	/* ──────────────────────────────────────────
	   Header (always dark, sticky)
	────────────────────────────────────────── */
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--shell-bg);
		border-bottom: 1px solid var(--shell-border);
		padding-block: 1rem;
	}

	/* 3-column grid: [left spacer | centre logo | right nav] */
	.header-inner {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
	}

	/* ──────────────────────────────────────────
	   Wordmark / Logo
	────────────────────────────────────────── */
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

		/* For the sweep effect */
		position: relative;
		padding: 0.15em 0.35em;
		border-radius: 2px;
		isolation: isolate;
	}

	/* Red sweep background on hover */
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

	.site-wordmark:hover::before {
		transform: scaleX(1);
	}

	.site-wordmark:hover {
		color: #fff;
	}

	.site-wordmark:hover .wm-dot {
		color: #fff;
	}

	.wm-dot {
		color: var(--shell-accent);
		transition: color 0.2s ease;
	}

	/* ──────────────────────────────────────────
	   Nav
	────────────────────────────────────────── */
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
	.nav-link.active {
		color: var(--shell-text);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--shell-accent);
	}

	/* ──────────────────────────────────────────
	   Footer (always dark)
	────────────────────────────────────────── */
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

	.footer-wordmark:hover {
		color: var(--shell-text);
	}

	.footer-text {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-muted);
		letter-spacing: 0.04em;
	}

	/* ──────────────────────────────────────────
	   Mobile
	────────────────────────────────────────── */
	@media (max-width: 600px) {
		.site-nav {
			gap: 1.25rem;
		}

		.nav-link {
			font-size: 0.65rem;
		}

		.site-wordmark {
			font-size: 1.1rem;
		}

		.footer-inner {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
