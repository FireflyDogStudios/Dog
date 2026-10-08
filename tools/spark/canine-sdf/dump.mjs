// Spark: print the key masses of a preset (debug aid). node dump.mjs wolf
await import('./canine.js');
const d = globalThis.Canine.build(globalThis.Canine.PRESETS[process.argv[2] || 'wolf']);
const r = v => v.map(Math.round);
for (const q of d.prims) console.log(q.name.padEnd(11), r(q.a), q.b ? r(q.b) : r(q.r), q.ra ? Math.round(q.ra) + '/' + Math.round(q.rb) : q.deg?.toFixed(0));
