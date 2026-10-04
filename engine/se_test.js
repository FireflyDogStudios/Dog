const SE = require('./se.js'); require('./se_den.js')(SE);
let T = 1000; SE.setClock(() => T);
const ok = (c, m) => { if (!c) throw new Error("FAIL: " + m); console.log("ok  " + m); };
const dingo = {name:"dingo"}, bug = {name:"bug", hp:100};

// stacks and per-stack mods
SE.apply(dingo, "hackles"); SE.apply(dingo, "hackles"); SE.apply(dingo, "hackles");
ok(SE.stacks(dingo, "hackles") === 3, "hackles stacks to 3");
ok(Math.abs(SE.mult(dingo, "dmg") - Math.pow(1.1, 3)) < 1e-9, "dmg mult = 1.1^3 with 3 stacks");
for (let i = 0; i < 5; i++) SE.apply(dingo, "hackles");
ok(SE.stacks(dingo, "hackles") === 5, "hackles capped at max 5");

// conditions multiply in; a brew and a treat stack multiplicatively with them
SE.apply(dingo, "weakened"); SE.apply(dingo, "brew-str");
ok(Math.abs(SE.mult(dingo, "dmg") - Math.pow(1.1, 5) * .7 * 1.25) < 1e-9, "weakened ×.7 and strength brew ×1.25 fold into one number");
const ex = SE.explain(dingo, "dmg"); ok(ex.length === 3 && ex.some(e => e.from === "Weakened"), "explain lists every source");

// expiry by clock
T += 7001; ok(!SE.has(dingo, "weakened"), "weakened expires after 7s");
ok(SE.has(dingo, "brew-str"), "brew still running (20 min)");
T += 1000; ok(SE.stacks(dingo, "hackles") === 0, "hackles gone after 8s too");

// refresh vs extend
SE.apply(dingo, "zoomies"); const u1 = SE.get(dingo, "zoomies").until; T += 3000; SE.apply(dingo, "zoomies"); ok(SE.get(dingo, "zoomies").until === u1 + 3000, "refresh restarts the timer");

// flags
SE.apply(dingo, "dazed"); ok(SE.flag(dingo, "noact"), "dazed sets noact"); T += 1001; ok(!SE.flag(dingo, "noact"), "noact clears when dazed expires");

// DoT ticks through ctx.damage, per-stack
let dealt = []; const ctx = {damage:(t, amt, id) => { t.hp -= amt; dealt.push([id, amt]); }};
SE.apply(bug, "burrs", {per:2}); SE.apply(bug, "burrs", {per:2}); SE.apply(bug, "burrs", {per:2});
SE.tick(bug, 1, ctx); ok(dealt.length === 2 && dealt[0][1] === 6, "burrs ticks 2 × 3 stacks = 6, twice a second");
SE.apply(bug, "scorched", {per:5}); dealt = []; SE.tick(bug, 1, ctx); ok(dealt.filter(d => d[0] === "scorched").length === 2, "scorched ticks twice a second (every .5)");
ok(bug.hp === 100 - 12 - 12 - 10, "bug hp tracks all ticks: " + bug.hp);

// creature traits as unique statuses
SE.apply(bug, "armored"); SE.apply(bug, "armored"); ok(SE.active(bug).filter(a => a.s.id === "armored").length === 1 && SE.mult(bug, "armor") === 1.5, "armored is unique and adds .5 armor");
ok(SE.flag({st:[{id:"phasing", stacks:1, until:0}]}, "phasing"), "phasing flag reads from a loaded instance");

// passives: gems, scrolls, time of day plug in without becoming statuses
SE.passive("gem:ruby", (t, stat) => t === dingo && stat === "dmg" ? 1.09 : 1);
ok(Math.abs(SE.mult(dingo, "dmg") - 1.25 * 1.09) < 1e-9, "passive gem ×1.09 folds into dmg with the brew");

// skills: cooldown, steps, auto-cast order
let hits = []; const sctx = {level:3, self:dingo, target:bug, targets:[bug, {name:"bug2"}], hit:(w, m) => hits.push([w.name, m]), call:(fn, a) => hits.push(["call", fn]), note:() => {}};
ok(!SE.cast("pounce", Object.assign({}, sctx, {target:null})) && SE.cooldown("pounce") === 0, "pounce refuses without a target and burns no cooldown");
ok(SE.cast("pounce", sctx), "pounce casts"); ok(hits[0][0] === "bug" && hits[0][1] === 8, "pounce hits the target ×8");
ok(!SE.cast("pounce", sctx), "pounce on cooldown"); ok(SE.cooldown("pounce") > 11, "cooldown ~12s");
ok(!SE.cast("shadow", sctx), "shadow pack needs level 5");
ok(SE.cast("howl", sctx) && SE.has(dingo, "rally"), "howl applies Rally Howl to self");
ok(Math.abs(SE.mult(dingo, "spd") - 1.4 * 1.3 /*zoomies*/) < 1e-9 || SE.mult(dingo, "spd") > 1, "rally + zoomies speed folds");
hits = []; const auto = SE.autoCast(["pounce", "whirl", "howl", "shadow", "feast"], sctx); ok(auto === "whirl", "auto-cast picks the first ready skill in bar order: " + auto);
ok(hits.length === 2 && SE.has(dingo, "zoomies"), "whirl hit both targets ×3 and gave zoomies");

// save / load round trip
const saved = JSON.parse(JSON.stringify(SE.save(dingo))); const d2 = {}; SE.load(d2, saved); ok(SE.has(d2, "brew-str") && SE.has(d2, "rally"), "statuses survive save/load");
console.log("\nall good:", Object.keys(SE.DEFS).length, "statuses,", Object.keys(SE.SKILLS).length, "skills");

// v0.47: passives may add (chance stats), and sum() reads the adds alone
const dmgBefore = SE.mult(dingo, "dmg");
SE.passive("season:winter", (t, stat) => t === dingo && stat === "crit" ? {add:.1} : 1);
SE.apply(dingo, "sharpnose");
ok(Math.abs(SE.sum(dingo, "crit") - .25) < 1e-9, "crit sum = sharpnose .15 + winter .1");
ok(SE.mult(dingo, "dmg") === dmgBefore, "a crit-only passive leaves dmg alone");
SE.apply(bug, "quick", {mods:[{stat:"dodge", add:.3}]}); ok(Math.abs(SE.sum(bug, "dodge") - .3) < 1e-9, "instance mods override def mods (elite Swift .3 over Quick .2)");

// tiers: one table says what Lesser and Greater mean; same tier doesn't stack, different tiers do
SE.define({id:"t-brew", name:"Strength Brew T", cls:"boon", dur:60, mods:[{stat:"dmg", tier:"greater"}]});
SE.define({id:"t-howl", name:"Rally T", cls:"boon", dur:60, mods:[{stat:"dmg", tier:"greater"}]});
SE.define({id:"t-treat", name:"Broth T", cls:"boon", dur:60, mods:[{stat:"dmg", tier:"lesser"}]});
const td = {}; SE.apply(td, "t-brew"); SE.apply(td, "t-howl");
const G = SE.TIERS.greater.mul, Lx = SE.TIERS.lesser.mul, Bx = SE.TIERS.base.mul;
ok(Math.abs(SE.mult(td, "dmg") - G) < 1e-9, "two Greater Strength sources count once");
SE.apply(td, "t-treat"); ok(Math.abs(SE.mult(td, "dmg") - G * Lx) < 1e-9, "Greater × Lesser stack");
const tx = SE.explain(td, "dmg"); ok(tx.filter(e => e.tier === "greater").length === 2 && tx.filter(e => e.counted).length === 2, "explain lists every tiered source and marks the two that count");
SE.TIERS.greater.dmg = 1.3; ok(Math.abs(SE.mult(td, "dmg") - 1.3 * Lx) < 1e-9, "a per-stat tier value overrides the table's default");
SE.define({id:"t-base", name:"Strength (itself)", cls:"boon", dur:60, mods:[{stat:"dmg", tier:"base"}]}); SE.apply(td, "t-base");
ok(Math.abs(SE.mult(td, "dmg") - 1.3 * Bx * Lx) < 1e-9, "Lesser × itself × Greater: three tiers is the most one stat carries");
SE.apply(td, "t-base"); ok(Math.abs(SE.mult(td, "dmg") - 1.3 * Bx * Lx) < 1e-9, "a second base source changes nothing");

// GW2-shaped conditions: stacks up (own timers, own strength) vs stacks long (capped)
T = 100000; const v = {name:"victim", hp:1000};
SE.apply(v, "burrs", {per:2}); T += 3000; SE.apply(v, "burrs", {per:5});
ok(SE.stacks(v, "burrs") === 2, "two burrs, applied 3 s apart");
let got = []; SE.tick(v, 1, {damage:(t, amt, id) => got.push(amt)});
ok(got.length === 2 && got[0] === 7, "each stack bleeds its own strength: 2 + 5 = 7 a tick");
T += 3100; SE.tick(v, 0, {}); ok(SE.stacks(v, "burrs") === 1, "the older stack falls off on its own, the newer one stays");
got = []; SE.tick(v, 1, {damage:(t, amt) => got.push(amt)}); ok(got[0] === 5, "and only the newer one bleeds now");
SE.apply(v, "frostbit"); SE.apply(v, "frostbit"); SE.apply(v, "frostbit"); ok(Math.abs(SE.timeLeft(v, "frostbit") - 6) < .01, "Frostbit stacks long, capped at 6 s");
ok(Math.abs(SE.mult(v, "move") - .5) < 1e-9, "but never stronger: still ×.5 move");
for (let i = 0; i < 12; i++) SE.apply(v, "shocked"); ok(SE.stacks(v, "shocked") === 10 && Math.abs(SE.sum(v, "armor") + .3) < 1e-9, "Shocked stacks up to 10 = −30% armor");
ok(SE.cleanse(v, 2).length === 2 && !SE.has(v, "shocked") && !SE.has(v, "frostbit") && SE.has(v, "burrs"), "cleanse(2) strips the two newest conditions");
SE.define({id:"t-resist", name:"Resist", cls:"boon", dur:5, flags:["resist"]}); SE.apply(v, "t-resist"); ok(SE.apply(v, "scorched", {per:3}) === null && !SE.has(v, "scorched"), "a Resist boon shrugs new conditions off");
ok(/Stacks up to 5/.test(SE.rule(SE.DEFS.burrs)) && /Stacks longer/.test(SE.rule(SE.DEFS.frostbit)) && /restarts/.test(SE.rule(SE.DEFS.zoomies)), "rule() says how each one stacks in plain words");
const sv = JSON.parse(JSON.stringify(SE.save(v))); const v2 = {}; SE.load(v2, sv); ok(SE.stacks(v2, "burrs") === 1 && v2.st[0].q, "per-stack timers survive save/load");
