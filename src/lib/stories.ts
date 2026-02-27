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
