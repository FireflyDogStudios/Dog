/* ===== Halloween treats (non-craftable consumables) ===== */
const TREATS = {
  pupcake:{n:"Pupcake", i:"🧁", d:"+30% candy", fx:"candy", v:0.3, min:20},
  kibble:{n:"Crunchy Kibble", i:"🌽", d:"+20% attack speed", fx:"spd", v:0.2, min:15},
  broth:{n:"Warm Bone Broth", i:"🍵", d:"+25% damage", fx:"dmg", v:0.25, min:20},
  apple:{n:"Apple Chew", i:"🍎", d:"+40% luck", fx:"luck", v:0.4, min:15},
  jerky:{n:"Pepper Jerky", i:"🌶️", d:"+15% crit chance", fx:"crit", v:0.15, min:10},
  brew:{n:"Fizzy Spring Water", i:"🧪", d:"+50% essence finds", fx:"ess", v:0.5, min:20},
  moonmilk:{n:"Moon Milk", i:"🥛", d:"+1 creature on the field", fx:"crowd", v:1, min:15},
  biscuit:{n:"Spooky Sprinkle Biscuit", i:"🍪", d:"Books drop twice as often", fx:"tome", v:1, min:20}
};
function treatMods(k){ const T = TREATS[k]; return T.fx === "crit" ? [{stat:"crit", add:T.v}] : [{stat:T.fx, mul:1 + T.v}]; }
function treatState(){ const H = huntState(); H.treatInv = H.treatInv || {}; return H; }
function treatActive(fx){ if (devOn){ return Object.values(TREATS).filter(T => T.fx === fx).reduce((a,T) => Math.max(a, T.v), 0); } if (!state || !state.hunt) return 0; let s = 0; SE.active(DINGO).forEach(({s:i}) => { if (i.id.startsWith("treat-") && i.data && i.data.fx === fx) s += i.data.v; }); return s; }
function giveTreat(k, n, quiet){ const H = treatState(); H.treatInv[k] = (H.treatInv[k]||0) + (n||1); if (!quiet) toast(TREATS[k].i + " You got " + (n > 1 ? n + "× " : "a ") + TREATS[k].n + "! It's in your Bag."); }
function randomTreat(){ const ks = Object.keys(TREATS); return ks[Math.floor(Math.random()*ks.length)]; }
function eatTreat(k){ const H = treatState(); if (!(H.treatInv[k] > 0)) return; H.treatInv[k]--; SE.apply(DINGO, "treat-" + k, {dur:TREATS[k].min * 60, data:{fx:TREATS[k].fx, v:TREATS[k].v}, mods:treatMods(k)}); sfx("crunch"); toast(TREATS[k].i + " Nom! " + TREATS[k].d + " for " + TREATS[k].min + " minutes."); }
function treatChips(){ const H = state.hunt; if (!H) return ""; const on = {}; SE.active(DINGO).forEach(({s}) => { if (s.id.startsWith("treat-")) on[s.id.slice(6)] = s.until; }); return Object.entries(on).filter(([k,u]) => u > Date.now() && TREATS[k]).map(([k,u]) => `<span class="chip" title="${esc(TREATS[k].n)}: ${esc(TREATS[k].d)}">${emoImg(TREATS[k].i)} ${Math.ceil((u - Date.now())/60000)}m</span>`).join(""); }
/* ===== Kindly Halloween visitors ===== */
