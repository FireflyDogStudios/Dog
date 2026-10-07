#!/usr/bin/env python3
"""Den team mail: members write to each other, and the mail lives in git. (Lever)

A message is one file, docs/team/mail/<YYYY-MM-DD>-<from>-to-<to>-<slug>.md, on the sender's own branch. Format (DEN-MSG v1 plus three headers):

    DEN-MSG v1
    To: Lever, Forge
    Cc: Firefly
    From: Palette
    Re: A style hook for the mail folder
    Type: request            (request | answer | fyi)
    Id: 2026-10-07-palette-to-lever-style-hook      (the file name without .md)
    Thread: 2026-10-07-palette-to-lever-style-hook  (the Id of the first message in the conversation)
    Date: 2026-10-07T23:10:00Z                      (when it was sent; orders a thread across branches)
    ---
    body

Commands (Python standard library plus git; run from anywhere inside the repo):
    mail.py send  --from NICK --to A,B [--cc C] --re "subject" [--type request] (--body-file F | --body TEXT) [--thread ID] [--no-push]
    mail.py check NICK [--no-fetch]        unread mail addressed or Cc'd to NICK, from every branch
    mail.py read  NICK (ID ... | --all)    mark read: appends to docs/team/mail/read/<nick>.txt on your branch, commits and pushes
    mail.py thread ID [--no-fetch]         a whole conversation in order, across branches
    mail.py all   [--since DATE] [--json] [--no-fetch]   everything (for Firefly's sync and GrumpyDingo's view)
Session ids come from the roster table in docs/claude/DEN-TEAM.md, never from this file. `send` prints one PING line per recipient:
the text to pass to send_message, if your session has it. Nobody has to: Firefly's sync relays new mail either way."""
import argparse, json, os, re, subprocess, sys
from datetime import datetime, timezone

MAIL_DIR = 'docs/team/mail'
READ_DIR = MAIL_DIR + '/read'
HEAD_KEYS = ('To', 'Cc', 'From', 'Re', 'Type', 'Id', 'Thread', 'Date')
TYPES = ('request', 'answer', 'fyi')


def git(*a, check=True, cwd=None):
    r = subprocess.run(['git', *a], capture_output=True, text=True, cwd=cwd)
    if check and r.returncode:
        sys.exit(f'git {" ".join(a)} failed: {r.stderr.strip()}')
    return r.stdout


def root():
    r = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True)
    if r.returncode:
        sys.exit('not inside a git repository')
    return r.stdout.strip()


def names(s):
    return [n.strip() for n in (s or '').split(',') if n.strip()]


def slug(s, n=48):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:n].strip('-') or 'mail'


def parse(text, branch=''):
    """Return a message dict, or None if the text is not DEN-MSG mail."""
    head, sep, body = text.replace('\r\n', '\n').partition('\n---\n')
    lines = head.split('\n')
    if not sep or not lines or not lines[0].strip().startswith('DEN-MSG'):
        return None
    h = {}
    for ln in lines[1:]:
        k, _, v = ln.partition(':')
        if k.strip() in HEAD_KEYS:
            h[k.strip()] = v.strip()
    if not h.get('Id') or not h.get('From'):
        return None
    return {'id': h['Id'], 'thread': h.get('Thread') or h['Id'], 'from': h['From'], 'to': names(h.get('To')), 'cc': names(h.get('Cc')),
            're': h.get('Re', ''), 'type': h.get('Type', 'request'), 'date': h.get('Date', ''), 'body': body.strip('\n'), 'branch': branch}


def refs():
    """Every ref that can hold mail: all remote branches plus the current HEAD (so unpushed local mail still shows)."""
    out = [r for r in git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/').split() if not r.endswith('/HEAD') and r != 'origin']
    return out + ['HEAD']


def load_all(fetch=True):
    if fetch:
        subprocess.run(['git', 'fetch', '-q', '--all', '--prune'], capture_output=True)
    seen, blobs = {}, {}
    for ref in refs():
        label = ref if ref != 'HEAD' else git('rev-parse', '--abbrev-ref', 'HEAD').strip()
        for ln in git('ls-tree', '-r', ref, '--', MAIL_DIR + '/', check=False).splitlines():
            meta, _, path = ln.partition('\t')
            sha = meta.split()[2]
            if not path.endswith('.md') or '/read/' in path:
                continue
            if sha not in blobs:
                blobs[sha] = parse(git('cat-file', 'blob', sha, check=False), label)
            m = blobs[sha]
            if not m:
                continue
            if m['id'] in seen:
                if label not in seen[m['id']]['branches']:
                    seen[m['id']]['branches'].append(label)
            else:
                seen[m['id']] = {**m, 'branches': [label]}
    msgs = list(seen.values())
    for m in msgs:
        m['branch'] = m['branches'][0]
    return sorted(msgs, key=lambda m: (m['date'], m['id']))


def roster():
    p = os.path.join(root(), 'docs/claude/DEN-TEAM.md')
    out = {}
    if os.path.exists(p):
        for ln in open(p, encoding='utf-8'):
            c = [x.strip() for x in ln.strip().strip('|').split('|')]
            if len(c) >= 4 and c[2].startswith('session_'):
                out[c[0].lower()] = {'nick': c[0], 'session': c[2], 'branch': c[3]}
    return out


def read_marks(nick):
    p = os.path.join(root(), READ_DIR, nick.lower() + '.txt')
    return set(x.strip() for x in open(p, encoding='utf-8')) if os.path.exists(p) else set()


def fmt(m, full=True):
    cc = f"  cc {', '.join(m['cc'])}" if m['cc'] else ''
    s = f"[{m['date'] or '?'}] {m['from']} -> {', '.join(m['to'])}{cc}\n  Re: {m['re']}   ({m['type']})   id {m['id']}   on {', '.join(m['branches'])}"
    return s + ('\n\n' + '\n'.join('  ' + ln for ln in m['body'].split('\n')) + '\n' if full else '')


def cmd_send(a):
    to, cc = names(a.to), names(a.cc)
    if not to:
        sys.exit('--to needs at least one name')
    if a.type not in TYPES:
        sys.exit('--type must be one of ' + ', '.join(TYPES))
    body = open(a.body_file, encoding='utf-8').read() if a.body_file else a.body
    if not body or not body.strip():
        sys.exit('give --body-file or --body, and it must not be empty')
    me = git('rev-parse', '--abbrev-ref', 'HEAD').strip()
    if me in ('HEAD', 'main', 'master'):
        sys.exit(f'refusing to send from "{me}": mail goes on your own branch')
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    base = f"{now[:10]}-{a.sender.lower()}-to-{'-'.join(n.lower() for n in to)[:40]}-{slug(a.re)}"
    mid, i = base, 2
    existing = {m['id'] for m in load_all(fetch=False)}
    while mid in existing or os.path.exists(os.path.join(root(), MAIL_DIR, mid + '.md')):
        mid, i = f'{base}-{i}', i + 1
    thread = a.thread or mid
    text = '\n'.join(['DEN-MSG v1', f"To: {', '.join(to)}", *([f"Cc: {', '.join(cc)}"] if cc else []), f'From: {a.sender}', f'Re: {a.re}',
                      f'Type: {a.type}', f'Id: {mid}', f'Thread: {thread}', f'Date: {now}', '---', body.strip('\n'), ''])
    path = os.path.join(root(), MAIL_DIR, mid + '.md')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(text)
    git('add', path)
    git('commit', '-q', '-m', f'{a.sender}: mail to {", ".join(to)}: {a.re}', '--', path)
    pushed = False
    if not a.no_push:
        r = subprocess.run(['git', 'push', '-q', '-u', 'origin', me], capture_output=True, text=True)
        pushed = r.returncode == 0
        if not pushed:
            print('WARNING: push failed, the mail is committed locally only:', r.stderr.strip(), file=sys.stderr)
    print(f'sent {mid}  (thread {thread}) on {me}' + ('' if pushed else ' [not pushed]'))
    ros = roster()
    for n in dict.fromkeys(to + cc):
        r = ros.get(n.lower())
        if r:
            print(f"PING {n} {r['session']} :: New team mail from {a.sender}: \"{a.re}\" (id {mid}). Run: python3 tools/team/mail.py check {n}")
        else:
            print(f'(no session id for {n} in the roster; Firefly\'s sync will relay it)')


def cmd_check(a):
    marks = read_marks(a.nick)
    n = a.nick.lower()
    mine = [m for m in load_all(not a.no_fetch) if m['from'].lower() != n and n in [x.lower() for x in m['to'] + m['cc']]]
    new = [m for m in mine if m['id'] not in marks]
    if not new:
        print(f'no unread mail for {a.nick} ({len(mine)} read)')
        return
    print(f'{len(new)} unread for {a.nick}:\n')
    for m in new:
        print(fmt(m))
    print(f'Mark read with: python3 tools/team/mail.py read {a.nick} --all')


def cmd_read(a):
    n = a.nick.lower()
    if a.all:
        ids = [m['id'] for m in load_all(fetch=False) if m['from'].lower() != n and n in [x.lower() for x in m['to'] + m['cc']]]
    else:
        ids = a.ids
    if not ids:
        sys.exit('give message ids or --all')
    marks = read_marks(n)
    add = [i for i in dict.fromkeys(ids) if i not in marks]
    if not add:
        print('nothing new to mark')
        return
    path = os.path.join(root(), READ_DIR, n + '.txt')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'a', encoding='utf-8') as f:
        f.write(''.join(i + '\n' for i in add))
    git('add', path)
    git('commit', '-q', '-m', f'{a.nick}: mark {len(add)} mail read', '--', path)
    me = git('rev-parse', '--abbrev-ref', 'HEAD').strip()
    if not a.no_push and subprocess.run(['git', 'push', '-q', '-u', 'origin', me], capture_output=True).returncode:
        print('WARNING: push failed; marks are committed locally only', file=sys.stderr)
    print(f'marked {len(add)} read')


def cmd_thread(a):
    msgs = [m for m in load_all(not a.no_fetch) if m['thread'] == a.id or m['id'] == a.id]
    if not msgs:
        sys.exit('no such thread: ' + a.id)
    print(f"Thread {msgs[0]['thread']}: {len(msgs)} message{'s' if len(msgs) > 1 else ''}\n")
    for m in msgs:
        print(fmt(m))


def cmd_all(a):
    msgs = [m for m in load_all(not a.no_fetch) if not a.since or m['date'][:10] >= a.since]
    if a.json:
        print(json.dumps(msgs, indent=1))
        return
    print(f'{len(msgs)} message{"s" if len(msgs) != 1 else ""}\n')
    for m in msgs:
        print(fmt(m, full=False))
        print()


def main(argv):
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('send'); s.add_argument('--from', dest='sender', required=True); s.add_argument('--to', required=True); s.add_argument('--cc', default='')
    s.add_argument('--re', required=True); s.add_argument('--type', default='request'); s.add_argument('--body-file'); s.add_argument('--body'); s.add_argument('--thread'); s.add_argument('--no-push', action='store_true')
    s.set_defaults(f=cmd_send)
    c = sub.add_parser('check'); c.add_argument('nick'); c.add_argument('--no-fetch', action='store_true'); c.set_defaults(f=cmd_check)
    r = sub.add_parser('read'); r.add_argument('nick'); r.add_argument('ids', nargs='*'); r.add_argument('--all', action='store_true'); r.add_argument('--no-push', action='store_true'); r.set_defaults(f=cmd_read)
    t = sub.add_parser('thread'); t.add_argument('id'); t.add_argument('--no-fetch', action='store_true'); t.set_defaults(f=cmd_thread)
    al = sub.add_parser('all'); al.add_argument('--since'); al.add_argument('--json', action='store_true'); al.add_argument('--no-fetch', action='store_true'); al.set_defaults(f=cmd_all)
    a = p.parse_args(argv)
    a.f(a)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
