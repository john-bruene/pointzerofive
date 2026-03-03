/**
 * stories.ts
 * Central registry of all published stories.
 * Add a new entry here whenever a story goes live.
 * The `color` field is the placeholder thumbnail background
 * until a real og-image/thumbnail exists.
 */

export interface Story {
	/** Sequential number shown on the card (#001, #002 …) */
	number: string;
	title: string;
	dek: string;
	slug: string; // full path: /YYYY/MM/slug
	date: string; // ISO: YYYY-MM-DD
	dateLabel: string; // human: "Feb 2026"
	category: string;
	/** Placeholder card color until real thumbnail is available */
	color: string;
}

export const stories: Story[] = [
	{
		number: '003',
		title: 'The Applicant Surge Era',
		dek: 'A fixed 2001-2022 admissions panel shows the surge clearly, with transparent checks and Greek-life snapshots to map what applicant scale does and does not explain.',
		slug: '/2026/03/applicant-surge-greek-snapshots',
		date: '2026-03-03',
		dateLabel: 'Mar 2026',
		category: 'Education data',
		color: '#6b4c2f' // earthy bronze
	},
	{
		number: '002',
		title: 'Admissions Arms Race, Greek Life Divide',
		dek: 'US campuses draw ever-larger applicant pools, but Greek participation often shrinks at the same time. A look at where the pattern holds and breaks.',
		slug: '/2026/02/us-college-greek-life',
		date: '2026-02-27',
		dateLabel: 'Feb 2026',
		category: 'Education data',
		color: '#304a66' // steel blue
	},
	{
		number: '001',
		title: 'Crosswalks of Italy',
		dek: 'How safe are pedestrian crossings across Italian cities? A data investigation into infrastructure, risk, and the widening gap between north and south.',
		slug: '/2026/02/crosswalks-italy',
		date: '2026-02-27',
		dateLabel: 'Feb 2026',
		category: 'Urban data',
		color: '#2a4a3e' // deep teal
	}
	// Add more stories here as they are published.
];
