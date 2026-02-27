<script lang="ts">
	import { stories } from '$lib/stories';
</script>

<svelte:head>
	<title>pointzerofive — data stories</title>
	<meta
		name="description"
		content="Visual data journalism. Scrollytelling essays built from real data."
	/>
</svelte:head>

<!-- ── Masthead ── -->
<section class="masthead container">
	<p class="masthead-sub">A data publication that will make you look twice at numbers.</p>
</section>

<!-- ── Story grid ── -->
<section class="grid-section container">
	<div class="story-grid">
		{#each stories as story}
			<article class="card">
				<a href={story.slug} class="card-link">
					<!-- Preview area (placeholder colour until real thumbnail) -->
					<div class="card-preview" style:background={story.color}>
						<span class="card-category">{story.category}</span>
					</div>

					<!-- Card footer -->
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

		<!-- Placeholder cards so the grid always looks full even with 1–2 stories -->
		{#if stories.length < 3}
			{#each Array(3 - stories.length) as _}
				<article class="card card--placeholder" aria-hidden="true">
					<div class="card-preview card-preview--empty"></div>
					<div class="card-body">
						<p class="placeholder-label">Coming soon</p>
					</div>
				</article>
			{/each}
		{/if}
	</div>
</section>

<style>
	/* ── Masthead ── */
	.masthead {
		padding-top: 5rem;
		padding-bottom: 3.5rem;
	}

	.masthead-sub {
		font-family: var(--font-ui);
		font-size: var(--size-sm);
		color: var(--shell-muted);
		letter-spacing: 0.03em;
		max-width: 52ch;
	}

	/* ── Grid section ── */
	.grid-section {
		padding-bottom: var(--space-xl);
	}

	/* ── 3-column responsive grid ── */
	.story-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5px; /* tight seam like The Pudding */
		background: var(--shell-border); /* border colour fills the gaps */
	}

	/* ── Card ── */
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

	/* Lift card on hover */
	.card-link:hover .card-preview {
		filter: brightness(1.12);
	}

	.card-link:hover .card-title {
		color: var(--shell-accent);
	}

	/* ── Preview image area ── */
	.card-preview {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		transition: filter 300ms ease;
	}

	.card-preview--empty {
		background: var(--shell-border);
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

	/* ── Card body ── */
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

	.card-number {
		font-weight: 700;
		color: var(--shell-accent);
	}

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
		/* Clamp to 3 lines */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ── Placeholder cards ── */
	.card--placeholder {
		opacity: 0.35;
		pointer-events: none;
	}

	.placeholder-label {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-muted);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.story-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 580px) {
		.story-grid {
			grid-template-columns: 1fr;
		}

		.masthead {
			padding-top: 3rem;
		}
	}
</style>
