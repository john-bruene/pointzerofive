// +page.server.ts
// Imports the story dataset at BUILD TIME via Vite (no runtime fs access).
// This works on Vercel and all serverless platforms.
//
// Content pipeline: re-run notebooks/crosswalks_pipeline.py to regenerate
// data/crosswalks-italy.json, then redeploy.

import storyData from '$data/crosswalks-italy.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { storyData };
};
