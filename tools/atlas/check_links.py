"""Check that markdown links and backtick-quoted paths in Atlas's docs point at real files.
Run from the repo root: python3 tools/atlas/check_links.py [files...]
Shorthand used in docs/research-package is expanded (fetched/ -> ref/research/fetched/, etc.)."""
import os, re, sys, glob
DOCS = sys.argv[1:] or ['docs/README.md', *sorted(f for f in glob.glob('docs/research-package/*.md') if not f.endswith('file-index.md')), *sorted(glob.glob('docs/log/*.md')),
                        'docs/claude/DEN-SCOUT-REQUEST-DISCS-2026-10-07.md', 'docs/claude/DEN-DRAFT-law-licence-question-2026-10-07.md', *sorted(glob.glob('docs/team/inbox/*atlas*.md')), 'docs/team/status/atlas.md']
SHORT = {'fetched/': 'ref/research/fetched/', 'missingfound/': 'ref/research/missingfound/',
         'scout/': 'ref/research/scout/', 'keypoints/': 'ref/research/keypoints/'}
# Named on purpose as not existing yet, or not in the repo (Drive, /tmp, branch names, field names).
EXPECTED_MISSING = {'ref/research/scout/19-dog-generators/', 'docs/team/atlas/2026-10-08-generator-licences.md', 'scout/19-dog-generators', 'ref/research/scout/13-disc-share/', 'ocr/', 'ocr/schema.json'}
SKIP = re.compile(r'^(species/build/meshes/|chrisjlaw/|data/data.csv|FireflyDogStudios/|claude/|/tmp/|den-ledger-everything|ref/dog/|cervical/)')
# Only tokens with a slash are checked; bare file names are written in the context of their folder.
PATHLIKE = re.compile(r'^\.{0,2}/?[\w.\-]+(/[\w.\-*{},]+)+/?$')
def candidates(p, doc):
    p = p.split('#')[0].split(':')[0].rstrip('/') + ('/' if p.split('#')[0].endswith('/') else '')
    yield os.path.normpath(os.path.join(os.path.dirname(doc), p)) + ('/' if p.endswith('/') else '')
    for k, v in SHORT.items():
        if p.startswith(k): yield v + p[len(k):]
    yield p
    for root in ('ref/research/', 'docs/', 'docs/claude/', 'species/', 'tools/den/'): yield root + p
def exists(p):
    p = p.rstrip('/')
    if any(c in p for c in '*{'):  # globs and brace sets: check the fixed prefix
        p = re.split(r'[*{]', p)[0].rstrip('/_') or '.'
        return bool(glob.glob(p + '*'))
    return os.path.exists(p) or bool(glob.glob(p + '-*'))  # 'fetched/04' names the folder 'fetched/04-gait-curves'
bad = 0
for doc in DOCS:
    text = open(doc).read()
    links = [m for m in re.findall(r'\]\(([^)\s]+)\)', text) if not m.startswith(('http', '#', 'mailto'))]
    ticks = [t for t in re.findall(r'`([^`\s]+)`', text) if PATHLIKE.match(t) and not SKIP.match(t)]
    for p in links + ticks:
        p = p.replace('%20', ' ')
        cs = list(candidates(p, doc))
        if any(c in EXPECTED_MISSING or (c.rstrip('/') + '/') in EXPECTED_MISSING for c in cs): continue
        if not any(exists(c) for c in cs):
            bad += 1; print(f'{doc}: missing -> {p}')
print('OK' if not bad else f'{bad} unresolved')
sys.exit(1 if bad else 0)
