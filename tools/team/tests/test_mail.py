"""Tests for tools/team/mail.py: send, check, read, thread across two fake branches in a temp repo. Run: python3 -m unittest discover tools/team/tests"""
import json, os, subprocess, sys, tempfile, time, unittest

MAIL = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mail.py')
ENV = {**os.environ, 'GIT_AUTHOR_NAME': 't', 'GIT_AUTHOR_EMAIL': 't@t', 'GIT_COMMITTER_NAME': 't', 'GIT_COMMITTER_EMAIL': 't@t'}
ROSTER = "| Nick | Session | Session id | Branch | Model |\n|---|---|---|---|---|\n| Alpha | A | session_aaa | claude/team-a | x |\n| Beta | B | session_bbb | claude/team-b | x |\n"


def sh(*a, cwd):
    r = subprocess.run(a, cwd=cwd, env=ENV, capture_output=True, text=True)
    assert r.returncode == 0, (a, r.stderr)
    return r.stdout


def mail(cwd, *a, ok=True):
    r = subprocess.run([sys.executable, MAIL, *a], cwd=cwd, env=ENV, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, (a, r.stdout, r.stderr)
    return r


class MailTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        t = self.tmp.name
        self.origin = os.path.join(t, 'origin.git')
        sh('git', 'init', '-q', '--bare', '-b', 'main', self.origin, cwd=t)
        seed = os.path.join(t, 'seed')
        sh('git', 'clone', '-q', self.origin, seed, cwd=t)
        os.makedirs(os.path.join(seed, 'docs/claude'))
        with open(os.path.join(seed, 'docs/claude/DEN-TEAM.md'), 'w') as f: f.write(ROSTER)
        sh('git', 'add', '.', cwd=seed); sh('git', 'commit', '-qm', 'seed', cwd=seed); sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=seed)
        self.a, self.b = os.path.join(t, 'a'), os.path.join(t, 'b')
        for d, br in ((self.a, 'claude/team-a'), (self.b, 'claude/team-b')):
            sh('git', 'clone', '-q', self.origin, d, cwd=t); sh('git', 'checkout', '-q', '-b', br, cwd=d)

    def tearDown(self):
        self.tmp.cleanup()

    def test_send_check_read_thread(self):
        r = mail(self.a, 'send', '--from', 'Alpha', '--to', 'Beta', '--cc', 'Firefly', '--re', 'Need a number', '--body', 'What is the jaw angle?')
        first = [ln for ln in r.stdout.splitlines() if ln.startswith('sent ')][0].split()[1]
        self.assertIn('PING Beta session_bbb', r.stdout)                    # session id came from the roster
        self.assertIn('no session id for Firefly', r.stdout)                # missing from the roster: named, not guessed
        # Beta sees it from its own branch, having never merged Alpha's
        c = mail(self.b, 'check', 'Beta')
        self.assertIn('1 unread for Beta', c.stdout); self.assertIn('What is the jaw angle?', c.stdout)
        self.assertIn('1 unread for Firefly', mail(self.b, 'check', 'Firefly').stdout)       # Cc counts
        self.assertIn('no unread mail for Alpha', mail(self.b, 'check', 'Alpha').stdout)   # the sender is not told about their own mail
        time.sleep(1.1)
        mail(self.b, 'send', '--from', 'Beta', '--to', 'Alpha', '--re', 'Re: Need a number', '--type', 'answer', '--body', '38 degrees.', '--thread', first)
        t = mail(self.a, 'thread', first).stdout                               # Alpha's branch has only its own mail until fetch; thread fetches
        self.assertIn('2 messages', t)
        self.assertLess(t.index('What is the jaw angle?'), t.index('38 degrees.'))
        self.assertIn('1 unread for Alpha', mail(self.a, 'check', 'Alpha').stdout)
        # read marks live on the reader's branch and survive
        mail(self.b, 'read', 'Beta', '--all')
        self.assertIn('no unread mail for Beta', mail(self.b, 'check', 'Beta').stdout)
        self.assertTrue(os.path.exists(os.path.join(self.b, 'docs/team/mail/read/beta.txt')))

    def test_all_json_since_and_dedupe(self):
        mail(self.a, 'send', '--from', 'Alpha', '--to', 'Beta', '--re', 'One', '--body', 'x')
        mail(self.a, 'send', '--from', 'Alpha', '--to', 'Beta', '--re', 'One', '--body', 'y')   # same day, same subject: ids must not collide
        data = json.loads(mail(self.b, 'all', '--json').stdout)
        self.assertEqual(len({m['id'] for m in data}), 2)
        self.assertEqual(json.loads(mail(self.b, 'all', '--json', '--since', '2999-01-01').stdout), [])
        sh('git', 'merge', '-q', 'origin/claude/team-a', cwd=self.b)                  # once merged, one message on two branches is still one message
        data = json.loads(mail(self.b, 'all', '--json').stdout)
        self.assertEqual(len(data), 2); self.assertEqual(len(data[0]['branches']), 2)

    def test_refuses_main_and_empty_body(self):
        sh('git', 'checkout', '-q', 'main', cwd=self.a)
        self.assertNotEqual(mail(self.a, 'send', '--from', 'Alpha', '--to', 'Beta', '--re', 'x', '--body', 'hi', ok=False).returncode, 0)
        sh('git', 'checkout', '-q', 'claude/team-a', cwd=self.a)
        self.assertNotEqual(mail(self.a, 'send', '--from', 'Alpha', '--to', 'Beta', '--re', 'x', '--body', '  ', ok=False).returncode, 0)


if __name__ == '__main__':
    unittest.main()
