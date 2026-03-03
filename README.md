# POINTZEROFIVE.NET

Data-journalism / scrollytelling site inspired by The Pudding.

- Live: https://pointzerofive.vercel.app
- Stack: SvelteKit 2, Svelte 5 runes, TypeScript, mdsvex, Vercel

## Development

```bash
npm install
npm run dev
```

Type/lint/build checks:

```bash
npm run check
npm run lint
npm run build
```

## Story Routes

- `/2026/02/crosswalks-italy`
- `/2026/02/us-college-greek-life`
- `/2026/03/applicant-surge-greek-snapshots`

Story index registry:

- `src/lib/stories.ts`

## Data Pipelines

Run from project root.

US college Greek snapshot pipeline:

```bash
python3 notebooks/us_college_greek_pipeline.py
```

Top-200 longitudinal pipeline (requested range 2000-2022, source-backed admissions 2001-2022 + Greek snapshots):

```bash
python3 notebooks/us_top200_longitudinal_pipeline.py
```

## Canonical Data Files

- `data/us-college-greek-life.json`
- `data/us-top200-longitudinal.json`
- `data/us-top200-admissions-2000-2022.csv`
- `data/us-top200-greek-snapshots-archive.csv`

## Notes

- No `readFileSync` at runtime for story data; data is imported via `$data` alias at build time.
- Story pages use the light editorial theme; shell pages stay in dark mode.
