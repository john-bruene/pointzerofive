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
		<a href="/" class="site-wordmark">
			pointzerofive<span class="wordmark-dot">.</span>
		</a>
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
	<div class="container">
		<p class="footer-text">
			© {new Date().getFullYear()} pointzerofive.net — data stories, carefully made.
		</p>
	</div>
</footer>

<style>
	/* ---- Header (always dark) ---- */
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--shell-bg);
		border-bottom: 1px solid var(--shell-border);
		padding-block: 1.1rem;
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.site-wordmark {
		font-family: var(--font-ui);
		font-size: var(--size-sm);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--shell-text);
		transition: color var(--transition);
	}

	.wordmark-dot {
		color: var(--shell-accent);
	}

	.site-wordmark:hover {
		color: var(--shell-accent);
	}

	/* ---- Nav ---- */
	.site-nav {
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

	/* ---- Footer (always dark) ---- */
	.site-footer {
		padding-block: var(--space-md);
		border-top: 1px solid var(--shell-border);
		background: var(--shell-bg);
	}

	.footer-text {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-muted);
		letter-spacing: 0.04em;
	}

	/* ---- Mobile ---- */
	@media (max-width: 600px) {
		.site-nav {
			gap: 1.25rem;
		}

		.nav-link {
			font-size: 0.65rem;
		}
	}
</style>
