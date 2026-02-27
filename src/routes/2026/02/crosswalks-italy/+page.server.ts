// +page.server.ts
// Reads the exported data file at request/build time.
// In production the content pipeline (R/Python notebooks) writes JSON to /data/.
// This loader passes it to the page as typed props.

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	// Resolve from the project root (process.cwd() in Node)
	const raw = readFileSync(resolve('data/example.json'), 'utf-8');
	const storyData = JSON.parse(raw);
	return { storyData };
};
