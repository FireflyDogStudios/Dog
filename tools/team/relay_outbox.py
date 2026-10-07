#!/usr/bin/env python3
"""Relay GrumpyDingo's queued or failed messages from the inbox page's Outbox. (Lever)

Why it exists: the page's own send can be refused (error code blocked_by_policy: an account policy blocks send_message for pages), so
messages wait in the store's `outbox/` collection. Firefly (or a Routine) delivers them with send_message and records that they were relayed.
This script never touches the network or the store: a Python script cannot reach the page's database. It reads documents an agent has
fetched with the ArtifactData tool, and writes the JSON the agent pastes back into ArtifactData.

  1. ArtifactData action=list collection=outbox url=<inbox page> out_dir=<dir>      (saves <dir>/outbox/<id>.json)
  2. python3 tools/team/relay_outbox.py plan <dir>/outbox                          prints, per message, who still needs it, their session ids
                                                                                    (from the roster in docs/claude/DEN-TEAM.md) and the exact text
  3. send_message to each session id with that text; note who it reached
  4. python3 tools/team/relay_outbox.py finish <dir>/outbox --delivered "<id>=Forge,Palette" --out <dir>/writes
                                                                                    writes <dir>/writes/*.json and prints the batch `writes` list
  5. ArtifactData action=batch writes=<that list>                                  moves delivered messages to sent/ ("delivered by Firefly") and
                                                                                    keeps the rest in the outbox with what is still undelivered
Input may be a directory of <id>.json files, one such file, or a JSON array. Each document is {id, version, data:{...}} or the bare fields."""
import argparse, json, os, sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mail  # noqa: E402  (roster parser)


def load(path):
    files = [os.path.join(path, f) for f in sorted(os.listdir(path)) if f.endswith('.json')] if os.path.isdir(path) else [path]
    raw = []
    for f in files:
        d = json.load(open(f, encoding='utf-8'))
        for x in (d if isinstance(d, list) else [d]):
            raw.append((x, os.path.splitext(os.path.basename(f))[0]))
    docs = []
    for x, stem in raw:
        data = x['data'] if isinstance(x.get('data'), dict) else x
        docs.append({'id': x.get('id') or stem, 'version': x.get('version'), 'data': data})
    return docs


def targets(o):
    return list(dict.fromkeys(list(o.get('to') or []) + list(o.get('cc') or [])))


def pending(o):
    done = {r['nick'] for r in (o.get('results') or []) if r.get('ok')}
    return [n for n in targets(o) if n not in done]


def relayable(docs):
    return [d for d in docs if d['data'].get('status') in ('queued', 'failed', None) and pending(d['data'])]


def cmd_plan(a):
    ros = mail.roster(a.roster)
    docs = relayable(load(a.path))
    if a.json:
        print(json.dumps([{'id': d['id'], 'version': d['version'], 're': d['data'].get('re'), 'text': d['data'].get('text'),
                           'send': [{'nick': n, 'session': (ros.get(n.lower()) or {}).get('session')} for n in pending(d['data'])]} for d in docs], indent=1))
        return
    if not docs:
        print('nothing to relay')
        return
    for d in docs:
        o = d['data']
        print(f"=== {d['id']} (version {d['version']}): {o.get('re')}   to {', '.join(o.get('to') or [])}" + (f"   cc {', '.join(o['cc'])}" if o.get('cc') else ''))
        for n in pending(o):
            r = ros.get(n.lower())
            print(f"    SEND to {n}: " + (r['session'] if r else 'NO SESSION ID IN THE ROSTER (cannot relay; tell GrumpyDingo)'))
        why = sorted({r.get('code') for r in (o.get('results') or []) if not r.get('ok') and r.get('code')})
        if why:
            print('    last failure: ' + ', '.join(why))
        print('    --- text to send ---')
        print('\n'.join('    ' + ln for ln in (o.get('text') or '(no text saved: rebuild from body)').split('\n')))
        print()


def cmd_finish(a):
    by = a.by
    delivered = {}
    for spec in a.delivered:
        i, _, names = spec.partition('=')
        delivered[i] = [n.strip() for n in names.split(',') if n.strip()]
    docs = {d['id']: d for d in load(a.path)}
    os.makedirs(a.out, exist_ok=True)
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    writes = []
    for i, nicks in delivered.items():
        if i not in docs:
            sys.exit(f'no outbox document with id {i}')
        d = docs[i]; o = d['data']
        if d['version'] is None:
            sys.exit(f'{i} has no version: fetch it with ArtifactData first so the write can be pinned')
        reasons = sorted({str(r.get('code')) for r in (o.get('results') or []) if not r.get('ok') and r.get('code')})
        note = f"delivered by {by}" + (f" (the page's send was {reasons[0]})" if reasons and not reasons[0].startswith(('relayed', 'delivered')) else '')
        results = [r for r in (o.get('results') or []) if r.get('ok')] + [{'nick': n, 'ok': True, 'code': note} for n in nicks if n in targets(o)]
        got = {r['nick'] for r in results}
        left = [n for n in targets(o) if n not in got]
        if left:
            data = {'status': 'failed', 'results': results + [{'nick': n, 'ok': False, 'code': 'not yet delivered'} for n in left]}
            f = os.path.join(a.out, f'{i}.outbox.json'); json.dump(data, open(f, 'w'), indent=1)
            writes.append({'op': 'update', 'collection': 'outbox', 'doc_id': i, 'file_path': os.path.abspath(f), 'if_version': d['version']})
        else:
            keep = {k: o.get(k) for k in ('to', 'cc', 're', 'type', 'body', 'thread', 'text') if o.get(k) is not None}
            data = {**keep, 'at': now, 'from': o.get('from') or 'GrumpyDingo', 'results': results, 'relayed_by': by}
            f = os.path.join(a.out, f'{i}.sent.json'); json.dump(data, open(f, 'w'), indent=1)
            writes.append({'op': 'set', 'collection': 'sent', 'doc_id': i, 'file_path': os.path.abspath(f)})
            writes.append({'op': 'delete', 'collection': 'outbox', 'doc_id': i, 'if_version': d['version']})
    wf = os.path.join(a.out, 'writes.json'); json.dump(writes, open(wf, 'w'), indent=1)
    print(f'wrote {wf}: {len(writes)} writes. ArtifactData action=batch writes=')
    print(json.dumps(writes))


def main(argv):
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0]); sub = p.add_subparsers(dest='cmd', required=True)
    pl = sub.add_parser('plan'); pl.add_argument('path'); pl.add_argument('--roster'); pl.add_argument('--json', action='store_true'); pl.set_defaults(f=cmd_plan)
    fi = sub.add_parser('finish'); fi.add_argument('path'); fi.add_argument('--delivered', action='append', default=[], required=True, help='<id>=Nick1,Nick2 (repeat per message)')
    fi.add_argument('--out', required=True); fi.add_argument('--by', default='Firefly'); fi.set_defaults(f=cmd_finish)
    a = p.parse_args(argv); a.f(a); return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
