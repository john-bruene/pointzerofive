<svelte:head>
	<title>About — pointzerofive</title>
</svelte:head>

<div class="container">
	<article class="prose about-page">
		<p class="page-label">About</p>
		<h1 class="page-title">Why pointzerofive?</h1>

		<p>
			pointzerofive is a personal data journalism project. The name is a reminder: even a small
			probability, 0.05, is meaningful when you understand the story behind it.
		</p>

		<p>
			Every piece here starts with a dataset, a question, and a lot of time spent on the details.
			The goal is not to overwhelm — it is to illuminate one thing clearly.
		</p>

		<h2>How it works</h2>

		<p>
			Stories are built notebook-first: data is explored and shaped in R or Python, then exported as
			clean JSON or CSV. The site consumes these artifacts directly. This separation keeps the
			analysis reproducible and the presentation focused.
		</p>

		<h2>Who makes this</h2>

		<p>
			This is a one-person project. If you have data, a story lead, or just want to say hello, you
			can reach me at <a href="mailto:hello@pointzerofive.net">hello@pointzerofive.net</a>.
		</p>
	</article>
</div>

<style>
	.about-page {
		padding-top: var(--space-lg);
		padding-bottom: var(--space-xl);
		color: var(--shell-text);
		font-family: var(--font-body);
	}

	.page-label {
		font-family: var(--font-ui);
		font-size: var(--size-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--shell-muted);
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-size: clamp(2rem, 4vw, var(--size-2xl));
		margin-bottom: 2.5rem;
		color: var(--shell-text);
	}

	.about-page p {
		color: var(--shell-muted);
		line-height: var(--leading-loose);
	}

	.about-page h2 {
		font-size: var(--size-lg);
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		color: var(--shell-text);
	}

	.about-page a {
		color: var(--shell-accent);
		text-underline-offset: 3px;
	}
</style>
