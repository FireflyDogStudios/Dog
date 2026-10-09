#!/usr/bin/env python3
"""Build the Den Gear Bench: gear.tpl.html + engine files -> collar.html (the published page)."""
import pathlib
B = pathlib.Path(__file__).parent
E = B.parent.parent / "engine"
tpl = (B / "gear.tpl.html").read_text()
fill = {
    "/*__PIXI__*/": (B / "pixi.min.js").read_text(),
    "/*__SMITHY__*/": (B / "smithy_extract.js").read_text(),
    "/*__RIG__*/": (E / "rig.js").read_text(),
    "/*__RIG_DEN__*/": (E / "rig_den.js").read_text(),
    "/*__GEAR__*/": (E / "gear.js").read_text(),
}
for k, v in fill.items():
    assert k in tpl, k
    tpl = tpl.replace(k, v, 1)
(B / "collar.html").write_text(tpl)
print("collar.html", len(tpl))
