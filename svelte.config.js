import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Allow both .svelte and .svelte.md files as page/component files.
	// Plain .md files in content/ are NOT treated as routes — they are
	// imported by server loaders or components as needed.
	extensions: ['.svelte', '.svelte.md'],

	preprocess: [
		mdsvex({
			extensions: ['.svelte.md'],
			// Smart typography: -- → en-dash, --- → em-dash, "quotes" → curly
			smartypants: true
		})
	],

	kit: {
		adapter: adapter(),
		alias: {
			// import myData from '$data/my-story.json'
			$data: 'data'
		}
	}
};

export default config;
