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
		number: '002',
		title: 'How Popular Is Greek Life?',
		dek: 'At the biggest US universities, fraternity and sorority participation often shrinks as applicant pools grow. We map the correlation, trace it across 20 years, and find who breaks the rule.',
		slug: '/2026/02/greek-life-in-america',
		date: '2026-03-06',
		dateLabel: 'Mar 2026',
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
