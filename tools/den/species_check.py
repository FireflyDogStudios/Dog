#!/usr/bin/env python3
"""den species check <file.yaml> [...]: validate a species file and cross-check its numbers against the research tables.

   A species file (YAML) holds every number for one animal with its source, so nothing reaches the rig unsourced:
     id: wolf                      name: Gray wolf             base: hero2 (the drawing it is built from)
     research: {skeleton: gray_wolf, keypoints: wolf}          (row keys in ref/research/skeleton/derived_skeleton_ratios.csv and ref/research/keypoints/proportions.json)
     numbers:                      groups: ratios, bones, angles, gait, behaviour, size
       bones:
         tibia_over_femur: {value: 1.04, unit: ratio, source: "Law et al. 2025", confidence: A, check: "skeleton:crural"}
     traits: [...]                 things numbers cannot say (tail carriage, coat), for GrumpyDingo to judge
   Every number needs value, unit, source and confidence (A, B, C or EST, as in the research reports).
   `check` names a research figure to compare against: "skeleton:<column>" or "keypoints:<table>/<feature>" (tables: props, sheet_ratios, angles_standing).
   Checks: shape of the file, plausible ranges per unit, and agreement with the research (skeleton: within 15%; keypoints: inside the middle half, q1-q3, or within 15% of the median).
   Exit 1 on any error. Disagreements are errors unless the number carries `override: "<why>"`."""
import sys, json, csv, pathlib
from typing import Literal, Optional, Dict, List
import yaml
from pydantic import BaseModel, Field, ValidationError, field_validator
ROOT = pathlib.Path(__file__).resolve().parents[2]
SKEL = ROOT / 'ref/research/skeleton/derived_skeleton_ratios.csv'; KP = ROOT / 'ref/research/keypoints/proportions.json'
RANGES = {'ratio': (0.005, 6), 'deg': (0, 360), 'mm': (1, 3000), 'kg': (0.1, 200), 'Hz': (0.01, 20), 's': (0.01, 60), 'per_min': (0.1, 600), 'fraction': (0, 1), 'units': (0, 200), 'm/s': (0, 25)}

class Number(BaseModel):
    value: float
    unit: Literal['ratio', 'deg', 'mm', 'kg', 'Hz', 's', 'per_min', 'fraction', 'units', 'm/s']
    source: str = Field(min_length=3)
    confidence: Literal['A', 'B', 'C', 'EST']
    check: Optional[str] = None
    override: Optional[str] = None
    note: Optional[str] = None
    @field_validator('check')
    @classmethod
    def _check(cls, v):
        if v is not None and not (v.startswith('skeleton:') or v.startswith('keypoints:')): raise ValueError('check must start with "skeleton:" or "keypoints:"')
        return v

class Species(BaseModel):
    id: str = Field(pattern=r'^[a-z][a-z0-9_]*$')
    name: str
    base: str
    status: Literal['draft', 'approved'] = 'draft'
    research: Dict[str, str] = {}
    numbers: Dict[Literal['ratios', 'bones', 'angles', 'gait', 'behaviour', 'size'], Dict[str, Number]]
    traits: List[str] = []

def research_tables():
    skel = {r['key']: r for r in csv.DictReader(open(SKEL))} if SKEL.exists() else {}
    kp = json.load(open(KP))['awa_unitB'] if KP.exists() else {}
    return skel, kp

def check_file(path):
    errs, notes = [], []
    try: sp = Species(**yaml.safe_load(open(path)))
    except ValidationError as e: return [f'{path}: {x["loc"]}: {x["msg"]}' for x in e.errors()], []
    except Exception as e: return [f'{path}: cannot read: {e}'], []
    skel, kp = research_tables()
    for group, nums in sp.numbers.items():
        for key, n in nums.items():
            tag = f'{sp.id}.{group}.{key}'; lo, hi = RANGES[n.unit]
            if not lo <= n.value <= hi: errs.append(f'{tag} = {n.value} {n.unit} is outside the plausible range {lo}-{hi}')
            if not n.check: continue
            kind, ref = n.check.split(':', 1)
            if kind == 'skeleton':
                row = skel.get(sp.research.get('skeleton', ''))
                if not row or ref not in row or row[ref] in ('', None): errs.append(f'{tag}: no skeleton figure {ref!r} for {sp.research.get("skeleton")!r}'); continue
                r = float(row[ref]); ok = abs(n.value - r) <= .15 * abs(r); msg = f'{tag} = {n.value} vs skeleton {ref} {r:g} ({(n.value / r - 1) * 100:+.0f}%)'
            else:
                table, feat = ref.split('/', 1); rec = kp.get(sp.research.get('keypoints', ''), {}).get(table, {}).get(feat)
                if not rec: errs.append(f'{tag}: no keypoint figure {ref!r} for {sp.research.get("keypoints")!r}'); continue
                m, q1, q3 = rec['median'], rec.get('q1', rec['median']), rec.get('q3', rec['median'])
                ok = q1 <= n.value <= q3 or abs(n.value - m) <= .15 * abs(m); msg = f'{tag} = {n.value} vs keypoints {feat} median {m:g} (middle half {q1:g}-{q3:g}, n={rec.get("n")})'
            if ok: notes.append('agrees: ' + msg)
            elif n.override: notes.append(f'differs on purpose ({n.override}): ' + msg)
            else: errs.append('disagrees: ' + msg + '  (fix it, or add override: "<why>")')
    return errs, notes

def main(paths):
    if not paths: print(__doc__); return 2
    bad = 0
    for p in paths:
        errs, notes = check_file(p)
        print(f'{"FAIL" if errs else "ok  "} {p}'); [print('   - ' + e) for e in errs]; [print('     ' + x) for x in notes]; bad += bool(errs)
    return 1 if bad else 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
