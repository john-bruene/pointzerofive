import storyData from '$data/us-college-greek-life.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { storyData };
};
