import rawLongitudinalJson from '$data/us-top200-longitudinal.json';
import rawScatterJson from '$data/us-college-greek-life.json';
import type { PageServerLoad } from './$types';

// ─── Scatter types ────────────────────────────────────────────────────────────

interface University {
	name: string;
	applicants: number;
	admit_rate: number;
	greek_rate: number;
	control: string;
}

interface ScatterData {
	meta: {
		source: string;
		updated: string;
		caveat: string;
	};
	summary: {
		universities_analyzed: number;
		total_applicants: number;
		applicant_median: number;
		average_greek_rate: number;
		correlation_applicants_greek: number;
		mega_applicant_cutoff: number;
		greek_heavy_cutoff: number;
		mega_applicant_schools: string[];
		mega_low_greek_schools: string[];
		greek_heavy_schools: string[];
		no_greek_schools: string[];
		top_greek_school: string;
		top_greek_rate: number;
	};
	regression: {
		slope: number;
		intercept: number;
	};
	universities: University[];
}

// ─── Longitudinal types ───────────────────────────────────────────────────────

interface SourceLink {
	name: string;
	url: string;
}

interface TopSchool {
	unitid: number;
	institution_name: string;
	state_abbr: string;
	applicants_2022: number;
	rank_2022_by_applicants: number;
}

interface AdmissionRow {
	year: number;
	unitid: number;
	admissions_data_available: boolean;
	applicants: number | null;
	admitted: number | null;
}

interface GreekPanelRow {
	snapshot_date: string;
	snapshot_year: number;
	snapshot_label: string;
	snapshot_source: string;
	unitid: number;
	match_type: string | null;
	rank_2022_by_applicants: number;
	fraternities_yes_no: string | null;
	sororities_yes_no: string | null;
	pct_fraternity: number | null;
	pct_sorority: number | null;
	fraternity_raw: string | null;
	sorority_raw: string | null;
}

interface CoveragePoint {
	snapshot_date: string;
	top200_matches: number;
	top200_total: number;
}

interface RawLongitudinalData {
	meta: {
		updated: string;
		admissions_limit_note: string;
		greek_limit_note: string;
		sources: SourceLink[];
		requested_admissions_start_year: number;
		requested_admissions_end_year: number;
		admissions_available_start_year: number;
		admissions_available_end_year: number;
	};
	summary: {
		top200_count: number;
		admissions_rows: number;
		greek_coverage_by_snapshot: CoveragePoint[];
	};
	top200: TopSchool[];
	admissions_panel: AdmissionRow[];
	greek_panel: GreekPanelRow[];
}

interface YearPoint {
	year: number;
	reportingSchoolCount: number;
	balancedSchoolCount: number;
	applicantsAll: number;
	applicantsBalanced: number;
	top50Applicants: number;
	restApplicants: number;
	admitRate: number;
	balancedShareOfAll: number;
}

interface GreekPoint {
	snapshotDate: string;
	snapshotYear: number;
	snapshotLabel: string;
	snapshotSource: string;
	totalSchools: number;
	matchedSchools: number;
	usableSchools: number;
	averageGreekTotal: number;
	top50GreekTotal: number;
	restGreekTotal: number;
}

interface CoverageCheckPoint {
	snapshotDate: string;
	reportedMatches: number;
	computedMatches: number;
	matchesAgree: boolean;
}

interface LatestSchoolPoint {
	unitid: number;
	institutionName: string;
	stateAbbr: string;
	rank2022: number;
	applicants2022: number;
	greekTotal: number;
	pctFraternity: number;
	pctSorority: number;
	matchType: string;
	top50: boolean;
}

interface StateMetricPoint {
	stateAbbr: string;
	schoolsInTop200: number;
	applicants2022: number;
	latestGreekUsableSchools: number;
	latestGreekAverage: number | null;
}

interface LongitudinalPayload {
	meta: {
		updated: string;
		admissionsLimitNote: string;
		greekLimitNote: string;
		sources: SourceLink[];
	};
	scope: {
		top200Count: number;
		requestedAdmissionsStartYear: number;
		requestedAdmissionsEndYear: number;
		availableAdmissionsStartYear: number;
		availableAdmissionsEndYear: number;
		balancedSchoolCount: number;
		latestGreekSnapshotDate: string | null;
	};
	series: {
		yearly: YearPoint[];
		greekSnapshots: GreekPoint[];
		latestSchools: LatestSchoolPoint[];
		stateMetrics: StateMetricPoint[];
	};
	highlights: {
		totalGrowthMultiple: number;
		top50GrowthMultiple: number;
		restGrowthMultiple: number;
		top50ShareFrom: number;
		top50ShareTo: number;
		admitRateFrom: number;
		admitRateTo: number;
		admitRatePandemicJump: number | null;
		latestGreekTop50: number;
		latestGreekRest: number;
		latestGreekUsable: number;
		latestGreekMatched: number;
		latestGreekTotal: number;
	};
	checks: {
		admissionsRowsExpected: number;
		admissionsRowsActual: number;
		admissionsRowsAgree: boolean;
		coverageChecks: CoverageCheckPoint[];
		coverageChecksAgree: boolean;
		balancedPanelShareInLatestYear: number;
	};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rawLongitudinal = rawLongitudinalJson as RawLongitudinalData;
const scatterData = rawScatterJson as ScatterData;

function sum(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

function parseGreekPercent(rawValue: string | null, yesNoFlag: string | null): number | null {
	if (rawValue === null) return null;
	const cleaned = rawValue.trim();
	if (cleaned === '' || cleaned === 'Not Reported' || cleaned === 'N/A') return null;
	if (cleaned === '-' && yesNoFlag === 'N') return 0;
	const match = cleaned.match(/\d+(\.\d+)?/);
	if (!match) return null;
	return Number(match[0]);
}

function safeAverage(values: number[]): number {
	if (values.length === 0) return 0;
	return sum(values) / values.length;
}

function buildYearlySeries(storyData: RawLongitudinalData): {
	yearly: YearPoint[];
	balancedUnitIds: Set<number>;
} {
	const admissions = storyData.admissions_panel;
	const top50UnitIds = new Set(
		storyData.top200
			.filter((row) => row.rank_2022_by_applicants <= 50)
			.map((row) => row.unitid)
	);

	const availableYears = [...new Set(admissions.map((row) => row.year))]
		.filter((year) =>
			admissions.some(
				(row) =>
					row.year === year &&
					row.admissions_data_available &&
					row.applicants !== null &&
					row.admitted !== null
			)
		)
		.sort((a, b) => a - b);

	const yearsByUnitId = new Map<number, Set<number>>();
	for (const row of admissions) {
		if (!row.admissions_data_available || row.applicants === null || row.admitted === null) continue;
		if (!yearsByUnitId.has(row.unitid)) yearsByUnitId.set(row.unitid, new Set<number>());
		yearsByUnitId.get(row.unitid)?.add(row.year);
	}

	const balancedUnitIds = new Set<number>(
		[...yearsByUnitId.entries()]
			.filter(([, years]) => availableYears.every((year) => years.has(year)))
			.map(([unitid]) => unitid)
	);

	const yearly = availableYears.map((year) => {
		const rows = admissions.filter(
			(row) =>
				row.year === year &&
				row.admissions_data_available &&
				row.applicants !== null &&
				row.admitted !== null
		);
		const balancedRows = rows.filter((row) => balancedUnitIds.has(row.unitid));
		const applicantsAll = sum(rows.map((row) => row.applicants ?? 0));
		const applicantsBalanced = sum(balancedRows.map((row) => row.applicants ?? 0));
		const admittedBalanced = sum(balancedRows.map((row) => row.admitted ?? 0));
		const top50Applicants = sum(
			balancedRows
				.filter((row) => top50UnitIds.has(row.unitid))
				.map((row) => row.applicants ?? 0)
		);
		const restApplicants = applicantsBalanced - top50Applicants;

		return {
			year,
			reportingSchoolCount: rows.length,
			balancedSchoolCount: balancedRows.length,
			applicantsAll,
			applicantsBalanced,
			top50Applicants,
			restApplicants,
			admitRate: applicantsBalanced > 0 ? admittedBalanced / applicantsBalanced : 0,
			balancedShareOfAll: applicantsAll > 0 ? applicantsBalanced / applicantsAll : 0
		};
	});

	return { yearly, balancedUnitIds };
}

function buildGreekSeries(storyData: RawLongitudinalData): {
	greekSnapshots: GreekPoint[];
	coverageChecks: CoverageCheckPoint[];
} {
	const coverageByDate = new Map(
		storyData.summary.greek_coverage_by_snapshot.map((row) => [row.snapshot_date, row])
	);

	const groupedByDate = new Map<string, GreekPanelRow[]>();
	for (const row of storyData.greek_panel) {
		if (!groupedByDate.has(row.snapshot_date)) groupedByDate.set(row.snapshot_date, []);
		groupedByDate.get(row.snapshot_date)?.push(row);
	}

	const greekSnapshots: GreekPoint[] = [];
	const coverageChecks: CoverageCheckPoint[] = [];

	for (const snapshotDate of [...groupedByDate.keys()].sort((a, b) => a.localeCompare(b))) {
		const rows = groupedByDate.get(snapshotDate) ?? [];
		const matchedRows = rows.filter((row) => row.match_type !== null);
		const usableRows = matchedRows
			.map((row) => {
				const fraternity =
					row.pct_fraternity ?? parseGreekPercent(row.fraternity_raw, row.fraternities_yes_no);
				const sorority =
					row.pct_sorority ?? parseGreekPercent(row.sorority_raw, row.sororities_yes_no);
				return { rank: row.rank_2022_by_applicants, fraternity, sorority };
			})
			.filter((row) => row.fraternity !== null || row.sorority !== null);

		const top50Rows = usableRows.filter((row) => row.rank <= 50);
		const restRows = usableRows.filter((row) => row.rank > 50);
		const totals = usableRows.map((row) => (row.fraternity ?? 0) + (row.sorority ?? 0));
		const top50Totals = top50Rows.map((row) => (row.fraternity ?? 0) + (row.sorority ?? 0));
		const restTotals = restRows.map((row) => (row.fraternity ?? 0) + (row.sorority ?? 0));

		const coverage = coverageByDate.get(snapshotDate);
		const exemplar = rows[0];
		const reportedMatches = coverage?.top200_matches ?? matchedRows.length;
		const totalSchools = coverage?.top200_total ?? storyData.summary.top200_count;

		greekSnapshots.push({
			snapshotDate,
			snapshotYear: exemplar?.snapshot_year ?? Number(snapshotDate.slice(0, 4)),
			snapshotLabel: exemplar?.snapshot_label ?? 'Greek Life Snapshot',
			snapshotSource: exemplar?.snapshot_source ?? 'unknown',
			totalSchools,
			matchedSchools: reportedMatches,
			usableSchools: usableRows.length,
			averageGreekTotal: safeAverage(totals),
			top50GreekTotal: safeAverage(top50Totals),
			restGreekTotal: safeAverage(restTotals)
		});

		coverageChecks.push({
			snapshotDate,
			reportedMatches,
			computedMatches: matchedRows.length,
			matchesAgree: reportedMatches === matchedRows.length
		});
	}

	return { greekSnapshots, coverageChecks };
}

function buildLatestSchoolView(
	storyData: RawLongitudinalData,
	latestSnapshotDate: string | undefined
): LatestSchoolPoint[] {
	if (!latestSnapshotDate) return [];
	const schoolByUnitId = new Map(storyData.top200.map((row) => [row.unitid, row]));
	const latestRows = storyData.greek_panel.filter(
		(row) => row.snapshot_date === latestSnapshotDate && row.match_type !== null
	);

	return latestRows
		.map((row) => {
			const school = schoolByUnitId.get(row.unitid);
			if (!school || !row.match_type) return null;
			const pctFraternity =
				row.pct_fraternity ?? parseGreekPercent(row.fraternity_raw, row.fraternities_yes_no);
			const pctSorority =
				row.pct_sorority ?? parseGreekPercent(row.sorority_raw, row.sororities_yes_no);
			if (pctFraternity === null && pctSorority === null) return null;
			return {
				unitid: school.unitid,
				institutionName: school.institution_name,
				stateAbbr: school.state_abbr,
				rank2022: school.rank_2022_by_applicants,
				applicants2022: school.applicants_2022,
				greekTotal: (pctFraternity ?? 0) + (pctSorority ?? 0),
				pctFraternity: pctFraternity ?? 0,
				pctSorority: pctSorority ?? 0,
				matchType: row.match_type,
				top50: school.rank_2022_by_applicants <= 50
			} satisfies LatestSchoolPoint;
		})
		.filter((row): row is LatestSchoolPoint => row !== null)
		.sort((a, b) => a.rank2022 - b.rank2022);
}

function buildStateMetrics(
	top200: TopSchool[],
	latestSchools: LatestSchoolPoint[]
): StateMetricPoint[] {
	const baseByState = new Map<string, { schoolsInTop200: number; applicants2022: number }>();
	for (const school of top200) {
		const current = baseByState.get(school.state_abbr) ?? { schoolsInTop200: 0, applicants2022: 0 };
		current.schoolsInTop200 += 1;
		current.applicants2022 += school.applicants_2022;
		baseByState.set(school.state_abbr, current);
	}
	const greekByState = new Map<string, { usable: number; sumGreek: number }>();
	for (const school of latestSchools) {
		const current = greekByState.get(school.stateAbbr) ?? { usable: 0, sumGreek: 0 };
		current.usable += 1;
		current.sumGreek += school.greekTotal;
		greekByState.set(school.stateAbbr, current);
	}
	return [...baseByState.entries()]
		.map(([stateAbbr, base]) => {
			const greek = greekByState.get(stateAbbr);
			return {
				stateAbbr,
				schoolsInTop200: base.schoolsInTop200,
				applicants2022: base.applicants2022,
				latestGreekUsableSchools: greek?.usable ?? 0,
				latestGreekAverage: greek && greek.usable > 0 ? greek.sumGreek / greek.usable : null
			} satisfies StateMetricPoint;
		})
		.sort((a, b) =>
			b.schoolsInTop200 !== a.schoolsInTop200
				? b.schoolsInTop200 - a.schoolsInTop200
				: b.applicants2022 - a.applicants2022
		);
}

function buildLongitudinalPayload(storyData: RawLongitudinalData): LongitudinalPayload {
	const { yearly } = buildYearlySeries(storyData);
	const { greekSnapshots, coverageChecks } = buildGreekSeries(storyData);
	const firstYear = yearly[0];
	const lastYear = yearly[yearly.length - 1];
	const latestGreek = greekSnapshots[greekSnapshots.length - 1];
	const latestSchools = buildLatestSchoolView(storyData, latestGreek?.snapshotDate);
	const stateMetrics = buildStateMetrics(storyData.top200, latestSchools);
	const admissionsRowsExpected =
		(storyData.meta.requested_admissions_end_year -
			storyData.meta.requested_admissions_start_year +
			1) * storyData.summary.top200_count;

	return {
		meta: {
			updated: storyData.meta.updated,
			admissionsLimitNote: storyData.meta.admissions_limit_note,
			greekLimitNote: storyData.meta.greek_limit_note,
			sources: storyData.meta.sources
		},
		scope: {
			top200Count: storyData.summary.top200_count,
			requestedAdmissionsStartYear: storyData.meta.requested_admissions_start_year,
			requestedAdmissionsEndYear: storyData.meta.requested_admissions_end_year,
			availableAdmissionsStartYear: storyData.meta.admissions_available_start_year,
			availableAdmissionsEndYear: storyData.meta.admissions_available_end_year,
			balancedSchoolCount: firstYear?.balancedSchoolCount ?? 0,
			latestGreekSnapshotDate: latestGreek?.snapshotDate ?? null
		},
		series: { yearly, greekSnapshots, latestSchools, stateMetrics },
		highlights: {
			totalGrowthMultiple:
				firstYear && lastYear && firstYear.applicantsBalanced > 0
					? lastYear.applicantsBalanced / firstYear.applicantsBalanced
					: 0,
			top50GrowthMultiple:
				firstYear && lastYear && firstYear.top50Applicants > 0
					? lastYear.top50Applicants / firstYear.top50Applicants
					: 0,
			restGrowthMultiple:
				firstYear && lastYear && firstYear.restApplicants > 0
					? lastYear.restApplicants / firstYear.restApplicants
					: 0,
			top50ShareFrom:
				firstYear && firstYear.applicantsBalanced > 0
					? firstYear.top50Applicants / firstYear.applicantsBalanced
					: 0,
			top50ShareTo:
				lastYear && lastYear.applicantsBalanced > 0
					? lastYear.top50Applicants / lastYear.applicantsBalanced
					: 0,
			admitRateFrom: firstYear?.admitRate ?? 0,
			admitRateTo: lastYear?.admitRate ?? 0,
			admitRatePandemicJump:
				yearly.some((p) => p.year === 2019) && yearly.some((p) => p.year === 2020)
					? (yearly.find((p) => p.year === 2020)?.admitRate ?? 0) -
						(yearly.find((p) => p.year === 2019)?.admitRate ?? 0)
					: null,
			latestGreekTop50: latestGreek?.top50GreekTotal ?? 0,
			latestGreekRest: latestGreek?.restGreekTotal ?? 0,
			latestGreekUsable: latestGreek?.usableSchools ?? 0,
			latestGreekMatched: latestGreek?.matchedSchools ?? 0,
			latestGreekTotal: latestGreek?.totalSchools ?? 0
		},
		checks: {
			admissionsRowsExpected,
			admissionsRowsActual: storyData.summary.admissions_rows,
			admissionsRowsAgree: admissionsRowsExpected === storyData.summary.admissions_rows,
			coverageChecks,
			coverageChecksAgree: coverageChecks.every((p) => p.matchesAgree),
			balancedPanelShareInLatestYear: lastYear?.balancedShareOfAll ?? 0
		}
	};
}

export const load: PageServerLoad = () => {
	const longitudinal = buildLongitudinalPayload(rawLongitudinal);
	return {
		scatter: scatterData,
		longitudinal
	};
};
