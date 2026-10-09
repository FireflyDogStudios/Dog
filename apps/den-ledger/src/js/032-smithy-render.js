/* ---------- save code ---------- 'c' + type + p1..p4 + mat + fit + wrap + gem + inf + rar + v */
const SLOTS=["type","p1","p2","p3","p4","mat","fit","wrap","gem","inf","rar","v"];
function slotList(w,k){
  const t=TYPES[w.type];
  if(k==="type") return TYPES; if(/^p\d$/.test(k)) return t.parts[+k[1]-1].list;
  if(k==="mat") return t.mats; return {fit:FIT,wrap:WRAP,gem:GEMS.map(g=>g||{n:"None"}),inf:INFS,rar:RARS,v:VARS}[k];
}
function encode(w){return "c"+SLOTS.map(k=>B36[w[k]]).join("");}
function decode(c){
  c=String(c||"").trim().toLowerCase().replace(/[^0-9a-z]/g,"");
  if(c.length!==SLOTS.length+1||c[0]!=="c") return null;
  const w={};
  for(let i=0;i<SLOTS.length;i++){const v=B36.indexOf(c[i+1]);w[SLOTS[i]]=v;}
  if(!(w.type>=0&&w.type<TYPES.length)) return null;
  for(const k of SLOTS){const L=slotList(w,k);if(!(w[k]>=0&&w[k]<L.length)) return null;}
  return w;
}
function nameOf(w){
  const t=TYPES[w.type],I=INFS[w.inf],Rr=RARS[w.rar],V=VARS[w.v];
  return [(w.v?V.n:""),(I.pre||Rr.adj),t.name(resolveParts(w),t.mats[w.mat]),(I.suf||"")].filter(Boolean).join(" ").replace(/\s+/g," ");
}
/* map list positions to the original drawing index (lets us retire a part without breaking the art code) */
function resolveParts(w){const t=TYPES[w.type],o={...w};t.parts.forEach((p,i)=>{const it=p.list[w["p"+(i+1)]];if(it&&it.v!==undefined)o["p"+(i+1)]=it.v;});return o;}

/* ================= renderer: fits the weapon, then layers rarity, variant and infusion effects ================= */
function seeded(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296;};}

function render(w,opts={}){
  rng=seeded(encode(w));
  const id="w"+(++UID), t=TYPES[w.type], B=t.build(resolveParts(w)), g=B.geo, I=INFS[w.inf], Rr=RARS[w.rar], small=!!opts.small;
  // fit: rotate the bounding box, scale it into the 200x200 view
  const [x0,y0,x1,y1]=B.box, cx=(x0+x1)/2, cy=(y0+y1)/2, a=B.rot*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a);
  const hw=(x1-x0)/2, hh=(y1-y0)/2, ew=Math.abs(hw*ca)+Math.abs(hh*sa), eh=Math.abs(hw*sa)+Math.abs(hh*ca);
  const s=156/(2*Math.max(ew,eh));
  const T=`rotate(${B.rot}) scale(${s.toFixed(3)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})`;
  const S=p=>{const x=(p[0]-cx)*s,y=(p[1]-cy)*s;return [x*ca-y*sa,x*sa+y*ca];};
  const tipS=S(g.tip), strikeS=g.strike.map(S), midS=strikeS[Math.min(1,strikeS.length-1)];
  let defs="", back="", over="", local="", parts="";
  const rk=Rr.k, c=Rr.c, mythic=rk==="mythic"||rk==="titan", still=!!opts.still;
  defs+=`<g id="${id}W" transform="${T}">${B.svg}</g>
    <mask id="${id}M" maskUnits="userSpaceOnUse" x="-130" y="-130" width="260" height="260" style="mask-type:alpha"><use href="#${id}W"/></mask>
    <mask id="${id}B" maskUnits="userSpaceOnUse" x="-130" y="-130" width="260" height="260" style="mask-type:alpha"><g transform="${T}">${g.metal}</g></mask>`;
  const outlineR={junk:0,common:0,uncommon:0,rare:1.4,epic:1.6,legendary:1.8,godly:2,mythic:2,titan:2.3}[rk], glowR={junk:0,common:0,uncommon:3,rare:3.5,epic:4.5,legendary:5.5,godly:6,mythic:6.5,titan:7.5}[rk];
  if(glowR){
    defs+=`<filter id="${id}O" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
      ${outlineR?`<feMorphology in="SourceAlpha" operator="dilate" radius="${outlineR}" result="d"/>`:`<feOffset in="SourceAlpha" result="d"/>`}
      <feFlood flood-color="${c}">${mythic&&!still?`<animate attributeName="flood-color" values="${rk==="titan"?"#ff2d55;#ffb347;#fff1b0;#ff2d55":"#5fe0d0;#c08cff;#ffd36e;#ff8fb8;#5fe0d0"}" dur="6s" repeatCount="indefinite"/>`:""}</feFlood>
      <feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="${glowR}" result="g"/>
      <feMerge><feMergeNode in="g"/>${rk!=="uncommon"?`<feMergeNode in="g"/><feMergeNode in="o"/>`:""}</feMerge></filter>`;
  }
  let wf="";
  const lum=`<feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0"/>`;
  if(w.v===1){defs+=`<filter id="${id}V" color-interpolation-filters="sRGB">${lum}<feComponentTransfer><feFuncR type="table" tableValues=".22 .62 .96 1 1"/><feFuncG type="table" tableValues=".1 .36 .72 .9 .98"/><feFuncB type="table" tableValues=".02 .06 .2 .5 .82"/></feComponentTransfer></filter>`;wf=`filter="url(#${id}V)"`;}
  else if(w.v===2){defs+=`<filter id="${id}V" color-interpolation-filters="sRGB">${lum}<feComponentTransfer><feFuncR type="table" tableValues=".05 .2 .42 .55 .9"/><feFuncG type="table" tableValues=".04 .12 .3 .7 .98"/><feFuncB type="table" tableValues=".2 .48 .78 .9 1"/></feComponentTransfer></filter>`;wf=`filter="url(#${id}V)"`;}
  else if(rk==="junk"){defs+=`<filter id="${id}V"><feColorMatrix type="saturate" values=".35"/><feComponentTransfer><feFuncR type="linear" slope=".9"/><feFuncG type="linear" slope=".9"/><feFuncB type="linear" slope=".88"/></feComponentTransfer></filter>`;wf=`filter="url(#${id}V)"`;}
  if(["legendary","godly","mythic","titan"].includes(rk)){
    defs+=`<radialGradient id="${id}A"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".55" stop-color="${c}" stop-opacity=".18"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
    back+=`<circle cx="0" cy="0" r="94" fill="url(#${id}A)" class="fx-pulse"/>`;
  }
  if(["godly","mythic","titan"].includes(rk)){
    let rays="";for(let i=0;i<12;i++){const a2=i*30;rays+=`<path d="M0 0 L${(Math.cos((a2-5)*Math.PI/180)*112).toFixed(1)} ${(Math.sin((a2-5)*Math.PI/180)*112).toFixed(1)} L${(Math.cos((a2+5)*Math.PI/180)*112).toFixed(1)} ${(Math.sin((a2+5)*Math.PI/180)*112).toFixed(1)} Z"/>`;}
    defs+=`<radialGradient id="${id}RG"><stop offset=".1" stop-color="${mythic?"#ffffff":c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
    back+=`<g fill="url(#${id}RG)" class="fx-rays">${rays}</g>`;
  }
  /* ---------- infusions ---------- */
  const inf=I.n;
  if(inf!=="None"){
    defs+=`<radialGradient id="${id}IG"><stop offset="0" stop-color="${I.c}" stop-opacity="${inf==="Shadow"?.6:.5}"/><stop offset="1" stop-color="${I.c}" stop-opacity="0"/></radialGradient>`;
    back+=`<circle cx="${midS[0].toFixed(1)}" cy="${midS[1].toFixed(1)}" r="46" fill="url(#${id}IG)" class="fx-pulse"/>`;
  }
  const rootL=g.root, tipL=g.tip;
  const overlay=(stops,blend)=>{const gid=id+"L"+(++UID);defs+=`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${rootL[0]}" y1="${rootL[1]}" x2="${tipL[0]}" y2="${tipL[1]}">${stops}</linearGradient>`;
    return `<g mask="url(#${id}B)"><g transform="${T}"><rect x="-200" y="-200" width="400" height="400" fill="url(#${gid})" style="mix-blend-mode:${blend}"/></g></g>`;};
  const at=(p,dx,dy)=>[p[0]+R(-dx,dx),p[1]+R(-dy,dy)];
  if(inf==="Ember"){
    over+=overlay(`<stop offset=".1" stop-color="#ff5a1f" stop-opacity="0"/><stop offset=".65" stop-color="#ff6a1f" stop-opacity=".75"/><stop offset="1" stop-color="#ffe08a" stop-opacity=".95"/>`,"screen");
    local+=`<g fill="none" stroke="#ffb347" stroke-width="1.7" stroke-linecap="round" class="fx-pulse">${g.strike.slice(0,3).map(([x,y])=>`<path d="M${x-3} ${y+4} l3 -5 l-2 -4 l4 -5"/>`).join("")}</g>`;
    if(!small) for(let i=0;i<9;i++){const p=at(strikeS[i%strikeS.length],8,5);parts+=`<circle class="fx-p fx-rise" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${R(1.6,3.2).toFixed(1)}" fill="${i%3?"#ffb347":"#fff1b0"}" style="--dx:${R(-12,12).toFixed(0)}px;animation-delay:${(i*.25).toFixed(2)}s;filter:drop-shadow(0 0 3px #ff7a2e)"/>`;}
  }
  if(inf==="Frost"){
    over+=overlay(`<stop offset="0" stop-color="#e8fbff" stop-opacity=".9"/><stop offset=".5" stop-color="#9fe8ff" stop-opacity=".5"/><stop offset="1" stop-color="#9fe8ff" stop-opacity=".05"/>`,"screen");
    (g.edges||[]).forEach(([x,y,side])=>{const sc=R(.8,1.2);local+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(side*R(35,60)).toFixed(0)}) scale(${sc.toFixed(2)})"><path d="M0 0 L3 -9 L0 -16 L-3 -9 Z M0 -2 L6 -6 L9 -2 L4 0 Z M0 -2 L-6 -6 L-9 -2 L-4 0 Z" fill="#dff8ff" stroke="#3a8fb0" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 -3 L0 -13" stroke="#fff" stroke-width="1"/></g>`;});
    if(!small) for(let i=0;i<7;i++){const p=at(strikeS[i%strikeS.length],16,10);parts+=`<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><path class="fx-p fx-fall" d="M0 -3 L1 0 L0 3 L-1 0 Z M-3 0 L0 1 L3 0 L0 -1 Z" fill="#ffffff" style="--dx:${R(-8,8).toFixed(0)}px;animation-delay:${(i*.5).toFixed(2)}s;filter:drop-shadow(0 0 2px #7fe0ff)"/></g>`;}
  }
  if(inf==="Storm"){
    over+=overlay(`<stop offset="0" stop-color="#fffbe0" stop-opacity="0"/><stop offset="1" stop-color="#ffe14a" stop-opacity=".45"/>`,"screen");
    const bolt=()=>{const a1=strikeS[0],b1=tipS;const pts=[];for(let i=0;i<=7;i++){const k=i/7;const j=i===0||i===7?0:R(-7,7);pts.push([a1[0]+(b1[0]-a1[0])*k+j*.7,a1[1]+(b1[1]-a1[1])*k+j*.7]);}return pts.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ");};
    over+=`<g fill="none" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 3px #ffe14a)"><polyline class="fx-bolt" points="${bolt()}" stroke="#fffbe0" stroke-width="2.2"/><polyline class="fx-bolt b2" points="${bolt()}" stroke="#ffe14a" stroke-width="1.8"/></g>`;
    if(!small) for(let i=0;i<6;i++){const p=at(strikeS[i%strikeS.length],12,12);parts+=`<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><path class="fx-p fx-twinkle" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="#fff6a8" style="animation-delay:${(i*.3).toFixed(2)}s;animation-duration:1.1s"/></g>`;}
  }
  if(inf==="Bloom"){
    over+=overlay(`<stop offset="0" stop-color="#7fdc7a" stop-opacity=".45"/><stop offset=".6" stop-color="#ffb6dc" stop-opacity=".25"/><stop offset="1" stop-color="#ffb6dc" stop-opacity="0"/>`,"soft-light");
    if(g.grip){const [y0,y1]=g.grip,gx=g.gripX||0;let d=`M${gx} ${y1}`;for(let i=1;i<=8;i++){const y=y1-(y1-y0)*i/8;d+=` Q${gx+(i%2?11:-11)} ${(y+(y1-y0)/16).toFixed(1)} ${gx} ${y.toFixed(1)}`;}
      local+=`<path d="${d}" fill="none" stroke="#1d4a22" stroke-width="4.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#5fbf5a" stroke-width="2.2" stroke-linecap="round"/>`;
      for(let i=0;i<3;i++){const y=y1-(y1-y0)*(.25+.3*i),side=i%2?1:-1;local+=`<path d="M${gx+side*6} ${y.toFixed(1)} q${side*10} -8 ${side*14} 2 q${side*-8} 6 ${side*-14} -2 Z" fill="#7fdc7a" stroke="#1d4a22" stroke-width="1.3" stroke-linejoin="round"/>`;}}
    else{(g.edges||[]).slice(0,3).forEach(([x,y],i)=>{local+=leaf(x,y,i*120-40,11);});}
    const [fx,fy]=g.flower;let fl="";for(let i=0;i<5;i++){const a2=i*72*Math.PI/180,px=(Math.cos(a2)*4.6).toFixed(1),py=(Math.sin(a2)*4.6).toFixed(1);fl+=`<ellipse cx="${px}" cy="${py}" rx="3.8" ry="2.6" transform="rotate(${i*72} ${px} ${py})" fill="#ffb6dc" stroke="#7a2450" stroke-width="1"/>`;}
    local+=`<g transform="translate(${fx} ${fy})">${fl}<circle r="2.6" fill="#ffd94a" stroke="#7a4a10" stroke-width="1"/></g>`;
    if(!small) for(let i=0;i<6;i++){const p=at(strikeS[i%strikeS.length],10,8);parts+=`<ellipse class="fx-p fx-drift" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="3" ry="1.8" fill="${i%2?"#ffb6dc":"#ffd1e8"}" style="--dx:${R(6,18).toFixed(0)}px;animation-delay:${(i*.55).toFixed(2)}s"/>`;}
  }
  if(inf==="Moon"){
    over+=overlay(`<stop offset="0" stop-color="#c4a8ff" stop-opacity=".2"/><stop offset="1" stop-color="#e9ddff" stop-opacity=".55"/>`,"screen");
    let runes="";g.strike.slice(0,3).forEach((p,i)=>{runes+=i===1?`<path d="M${p[0]+3} ${p[1]-5} a5 5 0 1 0 0 10 a3.6 3.6 0 1 1 0 -10 Z" fill="#f3ecff"/>`:`<circle cx="${p[0]}" cy="${p[1]}" r="1.8" fill="#f3ecff"/><path d="M${p[0]} ${p[1]-5} L${p[0]} ${p[1]+5}" stroke="#f3ecff" stroke-width="1.1"/>`;});
    local+=`<g class="fx-pulse" style="filter:drop-shadow(0 0 2px #c4a8ff)">${runes}</g>`;
    if(!small) for(let i=0;i<7;i++){const p=at(strikeS[i%strikeS.length],20,16);parts+=`<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><path class="fx-p fx-twinkle" d="M0 -6 Q0 0 6 0 Q0 0 0 6 Q0 0 -6 0 Q0 0 0 -6 Z" fill="#f3ecff" style="animation-delay:${(i*.35).toFixed(2)}s;filter:drop-shadow(0 0 3px #c4a8ff)"/></g>`;}
  }
  if(inf==="Shadow"){
    over+=overlay(`<stop offset="0" stop-color="#241838" stop-opacity=".15"/><stop offset="1" stop-color="#3a2560" stop-opacity=".7"/>`,"multiply");
    over+=overlay(`<stop offset=".5" stop-color="#b48cff" stop-opacity="0"/><stop offset="1" stop-color="#b48cff" stop-opacity=".35"/>`,"screen");
    if(!small) for(let i=0;i<7;i++){const p=at(strikeS[i%strikeS.length],8,4);parts+=`<circle class="fx-p fx-smoke" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${R(4,7).toFixed(1)}" fill="${i%2?"#3a2560":"#6c4fa8"}" style="--dx:${R(-10,10).toFixed(0)}px;animation-delay:${(i*.42).toFixed(2)}s;filter:blur(1.5px)"/>`;}
  }
  if(w.v===2){let st="";for(let i=0;i<14;i++){st+=`<circle class="fx-twinkle" cx="${R(-70,70).toFixed(0)}" cy="${R(-70,70).toFixed(0)}" r="${R(.8,1.8).toFixed(1)}" fill="#fff" style="animation-delay:${R(0,2.4).toFixed(2)}s"/>`;}over+=`<g mask="url(#${id}M)">${st}</g>`;}
  if(["epic","legendary","godly","mythic","titan"].includes(rk)||w.v===1){
    defs+=`<linearGradient id="${id}G" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".48" stop-color="#fff" stop-opacity=".85"/><stop offset=".52" stop-color="#fffbe0" stop-opacity=".95"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    over+=`<g mask="url(#${id}M)"><g transform="rotate(20)"><rect class="fx-glint" x="-60" y="-140" width="70" height="280" fill="url(#${id}G)" style="mix-blend-mode:screen"/></g></g>`;
  }
  rng=Math.random;
  return `<svg class="wsvg" viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${nameOf(w)}"><defs>${defs}</defs>
    ${back}
    <ellipse cx="4" cy="84" rx="48" ry="6.5" fill="#000" opacity=".14"/>
    ${glowR?`<use href="#${id}W" filter="url(#${id}O)"/>`:""}
    <g style="isolation:isolate"><use href="#${id}W" ${wf}/>${over}<g transform="${T}">${local}</g></g>
    ${parts}
  </svg>`;
}

