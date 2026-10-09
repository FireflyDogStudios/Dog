// node tools/qa/qa.mjs <rig> [--notes=<dir of Wolf Bench note JSONs>] [--phases=.442,.835] [--kill] [--quick]   (also: ./den qa <rig> ...)
// The standard art test (docs/claude/DEN-ART-QA.md): every check in one run, one report. Writes art/<rig>/qa/REPORT.md and the pictures.
//   1 dogcheck   anatomy, joints, gait, feet, pieces, slivers, contrast (tools/dogcheck)
//   2 edges      hairlines, rims, thin bands, spikes and square corners, seams that break while walking (tools/qa/edges.mjs), at 80 px a unit
//   3 notes      GrumpyDingo's Wolf Bench notes replayed on this build: is each one still there? (tools/qa/notes.mjs)
//   4 motion     each joint's swing, beats, lag and jerk; the tail's bend and follow-through (tools/qa/motion.mjs)
//   5 joints     every joint at 25x through the stride (picture, for the eye) (tools/bench/probe/joints5.mjs; hero5)
//   6 pixi       the game's renderer draws it without errors (tools/bench/probe/pixi5.cjs; hero5)
//   7 bench      the Wolf Bench loads it, every tab, no page errors (tools/bench/tests/wolf_bench_hero5.cjs)
//   8 kill       with --kill: npm run check (the game's t40 kill check at 5 window sizes)
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const A = process.argv.slice(2), id = A.find(a => !a.startsWith('--')) || 'hero5', O = Object.fromEntries(A.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const ROOT = path.resolve(new URL('../..', import.meta.url).pathname), OUT = path.join(ROOT, 'art', id, 'qa'); fs.mkdirSync(OUT, { recursive: true });
const run = (cmd, args, t = 900) => { const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', timeout: t * 1000 }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const steps = []; const step = (name, ok, lines, pics = []) => { steps.push({ name, ok, lines, pics }); console.log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'WARN'}  ${name}: ${lines[0] || ''}`); };
const t0 = Date.now(), commit = run('git', ['rev-parse', '--short', 'HEAD']).out.trim();
{ const r = run('node', ['tools/dogcheck/dogcheck.mjs', id]); const sum = (r.out.match(/(\d+) fail, (\d+) warn/) || []); const bad = r.out.split('\n').filter(l => /^\s+(FAIL|WARN)/.test(l) && !/notches/.test(l));
  step('dogcheck', sum[1] === '0' ? true : false, [`${sum[1] ?? '?'} fail, ${sum[2] ?? '?'} warn`, ...bad.map(l => l.trim())], [`../dogcheck/sheet.png`]); }
const phases = [O.phases, O.notes ? [...new Set(fs.readdirSync(O.notes).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(O.notes, f), 'utf8'))).filter(n => n.rig === id && !n.standing).map(n => n.phase))].join(',') : ''].filter(Boolean).join(',');
if (!O.quick) { const r = run('node', ['tools/qa/edges.mjs', id, path.join(OUT, 'edges'), '80', ...(phases ? [`--phases=${phases}`] : [])], 900); const F = fs.existsSync(path.join(OUT, 'edges/findings.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'edges/findings.json'))).findings.filter(f => !f.allowed) : [];
  const by = {}; F.forEach(f => by[f.kind] = (by[f.kind] || 0) + 1);
  step('edges', r.code === 0 ? (F.length ? false : true) : false, [`${F.length} findings (${Object.entries(by).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'})`, ...F.slice(0, 40).map(f => `${f.kind} ${f.frame} (${f.at[0]}, ${f.at[1]}): ${f.what}`)], ['edges/sheet.png']); }
if (O.notes && !O.quick) { const r = run('node', ['tools/qa/notes.mjs', id, O.notes, path.join(OUT, 'edges'), path.join(OUT, 'notes.png')]); const ls = r.out.trim().split('\n'), last = ls.pop() || '';
  const open_ = ls.filter(l => /\bflagged\b/.test(l)).length; step('notes', open_ === 0, [`${open_} of ${ls.length} notes still show a finding at their spot (0 = all fixed by what the detector can see)`, ...ls], ['notes.png']); }
{ const r = run('node', ['tools/qa/motion.mjs', id, path.join(OUT, 'motion.png')]); const ls = r.out.split('\n').filter(l => /^\s+(PASS|WARN|SKIP)/.test(l)).map(l => l.trim()); step('motion', !ls.some(l => l.startsWith('WARN')) ? true : null, [ls.filter(l => l.startsWith('WARN')).length + ' warnings', ...ls], ['motion.png']); }
if (id === 'hero5') { const r = run('node', ['tools/bench/probe/joints5.mjs', path.join(OUT, 'joints.png'), '#2040ff', '0']); step('joints', r.code === 0 ? true : false, ['every joint through the stride, for the eye'], ['joints.png']);
  const p = run('node', ['tools/bench/probe/pixi5.cjs', path.join(OUT, 'pixi.png')]); step('pixi', /errors none/.test(p.out) && /err none/.test(p.out), [p.out.trim().split('\n').join(' · ')], ['pixi.png']); }
if (id === 'hero5') { const r = run('node', ['apps/wolf-bench/build.mjs']); const t = run('node', ['tools/bench/tests/wolf_bench_hero5.cjs', OUT]); const ls = t.out.trim().split('\n').filter(l => !/CERT_AUTHORITY/.test(l) || !/page errors/.test(l));
  const fails = ls.filter(l => l.startsWith('FAIL')); step('bench', fails.length === 0, [`${ls.filter(l => l.startsWith('PASS')).length} pass, ${fails.length} fail (the sandbox's blocked web font is ignored)`, ...ls], ['bench_hero5.png']); }
if (O.kill) { const r = run('npm', ['run', 'check'], 1200); const k = (r.out.match(/"kills":6/g) || []).length; step('kill', k === 5, [`${k} of 5 window sizes reach 6 kills`]); }
const md = [`# QA ${id} · build ${commit} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ${((Date.now() - t0) / 1000).toFixed(0)} s`, '', 'The standard art test (docs/claude/DEN-ART-QA.md). Run: `./den qa ' + id + (O.notes ? ' --notes=<dir>' : '') + '`.', '',
  ...steps.flatMap(s => [`## ${s.ok === true ? 'PASS' : s.ok === false ? 'FAIL' : 'WARN'} · ${s.name}`, '', ...s.lines.map(l => '- ' + l), ...s.pics.map(p => `\n![${s.name}](${p})`), ''])].join('\n');
fs.writeFileSync(path.join(OUT, 'REPORT.md'), md); console.log(`→ art/${id}/qa/REPORT.md (${steps.filter(s => s.ok === false).length} failing steps)`);
process.exit(steps.some(s => s.ok === false) ? 1 : 0);
