"""Generate ref/research/CREDITS-RESEARCH.md: who to credit, and under what licence, for every photo, plate, scan, dataset and paper-derived table
stored under ref/. Re-run after any delivery:  python3 tools/atlas/credits.py   (add --check to audit only; exits 1 on a problem)

Parts: A photos and plates (from each catalogue.csv / candidates.csv, only files that exist), B 3D scans and skulls (from their LICENSE.txt
attribution lines), C datasets, models and code (curated here, each pointing at its licence file), D papers whose tables are stored (from the
Scout data.csv files, use = table/measured), E facts only (cited, nothing copied).
Audit: fails on a missing author/URL/licence, or on a photo licence containing NC, ND or SA."""
import csv, glob, os, re, sys, collections
OUT = 'ref/research/CREDITS-RESEARCH.md'
BAD = re.compile(r'(?<![A-Za-z])(NC|ND|SA)(?![A-Za-z])|non-?commercial|share-?alike|no ?deriv', re.I)
problems = []

def catalogues():
    for f in sorted(glob.glob('ref/research/photos/**/catalogue.csv', recursive=True)): yield f, 'photo'
    yield 'ref/research/scout/01-body-templates/candidates.csv', 'template'

def find_file(d, fn):
    fn = fn.strip()
    if not fn: return None
    hits = [os.path.join(d, fn), os.path.join(d, os.path.basename(fn))] + glob.glob(os.path.join(d, '*', os.path.basename(fn)))
    return next((h for h in hits if os.path.isfile(h)), None)

def part_a():
    groups = collections.OrderedDict(); n = 0; skipped = 0
    for f, kind in catalogues():
        d = os.path.dirname(f)
        label = os.path.relpath(d, 'ref/research').replace('photos/', '').replace('scout/01-body-templates', 'templates (Scout 01)')
        for r in csv.DictReader(open(f, encoding='utf-8')):
            path = find_file(d, r['file'])
            if not path: skipped += 1; continue
            a, u, l = (r.get('author') or '').strip(), (r.get('url') or '').strip(), (r.get('licence') or '').strip()
            if not (a and u and l): problems.append(f'{path}: missing author, url or licence')
            if BAD.search(l): problems.append(f'{path}: licence "{l}" is not allowed')
            groups.setdefault(label, []).append((os.path.basename(path), a, l, u)); n += 1
    return groups, n, skipped

def part_b():
    out = []
    for f in sorted(glob.glob('ref/research/scout/11-body-models/*/LICENSE.txt')):
        t = open(f, encoding='utf-8').read()
        m = re.search(r'Attribution line to use:\s*\n\s*(.+)', t)
        if not m: problems.append(f'{f}: no "Attribution line to use"'); continue
        out.append((os.path.dirname(f), m.group(1).strip()))
    return out

CURATED = [  # (what, where, licence, credit line / notes); each licence file exists (checked below)
 ('Stark dog musculoskeletal model, meshes, muscles, forelimb gait', 'ref/research/fetched/03-dog-model/ (`stark_*`), ref/research/scout/10-stark-meshes/', 'MIT', 'Copyright (c) 2021, FSU Jena, Heiko Stark. Stark H, Fischer MS, Hunt A, Young F, Quinn R, Andrada E (2021) Sci Rep 11:11335, doi:10.1038/s41598-021-90058-0. Keep the MIT notice with any copy.', 'ref/research/scout/10-stark-meshes/LICENSE-stark.txt'),
 ('Greyhound hindlimb model', 'ref/research/fetched/03-dog-model/greyhound_*', 'CC BY 4.0', 'Ellis RG, Rankin JW, Hutchinson JR (2018) Front Bioeng Biotechnol 6:162, doi:10.3389/fbioe.2018.00162; model: figshare doi:10.6084/m9.figshare.7240538.v2.', 'ref/research/fetched/03-dog-model/LICENSE.txt'),
 ('StanfordExtra v12 keypoints and outlines (coordinates only; Stanford Dogs images not included)', 'ref/research/fetched/02-outline-landmarks/, ref/research/keypoints/', 'MIT', 'Biggs B, Boyne O, Charles J, Fitzgibbon A, Cipolla R (2020) Who left the dogs out? ECCV. Keep the MIT notice.', 'ref/research/fetched/02-outline-landmarks/LICENSE.txt'),
 ('AP-10K (dog, wolf, fox poses; coordinates only)', 'ref/research/fetched/08-wild-keypoints/', 'CC BY 4.0', 'Yu H, Xu Y, Zhang J, Zhao W, Guan Z, Tao D (2021) AP-10K, NeurIPS Datasets and Benchmarks.', 'ref/research/fetched/08-wild-keypoints/LICENSE-AP10K.txt'),
 ('APT-36K (dog, wolf, fox video poses; coordinates only)', 'ref/research/fetched/08-wild-keypoints/', 'MIT per its README (no LICENSE file in its repository; see the audit notes)', 'Yang Y, Yang J, Xu Y, Zhang J, Lan L, Tao D (2022) APT-36K, NeurIPS Datasets and Benchmarks.', 'ref/research/fetched/08-wild-keypoints/NOTE.md'),
 ('AwA-Pose canid keypoints', 'ref/awa-pose/', 'MIT', 'Copyright (c) 2021 Prianka Banik. Keep the MIT notice.', 'ref/awa-pose/LICENSE.txt'),
 ('BADJA dog sequences', 'ref/research/keypoints/badja_dogs.json', 'MIT', 'Biggs B, Roddick T, Fitzgibbon A, Cipolla R (2018) Creatures great and SMAL; copyright (c) 2024 Benjamin Biggs. Keep the MIT notice.', 'ref/research/keypoints/LICENSE-BADJA.txt'),
 ('Two grey wolf skulls (3D) and their mandibles', 'ref/research/missingfound/wolf-skull/', 'CC BY 4.0', 'Mammal Research Institute, Polish Academy of Sciences (2020) Canis lupus - 170753, doi:10.48370/OFD/LVT9AC; (2022) Canis lupus - 170555, doi:10.48370/OFD/LNRMXW. Open Forest Data. Changes are listed in the licence file.', 'ref/research/missingfound/wolf-skull/LICENSE.txt'),
 ('Gait curves (joint angles through the stride)', 'ref/research/fetched/04-gait-curves/', 'CC BY 4.0 (Goldner 2018 data CC0)', 'Catavitello 2015; Humphries 2020; Fischer 2018; Miao 2026; Goldner 2018; Charles 2025 supplement. Full citations with DOIs are in the licence file. Changes made: angles recomputed, resampled and averaged.', 'ref/research/fetched/04-gait-curves/LICENSE.txt'),
 ('Limb indices of 150 carnivores', 'ref/research/fetched/06-limb-indices/', 'CC0 1.0', 'Samuels JX, Meachen JA, Sakai SA (2013) J Morphol 274:121-146, doi:10.1002/jmor.20077; Dryad doi:10.5061/dryad.77tm4. Credit is not required; it is good practice.', 'ref/research/fetched/06-limb-indices/NOTE.md'),
 ('Ellenberger and Baum dog anatomy plates (Tafel 1, 2, 3) and measurements taken from them', 'ref/research/missingfound/atlas-plates/, ref/research/scout/08-tafel2-muscles/, ref/research/fetched/01-skin-offsets/', 'Public domain (no known copyright)', 'Ellenberger W, Baum H, Dittrich H, Muench; Handbuch der Anatomie der Tiere fuer Kuenstler: Anatomie des Hundes, 1st ed., Leipzig (ca. 1911-25); scans: University of Wisconsin Digital Collections. A thank-you is suitable.', 'ref/research/scout/08-tafel2-muscles/NOTE.md'),
 ('Muybridge dog plates 704-710', 'ref/research/fetched/05-muybridge/', 'Public domain (1887)', 'Eadweard Muybridge, Animal Locomotion (1887); scans via Boston Public Library and USC Digital Library on Wikimedia Commons.', 'ref/research/fetched/05-muybridge/NOTE.md'),
 ('US government references (Mech 1974, USFWS photos); Mivart 1890 and Murie 1944 plates', 'ref/research/scout/09-us-gov-references/', 'Public domain (US government work; pre-1931 works)', 'See sources.csv in that folder for the evidence per item.', 'ref/research/scout/09-us-gov-references/sources.csv'),
 ('OpenCat robot gait tables (reference only)', 'ref/opencat/', 'MIT', 'Copyright (c) 2022 Rongzhong Li. Keep the MIT notice.', 'ref/opencat/LICENSE'),
 ('SVG design skill and character-animator references', 'ref/svg-design-skill/, ref/svg-character-animator-references/', 'MIT', 'Copyright (c) 2026 OpenData (design skill); copyright (c) 2026 molauu (animator references). Keep the notices.', 'ref/svg-design-skill/LICENSE.md'),
]

def read_csv(p):
    return list(csv.DictReader(open(p, encoding='utf-8', errors='replace')))

def part_d_e():
    tables, facts, dropped = collections.OrderedDict(), collections.OrderedDict(), []
    for p in sorted(glob.glob('ref/research/scout/*/data.csv')):
        rows = read_csv(p)
        if not rows: continue
        keys = {k.lower(): k for k in rows[0]}
        if not {'source', 'licence', 'use'} <= set(keys): continue
        folder = p.split('scout/')[1].split('/')[0]
        for r in rows:
            src = re.sub(r'\s+', ' ', r[keys['source']]).strip(); lic = re.sub(r'\s+', ' ', r[keys['licence']]).strip(); use = r[keys['use']].strip().lower()
            doi = (r.get('doi') or r.get('DOI') or '').strip(); url = (r.get('URL') or r.get('url') or '').strip()
            if not src or use in ('gap', ''): continue
            is_table = use in ('table', 'measured')
            if is_table:
                ident = (doi or url).lower().rstrip('/')
                if not ident: dropped.append(src[:70]); continue   # no DOI or link: cannot be credited; covered by part C or a photo catalogue
                k = (ident, '')   # one entry per DOI/link; the first source text and licence win
            else:
                k = (src[:160], lic[:60])
            bucket = tables if is_table else facts
            e = bucket.setdefault(k, {'src': src, 'lic': lic, 'folders': set(), 'doi': doi, 'url': url})
            e['folders'].add(folder); e['doi'] = e['doi'] or doi; e['url'] = e['url'] or url
    return tables, facts, dropped

def md_link(u): return f'<{u}>' if u.startswith('http') else u

def main():
    check = '--check' in sys.argv
    groups, n, skipped = part_a(); b = part_b(); tables, facts, dropped = part_d_e()
    for what, where, lic, credit, lf in CURATED:
        if not os.path.exists(lf): problems.append(f'curated entry "{what}": licence file {lf} not found')
    L = ['# Research credits', '',
         'Who to credit, and under what licence, for everything stored under `ref/`. **Generated** by `tools/atlas/credits.py` from the catalogues, licence files and data tables; do not edit by hand, re-run the script. Kept by Atlas.', '',
         'Rules: stored items are public domain, CC0, CC BY, MIT, BSD or Apache only (`docs/claude/DEN-TEAM.md`, house rules). **CC BY and MIT items must be credited wherever the item, or something made from it, ships.** '
         'Part E lists facts taken from papers under other licences: cited, never copied.', '',
         f'Counts: {n} photos and plates ({skipped} catalogue rows skipped because their file is not in the repo), {len(b)} 3D scans, {len(CURATED)} datasets and models, {len(tables)} paper tables, {len(facts)} cited-fact sources.', '']
    L += ['## A. Photos and plates', '', 'Attribution lines: "<title or file>" by <author>, <licence>, <link>. Each row is one stored file; the link is the source page.', '']
    for label, rows in groups.items():
        L += [f'### {label} ({len(rows)})', '', '| File | Author | Licence | Source |', '|---|---|---|---|']
        L += [f'| `{f}` | {a} | {l} | {md_link(u)} |' for f, a, l, u in rows] + ['']
    L += ['## B. 3D scans and models (reference use)', '']
    L += [f'- {line}  \n  _Licence file: `{d}/LICENSE.txt`_' for d, line in b] + ['']
    L += ['## C. Datasets, models and code', '', '| What | Where | Licence | Credit | Licence file |', '|---|---|---|---|---|']
    L += [f'| {w} | {wh} | {l} | {c} | `{lf}` |' for w, wh, l, c, lf in CURATED] + ['']
    L += ['## D. Papers whose tables or measurements are stored', '', 'Licence as recorded by Scout in each `data.csv`. Credit these where the numbers ship.', '', '| Source | Licence | DOI or link | Folder |', '|---|---|---|---|']
    for e in tables.values():
        L.append(f"| {e['src'].replace('|', '/')} | {e['lic'].replace('|', '/')} | {e['doi'] or md_link(e['url'])} | {', '.join(sorted(e['folders']))} |")
    L += ['', f'{len(dropped)} table rows had no DOI or link (Scout estimates, notes such as "this folder", repeats of a photo credited in part A) and are left out here; their sources are in part A or C, or in the folder\'s own data.csv.']
    L += ['', '## E. Facts only (cited, nothing copied)', '', 'Single numbers or findings from papers and sources under closed, non-commercial or no-derivatives terms. They need a citation, not a licence, but have a lawyer look before a public release.', '',
          '| Source | Licence as recorded | DOI or link | Folder |', '|---|---|---|---|']
    for e in facts.values():
        L.append(f"| {e['src'].replace('|', '/')} | {e['lic'].replace('|', '/')} | {e['doi'] or md_link(e['url'])} | {', '.join(sorted(e['folders']))} |")
    L.append('')
    if problems:
        print('PROBLEMS:'); [print('  ', p) for p in problems]
    else: print('audit clean')
    if not check:
        open(OUT, 'w', encoding='utf-8').write('\n'.join(L)); print(f'wrote {OUT}: {len(L)} lines')
    return 1 if problems else 0

if __name__ == '__main__': sys.exit(main())
