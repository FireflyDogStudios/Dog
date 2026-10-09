/* ================= page UI ================= */
const $=s=>document.querySelector(s);
const rnd=n=>Math.floor(Math.random()*n);
function pickRar(boost){if(boost) return 3+rnd(5);const t=RARS.reduce((a,r)=>a+r.w,0);let x=Math.random()*t;for(let i=0;i<RARS.length;i++){if((x-=RARS[i].w)<=0)return i;}return 0;}
function roll(boost,type){
  const w={type:type??rnd(TYPES.length)};
  for(const k of SLOTS.slice(1)) w[k]=rnd(slotList(w,k).length);
  if(Math.random()<.45) w.gem=0;
  w.rar=pickRar(boost);
  w.inf=Math.random()<(boost?.85:.35)?1+rnd(INFS.length-1):0;
  const v=Math.random(); w.v=v<(boost?.12:.03)?2:v<(boost?.3:.1)?1:0;
  return w;
}
function clampTo(w){for(const k of SLOTS){const n=slotList(w,k).length;if(w[k]>=n) w[k]=n-1;}return w;}
let W=decode("c311202130150")||roll(true,3);
const LABEL={type:"Type",mat:"Material",fit:"Fittings",wrap:"Wrap / cloth",gem:"Gem",inf:"Infusion",rar:"Rarity",v:"Variant"};
function dials(){
  const t=TYPES[W.type];
  $("#dials").innerHTML=SLOTS.map((k,i)=>{
    const L=slotList(W,k), it=L[W[k]], lab=/^p\d$/.test(k)?t.parts[+k[1]-1].n:LABEL[k];
    const dot=k==="rar"?`<span class="dot" style="background:${it.c}"></span>`:k==="inf"&&it.c?`<span class="dot" style="background:${it.c}"></span>`:(k==="mat"||k==="fit"||k==="wrap")&&it.b?`<span class="dot" style="background:${it.b};box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`:"";
    const hot=["inf","rar","v"].includes(k), part=/^p\d$/.test(k)||k==="type";
    return `<div class="dial${hot?" hot":""}${part?" part":""}"><span class="lab">${lab}</span><button type="button" data-k="${k}" data-d="-1" aria-label="Previous ${lab}">‹</button><span class="val">${dot}${it.n}</span><button type="button" data-k="${k}" data-d="1" aria-label="Next ${lab}">›</button></div>`;
  }).join("");
}
$("#dials").onclick=e=>{const b=e.target.closest("button");if(!b)return;const k=b.dataset.k,n=slotList(W,k).length;W[k]=(W[k]+(+b.dataset.d)+n)%n;if(k==="type") clampTo(W);show();};
function show(){
  $("#big").innerHTML=render(W); const n=$("#name"); n.textContent=nameOf(W); n.className="wname rn-"+RARS[W.rar].k;
  const t=TYPES[W.type];
  $("#meta").textContent=`${RARS[W.rar].n} · ${t.n} · ${t.verb}${W.inf?" · "+INFS[W.inf].n+" infused":""}${W.v?" · "+VARS[W.v].n:""}`;
  $("#codeIn").value=encode(W); $("#codeMsg").textContent="Paste any code and press Enter to load it."; dials();
  document.querySelectorAll("#types .tile").forEach(x=>x.setAttribute("aria-pressed",String(+x.dataset.t===W.type)));
}
$("#codeIn").addEventListener("keydown",e=>{if(e.key!=="Enter")return;const w=decode(e.target.value);if(w){W=w;show();}else $("#codeMsg").textContent="That code doesn't fit the format. Codes start with c and are 13 characters.";});
$("#copy").onclick=()=>{const v=$("#codeIn").value;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>{$("#codeMsg").textContent="Copied "+v;}).catch(()=>{$("#codeIn").select();$("#codeMsg").textContent="Selected. Press Ctrl+C to copy.";});};
$("#roll").onclick=()=>{W=roll(false);show();};
$("#rollHot").onclick=()=>{W=roll(true);show();};
$("#rollType").onclick=()=>{W=roll(true,W.type);show();};
$("#calm").onchange=e=>{$("#app").classList.toggle("calm",e.target.checked);document.querySelectorAll(".wsvg").forEach(s=>{try{e.target.checked?s.pauseAnimations():s.unpauseAnimations();}catch(_){}});};

function tile(w,i,attr=""){return `<button type="button" class="tile" data-i="${i}" ${attr}>${render(w)}<span class="n rn-${RARS[w.rar].k}">${nameOf(w)}</span><span class="c">${encode(w)}</span></button>`;}
let TYP=[];
function types(){
  TYP=TYPES.map((t,i)=>{const w=roll(true,i);w.rar=3+rnd(3);return w;});
  $("#types").innerHTML=TYP.map((w,i)=>`<button type="button" class="tile type" data-t="${i}" data-i="${i}">${render(w)}<span class="n">${TYPES[i].n}</span><span class="c">${TYPES[i].verb}</span></button>`).join("");
}
$("#types").onclick=e=>{const t=e.target.closest(".tile");if(!t)return;W={...TYP[+t.dataset.i]};show();$("#bench-h").scrollIntoView({behavior:"smooth"});};
$("#typesMore").onclick=types;
let RACK=[];
function rack(){
  RACK=Array.from({length:24},()=>roll(true));
  $("#rack").innerHTML=RACK.map((w,i)=>tile(w,i)).join("");
  $("#tiny").innerHTML=RACK.map(w=>`<div class="slot">${render(w,{small:true})}</div>`).join("");
}
$("#rack").onclick=e=>{const t=e.target.closest(".tile");if(!t)return;W={...RACK[+t.dataset.i]};show();$("#bench-h").scrollIntoView({behavior:"smooth"});};
$("#more").onclick=rack;
function shelves(){
  const showcase=[2,3,4,9,10,7];
  $("#infs").innerHTML=INFS.slice(1).map((I,i)=>{const w=roll(true,showcase[i]);w.inf=i+1;w.rar=4;w.v=0;return `<div class="cell">${render(w)}<div class="t">${I.n}</div><div class="s">${TYPES[w.type].n} · ${I.suf}</div></div>`;}).join("");
  const base=roll(true,8);base.inf=0;base.v=0;
  $("#ladder").innerHTML=RARS.map((r,i)=>{const w={...base,rar:i,inf:i>=4?1:0};return `<div class="cell">${render(w)}<div class="t rn-${r.k}">${r.n}</div><div class="s">${r.w}% of rolls</div></div>`;}).join("");
  const vb=roll(true,5);vb.inf=0;vb.rar=4;
  $("#vars").innerHTML=VARS.map((v,i)=>`<div class="cell">${render({...vb,v:i})}<div class="t">${v.n}</div><div class="s">${i===0?"as rolled":i===1?"from duplicates":"from Sunkissed copies"}</div></div>`).join("");
}
function facts(){
  let combos=0;for(const t of TYPES){let n=t.mats.length;for(const p of t.parts) n*=p.list.length;combos+=n;}
  const total=combos*FIT.length*WRAP.length*GEMS.length*INFS.length*RARS.length*VARS.length;
  $("#facts").innerHTML=[
    `<b>${TYPES.length} weapon types</b>, each with its own four part slots and its own materials. A stick picks its shape, growth, tie and tip. A ball picks seams, condition, an extra and a face.`,
    `A weapon saves as 13 characters, like <code>${encode(W)}</code>: a version letter, the type, four part slots, material, fittings, wrap, gem, infusion, rarity and variant. The same code always draws the same weapon, down to the sparks.`,
    `Every type tells the effects where its hitting part, tip, grip and edges are. That's why frost crystals grow on a club's knobs, a vine wraps a slingshot handle, and lightning runs down a bow's arrow.`,
    `About <b>${(total/1e9).toFixed(0)} billion</b> possible weapons from ${TYPES.length} hand-drawn types. Adding one type, or one part to a type, multiplies the pool again.`,
    `Calm mode and reduced motion stop every animation and keep the static glow.`,
  ].map(x=>`<li>${x}</li>`).join("");
}
types(); show(); shelves(); rack(); facts();
