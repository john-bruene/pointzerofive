<svelte:head>
	<title>pointzerofive — data stories</title>
	<meta
		name="description"
		content="Careful data journalism and visual essays in the style of The Pudding."
	/>
</svelte:head>

<section class="hero container">
	<p class="hero-label">Visual data journalism</p>
	<h1 class="hero-title">Stories made from data,<br />designed to be read.</h1>
	<p class="hero-sub">
		pointzerofive is a one-person publication exploring data through scrollytelling, charts, and
		careful writing.
	</p>
</section>

<section class="stories container">
	<h2 class="section-label">Latest stories</h2>

	<article class="story-card">
		<a href="/2026/02/crosswalks-italy" class="story-card-link">
			<div class="story-card-meta">
				<time datetime="2026-02-27">Feb 2026</time>
				<span class="story-tag">Urban data</span>
			</div>
			<h3 class="story-card-title">Crosswalks of Italy</h3>
			<p class="story-card-desc">
				How safe are pedestrian crossings across Italian cities? A scrollytelling investigation into
				infrastructure, risk, and urban design.
			</p>
		</a>
	</article>
</section>

<style>
	/* ---- Hero ---- */
	.hero {
		padding-top: var(--space-xl);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.hero-label {
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-bottom: 1.5rem;
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, var(--size-3xl));
		max-width: 16ch;
		margin-bottom: 1.5rem;
	}

	.hero-sub {
		font-size: var(--size-lg);
		color: var(--color-muted);
		max-width: 52ch;
		line-height: var(--leading-loose);
	}

	/* ---- Stories ---- */
	.stories {
		padding-top: var(--space-lg);
	}

	.section-label {
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-bottom: 2rem;
	}

	/* ---- Story card ---- */
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
