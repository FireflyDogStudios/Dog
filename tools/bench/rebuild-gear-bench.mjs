/* Swap the engine blocks inside apps/gear-bench/index.html for the current engine/*.js (the bench inlines them; the old
   Drive build script needs files that are not in the repo). usage: node tools/bench/rebuild-gear-bench.mjs [out.html]
   Without an argument it rewrites the bench in place. Each block is found by the first line of its engine file. */
import fs from "node:fs";
import cp from "node:child_process";
const root = new URL("../../", import.meta.url).pathname, bench = root + "apps/gear-bench/index.html", out = process.argv[2] || bench;
let page = fs.readFileSync(bench, "utf8");
for (const f of ["rig.js", "rig_den.js", "gear.js"]){
  /* ENGINE_REF=<git ref> builds from that commit's engine files (for before/after renders) instead of the working tree */
  const src = (process.env.ENGINE_REF ? cp.execFileSync("git", ["-C", root, "show", process.env.ENGINE_REF + ":engine/" + f], {encoding:"utf8", maxBuffer:1e8}) : fs.readFileSync(root + "engine/" + f, "utf8")).replace(/\n$/, ""), head = src.slice(0, src.indexOf("\n"));
  const a = page.indexOf("<script>\n" + head), i = a < 0 ? page.indexOf("<script>" + head) : a;
  if (i < 0) throw new Error("block for " + f + " not found");
  const start = page.indexOf(head, i), end = page.indexOf("</script>", start);
  page = page.slice(0, start) + src + "\n" + page.slice(end);
}
fs.writeFileSync(out, page);
console.log("wrote", out, page.length);
