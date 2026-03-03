"""
us_top200_universities_pipeline.py
-----------------------------------------------------------------
Build a top-200 US university panel using official IPEDS endpoints
(through educationdata.urban.org) and enrich with current Greek-life
rates from College Transitions Dataverse.

Output files:
  - data/us-top200-universities-2001-2022.csv
  - data/us-top200-universities-2001-2022.json

Run from project root:
  python3 notebooks/us_top200_universities_pipeline.py

Notes:
  - IPEDS admissions-enrollment coverage in this API: 2001-2022.
  - Greek-life table is a current snapshot (2024-25 CDS, with some
    fallback rows to older CDS years) and is NOT a full yearly history.
-----------------------------------------------------------------
"""

from __future__ import annotations

import csv
import html
import json
import re
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).parent.parent
OUT_CSV = ROOT / 'data' / 'us-top200-universities-2001-2022.csv'
OUT_JSON = ROOT / 'data' / 'us-top200-universities-2001-2022.json'

IPEDS_BASE = 'https://educationdata.urban.org/api/v1/college-university/ipeds'
GREEK_URL = 'https://www.collegetransitions.com/dataverse/greek-life'

YEARS = list(range(2001, 2023))
TOP_N = 200
USER_AGENT = 'Mozilla/5.0 (pointzerofive data pipeline)'

US_50_DC = {
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC',
}


@dataclass
class GreekSnapshot:
    unitid: int
    institution: str
    fraternities_yes_no: str
    sororities_yes_no: str
    pct_fraternity: float | None
    pct_sorority: float | None
    fraternity_raw: str
    sorority_raw: str


def fetch_json(url: str, retries: int = 4) -> dict[str, Any]:
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=240) as resp:
                return json.load(resp)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            if attempt == retries - 1:
                raise
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f'Failed to fetch JSON: {url}')


def fetch_text(url: str, retries: int = 4) -> str:
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=240) as resp:
                return resp.read().decode('utf-8', 'ignore')
        except (urllib.error.URLError, TimeoutError):
            if attempt == retries - 1:
                raise
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f'Failed to fetch text: {url}')


def fetch_ipeds(endpoint: str, year: int) -> list[dict[str, Any]]:
    url = f'{IPEDS_BASE}/{endpoint}/{year}/?per_page=20000'
    payload = fetch_json(url)
    return payload['results']


def clean_cell(raw: str) -> str:
    no_tags = re.sub(r'<[^>]+>', '', raw)
    collapsed = re.sub(r'\s+', ' ', html.unescape(no_tags)).strip()
    return collapsed


def parse_percent(raw: str) -> float | None:
    value = raw.strip()
    if value in {'', '-', 'Not Reported', 'N/A'}:
        return None
    if value.endswith('%'):
        value = value[:-1]
    try:
        return float(value)
    except ValueError:
        return None


def parse_greek_table(html_text: str) -> dict[int, GreekSnapshot]:
    tbody_match = re.search(r'<tbody>(.*?)</tbody>', html_text, flags=re.IGNORECASE | re.DOTALL)
    if not tbody_match:
        raise RuntimeError('Could not find <tbody> in Greek-life page.')

    tbody = tbody_match.group(1)
    row_html_list = re.findall(r'<tr[^>]*>(.*?)</tr>', tbody, flags=re.IGNORECASE | re.DOTALL)

    snapshots: dict[int, GreekSnapshot] = {}
    for row_html in row_html_list:
        cells = [clean_cell(c) for c in re.findall(r'<td[^>]*>(.*?)</td>', row_html, flags=re.IGNORECASE | re.DOTALL)]
        if len(cells) < 7:
            continue

        unitid_raw, institution, _tag, frat_yes_no, soro_yes_no, frat_raw, soro_raw = cells[:7]
        if not unitid_raw.isdigit():
            continue

        unitid = int(unitid_raw)
        snapshots[unitid] = GreekSnapshot(
            unitid=unitid,
            institution=institution,
            fraternities_yes_no=frat_yes_no,
            sororities_yes_no=soro_yes_no,
            pct_fraternity=parse_percent(frat_raw),
            pct_sorority=parse_percent(soro_raw),
            fraternity_raw=frat_raw,
            sorority_raw=soro_raw,
        )

    return snapshots


def is_top200_candidate(directory_row: dict[str, Any]) -> bool:
    return (
        directory_row.get('institution_level') == 4
        and directory_row.get('state_abbr') in US_50_DC
        and directory_row.get('currently_active_ipeds') == 1
    )


def select_top200(
    admissions_2022: list[dict[str, Any]],
    directory_2022: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    dir_by_unitid = {row['unitid']: row for row in directory_2022}

    candidates: list[dict[str, Any]] = []
    for row in admissions_2022:
        if row.get('sex') != 99:
            continue
        applicants = row.get('number_applied')
        if applicants is None:
            continue

        unitid = row['unitid']
        drow = dir_by_unitid.get(unitid)
        if not drow or not is_top200_candidate(drow):
            continue

        candidates.append(
            {
                'unitid': unitid,
                'institution_name': drow['inst_name'],
                'state_abbr': drow['state_abbr'],
                'inst_control': drow.get('inst_control'),
                'sector': drow.get('sector'),
                'institution_level': drow.get('institution_level'),
                'offering_highest_degree': drow.get('offering_highest_degree'),
                'applicants_2022': applicants,
            }
        )

    candidates.sort(key=lambda x: x['applicants_2022'], reverse=True)

    for i, school in enumerate(candidates[:TOP_N], start=1):
        school['rank_2022_by_applicants'] = i

    return candidates[:TOP_N]


def safe_ratio(numer: int | None, denom: int | None) -> float | None:
    if numer is None or denom is None or denom == 0:
        return None
    return round(numer / denom, 6)


def build_panel_rows(
    top200: list[dict[str, Any]],
    admissions_by_year: dict[int, list[dict[str, Any]]],
    greek_snapshots: dict[int, GreekSnapshot],
) -> list[dict[str, Any]]:
    panel: list[dict[str, Any]] = []

    top200_by_unitid = {row['unitid']: row for row in top200}

    for year in YEARS:
        yearly = admissions_by_year[year]
        totals = {
            row['unitid']: row
            for row in yearly
            if row.get('sex') == 99
        }

        for unitid, school in top200_by_unitid.items():
            adm = totals.get(unitid)
            greek = greek_snapshots.get(unitid)

            applicants = adm.get('number_applied') if adm else None
            admitted = adm.get('number_admitted') if adm else None
            enrolled_total = adm.get('number_enrolled_total') if adm else None

            panel.append(
                {
                    'year': year,
                    'unitid': unitid,
                    'institution_name': school['institution_name'],
                    'state_abbr': school['state_abbr'],
                    'rank_2022_by_applicants': school['rank_2022_by_applicants'],
                    'applicants': applicants,
                    'admitted': admitted,
                    'enrolled_total': enrolled_total,
                    'admit_rate': safe_ratio(admitted, applicants),
                    'yield_rate': safe_ratio(enrolled_total, admitted),
                    'greek_fraternities_yes_no': greek.fraternities_yes_no if greek else None,
                    'greek_sororities_yes_no': greek.sororities_yes_no if greek else None,
                    'greek_pct_fraternity_current': greek.pct_fraternity if greek else None,
                    'greek_pct_sorority_current': greek.pct_sorority if greek else None,
                    'greek_fraternity_raw_current': greek.fraternity_raw if greek else None,
                    'greek_sorority_raw_current': greek.sorority_raw if greek else None,
                }
            )

    return panel


def write_csv(rows: list[dict[str, Any]], path: Path) -> None:
    if not rows:
        raise RuntimeError('No rows to write.')

    fieldnames = list(rows[0].keys())
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    print('Fetching IPEDS directory 2022...')
    directory_2022 = fetch_ipeds('directory', 2022)

    print('Fetching IPEDS admissions 2022 for top-200 selection...')
    admissions_2022 = fetch_ipeds('admissions-enrollment', 2022)

    print('Selecting top 200 by 2022 applicants...')
    top200 = select_top200(admissions_2022, directory_2022)
    top200_unitids = {row['unitid'] for row in top200}

    print('Fetching annual admissions panel (2001-2022)...')
    admissions_by_year: dict[int, list[dict[str, Any]]] = {}
    for year in YEARS:
        print(f'  - {year}')
        admissions_by_year[year] = fetch_ipeds('admissions-enrollment', year)

    print('Fetching and parsing Greek-life snapshot table...')
    greek_html = fetch_text(GREEK_URL)
    greek_snapshots = parse_greek_table(greek_html)

    panel_rows = build_panel_rows(top200, admissions_by_year, greek_snapshots)

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    write_csv(panel_rows, OUT_CSV)

    greek_coverage = sum(1 for unitid in top200_unitids if unitid in greek_snapshots)

    out_json = {
        '_comment': 'Generated by notebooks/us_top200_universities_pipeline.py - do not edit manually.',
        'meta': {
            'title': 'Top 200 US Universities - Applicants Time Series + Greek Snapshot',
            'updated': str(date.today()),
            'sources': [
                {
                    'name': 'Urban Institute Education Data API (IPEDS)',
                    'url': 'https://educationdata.urban.org/api/v1/api-endpoints/?mode=R',
                    'endpoints_used': [
                        '/api/v1/college-university/ipeds/directory/{year}/',
                        '/api/v1/college-university/ipeds/admissions-enrollment/{year}/',
                    ],
                },
                {
                    'name': 'College Transitions Dataverse - Greek Life',
                    'url': GREEK_URL,
                    'note': 'Table states 2024-25 CDS as primary source with some fallback rows to older CDS years.',
                },
            ],
            'top200_definition': 'Top 200 institutions by number_applied in 2022 (IPEDS admissions-enrollment, sex=99 total), filtered to institution_level=4, currently_active_ipeds=1, and US 50 states + DC.',
            'year_coverage_applicants': {'start': min(YEARS), 'end': max(YEARS)},
            'year_coverage_requested': {'start': 2000, 'end': max(YEARS)},
            'coverage_note': 'IPEDS admissions-enrollment endpoint in this API starts at 2001 (no 2000 rows).',
            'greek_note': 'Greek columns are current snapshot values, repeated across years in panel rows for convenience.',
        },
        'summary': {
            'institutions_top200': len(top200),
            'panel_rows': len(panel_rows),
            'panel_years': len(YEARS),
            'greek_snapshot_rows_total': len(greek_snapshots),
            'greek_snapshot_matches_top200': greek_coverage,
        },
        'top200': top200,
        'panel': panel_rows,
    }

    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(out_json, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'Written -> {OUT_CSV}')
    print(f'Written -> {OUT_JSON}')
    print(f"Top 200 schools: {len(top200)}")
    print(f"Panel rows: {len(panel_rows)}")
    print(f"Greek snapshot matches: {greek_coverage}/{len(top200)}")


if __name__ == '__main__':
    main()
