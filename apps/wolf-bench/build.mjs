// Build the Wolf Review Bench: inline the real engine (rig.js, rig_den.js, hero3.js), the latest dogcheck report and the build id.
// node apps/wolf-bench/build.mjs  → apps/wolf-bench/index.html (run ./den dogcheck hero3 first so the report is current)
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const eng = ['rig.js', 'rig_den.js', 'hero3.js'].map(f => `/* ---- engine/${f} ---- */\n` + fs.readFileSync(path.join(ROOT, 'engine', f), 'utf8')).join('\n');
if (/<\/script/i.test(eng)) throw new Error('engine text contains </script>');
const rep = path.join(ROOT, 'art/hero3/dogcheck/report.json'), report = fs.existsSync(rep) ? fs.readFileSync(rep, 'utf8') : 'null';
const commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(), date = new Date().toISOString().slice(0, 10);
let html = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
html = html.replace('/*ENGINE*/', () => eng).replace('/*BUILD*/', () => JSON.stringify({ commit, date })).replace('/*REPORT*/', () => report);
fs.writeFileSync(path.join(HERE, 'index.html'), html);
console.log('wrote apps/wolf-bench/index.html', (html.length / 1024).toFixed(0) + ' KB', commit);
