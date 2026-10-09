// Den canine builder: read a species into the 2D builder's parameters (Spark, Oct 8 2026).
// Joints come from species/build/<id>.skel3d.json (joints_side_mm); form numbers from species/<id>.yaml.
// Everything is converted to withers heights (WH): withers top at (0,0), x forward, y down, ground y = 1.
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

export function loadSpecies(id, root = process.cwd()) {
  const sp = yamlLoad(fs.readFileSync(path.join(root, `species/${id}.yaml`), 'utf8')).numbers;
  const sk = JSON.parse(fs.readFileSync(path.join(root, `species/build/${id}.skel3d.json`), 'utf8'));
  const js = sk.joints_side_mm, [wx, wy] = js.topline, WH = wy;         // the withers top is the frame origin
  const J = Object.fromEntries(Object.entries(js).map(([k, [x, y]]) => [k, [(x - wx) / WH, (wy - y) / WH]]));
  const r = sp.ratios, v = k => r[k].value, sv = (g, k) => sp[g][k].value;
  const fur = {withers: 0.04, back: 0.026, croup: 0.024};             // species/build/<id>.curves.json estimates.fur_wh
  try { Object.assign(fur, JSON.parse(fs.readFileSync(path.join(root, `species/build/${id}.curves.json`), 'utf8')).estimates.fur_wh); } catch {}
  const loinY = 1 - sv('spine', 'loin_over_withers_tip'), crestY = 1 - sv('spine', 'crest_over_withers_tip');
  const loinX = (J.TL[0] + J.LS[0]) / 2;
  const chestFloor = 1 - v('chest_floor_over_height');                  // outer surface, fur included
  const form = {
    // back line (skin + fur): withers, mid-back, loin, iliac crest, tail root
    topline: [[0.12, 0.0], [0.0, -fur.withers * 0.75], [J.TL[0], (0 + loinY) / 2 - fur.back], [loinX, loinY - fur.back], [J.crest[0], crestY - fur.croup], [J.ischium[0] + 0.05, crestY + 0.04]],
    // underline: chest floor from the elbow back to the last ribs, then a fur-masked tuck-up to the groin (Scout 15)
    underline: [[0.05, chestFloor - 0.1], [J.elbow[0], chestFloor], [J.TL[0] + 0.05, chestFloor + 0.01], [J.stifle[0] + 0.12, chestFloor - 0.08], [J.stifle[0] + 0.02, chestFloor - 0.16], [J.ischium[0] + 0.05, 0.3]],
    trunk_front_x: 0.05, trunk_rear_x: J.ischium[0] + 0.08,
    chest_front: 0.1,                                                     // point of the chest ahead of the shoulder joint (outline skin check)
    nose: [v('nose_forward_over_height'), 1 - v('nose_height_over_height')]
  };
  const ear = {len: sv('size', 'ear_length') / sv('size', 'shoulder_height'), set: sp.angles.ear_set.value, base: 0.09, far: [0.012, 0.006]};
  const tail = {root: [J.ischium[0] + 0.1, crestY + 0.06], len: v('tail_over_height'), carriage: -sp.angles.tail_carriage.value, r: [0.055, 0.065, 0.03]};
  return {id, WH_mm: WH, J, form, far: {fore: -0.045, hind: 0.045}, ear, tail};
}
