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
return {TYPES,RARS,INFS,VARS,encode,decode,baseOf:c=>{const w=typeof c==="string"?decode(c):c;if(!w) return "";const t=TYPES[w.type];return t.name(resolveParts(w),t.mats[w.mat]).replace(/\s+/g," ").trim();},nameOf:c=>{const w=typeof c==="string"?decode(c):c;return w?nameOf(w):"";},render,svgDoc,dataUrl,forWeapon,recode};
