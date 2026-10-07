"""Tests for tools/team/relay_outbox.py. Run: python3 -m unittest discover tools/team/tests"""
import json, os, subprocess, sys, tempfile, unittest

RELAY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'relay_outbox.py')
ROSTER = "| Nick | Session | Session id | Branch | Model |\n|---|---|---|---|---|\n| Forge | F | session_forge | b | x |\n| Palette | P | session_pal | b | x |\n"
BLOCKED = [{'nick': 'Forge', 'ok': False, 'code': 'blocked_by_policy'}, {'nick': 'Palette', 'ok': False, 'code': 'blocked_by_policy'}]


def run(*a):
    r = subprocess.run([sys.executable, RELAY, *a], capture_output=True, text=True)
    return r


class RelayTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); t = self.tmp.name
        self.d = os.path.join(t, 'outbox'); os.makedirs(self.d)
        self.roster = os.path.join(t, 'roster.md')
        with open(self.roster, 'w') as f: f.write(ROSTER)
        self.write('m1', 3, {'at': '2026-10-07T23:00:00Z', 'to': ['Forge'], 'cc': ['Palette'], 're': 'Hello', 'type': 'request', 'body': 'b', 'thread': 'hello', 'text': 'DEN-MSG v1\nTo: Forge', 'status': 'failed', 'results': BLOCKED})
        self.write('m2', 1, {'at': '2026-10-07T23:01:00Z', 'to': ['Ghost'], 're': 'Nobody', 'text': 't', 'status': 'queued', 'results': []})
        self.write('m3', 2, {'at': '2026-10-07T23:02:00Z', 'to': ['Forge'], 're': 'Busy', 'text': 't', 'status': 'sending', 'results': []})

    def write(self, i, v, data):
        with open(os.path.join(self.d, i + '.json'), 'w') as f: json.dump({'id': i, 'version': v, 'data': data}, f)

    def tearDown(self):
        self.tmp.cleanup()

    def test_plan(self):
        out = run('plan', self.d, '--roster', self.roster).stdout
        self.assertIn('SEND to Forge: session_forge', out); self.assertIn('SEND to Palette: session_pal', out)
        self.assertIn('NO SESSION ID IN THE ROSTER', out)              # named, not guessed
        self.assertIn('last failure: blocked_by_policy', out); self.assertIn('DEN-MSG v1', out)
        self.assertNotIn('=== m3', out)                                 # one that is being sent right now is left alone

    def test_finish_complete_and_partial(self):
        w = os.path.join(self.tmp.name, 'w')
        r = run('finish', self.d, '--delivered', 'm1=Forge,Palette', '--out', w); self.assertEqual(r.returncode, 0, r.stderr)
        writes = json.load(open(os.path.join(w, 'writes.json')))
        self.assertEqual([x['op'] for x in writes], ['set', 'delete'])
        self.assertEqual(writes[0]['collection'], 'sent'); self.assertNotIn('if_version', writes[0])          # a new id: no pin
        self.assertEqual((writes[1]['collection'], writes[1]['if_version']), ('outbox', 3))                  # the delete is pinned to what was read
        sent = json.load(open(writes[0]['file_path']))
        self.assertEqual(sent['relayed_by'], 'Firefly'); self.assertTrue(all(x['ok'] for x in sent['results']))
        self.assertIn("delivered by Firefly (the page's send was blocked_by_policy)", sent['results'][0]['code'])
        self.assertEqual(sent['from'], 'GrumpyDingo'); self.assertEqual(sent['thread'], 'hello')
        # partial: only Forge reached, Palette stays in the outbox, undelivered
        w2 = os.path.join(self.tmp.name, 'w2')
        run('finish', self.d, '--delivered', 'm1=Forge', '--out', w2)
        writes = json.load(open(os.path.join(w2, 'writes.json')))
        self.assertEqual([x['op'] for x in writes], ['update']); self.assertEqual(writes[0]['if_version'], 3)
        res = json.load(open(writes[0]['file_path']))['results']
        self.assertEqual([(x['nick'], x['ok']) for x in res], [('Forge', True), ('Palette', False)])

    def test_finish_needs_a_version(self):
        self.write('m4', None, {'to': ['Forge'], 're': 'x', 'status': 'queued', 'results': []})
        self.assertNotEqual(run('finish', self.d, '--delivered', 'm4=Forge', '--out', os.path.join(self.tmp.name, 'w3')).returncode, 0)


if __name__ == '__main__':
    unittest.main()
