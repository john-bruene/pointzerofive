<svelte:head>
	<title>Support — pointzerofive</title>
</svelte:head>

<div class="container">
	<section class="prose support-page">
		<p class="page-label">Support</p>
		<h1 class="page-title">Keep the stories coming</h1>

		<p>
			Every story here takes dozens of hours to research, clean, and build. If you find the work
			useful or enjoyable, consider buying me a coffee. It keeps the lights on.
		</p>

		<!-- Buy Me a Coffee — replace href with your real link -->
		<a
			href="https://www.buymeacoffee.com/placeholder"
			class="bmc-button"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Buy Me a Coffee (opens in new tab)"
		>
			<span class="bmc-icon" aria-hidden="true">☕</span>
			Buy me a coffee
		</a>

		<p class="support-note">
			No subscription, no algorithm. Just good-faith support for independent data journalism.
		</p>
	</section>
</div>

<style>
	.support-page {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-xl);
	}

	.page-label {
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-size: clamp(2rem, 4vw, var(--size-2xl));
		margin-bottom: 2rem;
	}

	/* ---- Buy Me a Coffee button ---- */
	.bmc-button {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-block: 2.5rem;
		padding: 0.8rem 1.6rem;
		background: #ffdd00;
		color: #1a1a18;
		font-family: var(--font-sans);
		font-size: var(--size-base);
		font-weight: 400;
		text-decoration: none;
		border-radius: 4px;
		border: 2px solid #1a1a18;
		transition:
			background var(--transition),
			transform var(--transition);
	}

	.bmc-button:hover {
		background: #f5d000;
		transform: translateY(-1px);
	}

	.bmc-icon {
		font-size: 1.2em;
	}

	.support-note {
		font-size: var(--size-sm);
		color: var(--color-muted);
		max-width: 48ch;
	}
</style>
