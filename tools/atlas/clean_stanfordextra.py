"""Remove the [NaN, NaN, 0] placeholder keypoints from ref/research/fetched/02-outline-landmarks/data.json so the file is strict JSON.

The file's NOTE.md says joints that were not labelled are left out; 696 dogs in 110 breeds instead stored 7,777 of them as
[NaN, NaN, 0] (15,554 NaN tokens), which JavaScript's JSON.parse rejects and which poisons any average that includes them.
Only those entries are removed; every other value and the compact formatting are unchanged (approval: A-002 follow-up, Firefly's go
of 2026-10-07 for the NaN clean-up).

  python3 tools/atlas/clean_stanfordextra.py --check    report only, change nothing
  python3 tools/atlas/clean_stanfordextra.py            clean the file in place, then verify it"""
import json, sys, math
F = 'ref/research/fetched/02-outline-landmarks/data.json'

def strict_load(text):
    def bad(tok): raise ValueError(f'non-standard JSON constant {tok}')
    return json.loads(text, parse_constant=bad)

def main():
    text = open(F).read()
    try:
        strict_load(text); print('already strict JSON; nothing to do'); return 0
    except ValueError as e:
        print('not strict JSON:', e)
    d = json.loads(text)   # Python accepts NaN
    removed = dogs_hit = dogs = 0; per_name = {}
    for dogs_b in d.values():
        for e in dogs_b:
            dogs += 1
            bad = [k for k, v in e['kp'].items() if any(isinstance(x, float) and math.isnan(x) for x in v[:2])]
            assert all(e['kp'][k][2] == 0 for k in bad), 'a NaN keypoint with a non-zero visibility flag'
            for k in bad:
                del e['kp'][k]; per_name[k] = per_name.get(k, 0) + 1
            removed += len(bad); dogs_hit += bool(bad)
    print(f'{removed} placeholder keypoints in {dogs_hit} of {dogs} dogs; by name: ' + ', '.join(f'{k} {v}' for k, v in sorted(per_name.items(), key=lambda kv: -kv[1])[:8]) + ' ...')
    if '--check' in sys.argv: return 0
    out = json.dumps(d, separators=(',', ':'), ensure_ascii=False)
    strict_load(out)   # must now parse with the strict rule
    open(F, 'w').write(out)
    print('written; verified strict JSON,', len(out), 'bytes')
    return 0

if __name__ == '__main__': sys.exit(main())
