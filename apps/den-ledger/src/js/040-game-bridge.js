/* ---------- game bridge ---------- */
const FX_CSS=`.fx-rise,.fx-fall,.fx-drift,.fx-twinkle,.fx-smoke{transform-box:fill-box;transform-origin:center}
.fx-rays{transform-box:view-box;transform-origin:0 0;animation:spin 22s linear infinite}
.fx-glint{animation:glint 3.4s ease-in-out infinite}
@keyframes glint{0%{transform:translate(-170px,0)}55%,100%{transform:translate(170px,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fx-pulse{animation:pulse 2.6s ease-in-out infinite}@keyframes pulse{50%{opacity:.55}}
.fx-rise{animation:rise 2.2s ease-out infinite;opacity:0}@keyframes rise{0%{opacity:0;transform:translate(0,0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),-34px) scale(.25)}}
.fx-fall{animation:fall 3.6s linear infinite;opacity:0}@keyframes fall{0%{opacity:0;transform:translate(0,-6px) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),30px) rotate(180deg)}}
.fx-drift{animation:drift 3.4s ease-in-out infinite;opacity:0}@keyframes drift{0%{opacity:0;transform:translate(0,0) rotate(0)}20%{opacity:.95}100%{opacity:0;transform:translate(var(--dx,14px),26px) rotate(220deg)}}
.fx-twinkle{animation:twinkle 2.4s ease-in-out infinite}@keyframes twinkle{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1)}}
.fx-smoke{animation:smoke 3s ease-out infinite;opacity:0}@keyframes smoke{0%{opacity:0;transform:translate(0,0) scale(.5)}25%{opacity:.7}100%{opacity:0;transform:translate(var(--dx,0px),-30px) scale(1.8)}}
.fx-bolt{animation:bolt 1.3s steps(1) infinite}.fx-bolt.b2{animation-delay:-.65s}
@keyframes bolt{0%{opacity:1}12%{opacity:.2}18%{opacity:1}40%{opacity:0}62%{opacity:.9}70%{opacity:0}100%{opacity:0}}`;
const STATIC_CSS=`*{animation:none!important}.fx-p{display:none}.fx-twinkle{opacity:.8}.fx-bolt.b2{opacity:0}`;
/* mode: full = animated with particles, live = animated without particles, still = no motion */
function svgDoc(w,mode){
  let svg=render(w,{small:mode!=="full",still:mode==="still"});
  svg=svg.replace(/^<svg class="wsvg" /,'<svg ').replace(/>/,`><style>${FX_CSS}${mode==="still"?STATIC_CSS:""}</style>`);
  return svg;
}
const CACHE=new Map();
function dataUrl(code,mode){
  const key=code+"|"+mode; let u=CACHE.get(key); if(u) return u;
  const w=decode(code); if(!w) return "";
  u="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgDoc(w,mode));
  if(CACHE.size>700) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(key,u); return u;
}
/* weapon name text -> type (and a fitting part where it matters) */
const HINTS=[
  [/staff|wand|scepter|rod|aurora/i,{type:10}],
  [/ball|snowball|launcher/i,{type:4}],
  [/frisbee|disc|star\b|boomerang|ring|wreath|flake/i,{type:5}],
  [/whip|rope|scarf|leash|tug/i,{type:6}],
  [/sling|acorn|rock|pebble|stone|spore/i,{type:7}],
  [/bone|club|femur|antler/i,{type:8}],
  [/claw|talon/i,{type:9}],
  [/bow\b|bow$|longbow/i,{type:11}],
  [/spoon|shovel|spade|scoop|trowel/i,{type:12}],
  [/pick/i,{type:2,p1:3}],[/hammer|maul|mallet/i,{type:2,p1:2}],[/axe|hatchet|cleaver/i,{type:2,p1:0}],[/trident|spear|lance|tine/i,{type:2,p1:4}],[/glaive|scythe|sickle/i,{type:2,p1:5}],
  [/dagger|knife|fang|icicle|shiv/i,{type:1}],
  [/sword|blade|saber|sabre|katana/i,{type:0}],
  [/stick|twig|branch|log|pine|heartwood|wood/i,{type:3}],
];
const ZONE_MATS={meadow:["Oak","Birch","Iron","Bronze","Classic","Bone","Red","Yellow","Cream","Sunsteel"],forest:["Pine","Oak","Mossjade","Dark wood","Green","Old Bone","Emberstone","Cherry","Bronze"],moon:["Moonsilver","Frostglass","Ghostwood","Ghost Bone","Sky","Grape","Steel","Obsidian","Purple","Glow","Midnight"]};
const INF_CHANCE=[0,.05,.15,.35,.6,1,1,1,1];
function forWeapon(o){
  rng=seeded(String(o.seed||Math.random()));
  const pick=n=>Math.floor(rng()*n);
  let hint={};for(const [re,h] of HINTS){if(re.test(o.name||"")){hint=h;break;}}
  if(o.type!==undefined) hint={type:o.type,p1:o.p1};
  const w={type:hint.type!==undefined?hint.type:pick(TYPES.length)};
  for(const k of SLOTS.slice(1)) w[k]=pick(slotList(w,k).length);
  if(hint.p1!==undefined){const L=slotList(w,"p1");const i=L.findIndex((it,ix)=>(it.v!==undefined?it.v:ix)===hint.p1);if(i>=0) w.p1=i;}
  const zm=o.mats||ZONE_MATS[o.zone]; if(zm&&(o.mats||rng()<.65)){const L=TYPES[w.type].mats.map((m,i)=>[m.n,i]).filter(([n])=>zm.includes(n));if(L.length) w.mat=L[pick(L.length)][1];}
  if(rng()<.5) w.gem=0;
  w.rar=Math.max(0,Math.min(RARS.length-1,o.rar|0));
  w.inf=rng()<INF_CHANCE[w.rar]?1+pick(INFS.length-1):0;
  if(o.inf!==undefined){const k=INFS.findIndex(x=>x.n===o.inf);w.inf=k>=0?k:0;}
  else if(w.inf&&o.infs&&rng()<.7){const L=INFS.map((x,i)=>[x.n,i]).filter(([n])=>o.infs.includes(n));if(L.length) w.inf=L[pick(L.length)][1];}
  w.v=o.v|0;
  rng=Math.random;
  return encode(w);
}
function recode(code,patch){const w=decode(code);if(!w) return code;Object.assign(w,patch);return encode(w);}
return {PAL:{METAL,WOOD,BONE,BALL,PLASTIC,ROPE2,FIT,WRAP,GEMS},TYPES,RARS,INFS,VARS,encode,decode,baseOf:c=>{const w=typeof c==="string"?decode(c):c;if(!w) return "";const t=TYPES[w.type];return t.name(resolveParts(w),t.mats[w.mat]).replace(/\s+/g," ").trim();},nameOf:c=>{const w=typeof c==="string"?decode(c):c;return w?nameOf(w):"";},render,svgDoc,dataUrl,forWeapon,recode};

})();

let devOn = false; try { devOn = localStorage.getItem("dengame-dev") === "1"; } catch(e){}


const KEY = "den-game-v1";
let state = null, dbRef = null, mode = "loading", pending = 0, chain = Promise.resolve();
const $ = s => document.querySelector(s);
const app = $("#app"), statusEl = $("#status");

/* helpers */
const r2 = n => Math.round((Number(n)||0)*100)/100;
const money = n => (n<0?"−":"") + "$" + Math.abs(r2(n)).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const pd = s => { const [y,m,d] = String(s).split("-").map(Number); return new Date(y, m-1, d); };
const iso = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const todayIso = () => iso(new Date());
function setStatus(t, err){ statusEl.textContent = t; statusEl.classList.toggle("err", !!err); }

const SAVE_EPOCH = 2; /* v0.36: one-time fresh start for the new Inventory (pre-release) */
function blank(){
  return { epoch:SAVE_EPOCH, treats:{bones:0, earned:0}, collection:{owned:{}, sets:{}, forages:0}, events:[] };
}
function norm(s){
  const b = blank();
  s = s && typeof s === "object" ? s : {};
  if ((s.epoch || 0) < SAVE_EPOCH) s = b;
  for (const k of Object.keys(b)) if (s[k] === undefined) s[k] = b[k];
  s.treats = Object.assign({bones:0, earned:0}, s.treats||{});
  if (typeof s.treats.earned !== "number") s.treats.earned = s.treats.bones;
  s.collection = Object.assign({owned:{}, sets:{}, forages:0}, s.collection||{});
  if (s.hunt && s.hunt.reserve === 200 && !s.reserveFix){ s.hunt.reserve = 0; } s.reserveFix = true;
  return s;
}

/* saving */
const BACKUP_KEY = "den-game-backup";
let latestSnap = null, flushing = false, failCount = 0, lastMsg = "", lastLocalSave = 0, extSnap = null;
function save(msg, quiet){
  state.savedAt = Math.max(Date.now(), (state.savedAt||0) + 1); lastLocalSave = state.savedAt;
  const snapshot = JSON.parse(JSON.stringify(state));
  if (!quiet) render();
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot)); } catch(e){}
  if (mode === "db"){
    latestSnap = snapshot; lastMsg = msg || "Saved"; pending = 1; if (!quiet) setStatus("Saving…"); flush();
  } else {
    try { localStorage.setItem(KEY, JSON.stringify(snapshot)); if (!quiet) setStatus((msg || "Saved") + " on this device"); }
    catch(e){ setStatus("Couldn't save on this device", true); }
  }
}
function flush(){
  if (flushing || !latestSnap || !dbRef) return; flushing = true; const snap = latestSnap;
  Promise.resolve().then(() => dbRef.set(snap)).then(() => {
    flushing = false; failCount = 0;
    if (latestSnap !== snap){ flush(); return; }
    latestSnap = null; pending = 0; setStatus(lastMsg);
    if (extSnap && extSnap.savedAt > lastLocalSave){ const ext = extSnap; extSnap = null; state = norm(ext); render(); save("Synced a change from the den's storage"); } else extSnap = null;
  }).catch(e => {
    if (e && ["invalid_argument","not_granted","capability_disabled","capability_removed","revoked","transform_error"].includes(e.code)){ flushing = false; mode = "local"; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(_){} setStatus("Saving on this device only"); return; }
    flushing = false; failCount++; const wait = Math.min(30000, 2000 * failCount);
    setStatus("Storage hiccup. Your changes are safe on this device, retrying in " + Math.round(wait/1000) + "s…", true);
    setTimeout(flush, wait);
  });
}
window.addEventListener("online", () => { failCount = 0; flush(); });
window.addEventListener("beforeunload", e => { if (latestSnap){ e.preventDefault(); e.returnValue = ""; } });

/* math */
let jarGrew = 0, advAsk = null, jarAsk = null;
/* render */
/* v0.40: every outside asset or library gets a line here (what, who, licence, link). Add to it whenever we use something. */
const CREDITS = [
  ["Design", "GrumpyDingo", "", ""],
  ["Programming, dingo art, weapon art", "Firefly", "", ""],
  ["UI icons", "game-icons.net: Lorc, Delapouite and contributors", "CC BY 3.0", "https://game-icons.net"],
  ["Emoji art", "Microsoft Fluent Emoji", "MIT", "https://github.com/microsoft/fluentui-emoji"],
  ["Field renderer", "PixiJS", "MIT", "https://github.com/pixijs/pixijs"],
  ["Emoji art", "Google Noto Emoji", "Apache 2.0", "https://github.com/googlefonts/noto-emoji"],
  ["Emoji art", "Blobmoji", "Apache 2.0", "https://github.com/C1710/blobmoji"],
  ["Emoji art", "Twemoji by X Corp and contributors", "CC BY 4.0", "https://github.com/jdecked/twemoji"],
  ["Fonts", "Spectral SC, Barlow, Barlow Condensed (Google Fonts)", "SIL Open Font License", "https://fonts.google.com"],
  ["Weather effects and thunder sound (adapted)", "web-weather by greywen", "MIT", "https://github.com/greywen/web-weather"],
  ["Lighting ideas", "pixi-lights-and-shadows by Dominic Branchaud", "MIT", "https://github.com/dobrado76/pixi-lights-and-shadows"],
  ["Particle effects", "Proton by drawcall", "MIT", "https://github.com/drawcall/Proton"]
];
function creditsSection(){ return `<footer aria-labelledby="credits-h"><h2 id="credits-h" class="sr">Credits</h2><p class="small">Made with love by <b>GrumpyDingo</b> and <b>Firefly</b>. 🐾✨</p><ul class="credlist">${CREDITS.map(([what, who, lic, url]) => `<li><b>${esc(what)}</b><span>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(who)}</a>` : esc(who)}${lic ? ` · ${esc(lic)}` : ""}</span></li>`).join("")}</ul></footer>`; }
/* v0.42: the boot screen waits for the main art (published build loads it separately), with a safety timeout */
function bootOut(){ if (window.__artReady === false && !bootOut.forced){ window.__bootWait = bootOut; if (!bootOut.t) bootOut.t = setTimeout(() => { bootOut.forced = true; bootOut(); }, 12000); return; }
  document.body.classList.remove("booting"); const bt = document.getElementById("boot"); if (bt){ bt.classList.add("out"); setTimeout(() => bt.remove(), 600); } }
function render(){
  if (!state){ return; } if (typeof fkSetup === "function" && !render.fkDone){ render.fkDone = true; fkSetup(); setTimeout(bootOut, 60); pixiBoot(); }
  $("#hero-in").innerHTML = "";
  { fkRenderAll(); const hero = document.querySelector("section.hero"); if (hero){ hero.style.display = ""; hero.classList.toggle("clean", true); } const skb = $("#skills"); if (skb){ skb.style.display = ""; renderSkillBar(); renderSkillBarHome(); } afterRender(); return; }

}

let prevBones = null, boneGain = false;
function earn(k){
  const before = levelFrom(state.treats.earned||0).lvl;
  state.treats.bones += k; state.treats.earned = (state.treats.earned||0) + k; boneGain = true;
  floatText("+" + k + " 🦴"); sfx("coin");
  const after = levelFrom(state.treats.earned).lvl;
  if (after > before) pendingLevel = after;
}

function burst(card){
  if (calm) return; const b = document.createElement("div"); b.className = "burst";
  for (let k=0;k<16;k++){ const a = (k/16)*Math.PI*2, d = 60+Math.random()*50;
    const el = k%2 ? document.createElement("i") : document.createElementNS("http://www.w3.org/2000/svg","svg");
    if (!(k%2)) el.innerHTML = '<use href="#paw"/>';
    el.style.setProperty("--dx", (Math.cos(a)*d).toFixed(0)+"px"); el.style.setProperty("--dy", (Math.sin(a)*d-20).toFixed(0)+"px");
    el.style.setProperty("--r", (Math.random()*180-90).toFixed(0)+"deg"); el.style.animationDelay = (0.7+Math.random()*0.12).toFixed(2)+"s";
    b.appendChild(el); }
  card.appendChild(b);
}
/* motion */
const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
let shownLeft = null, introDone = false, flash = null, tweenId = 0;
function afterRender(){
  if (boneGain){ const c = $("#bone-count"); if (c && !calm){ c.classList.remove("gain"); void c.offsetWidth; c.classList.add("gain"); } boneGain = false; chipPop = true; }
  prevBones = state.treats.bones;
  renderHud();
  startBattle(); syncGhosts();
  { const d = $("#dingo"), tier = gameTier(); if (d) d.className = "dingo-run tier-" + tier + (d.classList.contains("happy") ? " happy" : ""); applyCosmetics(); applyWardrobe(); applyBandana(); }
  if (chipPop){ chipPop = false; const c = $("#chip-bones"); if (c && !calm){ c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }
  jarGrew = 0; puffTick = false; stashBump = null; medJust = null; freshCard = null;
  setTimeout(levelUpCheck, 350);
  if (!introDone){ app.classList.add("first-load"); setTimeout(() => app.classList.remove("first-load"), 900); setTimeout(() => { introDone = true; }, 0); }
  if (flash){ const row = document.querySelector('[data-row="'+flash+'"]'); if (row) row.classList.add("pop"); flash = null; }
}
function happy(){ const d = $("#dingo"); d.classList.remove("happy"); void d.offsetWidth; d.classList.add("happy"); setTimeout(()=>d.classList.remove("happy"), 1500); }
function makeFlies(){
  const box = $("#flies"); if (!box) return;
  for (let i=0;i<14;i++){
    const s = document.createElement("span");
    s.style.left = (4+Math.random()*92)+"%"; s.style.top = (8+Math.random()*62)+"%";
    s.style.setProperty("--d", (7+Math.random()*7).toFixed(1)+"s");
    s.style.setProperty("--dl", (-Math.random()*12).toFixed(1)+"s");
    s.style.setProperty("--x", (Math.random()*60-30).toFixed(0)+"px");
    s.style.setProperty("--y", (Math.random()*-40-6).toFixed(0)+"px");
    box.appendChild(s);
  }
}
makeFlies();

/* puffs */
let puffTick = false;
/* log paging */
