#!/usr/bin/env python3
"""Firefly's team inbox: what the role sessions have left for the lead that the lead hasn't merged yet.

   Fetches every remote branch except the lead's own, then for each branch lists the files under docs/team/inbox/ and docs/team/status/
   that differ from the lead's current tree, printing each note in full (they are short by rule) and each status file.
   Reads git only: no network beyond `git fetch`, no session tools. Usage: python3 tools/team/inbox.py [--no-fetch]"""
import subprocess, sys

def git(*a):
    return subprocess.run(['git', *a], capture_output=True, text=True).stdout

def main(args):
    if '--no-fetch' not in args:
        subprocess.run(['git', 'fetch', '-q', '--all', '--prune'], capture_output=True)
    me = git('rev-parse', '--abbrev-ref', 'HEAD').strip()
    branches = [b.strip() for b in git('branch', '-r', '--format=%(refname:short)').splitlines()
                if b.strip() and not b.strip().endswith(('/HEAD', '/' + me, '/main')) and b.strip() != 'origin']
    found = 0
    for b in branches:
        ahead = int(git('rev-list', '--count', f'HEAD..{b}').strip() or 0)
        if not ahead: continue                                                     # fully merged: nothing new on it
        files = [f for f in git('diff', '--name-only', f'HEAD...{b}', '--', 'docs/team/').splitlines() if f.strip()]
        last = git('log', '-1', '--format=%cr: %s', b).strip()
        print(f'=== {b}  ({ahead} unmerged commits; last {last})')
        if not files: print('    (no note or status file: read its commits or its session summary)'); found += 1
        for f in sorted(files, key=lambda x: (not x.startswith('docs/team/status/'), x)):
            body = git('show', f'{b}:{f}')
            if not body: print(f'--- {f} (deleted on that branch)'); continue
            print(f'--- {f}'); print(body.rstrip()); print()
            found += 1
    if not found: print('inbox empty: nothing new from the team (merged branches drop out automatically)')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
