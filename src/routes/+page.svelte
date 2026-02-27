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
	<p class="masthead-eyebrow">Visual data journalism</p>
	<h1 class="masthead-headline">
		Stories that<br /><em>make you look</em><br />twice.
	</h1>
	<div class="masthead-rule"></div>
	<p class="masthead-sub">
		One dataset. One question. Built from scratch, every time.
	</p>
</section>

<!-- ── Story grid ── -->
<section class="grid-section container">
	<div class="grid-header">
		<h2 class="grid-label">Latest stories</h2>
		<span class="grid-count">{stories.length} published</span>
	</div>

	<div class="story-grid">
		{#each stories as story, i}
			<article class="card" style="--i:{i}">
				<a href={story.slug} class="card-link">
					<!-- Preview area -->
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
			{#each Array(3 - stories.length) as _, j}
				<article
					class="card card--placeholder"
					aria-hidden="true"
					style="--i:{stories.length + j}"
				>
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
		padding-top: 6rem;
		padding-bottom: 4rem;
	}

	.masthead-eyebrow {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-accent);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 600;
		margin-bottom: 1.5rem;
		animation: slideInLeft 0.6s ease backwards;
	}

	.masthead-headline {
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 7.5vw, 7rem);
		line-height: 1.0;
		letter-spacing: -0.03em;
		color: var(--shell-text);
		max-width: 14ch;
		margin-bottom: 2rem;
		animation: fadeUp 0.7s ease backwards;
		animation-delay: 0.1s;
	}

	.masthead-headline em {
		color: var(--shell-muted);
		font-style: italic;
	}

	.masthead-rule {
		width: 3.5rem;
		height: 3px;
		background: var(--shell-accent);
		margin-bottom: 1.5rem;
		animation: fadeIn 0.8s ease backwards;
		animation-delay: 0.35s;
	}

	.masthead-sub {
		font-family: var(--font-ui);
		font-size: var(--size-sm);
		color: var(--shell-muted);
		letter-spacing: 0.02em;
		max-width: 44ch;
		line-height: 1.7;
		animation: fadeUp 0.6s ease backwards;
		animation-delay: 0.45s;
	}

	/* ── Grid section ── */
	.grid-section {
		padding-bottom: var(--space-xl);
	}

	.grid-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--shell-border);
	}

	.grid-label {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--shell-text);
	}

	.grid-count {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		color: var(--shell-muted);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* ── 3-column responsive grid ── */
	.story-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5px;
		background: var(--shell-border);
	}

	/* ── Card ── */
	.card {
		background: var(--shell-bg-card);
		overflow: hidden;
		position: relative;
		/* Staggered entrance */
		animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(var(--i, 0) * 130ms + 500ms);
		/* Lift on hover */
		transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
			box-shadow 0.25s ease,
			z-index 0s;
	}

	.card:not(.card--placeholder):hover {
		transform: translateY(-8px) scale(1.005);
		box-shadow: 0 28px 72px rgba(0, 0, 0, 0.55);
		z-index: 2;
	}

	.card-link {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		color: var(--shell-text);
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

	/* Dot-grid texture overlay */
	.card-preview::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, rgba(255, 255, 255, 0.13) 1px, transparent 1px);
		background-size: 18px 18px;
		z-index: 1;
		pointer-events: none;
	}

	/* Bottom vignette so category tag is readable */
	.card-preview::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 55%;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
		z-index: 1;
		pointer-events: none;
	}

	.card:not(.card--placeholder):hover .card-preview {
		filter: brightness(1.1) saturate(1.08);
	}

	.card-preview--empty {
		background: var(--shell-border) !important;
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
		color: rgba(255, 255, 255, 0.85);
		padding: 0.2em 0.55em;
		border-radius: 2px;
		z-index: 2;
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
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ── Placeholder cards ── */
	.card--placeholder {
		opacity: 0.3;
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
		.masthead {
			padding-top: 3.5rem;
			padding-bottom: 3rem;
		}

		.masthead-headline {
			font-size: clamp(2.8rem, 12vw, 4rem);
		}

		.story-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
