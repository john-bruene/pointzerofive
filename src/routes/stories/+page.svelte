<script lang="ts">
	import { stories } from '$lib/stories';
</script>

<svelte:head>
	<title>All stories — pointzerofive</title>
	<meta name="description" content="Every data story published on pointzerofive." />
</svelte:head>

<div class="container">
	<header class="page-header">
		<p class="page-eyebrow">All stories</p>
		<h1 class="page-title">Every story, in order.</h1>
	</header>
</div>

<section class="grid-section container">
	<div class="story-grid">
		{#each stories as story}
			<article class="card">
				<a href={story.slug} class="card-link">
					<div class="card-preview" style:background={story.color}>
						<span class="card-category">{story.category}</span>
					</div>
					<div class="card-body">
						<div class="card-meta">
							<span class="card-number">#{story.number}</span>
							<time datetime={story.date} class="card-date">{story.dateLabel}</time>
						</div>
						<h2 class="card-title">{story.title}</h2>
						<p class="card-dek">{story.dek}</p>
					</div>
				</a>
			</article>
		{/each}
	</div>
</section>

<style>
	/* ── Page header ── */
	.page-header {
		padding-top: 4rem;
		padding-bottom: 2.5rem;
	}

	.page-eyebrow {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--shell-muted);
		margin-bottom: 0.75rem;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3rem);
		color: var(--shell-text);
	}

	/* ── Grid (reuse same pattern as homepage) ── */
	.grid-section {
		padding-bottom: var(--space-xl);
	}

	.story-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5px;
		background: var(--shell-border);
	}

	.card {
		background: var(--shell-bg-card);
		overflow: hidden;
	}

	.card-link {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		color: var(--shell-text);
	}

	.card-link:hover .card-preview { filter: brightness(1.12); }
	.card-link:hover .card-title   { color: var(--shell-accent); }

	.card-preview {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		transition: filter 300ms ease;
	}

	.card-category {
		position: absolute;
		bottom: 0.75rem;
		left: 0.75rem;
		font-family: var(--font-ui);
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.7);
		background: rgba(0, 0, 0, 0.35);
		padding: 0.2em 0.5em;
		border-radius: 2px;
		backdrop-filter: blur(4px);
	}

	.card-body {
		padding: 1.25rem 1.25rem 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--shell-muted);
	}

	.card-number { font-weight: 700; color: var(--shell-accent); }

	.card-title {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2vw, 1.6rem);
		line-height: var(--leading-tight);
		color: var(--shell-text);
		transition: color var(--transition);
	}

	.card-dek {
		font-family: var(--font-ui);
		font-size: var(--size-sm);
		color: var(--shell-muted);
		line-height: 1.6;
		margin-top: 0.25rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.story-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (max-width: 580px) {
		.story-grid { grid-template-columns: 1fr; }
	}
</style>
