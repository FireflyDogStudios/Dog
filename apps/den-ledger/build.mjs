// Builds the Den Ledger game page from src/ into dist/.
//   node build.mjs            -> dist/index.html + dist/<public files>
//   node build.mjs --check <f> -> also verify the build is byte-identical to <f>
// dist/index.html is the exact text to publish (the artifact service adds its own page skeleton).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (...p) => path.join(here, "src", ...p);
const read = (...p) => fs.readFileSync(src(...p), "utf8");
const dir = (d) => fs.readdirSync(src(d)).filter((f) => !f.startsWith(".")).sort();
const cat = (d, ext) => dir(d).filter((f) => f.endsWith(ext)).map((f) => read(d, f)).join("");

const html =
  read("head.html") +
  "<style>\n" + cat("css", ".css") + "</style>\n" +
  '<style id="artmix-css">\n' + cat("css-artmix", ".css") + "</style>\n" +
  read("body.html") +
  "<script>" + cat("js-loader", ".js").replace(/\n$/, "") + "</script>\n" +
  "<script>\n" + cat("js", ".js") + "</script>\n" +
  read("tail.html");

const dist = path.join(here, "dist");
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "index.html"), html);
const pub = path.join(here, "public");
for (const f of fs.readdirSync(pub)) fs.copyFileSync(path.join(pub, f), path.join(dist, f));
console.log(`dist/index.html ${html.length} chars, ${dir("js").length} js modules`);

const i = process.argv.indexOf("--check");
if (i > 0) {
  const raw = fs.readFileSync(process.argv[i + 1], "utf8");
  const body = raw.slice(raw.indexOf("\n") + 1, raw.length - "\n</body></html>".length);
  if (body === html) console.log("round-trip: IDENTICAL to", process.argv[i + 1]);
  else { console.error("round-trip: DIFFERENT"); process.exit(1); }
}
