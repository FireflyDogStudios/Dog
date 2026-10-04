// Prepares sim/game.html: the built Den Ledger plus one line that lets the bot reach the game's insides
// (window.__E = eval). Never publish this copy. Replaces the old make_game_copy.py.
//   node apps/den-ledger/build.mjs && node tools/make-sim-copy.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "apps/den-ledger/dist");
const sim = path.join(root, "sim");
const s = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const k = s.lastIndexOf("})();");
fs.writeFileSync(path.join(sim, "game.html"), s.slice(0, k) + "window.__E=(c)=>eval(c);\n" + s.slice(k));
for (const f of ["pixi.min.js", "proton.web.min.js", "art-base.css", "art-alt.css"]) fs.copyFileSync(path.join(dist, f), path.join(sim, f));
console.log("wrote sim/game.html (+ libs and art beside it)");
