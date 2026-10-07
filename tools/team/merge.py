#!/usr/bin/env python3
"""Merge a member's branch into the lead branch, resolving docs/log/LOG.md conflicts by keeping every line (theirs first, then ours).
Any other conflict stops the merge for a hand review.

  python3 tools/team/merge.py <branch> "<merge message>"     e.g. merge.py claude/team-lever "Merge Lever: mail.py post"
"""
import re, subprocess, sys

def run(*a, check=True):
    return subprocess.run(a, capture_output=True, text=True, check=check)

def main(branch, msg):
    run('git', 'fetch', '-q', 'origin', branch)
    r = run('git', 'merge', '--no-ff', '-q', '-m', msg, f'origin/{branch}', check=False)
    if r.returncode == 0:
        print('merged:', branch); return 0
    bad = [f for f in run('git', 'diff', '--name-only', '--diff-filter=U').stdout.split() if f]
    if bad != ['docs/log/LOG.md']:
        print('conflicts need a hand review:', bad); return 1
    p = 'docs/log/LOG.md'; s = open(p).read()
    s = re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', lambda m: m.group(2) + m.group(1), s, flags=re.S)
    open(p, 'w').write(s); run('git', 'add', p); run('git', 'commit', '-q', '--no-edit')
    print('merged (LOG.md lines kept from both sides):', branch); return 0

if __name__ == '__main__':
    if len(sys.argv) != 3: print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1], sys.argv[2]))
