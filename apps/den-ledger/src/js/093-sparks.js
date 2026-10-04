/* ===================== v0.44 Den Sparks (Proton) =====================
   Every hit spark, crit burst, kill puff, weapon trail and loot pickup goes through ONE particle system:
   Proton by drawcall (MIT, https://github.com/drawcall/Proton), loaded as proton.web.min.js next to the page.
   Effects are named presets in PFX_PRE, so a new effect is a new line in the table, not new code.
   If Proton isn't there (or effects are Off), the old simple sparks still play. Drawn on one canvas in the scene,
   in logical stage units, above the creatures. */
const PFX = {p:null, cv:null, r:null};
const PFX_PRE = {
  hit:   {n:[5, 8],   life:[.16, .3],  v:[1.4, 3.0], r:[1.0, 2.2], a:[1, 0],   s:[1, .3]},
  crit:  {n:[14, 20], life:[.22, .42], v:[2.4, 5.0], r:[1.4, 3.0], a:[1, 0],   s:[1.3, .1], ring:true},
  poof:  {n:[9, 13],  life:[.35, .6],  v:[.5, 1.4],  r:[2.6, 5.2], a:[.55, 0], s:[1, 1.9], g:-.35, col:"#e6e6f0"},
  trail: {n:[1, 1],   life:[.22, .36], v:[0, .25],   r:[2, 2],     a:[.9, 0],  s:[1, .25]},
  glint: {n:[1, 2],   life:[.4, .6],   v:[.2, .6],   r:[1.2, 2],   a:[1, 0],   s:[1.4, .2]},
  pickup:{n:[8, 12],  life:[.35, .6],  v:[.8, 2.2],  r:[1.0, 2.2], a:[1, 0],   s:[1, .2], g:-1.2},
  ember: {n:[3, 5],   life:[.4, .7],   v:[.3, .9],   r:[1.0, 2.0], a:[1, 0],   s:[1, .3], g:-1.4, col:"#ff8a3a"},
  bolt:  {n:[16, 24], life:[.25, .5],  v:[1.5, 4.0], r:[1.0, 2.2], a:[1, 0],   s:[1, .2], col:"#dfeaff", g:2},
  ring:  {n:[18, 18], life:[.18, .22], v:[5.2, 5.6], r:[1.4, 1.6], a:[.9, 0],  s:[1, 1]}
};
function pfxReady(){ if (PFX.p) return true; if (typeof Proton === "undefined" || !fxOn()) return false; const hero = document.querySelector("section.hero"); if (!hero) return false;
  const cv = document.createElement("canvas"); cv.className = "fxc"; cv.id = "fx-part"; cv.setAttribute("aria-hidden", "true"); cv.style.zIndex = 4; hero.appendChild(cv); PFX.cv = cv;
  PFX.p = new Proton(); const r = new Proton.CanvasRenderer(cv);
  /* clear in raw pixels, then draw in stage units with additive light */
  r.onProtonUpdate = function(){ const c = this.context; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.element.width, this.element.height); c.setTransform(FX.k || 1, 0, 0, FX.k || 1, 0, 0); c.globalCompositeOperation = "lighter"; };
  PFX.p.addRenderer(r); PFX.r = r; return true; }
function pfxHex(c){ if (!c) return "#ffffff"; if (c[0] === "#") return c.length === 4 ? "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(0, 7); const m = String(c).match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return "#ffffff"; return "#" + m.slice(0, 3).map(v => (+v | 0).toString(16).padStart(2, "0")).join(""); }
/* One persistent emitter per effect + colour (pooled particles, no emitter churn even at high attack speeds).
   pfx("hit", x, y, color) bursts at a point; returns false when the old effects should play instead. */
function pfxEm(kind, cols, rr){ const key = kind + "|" + cols.join(",") + "|" + (rr || ""); PFX.em = PFX.em || new Map(); let e = PFX.em.get(key); if (e) return e;
  if (PFX.em.size > 80){ const k0 = PFX.em.keys().next().value; PFX.em.delete(k0); }
  const P = PFX_PRE[kind] || PFX_PRE.hit, S = (a, b) => new Proton.Span(a, b); e = new Proton.Emitter();
  e.addInitialize(new Proton.Mass(1)); e.addInitialize(new Proton.Life(P.life[0], P.life[1]));
  e.addInitialize(new Proton.Radius(rr || P.r[0], rr || P.r[1])); e.addInitialize(new Proton.Velocity(S(P.v[0], P.v[1]), S(0, 360), "polar"));
  e.addBehaviour(new Proton.Alpha(P.a[0], P.a[1])); e.addBehaviour(new Proton.Scale(P.s[0], P.s[1])); e.addBehaviour(new Proton.Color(cols.length > 1 ? cols : cols[0])); if (P.g) e.addBehaviour(new Proton.Gravity(P.g));
  PFX.p.addEmitter(e); e.stop(); PFX.em.set(key, e); return e; }
function pfx(kind, x, y, col, o){ if (!pfxReady()) return false; const P = PFX_PRE[kind]; if (!P) return false; o = o || {};
  const cols = Array.isArray(col) ? col.map(pfxHex) : [pfxHex(col || P.col)], e = pfxEm(kind, cols, o.r), n = o.n || Math.round(P.n[0] + Math.random() * (P.n[1] - P.n[0]));
  e.p.x = x; e.p.y = y; for (let i = 0; i < n; i++) e.createParticle();
  if (P.ring){ const rg = pfxEm("ring", cols); rg.p.x = x; rg.p.y = y; for (let i = 0; i < 18; i++) rg.createParticle(); }
  return true; }
function pfxFrame(){ if (!PFX.p) return; if (!fxOn()){ PFX.cv.style.display = "none"; return; } PFX.cv.style.display = ""; if (PFX.cv.width !== FX.w || PFX.cv.height !== FX.h){ PFX.cv.width = FX.w || 1; PFX.cv.height = FX.h || 1; } PFX.p.update(); }

