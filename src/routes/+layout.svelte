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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="container header-inner">
		<a href="/" class="site-wordmark">pointzerofive</a>
		<nav class="site-nav" aria-label="Main navigation">
			{#each nav as { href, label }}
				<a {href} class="nav-link" class:active={$page.url.pathname.startsWith(href)}>
					{label}
				</a>
			{/each}
		</nav>
	</div>
</header>

<main>
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
	/* ---- Header ---- */
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		padding-block: 1rem;
	}

	.header-inner {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.site-wordmark {
		font-size: var(--size-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--color-text);
		font-weight: 400;
	}

	.site-wordmark:hover {
		color: var(--color-accent);
	}

	/* ---- Nav ---- */
	.site-nav {
		display: flex;
		gap: 1.75rem;
		align-items: center;
	}

	.nav-link {
		font-size: var(--size-sm);
		text-decoration: none;
		color: var(--color-muted);
		letter-spacing: 0.04em;
		transition: color var(--transition);
		position: relative;
	}

	.nav-link:hover,
	.nav-link.active {
		color: var(--color-text);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -3px;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-accent);
	}

	/* ---- Footer ---- */
	.site-footer {
		margin-top: var(--space-xl);
		padding-block: var(--space-md);
		border-top: 1px solid var(--color-border);
	}

	.footer-text {
		font-size: var(--size-xs);
		color: var(--color-muted);
		letter-spacing: 0.03em;
	}

	/* ---- Mobile ---- */
	@media (max-width: 600px) {
		.site-wordmark {
			font-size: 0.7rem;
		}

		.site-nav {
			gap: 1rem;
		}

		.nav-link {
			font-size: 0.75rem;
		}
	}
</style>
