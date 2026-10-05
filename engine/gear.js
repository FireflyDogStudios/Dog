/* ================= Den Gear (GEAR) =================
   Armor pieces for the dingo, generated from the Smithy's own materials and drawn as rig parts on his joints.
   Every piece is a short code like a weapon: band material, fitting metal, style, gem, rarity, infusion. Rules shared by every piece:
   decoration spaced evenly along the piece, the gem centred, the hardware where it fastens, the Smithy's brush (outline, base, shade, light).
   GEAR.init(SMITHY) borrows the Smithy's palettes; GEAR.KINDS lists the pieces in layer order; GEAR.decode(code) rebuilds one.
   Parts are plain rig part specs (paths in the 62×38 drawing space) so RIG.attach draws them on the hero. */
const GEAR = (() => {
"use strict";
let P = null, RARS = [], INFS = [];
/* Oak and Dark wood are also fittings (pegs, toggles, plate edges, rings), appended at the END so every existing code keeps its meaning. Done here, not in the Smithy: the game's own lists and the weapons are untouched. */
function init(S){ const W = S.PAL.WRAP, wood = n => W.find(w => w.n === n); P = Object.assign({}, S.PAL, {FIT:[...S.PAL.FIT, wood("Oak"), wood("Dark wood")]}); RARS = S.RARS; INFS = S.INFS; }
/* seeded dice of our own: a generator must never touch the game's Math.random */
function rngOf(seed){ let h = 1779033703 ^ String(seed).length; for (let i = 0; i < String(seed).length; i++){ h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* ---------- connection points: where each dog's neck (and later tail, paws and hem) sits ----------
   A piece is drawn against these, never against one dog's numbers, so the same collar fits every dog and a new dog is one more row.
   collar: the footprint of the dog's own collar band, as its two edges R (rear, upper) and F (front, lower), each a cubic running crest → throat.
   A gear collar covers exactly this footprint, so it sits flush, at the dog's own angle, and never drapes past the neck. Numbers are in each rig's 62×38 space
   (hero: its `band`; hero2: its `band2`). */
/* line weights: the style sheet. Visible outline widths; an outline is drawn as a stroke UNDER its fill at twice this width, so it sits outside the shape.
   contour = a piece's silhouette; interior = a part inside a piece (stud, buckle frame); detail = fine marks. One outline per shape, round joins, nothing else. */
const LINE = {contour:.32, interior:.22, detail:.14};
const MOUNTS = {
  hero:  {collar:{R:[[40.9, 8.4], [43.6, 9.9], [45.5, 11.9], [46.6, 14.1]], F:[[38.9, 10], [42.1, 11.5], [44, 13.7], [45.2, 15.9]]},
          tail:{kind:"bezier", c:[[14.4, 17.6], [10.8, 20.6], [9.3, 25.4], [10.1, 30.4]], w:[2.8, 2.2], seat:[.225, .995], plates:4, gap:.0567, ring:.9, light:1},
          torso:{rear:17.2, girth:28.5, tuft:{amp:.85, period:2.2}}},
  hero2: {collar:{R:[[40.73, 7.81], [43.15, 8.79], [45.23, 10.26], [46.97, 12.22]], F:[[39.60, 9.41], [42.02, 10.39], [44.10, 11.86], [45.83, 13.82]]}, /* 35.3° (GrumpyDingo's red line): tools/lens/place_band.py */
          tail:{kind:"catmull", pts:[[23.4, 13.6], [19.6, 14.6], [15.6, 14.6], [12.2, 13.0], [10.2, 10.4], [9.8, 7.8], [11.0, 6.2]], w:[3.8, 1.8], seat:[.29, .92], plates:4, gap:.043, ring:.95, light:-1}, /* seat: from where the tail comes out from behind the rump (the body draws over the tail root, so it is hidden until about .29) round the whole hook, leaving the tip tuft bare. gap: thin, so a ring (ring = its width in units) sits across it and overlaps the plate edges a little */
          torso:{rear:21.4, girth:32.0, tuft:{amp:.85, period:2.2}}},
};
/* tail: the dog's tail centreline (kind "bezier": one cubic c, t is the curve parameter; kind "catmull": a Catmull-Rom curve through pts, t is the fraction of ARC LENGTH, as in the fit sheet),
   w = the tail's full width at the root and the tip, seat = the stretch of the tail the guard covers, plates and gap = the guard's links (gap as a fraction of the tail's length).
   THE SPACING RULE (GrumpyDingo, Oct 4): the gaps between the guard's plates ARE the ring slots. Rings are placed from guardLayout(), never from a separate number. light = which side of the tail catches the light (+1 or -1). */
/* BEGIN COMPILED (tools/lens/compile_mounts.py writes this; do not hand-edit) */
const COMPILED = {
  hero: {"collar":{"base":"M39.30 9.69 L39.22 9.79 L39.18 9.91 L39.19 10.03 L39.28 10.17 L40.16 10.66 L41.00 11.20 L41.77 11.77 L42.47 12.38 L43.11 13.00 L43.68 13.65 L44.20 14.32 L44.77 15.15 L44.86 15.24 L45.04 15.28 L45.13 15.26 L45.24 15.19 L45.61 14.71 L46.33 13.93 L46.38 13.78 L46.35 13.63 L45.89 12.87 L45.18 11.91 L44.50 11.14 L43.74 10.40 L43.07 9.84 L42.17 9.18 L41.39 8.68 L40.97 8.44 L40.84 8.43 L40.72 8.46 Z","shade":"M39.11 9.85 L39.06 9.91 L39.05 9.97 L39.07 10.05 L39.11 10.10 L40.15 10.66 L41.00 11.20 L41.77 11.77 L42.47 12.38 L43.11 13.00 L43.82 13.82 L44.32 14.48 L44.89 15.36 L45.00 15.41 L45.08 15.39 L45.13 15.35 L45.63 14.68 L45.66 14.61 L45.64 14.53 L45.16 13.76 L44.56 12.94 L43.87 12.15 L43.10 11.39 L42.41 10.80 L41.67 10.25 L40.86 9.73 L39.96 9.23 L39.89 9.22 L39.81 9.25 Z","light":"M40.48 8.66 L40.46 8.72 L40.49 8.78 L41.36 9.29 L42.14 9.80 L42.87 10.35 L43.54 10.92 L44.29 11.67 L44.97 12.46 L45.56 13.27 L46.06 14.09 L46.11 14.11 L46.16 14.10 L46.34 13.94 L46.35 13.85 L46.03 13.29 L45.59 12.63 L45.23 12.15 L44.42 11.22 L43.66 10.49 L42.99 9.92 L42.45 9.52 L41.69 9.01 L41.08 8.64 L40.73 8.46 Z"},"torso":{"base":"M16.62 18.97 L16.47 20.73 L16.51 20.84 L16.61 20.89 L17.97 20.95 L18.80 21.72 L18.88 21.76 L19.00 21.73 L19.83 21.04 L20.18 21.06 L21.01 21.82 L21.10 21.86 L21.20 21.84 L22.02 21.29 L22.40 21.37 L23.28 22.21 L23.39 22.21 L24.19 21.89 L24.65 22.02 L25.43 22.73 L25.50 22.76 L25.59 22.75 L26.35 22.46 L26.88 22.58 L27.69 23.17 L27.78 23.17 L28.52 22.89 L29.09 22.98 L29.83 23.47 L29.90 23.50 L29.97 23.49 L30.71 23.19 L31.27 23.24 L32.03 23.72 L32.10 23.75 L32.18 23.73 L32.92 23.37 L34.85 23.43 L36.61 23.42 L38.33 23.33 L40.40 23.14 L41.20 23.04 L41.56 22.92 L41.84 22.59 L42.33 21.87 L42.77 21.11 L43.15 20.30 L43.61 19.05 L44.09 17.28 L44.55 16.31 L44.88 15.74 L44.89 15.66 L44.85 15.57 L39.00 10.10 L38.93 10.06 L38.82 10.08 L37.48 11.07 L36.12 11.93 L35.56 11.96 L33.26 11.76 L30.97 11.63 L29.28 11.57 L27.64 11.55 L26.03 11.56 L24.49 11.62 L23.01 11.72 L21.60 11.86 L20.27 12.05 L19.04 12.28 L17.92 12.57 L17.45 12.71 L17.37 12.77 L17.35 12.84 L17.27 13.47 L16.57 14.19 L16.53 14.28 L16.56 14.38 L17.06 15.09 L17.01 15.50 L16.47 16.18 L16.44 16.26 L16.46 16.35 L16.82 17.02 L16.76 17.51 L16.31 18.17 L16.28 18.23 L16.30 18.32 Z","shade":"M16.47 20.73 L16.51 20.84 L16.60 20.89 L17.97 20.95 L18.80 21.72 L18.88 21.76 L19.00 21.73 L19.83 21.04 L20.18 21.06 L21.01 21.83 L21.10 21.86 L21.20 21.84 L22.03 21.29 L22.40 21.37 L23.28 22.21 L23.39 22.21 L24.19 21.89 L24.65 22.02 L25.43 22.73 L25.49 22.76 L25.58 22.76 L26.35 22.46 L26.88 22.58 L27.69 23.17 L27.78 23.17 L28.52 22.89 L29.09 22.98 L29.83 23.47 L29.90 23.50 L29.97 23.49 L30.71 23.19 L31.27 23.24 L32.03 23.72 L32.10 23.75 L32.18 23.73 L32.92 23.37 L34.85 23.43 L37.05 23.40 L39.17 23.27 L41.19 23.04 L41.53 22.94 L41.59 22.89 L42.09 22.24 L42.33 21.88 L42.77 21.11 L43.14 20.31 L43.47 19.47 L43.73 18.62 L43.95 17.75 L44.09 17.28 L44.55 16.31 L44.88 15.74 L44.89 15.66 L44.85 15.58 L44.57 15.31 L44.50 15.31 L44.09 16.18 L43.61 17.94 L43.31 18.79 L42.96 19.61 L42.77 20.01 L42.33 20.78 L42.09 21.14 L41.59 21.79 L41.53 21.84 L41.19 21.94 L39.17 22.17 L37.05 22.30 L34.85 22.33 L32.93 22.27 L32.18 22.63 L32.10 22.65 L32.03 22.62 L31.27 22.14 L30.71 22.09 L29.97 22.39 L29.90 22.40 L29.83 22.37 L29.09 21.88 L28.53 21.79 L27.78 22.07 L27.69 22.07 L26.88 21.48 L26.36 21.36 L25.59 21.65 L25.50 21.66 L25.43 21.63 L24.65 20.92 L24.20 20.79 L23.38 21.11 L23.28 21.11 L22.40 20.27 L22.04 20.20 L21.19 20.75 L21.08 20.76 L21.01 20.72 L20.16 19.96 L19.83 19.94 L19.00 20.63 L18.90 20.66 L18.80 20.63 L17.96 19.86 L16.59 19.79 L16.55 19.84 Z","light":"M17.25 14.28 L17.35 13.61 L17.42 13.53 L17.56 13.48 L18.65 13.17 L19.85 12.92 L21.15 12.72 L23.01 12.52 L23.99 12.45 L25.51 12.38 L27.10 12.35 L28.73 12.36 L30.40 12.40 L32.11 12.49 L33.83 12.61 L35.57 12.76 L36.12 12.73 L36.59 12.45 L37.48 11.87 L38.82 10.88 L38.91 10.86 L39.00 10.90 L44.59 16.13 L44.66 16.12 L44.89 15.69 L44.84 15.57 L39.00 10.10 L38.91 10.06 L38.82 10.08 L37.48 11.07 L36.12 11.93 L35.56 11.96 L32.68 11.72 L30.40 11.60 L28.18 11.55 L26.56 11.55 L24.49 11.62 L22.53 11.76 L20.71 11.98 L19.44 12.20 L18.28 12.47 L17.56 12.68 L17.39 12.75 L17.35 12.84 L17.27 13.47 L16.57 14.19 L16.53 14.30 L16.56 14.38 L16.78 14.69 L16.82 14.71 Z","seam":"M18.20 13.24 L18.45 13.18 L18.70 13.11 L18.95 13.06 L19.20 13.00 L19.45 12.95 L19.70 12.90 L19.95 12.85 L20.20 12.81 L20.45 12.77 L20.70 12.73 L20.95 12.69 L21.20 12.66 L21.45 12.63 L21.70 12.60 L21.95 12.57 L22.20 12.54 L22.45 12.52 L22.70 12.49 L22.95 12.47 L23.20 12.45 L23.45 12.43 L23.70 12.41 L23.95 12.40 L24.20 12.38 L24.45 12.37 L24.70 12.36 L24.95 12.35 L25.20 12.34 L25.45 12.33 L25.70 12.32 L25.95 12.31 L26.20 12.31 L26.45 12.30 L26.70 12.30 L26.95 12.30 L27.20 12.30 L27.45 12.30 L27.70 12.30 L27.95 12.30 L28.20 12.30 L28.45 12.30 L28.70 12.31 L28.95 12.31 L29.20 12.32 L29.45 12.32 L29.70 12.33 L29.95 12.34 L30.20 12.35 L30.45 12.36 L30.70 12.37 L30.95 12.38 L31.20 12.39 L31.45 12.40 L31.70 12.42 L31.95 12.43 L32.20 12.44 L32.45 12.46 L32.70 12.48 L32.95 12.49 L33.20 12.51 L33.45 12.53 L33.70 12.55 L33.95 12.57 L34.20 12.59 L34.45 12.61 L34.70 12.63 L34.95 12.65 L35.20 12.67 L35.45 12.70 L35.70 12.70 L35.95 12.69 L36.20 12.63 L36.45 12.48 L36.70 12.33 L36.95 12.17 L37.20 12.01 L37.45 11.84 L37.70 11.67 L37.95 11.49 L38.20 11.30 L38.45 11.12 L38.70 10.92 L38.95 10.80 L39.20 11.03 L39.45 11.27 L39.70 11.50 L39.95 11.73 L40.20 11.97 L40.45 12.20 L40.70 12.44 L40.95 12.67 L41.20 12.90 L41.45 13.14 L41.70 13.37 L41.95 13.61 L42.20 13.84 L42.45 14.07 L42.70 14.31 L42.95 14.54 L43.20 14.78 L43.45 15.01 L43.70 15.25 L43.95 15.48 L44.20 15.71 L44.45 15.95","ticks":"M18.26 12.87 L18.54 13.51 M19.06 12.68 L19.34 13.32 M19.86 12.53 L20.14 13.17 M20.66 12.40 L20.94 13.04 M21.46 12.29 L21.74 12.93 M22.26 12.20 L22.54 12.84 M23.06 12.13 L23.34 12.77 M23.86 12.07 L24.14 12.71 M24.66 12.03 L24.94 12.67 M25.46 12.00 L25.74 12.64 M26.26 11.98 L26.54 12.62 M27.06 11.98 L27.34 12.62 M27.86 11.98 L28.14 12.62 M28.66 11.99 L28.94 12.63 M29.46 12.01 L29.74 12.65 M30.26 12.03 L30.54 12.67 M31.06 12.07 L31.34 12.71 M31.86 12.11 L32.14 12.75 M32.66 12.16 L32.94 12.80 M33.46 12.22 L33.74 12.86 M34.26 12.28 L34.54 12.92 M35.06 12.35 L35.34 12.99 M35.86 12.37 L36.14 13.01 M36.66 11.95 L36.94 12.59 M37.46 11.42 L37.74 12.06 M38.26 10.83 L38.54 11.47 M39.06 10.71 L39.34 11.35 M39.86 11.46 L40.14 12.10 M40.66 12.21 L40.94 12.85 M41.46 12.96 L41.74 13.60 M42.26 13.71 L42.54 14.35 M43.06 14.46 L43.34 15.10 M43.86 15.21 L44.14 15.85","strap":"M28.00 11.65 L29.00 11.66 L29.00 22.91 L28.00 22.75 Z","rivets":[[28.5,14.14],[28.5,20.44]],"gem":[28.5,17.29]}},
  hero2: {"collar":{"base":"M39.96 9.08 L39.88 9.21 L39.87 9.33 L39.90 9.45 L40.00 9.57 L40.94 10.02 L41.64 10.40 L42.32 10.81 L42.97 11.25 L43.76 11.84 L44.37 12.35 L44.95 12.89 L45.62 13.57 L45.71 13.60 L45.83 13.61 L45.95 13.57 L46.04 13.48 L46.08 13.40 L46.27 12.79 L46.61 12.07 L46.63 11.95 L46.59 11.83 L46.23 11.43 L45.50 10.75 L44.90 10.24 L44.27 9.76 L43.61 9.31 L42.77 8.80 L41.89 8.33 L41.17 8.01 L41.04 8.02 L40.90 8.10 L40.37 8.67 Z","shade":"M39.79 9.24 L39.74 9.36 L39.76 9.44 L39.81 9.49 L40.76 9.93 L41.47 10.30 L42.32 10.81 L43.13 11.36 L43.76 11.84 L44.51 12.48 L45.09 13.04 L45.79 13.77 L45.90 13.80 L46.01 13.74 L46.23 12.93 L46.23 12.85 L46.20 12.80 L45.52 12.09 L44.93 11.55 L44.33 11.04 L43.70 10.56 L42.88 10.01 L42.21 9.60 L41.33 9.13 L40.44 8.73 L40.36 8.72 L40.29 8.76 Z","light":"M40.81 8.31 L41.64 8.69 L42.34 9.06 L43.03 9.46 L43.69 9.89 L44.48 10.48 L45.10 10.98 L45.83 11.65 L46.41 12.25 L46.48 12.27 L46.53 12.23 L46.63 12.05 L46.63 11.99 L46.17 11.51 L45.14 10.57 L44.53 10.08 L43.89 9.61 L43.23 9.18 L42.54 8.78 L41.84 8.41 L41.02 8.03 L40.94 8.05 L40.80 8.22 Z"},"torso":{"base":"M21.12 16.23 L20.90 18.00 L20.91 18.08 L20.96 18.14 L22.18 18.59 L23.07 19.65 L23.19 19.66 L24.03 19.32 L24.39 19.49 L25.28 20.59 L25.39 20.61 L26.18 20.42 L26.65 20.62 L27.49 21.48 L27.59 21.48 L28.36 21.25 L28.88 21.41 L29.69 22.08 L29.78 22.08 L30.53 21.85 L31.09 21.98 L31.84 22.53 L31.90 22.55 L31.97 22.55 L32.71 22.30 L33.28 22.39 L34.03 22.92 L34.10 22.94 L34.18 22.93 L34.92 22.63 L35.45 22.69 L36.23 23.25 L36.30 23.28 L36.38 23.26 L37.16 22.93 L38.04 23.10 L38.77 23.19 L39.50 23.23 L39.86 23.22 L40.25 23.19 L41.01 22.98 L41.72 22.71 L42.40 22.37 L42.72 22.17 L43.32 21.74 L43.87 21.26 L44.37 20.73 L44.81 20.17 L45.19 19.56 L45.52 18.93 L45.78 18.26 L46.02 17.49 L46.11 17.10 L46.22 16.37 L46.24 15.64 L46.14 14.59 L46.04 14.02 L46.00 13.94 L39.70 9.48 L39.61 9.45 L39.53 9.48 L39.01 9.90 L38.42 10.32 L37.81 10.69 L37.18 11.00 L36.15 11.24 L34.70 11.49 L33.57 11.62 L32.40 11.72 L31.22 11.79 L29.64 11.83 L28.09 11.83 L26.58 11.79 L24.80 11.71 L23.20 11.60 L22.58 11.69 L21.74 11.90 L21.68 11.94 L21.65 12.00 L21.56 12.76 L21.02 13.44 L20.99 13.51 L21.00 13.61 L21.36 14.28 L21.30 14.77 L20.84 15.43 L20.81 15.49 L20.82 15.58 Z","shade":"M20.90 18.00 L20.92 18.09 L20.98 18.16 L22.18 18.59 L23.03 19.61 L23.09 19.66 L23.20 19.66 L24.03 19.32 L24.39 19.49 L25.29 20.60 L25.39 20.61 L26.18 20.42 L26.65 20.62 L27.48 21.48 L27.59 21.48 L28.36 21.25 L28.88 21.41 L29.69 22.08 L29.78 22.08 L30.53 21.85 L31.09 21.98 L31.90 22.55 L31.98 22.55 L32.71 22.30 L33.28 22.39 L34.03 22.92 L34.10 22.94 L34.18 22.93 L34.92 22.63 L35.45 22.69 L36.23 23.25 L36.30 23.28 L36.38 23.26 L37.16 22.93 L38.04 23.10 L38.77 23.19 L39.50 23.23 L40.22 23.19 L40.63 23.10 L41.37 22.85 L41.73 22.70 L42.40 22.36 L43.02 21.96 L43.32 21.74 L43.87 21.26 L44.37 20.73 L44.81 20.17 L45.01 19.86 L45.36 19.24 L45.66 18.59 L45.91 17.87 L46.11 17.11 L46.22 16.37 L46.24 15.87 L46.19 15.82 L46.14 15.85 L46.03 16.38 L45.91 16.78 L45.66 17.50 L45.36 18.15 L45.01 18.76 L44.81 19.07 L44.37 19.63 L44.12 19.91 L43.61 20.40 L43.32 20.64 L42.72 21.07 L42.40 21.27 L41.73 21.60 L41.37 21.75 L40.63 22.00 L40.22 22.09 L39.50 22.13 L38.77 22.09 L38.04 22.00 L37.17 21.83 L36.38 22.16 L36.30 22.18 L36.23 22.15 L35.44 21.59 L34.92 21.53 L34.12 21.85 L34.03 21.82 L33.27 21.29 L32.71 21.20 L31.97 21.45 L31.89 21.45 L31.10 20.88 L30.54 20.75 L29.78 20.98 L29.68 20.98 L28.88 20.32 L28.37 20.16 L27.59 20.38 L27.49 20.38 L26.65 19.53 L26.20 19.33 L25.39 19.51 L25.30 19.50 L25.24 19.46 L24.38 18.38 L24.02 18.22 L23.20 18.56 L23.09 18.56 L23.03 18.51 L22.18 17.49 L21.07 17.09 L21.01 17.13 Z","light":"M21.55 13.57 L21.65 12.80 L21.71 12.71 L22.58 12.49 L23.18 12.40 L25.15 12.53 L26.95 12.61 L28.47 12.63 L30.04 12.63 L31.62 12.57 L33.18 12.46 L34.70 12.29 L35.80 12.11 L37.17 11.81 L37.50 11.66 L38.42 11.12 L39.01 10.70 L39.53 10.28 L39.63 10.25 L39.70 10.28 L45.98 14.73 L46.04 14.81 L46.12 15.20 L46.17 15.23 L46.21 15.19 L46.09 14.24 L46.04 14.01 L46.00 13.94 L39.70 9.48 L39.62 9.45 L39.52 9.48 L39.01 9.90 L38.42 10.32 L37.81 10.69 L37.18 11.00 L36.15 11.24 L34.70 11.49 L33.57 11.62 L32.40 11.72 L30.04 11.83 L28.47 11.83 L26.58 11.79 L24.80 11.71 L23.20 11.60 L22.25 11.76 L21.75 11.89 L21.68 11.95 L21.65 12.02 L21.56 12.76 L21.02 13.44 L20.99 13.52 L21.01 13.61 L21.18 13.93 L21.22 13.95 L21.26 13.94 Z","seam":"M22.40 12.48 L22.65 12.43 L22.90 12.39 L23.15 12.36 L23.40 12.37 L23.65 12.38 L23.90 12.40 L24.15 12.42 L24.40 12.44 L24.65 12.45 L24.90 12.47 L25.15 12.48 L25.40 12.49 L25.65 12.51 L25.90 12.52 L26.15 12.53 L26.40 12.54 L26.65 12.55 L26.90 12.55 L27.15 12.56 L27.40 12.57 L27.65 12.57 L27.90 12.58 L28.15 12.58 L28.40 12.58 L28.65 12.59 L28.90 12.59 L29.15 12.59 L29.40 12.58 L29.65 12.58 L29.90 12.58 L30.15 12.57 L30.40 12.57 L30.65 12.56 L30.90 12.55 L31.15 12.54 L31.40 12.53 L31.65 12.52 L31.90 12.50 L32.15 12.49 L32.40 12.47 L32.65 12.45 L32.90 12.43 L33.15 12.41 L33.40 12.39 L33.65 12.36 L33.90 12.34 L34.15 12.31 L34.40 12.28 L34.65 12.24 L34.90 12.21 L35.15 12.17 L35.40 12.13 L35.65 12.09 L35.90 12.04 L36.15 11.99 L36.40 11.94 L36.65 11.88 L36.90 11.83 L37.15 11.76 L37.40 11.65 L37.65 11.53 L37.90 11.39 L38.15 11.24 L38.40 11.08 L38.65 10.91 L38.90 10.73 L39.15 10.54 L39.40 10.33 L39.65 10.20 L39.90 10.37 L40.15 10.55 L40.40 10.73 L40.65 10.90 L40.90 11.08 L41.15 11.26 L41.40 11.43 L41.65 11.61 L41.90 11.79 L42.15 11.97 L42.40 12.14 L42.65 12.32 L42.90 12.50 L43.15 12.67 L43.40 12.85 L43.65 13.03 L43.90 13.20 L44.15 13.38 L44.40 13.56 L44.65 13.73 L44.90 13.91 L45.15 14.09 L45.40 14.27 L45.65 14.44 L45.90 14.62 L46.15 15.38","ticks":"M22.46 12.12 L22.74 12.76 M23.26 12.05 L23.54 12.69 M24.06 12.10 L24.34 12.74 M24.86 12.15 L25.14 12.79 M25.66 12.19 L25.94 12.83 M26.46 12.22 L26.74 12.86 M27.26 12.25 L27.54 12.89 M28.06 12.26 L28.34 12.90 M28.86 12.27 L29.14 12.91 M29.66 12.26 L29.94 12.90 M30.46 12.24 L30.74 12.88 M31.26 12.21 L31.54 12.85 M32.06 12.16 L32.34 12.80 M32.86 12.10 L33.14 12.74 M33.66 12.03 L33.94 12.67 M34.46 11.93 L34.74 12.57 M35.26 11.81 L35.54 12.45 M36.06 11.66 L36.34 12.30 M36.86 11.48 L37.14 12.12 M37.66 11.13 L37.94 11.77 M38.46 10.63 L38.74 11.27 M39.26 10.01 L39.54 10.65 M40.06 10.26 L40.34 10.90 M40.86 10.83 L41.14 11.47 M41.66 11.40 L41.94 12.04 M42.46 11.96 L42.74 12.60 M43.26 12.53 L43.54 13.17 M44.06 13.10 L44.34 13.74 M44.86 13.66 L45.14 14.30 M45.66 14.23 L45.94 14.87","strap":"M31.50 11.88 L32.50 11.81 L32.50 22.21 L31.50 22.02 Z","rivets":[[32,14.1],[32,19.92]],"gem":[32,17.01]}}
};
/* END COMPILED */
const mountOf = (rigId, what) => { const m = MOUNTS[rigId || "hero"]; if (!m || !m[what]) throw new Error("no " + what + " mount for " + rigId); return m[what]; };

/* ---------- the collar: one band that sits over the dog's own, around the neck line of the drawing ----------
   Drawn the Smithy's way: an outline, a base, the lower half in shade, a light strip on the upper edge; gems are the Smithy's diamond with a
   dark rim and a glint, always centred on the band (the centre stud gives way to it); the fitting lives at the throat. */
const STYLES = [
  {k:"plain", n:"Collar", fit:"buckle"},
  {k:"studded", n:"Studded Collar", fit:"buckle", studs:5},
  {k:"tag", n:"Tag Collar", fit:"tag"},
  {k:"rope", n:"Rope Collar", fit:"knot"},
];
const cub = (p, t) => { const u = 1 - t; return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0], u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]]; };
/* a point on the band: t runs crest → throat, s across it (-1 the front edge, 0 the middle, +1 the rear edge) */
function bandPt(m, t, s){ const r = cub(m.R, t), f = cub(m.F, t), k = (s + 1) / 2; return [f[0] + (r[0] - f[0]) * k, f[1] + (r[1] - f[1]) * k]; }
/* the middle of the band with its frame: t along it, n across it (toward the rear edge), hw the half width there */
function bandAt(t, m){ const [x, y] = bandPt(m, t, 0), a = bandPt(m, Math.max(0, t - .01), 0), b = bandPt(m, Math.min(1, t + .01), 0), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / d, ty = (b[1] - a[1]) / d;
  const r = cub(m.R, t), f = cub(m.F, t);
  return {x, y, tx, ty, nx:ty, ny:-tx, hw:Math.hypot(r[0] - f[0], r[1] - f[1]) / 2}; }
function along(m, n, t0 = .1, t1 = .74){ const out = []; for (let i = 0; i < n; i++) out.push(bandAt(t0 + (t1 - t0) * (n === 1 ? .5 : i / (n - 1)), m)); return out; }
function bandLine(m, s){ let d = ""; for (let i = 0; i <= 12; i++){ const p = bandPt(m, .02 + .96 * i / 12, s); d += (i ? " L" : "M") + f1(p[0]) + " " + f1(p[1]); } return d; }
const diamond = (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`;
function gemParts(G, x, y, r){ return [{d:diamond(x, y, r + .28), paint:"rim"}, {d:diamond(x, y, r), paint:"gem"}, {d:`M${x} ${y} L${x + r} ${y} L${x} ${y + r} Z`, paint:"gemS", alpha:.8}, {circle:[x - r * .3, y - r * .35, r * .22], paint:"white", alpha:.9}]; }
function collar(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {band:W.b, bandS:W.s, bandL:W.l, bandO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  /* the same piece drawn for any dog: the code never changes, only the connection points it is drawn against */
  const build = rid => {
    const m = mountOf(rid, "collar"), parts = [];
    /* band: ONE closed shape (compiled: the dog's footprint cut to its body outline, so it is flush on the fur), one outline, then shade and light inside it */
    const C = COMPILED[rid || "hero"].collar;
    if (rar >= 3) parts.push({d:C.base, stroke:true, paint:"glow", sw:2 * (LINE.contour + .5), alpha:.35});
    parts.push({d:C.base, stroke:true, paint:"bandO", sw:2 * LINE.contour}, {d:C.base, paint:"band"}, {d:C.shade, paint:"bandS", alpha:.8}, {d:C.light, paint:"bandL", alpha:.6});
    if (S.k === "rope"){ let d = ""; for (let i = 0; i < 6; i++){ const t = .1 + i * .15, a = bandPt(m, t - .02, -.78), b = bandPt(m, t + .02, .78); d += `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} `; } parts.push({d, stroke:true, paint:"bandO", sw:2 * LINE.interior, alpha:.8}); }
    const mid = bandAt(.42, m), socket = [mid.x, mid.y]; /* the gem is always centred on the band (GrumpyDingo: symmetry first); the fitting stays at the throat */
    if (S.studs){ along(m, S.studs).forEach((q, i) => { if (G && i === (S.studs - 1) / 2) return; /* the centre stud is the gem's socket */ const {x, y, hw} = q, k = hw / 1.1; parts.push({circle:[x, y, .6 * k], paint:"fitO"}, {circle:[x, y, .44 * k], paint:"fit"}, {circle:[x + .1, y + .15, .3 * k], paint:"fitS", alpha:.8}, {circle:[x - .15, y - .17, .14 * k], paint:"fitL"}); }); }
    /* the fitting at the throat, outline · base · shade · light. Buckle and knot sit in the band's own frame (u along it, v across it); the tag hangs straight down */
    const q = bandAt(.83, m), k = q.hw / 1.1, at = (u, v) => [q.x + q.tx * u * k + q.nx * v * k, q.y + q.ty * u * k + q.ny * v * k], H = q.hw / k; /* H = the band's half width in the frame's units */
    const box = (u0, u1, v0, v1) => "M" + [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map(p => f1(p[0]) + " " + f1(p[1])).join(" L") + " Z";
    if (S.fit === "buckle"){ const o = H - .12, i = o - LINE.interior; /* the frame stays inside the band: outline at the interior weight, never poking past the band's own edge */
      parts.push({d:box(-.62, .62, -o, o), paint:"fitO"}, {d:box(-.4, .4, -i, i), paint:"fit"}, {d:box(-.4, .4, -i, -.2), paint:"fitS", alpha:.8}, {d:box(-.4, .4, i - .3, i), paint:"fitL", alpha:.6}, {d:box(-.2, .2, -(i - .45), i - .45), paint:"band"}, {line:[at(0, -(i - .35)), at(0, i - .35)], sw:LINE.interior, paint:"fitO"}); }
    if (S.fit === "tag"){ const x = q.x, y = q.y + q.hw * .5, p = (dx, dy, mm = 1) => f1(x + dx * mm) + " " + f1(y + dy * mm), plate = mm => `M${p(-.55, .5, mm)} L${p(.55, .5, mm)} L${p(.75, 2.3, mm)} L${p(0, 2.7, mm)} L${p(-.75, 2.3, mm)} Z`;
      parts.push({d:plate(1), paint:"fitO"}, {d:plate(.8), paint:"fit"}, {d:`M${p(-.6, 1.9, .8)} L${p(.6, 1.9, .8)} L${p(.75, 2.3, .8)} L${p(0, 2.7, .8)} L${p(-.75, 2.3, .8)} Z`, paint:"fitS", alpha:.8}, {circle:[x, y + .95, .17], paint:"fitO"}); }
    if (S.fit === "knot"){ const r1 = Math.min(1.05 * k, q.hw * 1.05); parts.push({circle:[q.x, q.y, r1], paint:"bandO"}, {circle:[q.x, q.y, r1 * .76], paint:"band"}, {d:`M${f1(q.x - r1 * .76)} ${f1(q.y)} A${f1(r1 * .76)} ${f1(r1 * .76)} 0 0 0 ${f1(q.x + r1 * .76)} ${f1(q.y)} Z`, paint:"bandS", alpha:.8}, {circle:[q.x - .3, q.y - .3, .22], paint:"bandL", alpha:.8}, {d:`M${f1(q.x - .3)} ${f1(q.y + 1)} L${f1(q.x - .8)} ${f1(q.y + 2.6)} M${f1(q.x + .3)} ${f1(q.y + 1)} L${f1(q.x + .7)} ${f1(q.y + 2.5)}`, stroke:true, paint:"bandO", sw:2 * LINE.contour}); }
    if (G) parts.push(...gemParts(G, socket[0], socket[1], S.fit === "tag" ? .42 : Math.min(.52, mid.hw * .5)));
    if (I.c) parts.push({d:bandLine(m, .8), stroke:true, paint:"inf", sw:.35, alpha:.9});
    parts.hides = ["collar", "tag", "tag2"]; parts.hidesIn = "body"; /* and hides the dog's own collar and tag (in the body joint) while it is worn */
    parts.follow = "body"; /* hosted at the root so it draws over the torso piece, and follows the body */
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "k" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"collar", code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"root", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- the tail guard: a wrap, a sleeve or plates along the tail, under the rings ----------
   The tail hangs from the rump (14.5,17.5) to the tip (10.1,30.4), drawn in the "tail" joint so the guard wags with it.
   Same rules as the collar: even spacing along the centreline, the gem centred, the Smithy's brush. */
const f1 = v => (+v).toFixed(2);
/* a Catmull-Rom curve through pts, ten samples a segment (the same construction the rig uses for hero2's tail ribbon, so the guard hugs the real tail) */
function catmull(pts){ const P = [pts[0], ...pts, pts[pts.length - 1]], c = [];
  for (let i = 1; i < P.length - 2; i++){ const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]; for (let k = 0; k < 10; k++){ const t = k / 10, t2 = t * t, t3 = t2 * t; c.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  c.push(pts[pts.length - 1]); return c; }
const tailCache = new WeakMap();
function tailSamples(m){ let k = tailCache.get(m); if (k) return k; const c = catmull(m.pts), s = [0]; for (let i = 1; i < c.length; i++) s.push(s[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  const L = s[s.length - 1]; k = {c, s:s.map(v => v / L), L}; tailCache.set(m, k); return k; }
/* a point on the tail at t, with its frame: t along it, n across (toward the side that catches the light), w the tail's half width there */
function tailAt(t, m = MOUNTS.hero.tail){
  if (m.kind === "bezier"){ const [a, b, c, d] = m.c, u = 1 - t; const x = u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], y = u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1];
    const dx = 3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]), dy = 3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1]); const n = Math.hypot(dx, dy) || 1, l = m.light || 1;
    return {x, y, tx:dx / n, ty:dy / n, nx:l * dy / n, ny:l * -dx / n, w:(m.w[0] + (m.w[1] - m.w[0]) * t) / 2}; }
  const k = tailSamples(m), n = k.c.length; t = Math.min(1, Math.max(0, t)); let i = 0; while (i < n - 2 && k.s[i + 1] < t) i++;
  const f = (t - k.s[i]) / ((k.s[i + 1] - k.s[i]) || 1), x = k.c[i][0] + (k.c[i + 1][0] - k.c[i][0]) * f, y = k.c[i][1] + (k.c[i + 1][1] - k.c[i][1]) * f;
  const a = k.c[Math.max(0, i - 1)], b = k.c[Math.min(n - 1, i + 2)], dx = b[0] - a[0], dy = b[1] - a[1], h = Math.hypot(dx, dy) || 1, l = m.light || 1, u = (i + f) / (n - 1);
  return {x, y, tx:dx / h, ty:dy / h, nx:l * dy / h, ny:l * -dx / h, w:(m.w[0] + (m.w[1] - m.w[0]) * u) / 2}; }
/* a band across the tail from t0 to t1: the tail's own width plus `pad` each side */
/* nodes only where they are needed: about one a 0.6 units along the band, never two closer than that */
function tailLength(m = MOUNTS.hero.tail){ if (m.kind === "catmull") return tailSamples(m).L; let L = 0, p = tailAt(0, m); for (let i = 1; i <= 24; i++){ const q = tailAt(i / 24, m); L += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return L; }
const tailNodes = (t0, t1, m) => Math.max(1, Math.min(30, Math.ceil(Math.abs(t1 - t0) * tailLength(m) / .6)));
function tailBand(t0, t1, pad, m){ const n = tailNodes(t0, t1, m), L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n, m), w = q.w + pad; L.push([q.x + q.nx * w, q.y + q.ny * w]); R.push([q.x - q.nx * w, q.y - q.ny * w]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
function tailHalf(t0, t1, pad, upper, m){ const n = tailNodes(t0, t1, m), L = [], R = []; for (let i = 0; i <= n; i++){ const q = tailAt(t0 + (t1 - t0) * i / n, m), w = q.w + pad, sgn = upper ? 1 : -1; L.push([q.x + q.nx * w * sgn, q.y + q.ny * w * sgn]); R.push([q.x, q.y]); }
  return "M" + L.map(p => p.map(f1).join(" ")).join(" L") + " L" + R.reverse().map(p => p.map(f1).join(" ")).join(" L") + " Z"; }
/* the guard's links: `plates` plates over the seat with `gap` between them. The gaps are the ring slots (their centres), so the rings can never disagree with the guard. */
function guardLayout(m){ const [s0, s1] = m.seat, n = m.plates, p = (s1 - s0 - (n - 1) * m.gap) / n, plates = [], slots = [];
  for (let i = 0; i < n; i++){ const t0 = s0 + i * (p + m.gap); plates.push([t0, t0 + p]); if (i < n - 1) slots.push(t0 + p + m.gap / 2); }
  return {plates, slots, plate:p, gap:m.gap, seat:m.seat}; }
const ringSlots = rigId => guardLayout(mountOf(rigId, "tail")).slots;
const TAIL_STYLES = [
  {k:"sleeve", n:"Tail Sleeve", sleeve:true}, /* one sleeve over the whole seat */
  {k:"plated", n:"Tail Guard", plated:true, hard:true}, /* the links: plates with gaps; the gaps are the ring slots */
];
/* the old hero's ring slots, kept as the rings are not refitted yet (they are the old hero's guard gaps, from the same layout) */
const RING_SLOTS = ringSlots("hero");
function tailguard(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = picks.style ?? Math.floor(r() * TAIL_STYLES.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = TAIL_STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {m:W.b, mS:W.s, mL:W.l, mO:W.o, u:W.s, uS:W.o, uO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c}; /* the band is the material of the whole piece; the fitting is the accent */
  /* the same piece drawn for any dog: the code never changes, only the tail it is drawn against */
  const build = rid => {
    const m = mountOf(rid, "tail"), lay = guardLayout(m), [s0, s1] = m.seat, parts = [], OUT = 2 * LINE.contour;
    /* one link: an outline (one, under the fill, round joins), the fill, shade on the lower half, light on the upper */
    const link = (t0, t1, pad) => { const d = tailBand(t0, t1, pad, m); parts.push({d, stroke:true, paint:"mO", sw:OUT}, {d, paint:"m"}, {d:tailHalf(t0, t1, pad, false, m), paint:"mS", alpha:.8}, {d:tailHalf(t0 + (t1 - t0) * .15, t0 + (t1 - t0) * .4, pad, true, m), paint:"mL", alpha:.6}); };
    if (rar >= 3) parts.push({d:tailBand(s0 - .02, s1 + .02, .9, m), paint:"glow", alpha:.3});
    if (S.sleeve){ link(s0, s1, .22);
      [s0, s1].forEach(t => { const d = tailBand(t - .02, t + .02, .34, m); parts.push({d, stroke:true, paint:"fitO", sw:2 * LINE.detail}, {d, paint:"fit"}); }); } /* a trim at each end in the fitting metal */
    if (S.plated){ const strip = tailBand(s0, s1, .22, m); parts.push({d:strip, stroke:true, paint:"uO", sw:OUT}, {d:strip, paint:"u"}); /* a darker strip of the same material shows in the gaps */
      lay.plates.forEach(([t0, t1]) => { link(t0, t1, .28);
        /* fitting accents: a metal edge along the leading end of each plate and a rivet in the middle */
        parts.push({d:tailBand(t0, t0 + lay.plate * .26, .28, m), paint:"fit"}, {d:tailBand(t0, t0 + lay.plate * .12, .28, m), paint:"fitL", alpha:.6});
        const q = tailAt((t0 + t1) / 2, m); parts.push({circle:[q.x, q.y, .2 + LINE.detail], paint:"fitO"}, {circle:[q.x, q.y, .2], paint:"fit"}, {circle:[q.x - .07, q.y - .08, .07], paint:"fitL"}); }); }
    if (G){ const q = tailAt(lay.slots[1], m); parts.push(...gemParts(G, q.x, q.y, .5)); } /* the gem takes the middle ring slot */
    if (I.c){ let d = ""; for (let i = 0; i <= 5; i++){ const q = tailAt(s0 + (s1 - s0) * (.08 + .84 * i / 5), m); d += (i ? " L" : "M") + f1(q.x) + " " + f1(q.y); } parts.push({d, stroke:true, paint:"inf", sw:.35, alpha:.9}); }
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "t" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"tailguard", code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"tail", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- tail rings: each ring is its own piece (its own metal, gem, rarity, infusion) in one of the three ring slots ----------
   code: r<slot><fitting><band><gem><rarity><infusion>; the band is the ring's material, the fitting its metal edges. */
const RING_SLOT_NAMES = [{n:"Ring 1 · near the rump"}, {n:"Ring 2 · middle"}, {n:"Ring 3 · near the tip"}];
function tailring(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const slot = Math.min(2, Math.max(0, picks.slot ?? 1)), fit = picks.fit ?? Math.floor(r() * P.FIT.length), band = picks.band ?? Math.floor(r() * P.WRAP.length);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const F = P.FIT[fit], W = P.WRAP[band], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  /* the ring is the FITTING material (a metal, antler or wood); the BAND material is the gem's socket, shown as an empty setting when there is no gem */
  const pal = {m:F.b, mS:F.s, mL:F.l, mO:F.o, wB:W.b, wS:W.s, wL:W.l, wO:W.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  /* the same ring on any dog: it sits across the guard's slot (the slot comes from the guard's own gaps), its width is the mount's ring width */
  const build = rid => {
    const m = mountOf(rid, "tail"), t = ringSlots(rid)[slot], len = (m.ring / 2) / tailLength(m), pad = .48, q = tailAt(t, m), parts = [];
    if (rar >= 3) parts.push({d:tailBand(t - len * 2, t + len * 2, pad + .5, m), paint:"glow", alpha:.3});
    const d = tailBand(t - len, t + len, pad, m);
    parts.push({d, stroke:true, paint:"mO", sw:2 * LINE.contour}, {d, paint:"m"}, {d:tailHalf(t - len, t + len, pad, false, m), paint:"mS", alpha:.8}, {d:tailHalf(t - len * .6, t + len * .2, pad, true, m), paint:"mL", alpha:.6});
    /* a lighter rim on each side of the ring, in its own material */
    parts.push({d:tailBand(t - len, t - len * .7, pad, m), paint:"mL", alpha:.55}, {d:tailBand(t + len * .7, t + len, pad, m), paint:"mL", alpha:.55});
    if (I.c) parts.push({d:tailBand(t - len * 1.4, t - len * .9, pad + .05, m), paint:"inf", alpha:.9});
    /* the socket: the gem's diamond a little larger, in the band material, outline at the interior weight; empty (a recess) when there is no gem */
    const rs = .9, x = q.x, y = q.y, dia = rr => diamond(+f1(x), +f1(y), rr); /* numbers, not text, or the helper joins them as strings */
    parts.push({d:dia(rs), stroke:true, paint:"wO", sw:2 * LINE.interior}, {d:dia(rs), paint:"wB"}, {d:`M${f1(x - rs)} ${f1(y)} L${f1(x)} ${f1(y + rs)} L${f1(x + rs)} ${f1(y)} Z`, paint:"wS", alpha:.8}, {d:`M${f1(x - rs)} ${f1(y)} L${f1(x)} ${f1(y - rs)} L${f1(x + rs * .35)} ${f1(y - rs * .65)} L${f1(x - rs * .3)} ${f1(y)} Z`, paint:"wL", alpha:.6});
    if (G) parts.push(...gemParts(G, x, y, .42));
    else parts.push({d:dia(.42), paint:"wO", alpha:.55}, {circle:[x - .12, y - .14, .1], paint:"wL", alpha:.8});
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + F.n + " Tail Ring" + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "r" + [slot, fit, band, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"ring" + (slot + 1), slot, code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"tail", picks:{slot:RING_SLOT_NAMES[slot].n, material:F.n, setting:W.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
const ringKind = i => ({n:"Tail ring " + (i + 1), make:(seed, picks = {}, rigId) => tailring(seed, Object.assign({}, picks, {slot:i}), rigId), styles:[RING_SLOT_NAMES[i]], code:"r", noStyle:true, group:"Tail rings", slot:i});
/* ---------- the body armor: the base layer. A silhouette of the body from just under the collar, over the back to the rump, down the
   sides to a hem that stays ABOVE the leg roots (hips at y17, shoulders at y15), so the legs come out from under it and swing free.
   Its front-top edge IS the collar's lower edge, so the collar sits on it flush. Drawn in the body joint, first of everything;
   the near legs are drawn after the body, so they cross the armor the way legs cross a coat. (Reference: a dog in mail barding.) */
/* ---------- the torso piece ("Body armor"): drawn OVER the legs, UNDER the collar ----------
   It is one closed shape per dog, compiled from the dog's own body outline (tools/lens/compile_mounts.py): it starts under the collar's lower edge, follows the back and chest
   flush, ends at a rear edge in front of the tail, and its hem follows the belly line, so the legs' tops are under it and the legs come out below. It is hosted at the root
   (above every limb) and follows the body joint so it bobs with the body. Only one style so far (Hide); Scale and Plated come after Hide is right. */
const ARMOR_STYLES = [
  {k:"hide", n:"Hide Armor"},
];
function armor(seed, picks = {}, rigId = "hero"){
  if (!P) throw new Error("GEAR.init(SMITHY) first");
  const r = rngOf(seed);
  const band = picks.band ?? Math.floor(r() * P.WRAP.length), fit = picks.fit ?? Math.floor(r() * P.FIT.length), style = Math.min(ARMOR_STYLES.length - 1, picks.style ?? 0);
  const rar = picks.rar ?? Math.min(RARS.length - 1, Math.floor(Math.pow(r(), 2.2) * RARS.length)), gem = picks.gem ?? (rar >= 3 ? 1 + Math.floor(r() * (P.GEMS.length - 1)) : 0), inf = picks.inf ?? (rar >= 2 && r() < .5 ? 1 + Math.floor(r() * (INFS.length - 1)) : 0);
  const W = P.WRAP[band], F = P.FIT[fit], S = ARMOR_STYLES[style], G = P.GEMS[gem], I = INFS[inf], R = RARS[rar];
  const pal = {m:W.b, mS:W.s, mL:W.l, mO:W.o, fit:F.b, fitS:F.s, fitL:F.l, fitO:F.o, gem:G ? G.b : F.b, gemS:G ? G.s : F.s, gemL:G ? G.l : F.l, rim:"#1a1020", white:"#ffffff", glow:R.c, inf:I.c || R.c};
  const build = rid => {
    const T = (COMPILED[rid || "hero"] || {}).torso; if (!T) throw new Error("no compiled torso for " + rid); const parts = [];
    if (rar >= 3) parts.push({d:T.base, stroke:true, paint:"glow", sw:2 * (LINE.contour + .5), alpha:.3});
    /* the hide: one shape, one outline, then shade along the hem and light along the back */
    parts.push({d:T.base, stroke:true, paint:"mO", sw:2 * LINE.contour}, {d:T.base, paint:"m"}, {d:T.shade, paint:"mS", alpha:.8}, {d:T.light, paint:"mL", alpha:.6});
    /* lacing: a seam down the back, stitched across in the fitting material */
    parts.push({d:T.seam, stroke:true, paint:"fitO", sw:2 * LINE.detail}, {d:T.ticks, stroke:true, paint:"fit", sw:2 * LINE.detail});
    /* the girth strap behind the shoulder: one outline, a fill, two rivets */
    parts.push({d:T.strap, stroke:true, paint:"fitO", sw:2 * LINE.detail}, {d:T.strap, paint:"fit"});
    T.rivets.forEach(([x, y]) => parts.push({circle:[x, y, .17 + LINE.detail], paint:"fitO"}, {circle:[x, y, .17], paint:"fit"}, {circle:[x - .05, y - .06, .06], paint:"fitL"}));
    if (G) parts.push(...gemParts(G, T.gem[0], T.gem[1], .5)); /* the gem is set in the middle of the girth strap */
    if (I.c) parts.push({d:T.seam, stroke:true, paint:"inf", sw:.3, alpha:.9});
    parts.follow = "body"; /* hosted at the root, above the legs, and follows the body */
    return parts;
  };
  const name = (R.adj ? R.adj + " " : "") + (I.pre ? I.pre + " " : "") + W.n + " " + S.n + (G ? " with " + G.n : "") + (I.suf ? " " + I.suf : "");
  const code = "c" + [band, fit, style, gem, rar, inf].map(n => n.toString(36)).join("");
  return {kind:"armor", code, name, rk:R.k, rar, parts:build(rigId), partsFor:build, rig:rigId, palette:pal, joint:"root", picks:{band:W.n, fitting:F.n, style:S.n, gem:G ? G.n : "none", rarity:R.n, infusion:I.n}};
}
/* ---------- registry: kinds in LAYER order (what goes on first is first) ---------- */
const KINDS = {armor:{n:"Body armor", make:armor, styles:ARMOR_STYLES, code:"c"}, tailguard:{n:"Tail guard", make:tailguard, styles:TAIL_STYLES, code:"t"}, ring1:ringKind(0), ring2:ringKind(1), ring3:ringKind(2), collar:{n:"Collar", make:collar, styles:STYLES, code:"k"}};
function decode(code, rigId){ if (!code) return null; let K = Object.values(KINDS).find(k => k.code === code[0]); if (!K) return null; if (code[0] === "r"){ K = KINDS["ring" + (Math.min(2, parseInt(code[1], 36) || 0) + 1)]; const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {fit:cl(v[1], P.FIT.length), band:cl(v[2], P.WRAP.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}, rigId); } const v = code.slice(1).split("").map(c => parseInt(c, 36) || 0), cl = (x, n) => Math.min(n - 1, Math.max(0, x)); return K.make(code, {band:cl(v[0], P.WRAP.length), fit:cl(v[1], P.FIT.length), style:cl(v[2], K.styles.length), gem:cl(v[3], P.GEMS.length), rar:cl(v[4], RARS.length), inf:cl(v[5], INFS.length)}, rigId); }
return {init, MOUNTS, collar, tailguard, tailring, armor, decode, KINDS, STYLES, TAIL_STYLES, RING_SLOT_NAMES, RING_SLOTS, ringSlots, guardLayout, tailAt, get PAL(){ return P; }, get RARS(){ return RARS; }, get INFS(){ return INFS; }};
})();
if (typeof module !== "undefined") module.exports = GEAR;
