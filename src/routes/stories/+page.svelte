<svelte:head>
	<title>Stories — pointzerofive</title>
</svelte:head>

<div class="container">
	<section class="stories-page">
		<p class="page-label">Stories</p>
		<h1 class="page-title">All stories</h1>

		<article class="story-card">
			<a href="/2026/02/crosswalks-italy" class="story-card-link">
				<div class="story-card-meta">
					<time datetime="2026-02-27">Feb 2026</time>
					<span class="story-tag">Urban data</span>
				</div>
				<h2 class="story-card-title">Crosswalks of Italy</h2>
				<p class="story-card-desc">
					How safe are pedestrian crossings across Italian cities? A scrollytelling investigation
					into infrastructure, risk, and urban design.
				</p>
			</a>
		</article>
	</section>
</div>

<style>
	.stories-page {
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
		margin-bottom: 3rem;
	}

	.story-card {
		border-top: 1px solid var(--color-border);
		padding-block: 2rem;
	}

	.story-card-link {
		text-decoration: none;
		display: block;
	}

	.story-card-link:hover .story-card-title {
		color: var(--color-accent);
	}

	.story-card-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		font-size: var(--size-xs);
		color: var(--color-muted);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 0.75rem;
	}

	.story-tag {
		border: 1px solid var(--color-border);
		padding: 0.1em 0.5em;
		border-radius: var(--radius);
	}

	.story-card-title {
		font-size: var(--size-xl);
		margin-bottom: 0.75rem;
		transition: color var(--transition);
	}

	.story-card-desc {
		color: var(--color-muted);
		max-width: 60ch;
		line-height: var(--leading-loose);
	}
</style>
