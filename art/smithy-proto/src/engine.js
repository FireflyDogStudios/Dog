/* ================= Den Smithy engine ================= */
const B36="0123456789abcdefghijklmnopqrstuvwxyz";
let rng=Math.random;
const R=(a,b)=>a+rng()*(b-a);
let UID=0;

/* ---------- palettes: base, shade, light, outline ---------- */
const METAL=[
  {n:"Iron",b:"#b9c2cc",s:"#7d8794",l:"#eef3f7",o:"#2b2f36"},
  {n:"Steel",b:"#9cc4e4",s:"#5e88ab",l:"#e6f4ff",o:"#1f2c3a"},
  {n:"Bronze",b:"#d99a4e",s:"#a2652a",l:"#ffd9a1",o:"#3a2410"},
  {n:"Bone",b:"#efe4c9",s:"#c7b58d",l:"#fffaf0",o:"#4a3b26"},
  {n:"Obsidian",b:"#4a4058",s:"#2a2333",l:"#9a8cc0",o:"#120e18"},
  {n:"Frostglass",b:"#9fe8f2",s:"#56bccd",l:"#f2feff",o:"#163a44"},
  {n:"Moonsilver",b:"#cdbff2",s:"#9480cc",l:"#f8f2ff",o:"#2a2148"},
  {n:"Sunsteel",b:"#f3c64e",s:"#c48a1c",l:"#fff2b8",o:"#3f2a06"},
  {n:"Emberstone",b:"#ef7a43",s:"#b2401e",l:"#ffd0a8",o:"#3a1408"},
  {n:"Mossjade",b:"#7fcf9a",s:"#3f9466",l:"#d9ffe6",o:"#123020"},
];
const WOOD=[
  {n:"Oak",b:"#a8743f",s:"#77502a",l:"#d9a874",o:"#2e1c0c"},
  {n:"Birch",b:"#ece4d2",s:"#c4b89c",l:"#ffffff",o:"#3a3226",mark:"#3a3226"},
  {n:"Pine",b:"#8a5a34",s:"#5e3b20",l:"#c08a5a",o:"#24140a"},
  {n:"Driftwood",b:"#c9bca6",s:"#968a76",l:"#ece4d6",o:"#33302a"},
  {n:"Cherry",b:"#a4503c",s:"#743222",l:"#d88a72",o:"#2a0e08"},
  {n:"Ghostwood",b:"#d4dcf0",s:"#9aa6c8",l:"#ffffff",o:"#283048"},
  {n:"Ironbark",b:"#5a5450",s:"#3a3634",l:"#8a847e",o:"#141210"},
];
const BONE=[
  {n:"Bone",b:"#efe4c9",s:"#c7b58d",l:"#fffaf0",o:"#4a3b26"},
  {n:"Old Bone",b:"#d9c79a",s:"#a8915e",l:"#f4e8c4",o:"#3e3018"},
  {n:"Dino Bone",b:"#d4a87a",s:"#9c7046",l:"#f2d2a8",o:"#3a220e"},
  {n:"Ghost Bone",b:"#dfe8ff",s:"#a4b2e0",l:"#ffffff",o:"#28305a"},
  {n:"Charred Bone",b:"#6a5c56",s:"#443a36",l:"#9a8a82",o:"#161210"},
  {n:"Gilded Bone",b:"#f3d27a",s:"#c49a36",l:"#fff4c8",o:"#3f2a06"},
];
const BALL=[
  {n:"Classic",b:"#d8f04a",s:"#a8c41e",l:"#f4ffb0",o:"#2e3a06"},
  {n:"Bubblegum",b:"#ff8fc0",s:"#d85a92",l:"#ffd2e6",o:"#4a0e2a"},
  {n:"Sky",b:"#6ec6ff",s:"#3a92d0",l:"#d2eeff",o:"#0a2a44"},
  {n:"Sunset",b:"#ff9a3c",s:"#d2661a",l:"#ffd6a8",o:"#401a04"},
  {n:"Grape",b:"#9b7bff",s:"#6a4ad0",l:"#ddd2ff",o:"#1e1048"},
  {n:"Glow",b:"#7dffb0",s:"#3ccf7e",l:"#e2fff0",o:"#0a3a20"},
  {n:"Midnight",b:"#3a3a5a",s:"#22223a",l:"#7a7aa8",o:"#0a0a16"},
];
const PLASTIC=[
  {n:"Red",b:"#ef4b4b",s:"#b82424",l:"#ffb0a8",o:"#3a0808"},
  {n:"Blue",b:"#3f8cff",s:"#1f5ec4",l:"#bcd8ff",o:"#0a1e44"},
  {n:"Yellow",b:"#ffd23f",s:"#d2a414",l:"#fff2b8",o:"#3f2e04"},
  {n:"Green",b:"#4fd06a",s:"#2a9a44",l:"#c4f6cc",o:"#0a3014"},
  {n:"Purple",b:"#a46cff",s:"#7240d2",l:"#e2d0ff",o:"#1e0a48"},
  {n:"Glow",b:"#c8ffe8",s:"#7ad8b4",l:"#ffffff",o:"#0e3a2c"},
];
const ROPE2=[
  {n:"Cream",b:"#f4efe6"},{n:"Red",b:"#e04a40"},{n:"Blue",b:"#4a8ae0"},{n:"Green",b:"#5ac06a"},{n:"Sunny",b:"#ffd24a"},{n:"Purple",b:"#a47aff"},
];
const FIT=[
  {n:"Brass",b:"#e2b84f",s:"#a97c1f",l:"#fff0b0",o:"#3a2806"},
  {n:"Iron",b:"#8e96a0",s:"#5c636d",l:"#d8dee5",o:"#22262c"},
  {n:"Silver",b:"#dfe5ec",s:"#a5afbb",l:"#ffffff",o:"#2a3038"},
  {n:"Copper",b:"#d77d55",s:"#9c4b2c",l:"#ffc3a3",o:"#381808"},
  {n:"Blackened",b:"#4a4a52",s:"#2c2c33",l:"#8a8a98",o:"#111114"},
  {n:"Antler",b:"#d8c3a0",s:"#a68a62",l:"#f6ead6",o:"#3c2c18"},
];
const WRAP=[
  {n:"Oak",b:"#a8743f",s:"#77502a",l:"#d9a874",o:"#2e1c0c"},
  {n:"Dark wood",b:"#6b4630",s:"#47291a",l:"#9e7458",o:"#1c0f08"},
  {n:"Red leather",b:"#c2493a",s:"#86271e",l:"#f08b78",o:"#2e0c08"},
  {n:"Blue cord",b:"#3f7cc2",s:"#244f86",l:"#8ab9ef",o:"#0c1c30"},
  {n:"Green cloth",b:"#4f9a5a",s:"#2e6638",l:"#93d49b",o:"#0e2412"},
  {n:"Bandana red",b:"#d8443c",s:"#9a2620",l:"#ff9a8c",o:"#2c0a08"},
];
const GEMS=[null,{n:"Ruby",b:"#ff4d6d",s:"#b3123a",l:"#ffd0da"},{n:"Sapphire",b:"#4da3ff",s:"#1b5fc4",l:"#d6ebff"},{n:"Emerald",b:"#3ee08a",s:"#13965a",l:"#d2ffe6"},{n:"Amber",b:"#ffb238",s:"#c4720c",l:"#ffefc9"},{n:"Moonstone",b:"#d4c6ff",s:"#8b74d9",l:"#ffffff"}];
const INFS=[
  {n:"None"},
  {n:"Ember",c:"#ff7a2e",pre:"Ember",suf:"of Cinders"},
  {n:"Frost",c:"#7fe0ff",pre:"Frostbitten",suf:"of the Long Winter"},
  {n:"Storm",c:"#ffe14a",pre:"Thundering",suf:"of Swiftness"},
  {n:"Bloom",c:"#ff8fc8",pre:"Blooming",suf:"of Mending"},
  {n:"Moon",c:"#c4a8ff",pre:"Moonlit",suf:"of the Howl"},
  {n:"Shadow",c:"#6c4fa8",pre:"Shadowed",suf:"of the Hollow"},
];
const RARS=[
  {n:"Junk",k:"junk",c:"#8a8f93",w:55,adj:"Chewed"},
  {n:"Common",k:"common",c:"#93a399",w:28,adj:"Trusty"},
  {n:"Uncommon",k:"uncommon",c:"#4f8fb8",w:11,adj:"Sturdy"},
  {n:"Rare",k:"rare",c:"#a77bd6",w:4.7,adj:"Howling"},
  {n:"Epic",k:"epic",c:"#e8741c",w:1,adj:"Feral"},
  {n:"Legendary",k:"legendary",c:"#e3b23c",w:.3,adj:"Ancient"},
  {n:"Godly",k:"godly",c:"#f25f8c",w:.08,adj:"Divine"},
  {n:"Mythic",k:"mythic",c:"#5fe0d0",w:.02,adj:"Celestial"},
];
const VARS=[{n:"Normal"},{n:"Sunkissed"},{n:"Starlit"}];

/* ---------- drawing helpers ---------- */
function shaded(d,m,opt={}){
  const id="c"+(++UID), cx=opt.cx??0, sw=opt.sw??3.2, hw=opt.hw??9;
  return `<g><clipPath id="${id}"><path d="${d}" ${opt.rule?`clip-rule="evenodd"`:""}/></clipPath><path d="${d}" fill="${m.b}" ${opt.rule?`fill-rule="evenodd"`:""}/>
    <g clip-path="url(#${id})"><rect x="${cx}" y="-400" width="400" height="800" fill="${m.s}" opacity=".85"/>
    ${opt.nohl?"":`<rect x="${cx-hw}" y="-400" width="${hw*.42}" height="800" fill="${m.l}" opacity=".9"/>`}${opt.extra||""}</g>
    <path d="${d}" fill="none" stroke="${m.o}" stroke-width="${sw}" stroke-linejoin="round"/></g>`;
}
/* round things: soft radial shading instead of a split */
function roundShade(d,m,cx,cy,r,extra=""){
  const id="c"+(++UID), gid="r"+(++UID);
  return `<g><radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${cx-r*.35}" cy="${cy-r*.4}" r="${r*1.35}"><stop offset="0" stop-color="${m.l}"/><stop offset=".35" stop-color="${m.b}"/><stop offset=".85" stop-color="${m.s}"/></radialGradient>
    <clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="url(#${gid})"/><g clip-path="url(#${id})">${extra}</g>
    <path d="${d}" fill="none" stroke="${m.o}" stroke-width="3.2" stroke-linejoin="round"/></g>`;
}
const circleP=(cx,cy,r)=>`M${cx-r} ${cy} A${r} ${r} 0 1 0 ${cx+r} ${cy} A${r} ${r} 0 1 0 ${cx-r} ${cy} Z`;
const f1=v=>(+v).toFixed(1);
/* smooth centreline -> sampled points */
function spline(pts,n=24){
  const out=[];const P=[pts[0],...pts,pts[pts.length-1]];
  for(let i=1;i<P.length-2;i++){const[p0,p1,p2,p3]=[P[i-1],P[i],P[i+1],P[i+2]];
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(j=>.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)));}}
  out.push(pts[pts.length-1]);return out;
}
/* a tapered ribbon around a centreline; wf(t) gives half-width */
function ribbon(pts,wf,n=16){
  const c=spline(pts,n),L=[],Rt=[];
  for(let i=0;i<c.length;i++){const a=c[Math.max(0,i-1)],b=c[Math.min(c.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;const w=wf(i/(c.length-1),i);L.push([c[i][0]-dy*w,c[i][1]+dx*w]);Rt.push([c[i][0]+dy*w,c[i][1]-dx*w]);}
  return "M"+L.map(p=>p.map(f1).join(" ")).join(" L")+" L"+Rt.reverse().map(p=>p.map(f1).join(" ")).join(" L")+" Z";
}
function pathAlong(pts,n=12){const c=spline(pts,n);return "M"+c.map(p=>p.map(f1).join(" ")).join(" L");}
function gemShape(G,x,y,r){
  const id="g"+(++UID);
  return `<g><radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${G.l}"/><stop offset=".45" stop-color="${G.b}"/><stop offset="1" stop-color="${G.s}"/></radialGradient>
   <path d="M${x} ${y-r} L${x+r} ${y} L${x} ${y+r} L${x-r} ${y} Z" fill="url(#${id})" stroke="#1a1020" stroke-width="1.8" stroke-linejoin="round"/>
   <circle cx="${x-r*.3}" cy="${y-r*.35}" r="${r*.2}" fill="#fff" opacity=".9"/></g>`;
}
function pawPads(m,cx,cy,r){
  return `<g fill="${m.s}" stroke="${m.o}" stroke-width="1.6"><ellipse cx="${cx}" cy="${cy+r*.35}" rx="${r*.55}" ry="${r*.45}"/>
    <circle cx="${cx-r*.55}" cy="${cy-r*.35}" r="${r*.22}"/><circle cx="${cx-r*.18}" cy="${cy-r*.62}" r="${r*.22}"/><circle cx="${cx+r*.18}" cy="${cy-r*.62}" r="${r*.22}"/><circle cx="${cx+r*.55}" cy="${cy-r*.35}" r="${r*.22}"/></g>`;
}
function pawShape(cx,cy,r,fill,stroke){
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="1.4"><ellipse cx="${cx}" cy="${cy+r*.35}" rx="${r*.55}" ry="${r*.45}"/>
    <circle cx="${cx-r*.58}" cy="${cy-r*.3}" r="${r*.24}"/><circle cx="${cx-r*.2}" cy="${cy-r*.62}" r="${r*.24}"/><circle cx="${cx+r*.2}" cy="${cy-r*.62}" r="${r*.24}"/><circle cx="${cx+r*.58}" cy="${cy-r*.3}" r="${r*.24}"/></g>`;
}
function leaf(x,y,ang,len,col="#6fcf6a",o="#1d4a22"){
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="M0 0 Q${len*.5} ${-len*.32} ${len} 0 Q${len*.5} ${len*.32} 0 0 Z" fill="${col}" stroke="${o}" stroke-width="1.3" stroke-linejoin="round"/><path d="M1 0 L${len*.8} 0" stroke="${o}" stroke-width=".9" opacity=".6"/></g>`;
}
function acorn(x,y,s=1){
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-5 -1 Q-6 8 0 11 Q6 8 5 -1 Z" fill="#c9893e" stroke="#3a220c" stroke-width="1.3"/><path d="M-6.5 -1 Q0 -8 6.5 -1 Q0 1 -6.5 -1 Z" fill="#7a5230" stroke="#3a220c" stroke-width="1.3"/><path d="M0 -5 L1 -9" stroke="#3a220c" stroke-width="1.6" stroke-linecap="round"/></g>`;
}
function mushroom(x,y,ang,s=1){
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${ang}) scale(${s})"><rect x="-1.6" y="-1" width="3.2" height="6" fill="#f4ecd8" stroke="#3a2a1a" stroke-width="1"/><path d="M-6 -1 Q0 -9 6 -1 Z" fill="#e8463c" stroke="#3a1008" stroke-width="1.2"/><circle cx="-2" cy="-4" r="1" fill="#fff"/><circle cx="2" cy="-3" r=".8" fill="#fff"/></g>`;
}
function crystal(x,y,len,G,ang=0){
  const w=len*.28;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${ang})">${shaded(`M0 ${-len} L${w} ${-len*.7} L${w*.8} 0 L${-w*.8} 0 L${-w} ${-len*.7} Z`,{b:G.b,s:G.s,l:G.l,o:"#1a1030"},{hw:w*.8,sw:2.2})}<path d="M0 ${-len} L0 0" stroke="${G.l}" stroke-width="1" opacity=".7"/></g>`;
}

/* ================= weapon TYPES =================
   each build(w) returns {svg, geo, box:[x0,y0,x1,y1], rot}
   geo: strike[] (points along the hitting part), tip, root, grip:[y0,y1]|null, gripX, flower, edges[[x,y,dir]], metal (svg used as tint mask) */
const TYPES=[];
function T(def){TYPES.push(def);return def;}

/* ---- Sword / Dagger ---- */
const BLADES=[
  {n:"Longblade",d:(L)=>`M-8 0 L-8 ${-L+22} L0 ${-L} L8 ${-L+22} L8 0 Z`,fuller:true,hw:8},
  {n:"Leafblade",d:(L)=>`M-6 0 C-15 ${-L*.35} -14 ${-L*.7} 0 ${-L} C14 ${-L*.7} 15 ${-L*.35} 6 0 Z`,fuller:true,hw:11},
  {n:"Cleaver",d:(L)=>`M-8 0 L-9 ${-L+10} Q-9 ${-L} 2 ${-L} L13 ${-L+8} L8 0 Z`,hw:10},
  {n:"Fang",d:(L)=>`M-8 0 Q-12 ${-L*.55} 6 ${-L} Q4 ${-L*.5} 8 0 Z`,hw:9},
  {n:"Flamberge",d:(L)=>{let s="M-7 0";const k=6;for(let i=1;i<=k;i++){const y=-L*.82*i/k;s+=` Q${i%2?-13:-3} ${y+L*.07} -7 ${y}`;}s+=` L0 ${-L} L7 ${-L*.82}`;for(let i=k-1;i>=0;i--){const y=-L*.82*i/k;s+=` Q${i%2?3:13} ${y-L*.07} 7 ${y}`;}return s+" Z";},fuller:true,hw:10},
  {n:"Moonblade",d:(L)=>`M-7 0 C-9 ${-L*.4} -2 ${-L*.8} 14 ${-L} C4 ${-L*.75} 8 ${-L*.35} 8 0 Z`,hw:9},
  {n:"Pawblade",d:(L)=>`M-9 0 L-9 ${-L+30} C-9 ${-L+8} -4 ${-L} 0 ${-L} C4 ${-L} 9 ${-L+8} 9 ${-L+30} L9 0 Z`,fuller:true,paw:true,hw:9},
];
const GUARDS=[
  {n:"Bar",d:"M-26 -5 L26 -5 L28 0 L26 5 L-26 5 L-28 0 Z"},
  {n:"Crescent",d:"M-30 -12 Q-24 2 0 4 Q24 2 30 -12 Q26 8 0 9 Q-26 8 -30 -12 Z"},
  {n:"Wings",d:"M-6 -5 Q-22 -6 -34 -20 Q-30 2 -6 7 L6 7 Q30 2 34 -20 Q22 -6 6 -5 Z"},
  {n:"Disc",d:"M-15 0 A15 7 0 1 0 15 0 A15 7 0 1 0 -15 0 Z"},
  {n:"Fangs",d:"M-24 -4 L24 -4 L22 4 Q14 8 12 22 Q8 6 0 6 Q-8 6 -12 22 Q-14 8 -22 4 Z"},
  {n:"Leafs",d:"M0 -2 C-10 -14 -30 -12 -34 -2 C-26 6 -10 8 0 4 C10 8 26 6 34 -2 C30 -12 10 -14 0 -2 Z"},
];
const GRIPS=[{n:"Plain",len:34},{n:"Wrapped",len:36,wrap:true},{n:"Banded",len:34,bands:true},{n:"Long",len:46,wrap:true}];
const POMMELS=[
  {n:"Orb",d:"M-8 0 A8 8 0 1 0 8 0 A8 8 0 1 0 -8 0 Z",h:8},
  {n:"Diamond",d:"M0 -10 L10 0 L0 12 L-10 0 Z",h:10},
  {n:"Ring",d:"M-10 0 A10 10 0 1 0 10 0 A10 10 0 1 0 -10 0 Z M-5 0 A5 5 0 1 1 5 0 A5 5 0 1 1 -5 0 Z",h:10},
  {n:"Paw",paw:true,h:9},
  {n:"Claw",d:"M-9 -4 L9 -4 Q8 6 0 14 Q4 4 -2 2 Q-6 8 -10 6 Q-6 0 -9 -4 Z",h:9},
];
function gripAndPommel(w,glen,F,Wr,po){
  let svg="",extra="";const gr=GRIPS[w.p3];
  if(gr.wrap){for(let y=8;y<glen-2;y+=6) extra+=`<path d="M-8 ${y} L8 ${y+4}" stroke="${Wr.o}" stroke-width="1.6" opacity=".55"/>`;}
  if(gr.bands){for(const y of [glen*.3,glen*.65]) extra+=`<rect x="-9" y="${y-2}" width="18" height="4" fill="${F.b}" stroke="${F.o}" stroke-width="1.4"/>`;}
  svg+=shaded(`M-6.5 4 L6.5 4 L7 ${glen} L-7 ${glen} Z`,Wr,{hw:5,extra});
  const py=glen+po.h-1;
  svg+=`<g transform="translate(0 ${py})">${po.paw?shaded("M-11 0 A11 10 0 1 0 11 0 A11 10 0 1 0 -11 0 Z",F,{hw:8})+pawPads(F,0,0,10):shaded(po.d,F,{hw:7})}</g>`;
  return {svg,bottom:py+12};
}
function bladeType(name,L,verb){
  return T({n:name,verb,mats:METAL,parts:[{n:"Blade",list:BLADES},{n:"Guard",list:GUARDS.map((g,i)=>({...g,v:i})).filter(g=>g.n!=="Crescent")},{n:"Grip",list:GRIPS},{n:"Pommel",list:POMMELS}],
    name:(w,M)=>`${M.n} ${L<100?BLADES[w.p1].n.replace(/blade$/,"")+" Dagger":BLADES[w.p1].n}`,
    build(w){
      const M=METAL[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap],G=GEMS[w.gem],bl=BLADES[w.p1],gd=GUARDS[w.p2],po=POMMELS[w.p4];
      const glen=L<100?Math.min(GRIPS[w.p3].len,30):GRIPS[w.p3].len;
      const gp=gripAndPommel(w,glen,F,Wr,po);
      let bx="";
      if(bl.fuller) bx+=`<path d="M0 -6 L0 ${-L*.72}" stroke="${M.s}" stroke-width="3" stroke-linecap="round"/>`;
      bx+=`<path d="M-30 ${-L*.62} L30 ${-L*.82}" stroke="#fff" stroke-width="5" opacity=".18"/>`;
      let svg=`<g transform="scale(1.3 1)">${shaded(bl.d(L),M,{hw:7,extra:bx,sw:2.6})}${bl.paw?pawPads(M,0,-L+30,12):""}</g>`+gp.svg+shaded(gd.d,F,{hw:10});
      if(G) svg+=gemShape(G,0,0,6.5);
      const hw=bl.hw*1.3;
      return {svg,rot:45,box:[-36,-L-6,36,gp.bottom],geo:{kind:"blade",root:[0,-4],tip:[bl.n==="Moonblade"?18:bl.n==="Cleaver"?8:0,-L],grip:[6,glen],gripX:0,flower:[9,-10],
        strike:[[0,-L*.2],[0,-L*.45],[0,-L*.7],[0,-L*.92]],edges:[[-hw+1,-L*.2,-1],[hw-1,-L*.38,1],[-hw+1,-L*.56,-1],[hw-1,-L*.74,1]],len:L,
        metal:`<g transform="scale(1.3 1)"><path d="${bl.d(L)}" fill="#fff"/></g>`}};
    }});
}
bladeType("Sword",128,"Slash");
bladeType("Dagger",78,"Stab");

/* ---- Polearm ---- */
const HEADS=[
  {n:"Bearded Axe",d:"M2 -14 L10 -14 Q26 -14 34 -26 Q42 0 30 26 Q22 14 10 12 L2 12 Z",kind:"axe",cx:18,span:[[6,-10],[34,-20],[30,20]]},
  {n:"Double Axe",d:"M-2 -10 Q-18 -10 -30 -24 Q-40 0 -30 24 Q-18 10 -2 10 L2 10 Q18 10 30 24 Q40 0 30 -24 Q18 -10 2 -10 Z",kind:"axe",span:[[-34,-18],[0,0],[34,-18]]},
  {n:"Maul",d:"M-22 -16 L22 -16 Q26 -16 26 -12 L26 12 Q26 16 22 16 L-22 16 Q-26 16 -26 12 L-26 -12 Q-26 -16 -22 -16 Z",kind:"hammer",span:[[-24,-14],[0,-16],[24,-14]]},
  {n:"Pick",d:"M-4 -8 Q-24 -10 -40 4 Q-22 -2 -4 6 L4 6 Q22 -2 40 4 Q24 -10 4 -8 Z",kind:"pick",span:[[-38,2],[0,-8],[38,2]]},
  {n:"Spear",d:"M-6 6 C-14 -14 -6 -34 0 -48 C6 -34 14 -14 6 6 Z",kind:"spear",span:[[0,0],[0,-24],[0,-48]]},
  {n:"Glaive",d:"M-4 8 Q-4 -20 14 -44 Q8 -14 12 8 Z",kind:"spear",span:[[2,4],[8,-20],[14,-44]]},
];
const HAFTS=[{n:"Plain"},{n:"Wrapped",wrap:true},{n:"Banded",bands:true},{n:"Tasselled",tassel:true}];
T({n:"Polearm",verb:"Cleave",mats:METAL,parts:[{n:"Head",list:HEADS},{n:"Collar",list:[{n:"Socket"},{n:"Ringed"},{n:"Fanged"}]},{n:"Haft",list:HAFTS},{n:"Butt",list:POMMELS}],
  name:(w,M)=>`${M.n} ${HEADS[w.p1].n}`,
  build(w){
    const M=METAL[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap],G=GEMS[w.gem],hd=HEADS[w.p1],po=POMMELS[w.p4],hf=HAFTS[w.p3],hl=104,haft=WOOD[w.wrap%3];
    let extra="";
    for(let y=18;y<hl-10;y+=11) extra+=`<path d="M-6 ${y} Q0 ${y+2} 6 ${y}" stroke="${haft.o}" stroke-width="1.2" fill="none" opacity=".4"/>`;
    const wrapY=hl-40;
    if(hf.wrap||hf.tassel){extra+=`<rect x="-8" y="${wrapY}" width="16" height="30" fill="${Wr.b}"/>`;for(let y=wrapY+3;y<wrapY+30;y+=5) extra+=`<path d="M-9 ${y} L9 ${y+3}" stroke="${Wr.o}" stroke-width="1.4" opacity=".6"/>`;}
    if(hf.bands) for(const y of [30,60,85]) extra+=`<rect x="-9" y="${y}" width="18" height="5" fill="${F.b}" stroke="${F.o}" stroke-width="1.3"/>`;
    let svg=shaded(`M-6 -18 L6 -18 L7 ${hl} L-7 ${hl} Z`,haft,{hw:5,extra});
    if(hf.tassel){svg+=`<g>${[ -6,-2,2,6].map((x,i)=>`<path d="M${x} 24 Q${x+R(-3,3)} 34 ${x+R(-4,4)} ${44+i%2*4}" stroke="${Wr.o}" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M${x} 24 Q${x} 34 ${x} ${42+i%2*4}" stroke="${Wr.b}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`).join("")}<rect x="-8" y="18" width="16" height="7" rx="2" fill="${F.b}" stroke="${F.o}" stroke-width="1.4"/></g>`;}
    const py=hl+po.h-2;
    svg+=`<g transform="translate(0 ${py})">${po.paw?shaded("M-10 0 A10 9 0 1 0 10 0 A10 9 0 1 0 -10 0 Z",F,{hw:7})+pawPads(F,0,0,9):`<g transform="scale(.85)">${shaded(po.d,F,{hw:7})}</g>`}</g>`;
    const ty=hd.kind==="spear"?-12:6, sc=1.55;
    svg+=`<g transform="translate(0 ${ty}) scale(${sc})">${shaded(hd.d,M,{hw:8,cx:hd.cx||0,extra:`<path d="M-50 -12 L50 -22" stroke="#fff" stroke-width="5" opacity=".2"/>`})}</g>`;
    const cy0=hd.kind==="spear"?-4:20, cy1=hd.kind==="spear"?8:30;
    svg+=shaded(`M-8 ${cy0} L8 ${cy0} L7 ${cy1} L-7 ${cy1} Z`,F,{hw:5});
    if(w.p2===1) svg+=`<rect x="-9.5" y="${cy1+2}" width="19" height="4" rx="1.5" fill="${F.b}" stroke="${F.o}" stroke-width="1.3"/>`;
    if(w.p2===2) svg+=`<path d="M-8 ${cy1} L-12 ${cy1+10} L-4 ${cy1+3} Z M8 ${cy1} L12 ${cy1+10} L4 ${cy1+3} Z" fill="${FIT[5].b}" stroke="${FIT[5].o}" stroke-width="1.3" stroke-linejoin="round"/>`;
    if(G) svg+=gemShape(G,0,hd.kind==="spear"?2:25,5.5);
    const top=hd.kind==="spear"?-92:-44, pts=hd.span.map(([x,y])=>[x*sc,ty+y*sc]);
    return {svg,rot:45,box:[-64,top,64,py+12],geo:{kind:hd.kind,root:[0,ty],tip:pts[2],grip:[wrapY,wrapY+30],gripX:0,flower:[10,cy0-4],strike:pts,edges:pts.map((p,i)=>[p[0],p[1],i%2?1:-1]),
      metal:`<g transform="translate(0 ${ty}) scale(${sc})"><path d="${hd.d}" fill="#fff"/></g>`}};
  }});

/* ---- Stick ---- */
T({n:"Stick",verb:"Bonk · fetch",mats:WOOD,
  parts:[{n:"Shape",list:[{n:"Straight"},{n:"Crooked"},{n:"Forked"},{n:"Gnarled"}]},{n:"Growth",list:[{n:"Bare"},{n:"Leafy"},{n:"Acorns"},{n:"Mushrooms"}]},{n:"Tie",list:[{n:"None"},{n:"Twine"},{n:"Bandana"},{n:"Tape"}]},{n:"Tip",list:[{n:"Snapped"},{n:"Sharpened"},{n:"Crystal"},{n:"Glow knot"}]}],
  name:(w,M)=>`${M.n} ${["Stick","Crooked Stick","Forked Stick","Gnarled Stick"][w.p1]}`,
  build(w){
    const M=WOOD[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap],G=GEMS[w.gem]||GEMS[2];
    const mains=[[[0,58],[1,20],[-1,-20],[1,-62]],[[0,58],[4,24],[-6,-6],[3,-34],[-4,-62]],[[0,58],[0,12],[-6,-36],[-10,-64]],[[0,58],[-2,24],[3,-12],[-2,-40],[1,-64]]][w.p1];
    const top=mains[mains.length-1];
    const wf=t=>7.2-2.4*t+(w.p1===3?Math.sin(t*22)*1.3:0);
    let svg="",bark="";
    for(let i=0;i<7;i++){const y=50-i*16,x=(i%2?2.5:-2.5);bark+=`<path d="M${x} ${y} l${i%2?-1:1} -7" stroke="${M.mark||M.o}" stroke-width="1.3" opacity="${M.mark?.8:.45}" stroke-linecap="round"/>`;}
    if(M.mark) for(let i=0;i<4;i++) bark+=`<path d="M-7 ${40-i*24} l5 1" stroke="${M.mark}" stroke-width="2" stroke-linecap="round"/>`;
    // twigs / fork drawn first so the main limb overlaps them
    const twigs=[];
    if(w.p1===2) twigs.push([[-1,6],[10,-20],[18,-46]]);
    else twigs.push([[0,-6],[10,-18],[16,-26]]);
    if(w.p1!==2) twigs.push([[0,22],[-9,12],[-14,8]]);
    for(const tw of twigs) svg+=shaded(ribbon(tw,t=>(w.p1===2&&tw===twigs[0]?4.6:3.2)-1.6*t),M,{hw:4,sw:2.6});
    svg+=shaded(ribbon(mains,wf),M,{hw:6,extra:bark});
    if(w.p1===3) for(const [x,y] of [[-6,10],[6,-22],[-5,-46]]) svg+=shaded(circleP(x,y,4),M,{hw:3,sw:2.2});
    // knot
    svg+=`<ellipse cx="2" cy="-2" rx="2.6" ry="3.6" fill="${M.s}" stroke="${M.o}" stroke-width="1.4"/>`;
    const ends=twigs.map(t=>t[t.length-1]);
    if(w.p2===1){ends.forEach(([x,y],i)=>{svg+=leaf(x,y,-60+i*80,13)+leaf(x,y,10+i*40,11);});svg+=leaf(top[0],top[1]+6,-130,12);}
    if(w.p2===2){svg+=acorn(ends[0][0]+2,ends[0][1]+4,1)+acorn(ends[0][0]-5,ends[0][1]+8,.85)+leaf(ends[0][0],ends[0][1],-30,11);}
    if(w.p2===3){svg+=mushroom(-6,-24,-60,1.1)+mushroom(-7,-16,-70,.8)+mushroom(6,8,60,.95);}
    // tie: placed along the limb's centreline so it sits right on crooked shapes
    const cl=spline(mains,16);
    const on=(y)=>{let k=0;for(let i=1;i<cl.length;i++){if(Math.abs(cl[i][1]-y)<Math.abs(cl[k][1]-y))k=i;}const a=cl[Math.max(0,k-1)],b=cl[Math.min(cl.length-1,k+1)];return [cl[k][0],Math.atan2(b[0]-a[0],a[1]-b[1])*180/Math.PI];};
    const tieAt=(y,inner)=>{const [x,ang]=on(y);return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})">${inner}</g>`;};
    if(w.p3===1){for(let y=30;y<52;y+=4) svg+=tieAt(y,`<path d="M-8.5 0 Q0 2.5 8.5 1" stroke="#5a4020" stroke-width="3.6" fill="none"/><path d="M-8.5 0 Q0 2.5 8.5 1" stroke="#e2c88a" stroke-width="2" fill="none"/>`);}
    if(w.p3===2){svg+=tieAt(4,shaded(`M-9 -4 L9 -4 L9 5 L-9 5 Z`,Wr,{hw:4,sw:2.4})+`<g>${shaded("M6 0 Q16 -2 22 8 Q14 6 6 4 Z",Wr,{hw:3,sw:2.2})}${shaded("M6 0 Q14 6 15 18 Q10 10 5 4 Z",Wr,{hw:3,sw:2.2})}<circle cx="6" cy="1" r="3.4" fill="${Wr.s}" stroke="${Wr.o}" stroke-width="1.6"/></g>`+[[-3,-1],[2,2],[-5,3]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity=".85"/>`).join(""));}
    if(w.p3===3){for(const y of [30,40]) svg+=tieAt(y,shaded(`M-9 -4 L9 -3 L9 4 L-9 3 Z`,{b:"#d8dce4",s:"#a8b0bc",l:"#fff",o:"#2a3038"},{hw:4,sw:2.2}));}
    // tip
    const tx=top[0],ty=top[1];
    if(w.p4===0) svg+=`<path d="M${tx-5} ${ty+2} L${tx-2} ${ty-4} L${tx+1} ${ty} L${tx+4} ${ty-3} L${tx+5} ${ty+2}" fill="${M.l}" stroke="${M.o}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if(w.p4===1) svg+=shaded(`M${tx-5.2} ${ty+3} L${tx} ${ty-14} L${tx+5.2} ${ty+3} Z`,{b:"#f3dcb0",s:"#d4b680",l:"#fff6e0",o:M.o},{cx:tx,hw:4,sw:2.4});
    if(w.p4===2){svg+=crystal(tx,ty+4,24,G,-8)+`<path d="M${tx-6} ${ty+2} L${tx+6} ${ty+5} M${tx-6} ${ty+6} L${tx+6} ${ty+9}" stroke="#e2c88a" stroke-width="2.4"/>`;}
    if(w.p4===3){svg+=`<circle cx="${tx}" cy="${ty+16}" r="5" fill="${G.b}" stroke="${M.o}" stroke-width="2"/><circle cx="${tx-1.5}" cy="${ty+14.5}" r="1.6" fill="#fff"/>`;}
    const tipY=w.p4===1?ty-14:w.p4===2?ty-20:ty;
    return {svg,rot:45,box:[-26,tipY-6,26,64],geo:{kind:"stick",root:[0,30],tip:[tx,tipY],grip:[26,52],gripX:0,flower:[7,-8],
      strike:[[0,-8],[-1,-28],[0,-46],[tx,ty]],edges:[[-6,-14,-1],[6,-30,1],[-6,-44,-1]],metal:`<path d="${ribbon(mains,wf)}" fill="#fff"/>`}};
  }});

/* ---- Tennis ball ---- */
T({n:"Ball",verb:"Throw · fetch",mats:BALL,
  parts:[{n:"Seams",list:[{n:"Classic"},{n:"Star"},{n:"Striped"},{n:"Paw spots"}]},{n:"Condition",list:[{n:"Fresh"},{n:"Fluffy"},{n:"Slobbery"},{n:"Chewed"}]},{n:"Extra",list:[{n:"None",v:0},{n:"Squeaker",v:2},{n:"Spikes",v:3}]},{n:"Face",list:[{n:"None"},{n:"Happy"},{n:"Paw stamp"},{n:"Star sticker"}]}],
  name:(w,M)=>`${["","Fluffy ","Slobbery ","Chewed "][w.p2]}${M.n} ${["Ball","Ball","Ball","Spiked Ball"][w.p3]}`,
  build(w){
    const M=BALL[w.mat],F=FIT[w.fit],r=32;
    let d;
    if(w.p2===1||w.p2===3){const n=w.p2===1?40:28;let s="";for(let i=0;i<n;i++){const a=i/n*Math.PI*2;let rr=r+(w.p2===1?(i%2?1.8:-0.6):0);if(w.p2===3){const bite=[.6,.66,.72,2.6,2.68];if(bite.some(b=>Math.abs(a-b)<.05))rr=r-6;}s+=(i?"L":"M")+f1(Math.cos(a)*rr)+" "+f1(Math.sin(a)*rr);}d=s+"Z";}
    else d=circleP(0,0,r);
    let svg="";
    if(w.p3===1){for(let i=0;i<3;i++){const o=(i-1)*12;svg+=`<path d="M${-20+o*.3} ${8+o} Q${-46} ${30+o} ${-62+i*4} ${44+o*.6}" stroke="${M.b}" stroke-width="${9-i*2}" stroke-linecap="round" fill="none" opacity="${.75-i*.18}"/>`;}}
    if(w.p3===3){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.cos(a),y=Math.sin(a);svg+=`<path d="M${f1(x*(r-2)-y*5)} ${f1(y*(r-2)+x*5)} L${f1(x*(r+11))} ${f1(y*(r+11))} L${f1(x*(r-2)+y*5)} ${f1(y*(r-2)-x*5)} Z" fill="${F.b}" stroke="${F.o}" stroke-width="1.8" stroke-linejoin="round"/>`;}}
    let inside="";
    const seam=(p)=>`<path d="${p}" stroke="${M.o}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/><path d="${p}" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if(w.p1===0) inside+=seam("M-26 -22 C-8 -8 -8 8 -26 22")+seam("M26 -22 C8 -8 8 8 26 22");
    if(w.p1===1){let s="";for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;s+=`M0 0 L${f1(Math.cos(a)*40)} ${f1(Math.sin(a)*40)} `;}inside+=seam(s);}
    if(w.p1===2) inside+=`<path d="M-40 -6 L40 -14 L40 2 L-40 10 Z" fill="#ffffff" stroke="${M.o}" stroke-width="1.5" opacity=".95"/>`;
    if(w.p1===3) inside+=[[-14,-14],[14,-6],[-6,14],[18,18]].map(([x,y])=>pawShape(x,y,6,M.s,"none")).join("");
    if(w.p2===1) for(let i=0;i<26;i++){const a=R(0,6.28),rr=R(4,r-3);inside+=`<path d="M${f1(Math.cos(a)*rr)} ${f1(Math.sin(a)*rr)} l${f1(R(-2,2))} ${f1(R(-2,2))}" stroke="${M.l}" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>`;}
    if(w.p2===3) inside+=`<circle cx="-12" cy="10" r="2.6" fill="${M.o}" opacity=".6"/><circle cx="8" cy="-16" r="2" fill="${M.o}" opacity=".6"/><circle cx="14" cy="12" r="2.2" fill="${M.o}" opacity=".6"/>`;
    svg+=roundShade(d,M,0,0,r,inside);
    if(w.p2===2) svg+=`<path d="M-14 -22 Q-4 -28 6 -24" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="12" cy="-20" r="2.2" fill="#fff"/><path d="M8 30 Q10 40 6 46 Q2 40 4 31 Z" fill="#cfefff" stroke="#3a6a8a" stroke-width="1.4" opacity=".9"/><path d="M-22 22 Q-24 30 -27 33 Q-28 28 -24 23 Z" fill="#cfefff" stroke="#3a6a8a" stroke-width="1.2" opacity=".85"/>`;
    if(w.p3===2) svg+=`<circle r="8" fill="${F.b}" stroke="${F.o}" stroke-width="2"/><circle r="3" fill="${F.o}"/>`;
    if(w.p4===1) svg+=`<g fill="${M.o}"><ellipse cx="-9" cy="-4" rx="3" ry="4.4"/><ellipse cx="9" cy="-4" rx="3" ry="4.4"/><circle cx="-8" cy="-5.5" r="1.1" fill="#fff"/><circle cx="10" cy="-5.5" r="1.1" fill="#fff"/></g><path d="M-8 6 Q0 14 8 6" stroke="${M.o}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-3 9.5 Q0 15 3 9.5 Z" fill="#ff6a8a"/>`;
    if(w.p4===2) svg+=pawShape(0,2,13,"#fff",M.o);
    if(w.p4===3) svg+=`<path d="M0 -11 L3 -3 L11 -3 L5 2 L7 10 L0 5 L-7 10 L-5 2 L-11 -3 L-3 -3 Z" fill="#ffe14a" stroke="#6a4a06" stroke-width="1.6" stroke-linejoin="round" transform="rotate(-12)"/>`;
    return {svg,rot:0,box:[w.p3===1?-66:-46,-46,46,w.p3===1?50:46],geo:{kind:"ball",root:[-24,24],tip:[22,-22],grip:null,flower:[18,-24],
      strike:[[-22,-22],[0,-31],[22,-22],[31,0]],edges:[[-30,-8,-1],[-12,-30,1],[18,-26,1],[30,8,1]],metal:`<path d="${d}" fill="#fff"/>`}};
  }});

/* ---- Flying disc ---- */
T({n:"Disc",verb:"Throw · returns",mats:PLASTIC,
  parts:[{n:"Rim",list:[{n:"Smooth"},{n:"Sawtooth"},{n:"Scalloped"},{n:"Star"}]},{n:"Centre",list:[{n:"Paw"},{n:"Ring"},{n:"Spiral"},{n:"Bone"}]},{n:"Bands",list:[{n:"None"},{n:"One"},{n:"Two"}]},{n:"Edge",list:[{n:"Plain"},{n:"Gilded"},{n:"Studded"},{n:"Ribbons"}]}],
  name:(w,M)=>`${M.n} ${["Disc","Sawdisc","Petal Disc","Star Disc"][w.p1]}`,
  build(w){
    const M=PLASTIC[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap];
    const rx=46,ry=24;
    const ring=(rr,k)=>{let s="";const n=w.p1===0?48:w.p1===1?36:w.p1===2?30:16;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;let m=1;if(w.p1===1)m=i%3===0?1.12:.96;if(w.p1===2)m=.94+.07*Math.abs(Math.sin(a*7.5));if(w.p1===3)m=i%2?.8:1.12;s+=(i?"L":"M")+f1(Math.cos(a)*rx*m*rr)+" "+f1(Math.sin(a)*ry*m*rr+k);}return s+"Z";};
    let svg="";
    if(w.p4===3) svg+=`<g>${[[-30,18,-58,40],[-18,20,-40,50]].map(([x,y,x2,y2])=>`<path d="M${x} ${y} Q${(x+x2)/2-8} ${y+16} ${x2} ${y2}" stroke="${Wr.o}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x} ${y} Q${(x+x2)/2-8} ${y+16} ${x2} ${y2}" stroke="${Wr.b}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`).join("")}</g>`;
    svg+=shaded(ring(1,8),{b:M.s,s:M.o,l:M.s,o:M.o},{nohl:true,hw:6});
    let top="";
    if(w.p3>=1) top+=`<ellipse cx="0" cy="0" rx="${rx*.74}" ry="${ry*.74}" fill="none" stroke="${M.l}" stroke-width="3.4" opacity=".9"/>`;
    if(w.p3>=2) top+=`<ellipse cx="0" cy="0" rx="${rx*.56}" ry="${ry*.56}" fill="none" stroke="${M.s}" stroke-width="3" opacity=".9"/>`;
    const C=`<g transform="scale(1 .52)">${[
      pawShape(0,1,14,M.l,M.o),
      `<circle r="14" fill="none" stroke="${M.o}" stroke-width="4"/><circle r="5" fill="${M.o}"/>`,
      `<path d="${pathAlong(Array.from({length:14},(_,i)=>{const a=i*.75,rr=2+i*1.2;return [Math.cos(a)*rr,Math.sin(a)*rr];}))}" stroke="${M.o}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
      `<g fill="#fff" stroke="${M.o}" stroke-width="1.8"><path d="M-12 -3 L12 -3 L12 3 L-12 3 Z"/><circle cx="-13" cy="-4" r="4.2"/><circle cx="-13" cy="4" r="4.2"/><circle cx="13" cy="-4" r="4.2"/><circle cx="13" cy="4" r="4.2"/><path d="M-11 -3 L11 -3 L11 3 L-11 3 Z" stroke="none"/></g>`][w.p2]}</g>`;
    svg+=roundShade(ring(1,0),M,0,0,rx,top+C+`<path d="M-30 -12 Q0 -26 30 -14" stroke="#fff" stroke-width="3.5" fill="none" opacity=".55" stroke-linecap="round"/>`);
    if(w.p4===1) svg+=`<path d="${ring(1,0)}" fill="none" stroke="${F.b}" stroke-width="3" stroke-linejoin="round"/>`;
    if(w.p4===2) for(let i=0;i<10;i++){const a=i/10*Math.PI*2;svg+=`<circle cx="${f1(Math.cos(a)*rx*.92)}" cy="${f1(Math.sin(a)*ry*.92)}" r="3" fill="${F.b}" stroke="${F.o}" stroke-width="1.4"/>`;}
    return {svg,rot:-14,box:[w.p4===3?-62:-54,-30,54,w.p4===3?54:36],geo:{kind:"disc",root:[-44,0],tip:[46,0],grip:null,flower:[-26,-14],
      strike:[[-40,-8],[-14,-22],[16,-22],[44,-4]],edges:[[-46,0,-1],[0,-24,1],[46,0,1]],metal:`<path d="${ring(1,0)}" fill="#fff"/>`}};
  }});

/* ---- Tug rope ---- */
T({n:"Tug Rope",verb:"Whip · flail",mats:ROPE2,
  parts:[{n:"End",list:[{n:"Big knot"},{n:"Double knot"},{n:"Ball end"},{n:"Bone end"}]},{n:"Weave",list:[{n:"Twisted"},{n:"Braided"},{n:"Frayed"}]},{n:"Length",list:[{n:"Short"},{n:"Long"}]},{n:"Handle",list:[{n:"Loop"},{n:"Knot"},{n:"Ring"}]}],
  name:(w,M)=>`${["Knotted","Double-Knot","Ball","Bone"][w.p1]} Tug Rope`,
  build(w){
    const A=WRAP[w.wrap],Bc=ROPE2[w.mat].b,F=FIT[w.fit];
    const top=w.p3?-56:-26;
    const pts=[[0,44],[3,20],[-3,-4],[2,top+6]];
    const rp=ribbon(pts,()=>5.5);
    let stripes="";for(let y=60;y>top-30;y-=w.p2===1?6:7.5){stripes+=w.p2===1?`<path d="M-8 ${y} L0 ${y-4} L8 ${y}" stroke="${Bc}" stroke-width="2.6" fill="none"/>`:`<path d="M-9 ${y} L9 ${y-9}" stroke="${Bc}" stroke-width="3.4"/>`;}
    let svg="";
    // handle
    if(w.p4===0) svg+=`<g fill="none"><ellipse cx="0" cy="58" rx="13" ry="15" stroke="${A.o}" stroke-width="10"/><ellipse cx="0" cy="58" rx="13" ry="15" stroke="${A.b}" stroke-width="6.6"/><ellipse cx="0" cy="58" rx="13" ry="15" stroke="${Bc}" stroke-width="6.6" stroke-dasharray="4 5"/></g>`;
    if(w.p4===1) svg+=roundShade(circleP(0,52,11),A,0,52,11,`<path d="M-11 48 Q0 58 11 48 M-10 56 Q0 46 10 56" stroke="${Bc}" stroke-width="3" fill="none"/>`);
    if(w.p4===2) svg+=`<g fill="none"><circle cx="0" cy="58" r="13" stroke="${F.o}" stroke-width="8"/><circle cx="0" cy="58" r="13" stroke="${F.b}" stroke-width="4.6"/><path d="M-8 52 A10 10 0 0 1 4 47" stroke="${F.l}" stroke-width="1.8"/></g>`;
    svg+=shaded(rp,A,{hw:5,extra:stripes});
    if(w.p2===2) for(let i=0;i<6;i++) svg+=`<path d="M${-4+i*1.6} 40 q${R(-3,3)} 6 ${R(-5,5)} ${R(9,14)}" stroke="${i%2?Bc:A.b}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    const knot=(y,r)=>roundShade(circleP(0,y,r),A,0,y,r,`<path d="M${-r} ${y-3} Q0 ${y+6} ${r} ${y-3} M${-r} ${y+4} Q0 ${y-6} ${r} ${y+4}" stroke="${Bc}" stroke-width="3.2" fill="none"/>`);
    let endY=top, endSvg="";
    if(w.p1===0){endSvg=knot(top,14);endY=top-14;}
    if(w.p1===1){endSvg=knot(top+18,9)+knot(top,13);endY=top-13;}
    if(w.p1===2){const BM=BALL[0];endSvg=roundShade(circleP(0,top-6,16),BM,0,top-6,16,`<path d="M-13 -16 C-4 -9 -4 -3 -13 4" transform="translate(0 ${top-6})" stroke="#fff" stroke-width="3" fill="none"/><path d="M13 -16 C4 -9 4 -3 13 4" transform="translate(0 ${top-6})" stroke="#fff" stroke-width="3" fill="none"/>`);endY=top-22;}
    if(w.p1===3){const BM=BONE[0];endSvg=`<g transform="translate(0 ${top-6}) rotate(90)">${shaded("M-16 -4 L16 -4 L16 4 L-16 4 Z",BM,{hw:5})}${roundShade(circleP(-17,-6,7),BM,-17,-6,7)}${roundShade(circleP(-17,6,7),BM,-17,6,7)}${roundShade(circleP(17,-6,7),BM,17,-6,7)}${roundShade(circleP(17,6,7),BM,17,6,7)}</g>`;endY=top-30;}
    svg+=endSvg;
    return {svg,rot:40,box:[-26,endY-4,26,76],geo:{kind:"rope",root:[0,30],tip:[0,endY+4],grip:[44,72],gripX:0,flower:[8,top+16],
      strike:[[0,top+10],[0,top-2],[0,endY+8],[0,endY+2]],edges:[[-12,top,-1],[12,top-8,1],[-10,endY+10,-1]],metal:`<g>${endSvg.replace(/fill="url\([^)]*\)"/g,'fill="#fff"')}</g>`}};
  }});

/* ---- Slingshot ---- */
T({n:"Slingshot",verb:"Shoot",mats:WOOD,
  parts:[{n:"Fork",list:[{n:"Classic Y"},{n:"Wide U"},{n:"Antler"},{n:"Bone"}]},{n:"Band",list:[{n:"Rubber"},{n:"Leather"},{n:"Vine"}]},{n:"Ammo",list:[{n:"Pebble"},{n:"Acorn"},{n:"Mini ball"},{n:"Star"}]},{n:"Handle",list:[{n:"Plain"},{n:"Twine"},{n:"Bandana"}]}],
  name:(w,M)=>`${w.p1===3?"Bone":w.p1===2?"Antler":M.n} Slingshot`,
  build(w){
    const M=w.p1===3?BONE[0]:w.p1===2?FIT[5]:WOOD[w.mat],Wr=WRAP[w.wrap],F=FIT[w.fit];
    const L=w.p1===1?[[0,10],[-18,0],[-26,-20],[-24,-40]]:[[0,12],[-12,-6],[-20,-24],[-22,-42]];
    const Rr=L.map(([x,y])=>[-x,y]);
    let svg="";
    const tipL=L[3],tipR=Rr[3];
    const band=[["#c2493a","#6a1a12"],["#8a5a34","#2e1c0c"],["#5fbf5a","#1d4a22"]][w.p2];
    // back band
    svg+=`<path d="M${tipR[0]} ${tipR[1]} Q8 -14 0 -10" stroke="${band[1]}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M${tipR[0]} ${tipR[1]} Q8 -14 0 -10" stroke="${band[0]}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const wf=t=>6.2-2.2*t;
    svg+=shaded(ribbon(L,wf),M,{hw:5,sw:2.8})+shaded(ribbon(Rr,wf),M,{hw:5,sw:2.8});
    if(w.p1===2){svg+=shaded(ribbon([[-17,-16],[-30,-24],[-36,-30]],t=>3.4-2*t),M,{hw:3,sw:2.4})+shaded(ribbon([[17,-16],[30,-24],[36,-30]],t=>3.4-2*t),M,{hw:3,sw:2.4});}
    if(w.p1===3){for(const p of [tipL,tipR]) svg+=roundShade(circleP(p[0],p[1]-3,6),M,p[0],p[1]-3,6);}
    let hx="";
    if(w.p4===1) for(let y=22;y<54;y+=4) hx+=`<path d="M-9 ${y} Q0 ${y+2.5} 9 ${y+1}" stroke="#e2c88a" stroke-width="2.2" fill="none"/>`;
    if(w.p4===2) hx+=`<rect x="-10" y="26" width="20" height="18" fill="${Wr.b}"/><path d="M-10 26 L10 30 M-10 36 L10 40" stroke="${Wr.l}" stroke-width="1.6"/>`;
    svg+=shaded(ribbon([[0,60],[0,30],[0,6]],t=>7.6-1.2*t),M,{hw:6,extra:hx});
    if(w.p1===3) svg+=roundShade(circleP(0,62,8),M,0,62,8);
    // pouch + ammo + front band
    svg+=`<ellipse cx="0" cy="-8" rx="9" ry="6" fill="${band[1]}"/>`;
    const amm=[roundShade(circleP(0,-12,7),{b:"#a8a8b0",s:"#6a6a74",l:"#e8e8f0",o:"#22222a"},0,-12,7),acorn(0,-14,1.2),roundShade(circleP(0,-13,8),BALL[0],0,-13,8,`<path d="M-6 -19 C-2 -15 -2 -11 -6 -7" stroke="#fff" stroke-width="2" fill="none"/>`),`<path d="M0 -24 L3 -16 L11 -16 L5 -11 L7 -3 L0 -8 L-7 -3 L-5 -11 L-11 -16 L-3 -16 Z" fill="#ffe14a" stroke="#6a4a06" stroke-width="1.6" stroke-linejoin="round"/>`][w.p3];
    svg+=amm;
    svg+=`<path d="M${tipL[0]} ${tipL[1]} Q-8 -2 -7 -6 Q0 -2 7 -6" stroke="${band[1]}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M${tipL[0]} ${tipL[1]} Q-8 -2 -7 -6 Q0 -2 7 -6" stroke="${band[0]}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const ammoPath=w.p3===1?circleP(0,-12,8):w.p3===3?"M0 -24 L3 -16 L11 -16 L5 -11 L7 -3 L0 -8 L-7 -3 L-5 -11 L-11 -16 L-3 -16 Z":circleP(0,-12,8);
    return {svg,rot:-12,box:[-40,-52,40,72],geo:{kind:"sling",root:[0,6],tip:[0,-20],grip:[22,56],gripX:0,flower:[-16,-20],
      strike:[[0,-12],[-8,-20],[8,-20],[0,-26]],edges:[[tipL[0],tipL[1],-1],[tipR[0],tipR[1],1]],metal:`<path d="${ammoPath}" fill="#fff"/>`}};
  }});

/* ---- Bone club ---- */
T({n:"Bone Club",verb:"Smash",mats:BONE,
  parts:[{n:"Knobs",list:[{n:"Classic"},{n:"Big femur"},{n:"Knobbly"},{n:"Ribbed"}]},{n:"Bands",list:[{n:"None"},{n:"Leather"},{n:"Metal"}]},{n:"Spikes",list:[{n:"None"},{n:"Studs"},{n:"Spikes"},{n:"Nails"}]},{n:"Carving",list:[{n:"None"},{n:"Paw"},{n:"Runes"},{n:"Crack"}]}],
  name:(w,M)=>`${M.n} ${["Club","Femur","Knucklebone","Ribcrusher"][w.p1]}`,
  build(w){
    const M=BONE[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap];
    const big=w.p1===1, tr=big?17:13, br=10;
    let svg="";
    // spikes behind the top knobs
    if(w.p3===2) for(const [x,y,a] of [[-18,-74,-140],[0,-86,-90],[18,-74,-40],[-24,-58,170],[24,-58,10]]) svg+=`<g transform="translate(${x} ${y}) rotate(${a})">${shaded("M0 -5 L16 0 L0 5 Z",F,{hw:3,sw:2})}</g>`;
    if(w.p3===3) for(const [x1,y1,x2,y2] of [[-26,-78,10,-50],[24,-80,-8,-52]]) svg+=`<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${F.o}" stroke-width="4.4" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${F.b}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="3.4" fill="${F.b}" stroke="${F.o}" stroke-width="1.4"/>`;
    let ex="";
    if(w.p1===3) for(let y=-40;y<40;y+=9) ex+=`<path d="M-9 ${y} Q0 ${y+3} 9 ${y}" stroke="${M.s}" stroke-width="2.2" fill="none"/>`;
    if(w.p4===1) ex+=pawShape(0,-20,8,M.s,"none");
    if(w.p4===2) ex+=`<path d="M-3 -40 L3 -34 L-3 -28 M3 -20 L-3 -14 L3 -8 M0 4 L0 12" stroke="${M.o}" stroke-width="1.6" fill="none" opacity=".7"/>`;
    if(w.p4===3) ex+=`<path d="M4 -48 L-1 -36 L4 -28 L-2 -14" stroke="${M.o}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`;
    const shaft=ribbon([[0,56],[0,10],[0,-58]],t=>(w.p1===2?8.6+Math.sin(t*18)*1.6:8.6)-1.2*Math.sin(t*Math.PI));
    svg+=shaded(shaft,M,{hw:6,extra:ex});
    for(const [x,y,r] of [[-tr*.6,-60-tr*.5,tr],[tr*.6,-60-tr*.5,tr],[-br*.65,58+br*.4,br],[br*.65,58+br*.4,br]]) svg+=roundShade(circleP(x,y,r),M,x,y,r);
    if(w.p1===2) for(const [x,y] of [[-9,-6],[9,18],[-9,34]]) svg+=roundShade(circleP(x,y,4.6),M,x,y,4.6);
    if(w.p2===1){svg+=shaded("M-10 22 L10 22 L10 46 L-10 46 Z",Wr,{hw:5,extra:[26,32,38,44].map(y=>`<path d="M-11 ${y} L11 ${y-4}" stroke="${Wr.o}" stroke-width="1.4" opacity=".6"/>`).join("")});}
    if(w.p2===2) for(const y of [-36,26]) svg+=shaded(`M-11 ${y} L11 ${y} L11 ${y+7} L-11 ${y+7} Z`,F,{hw:5,sw:2.4});
    if(w.p3===1) for(const [x,y] of [[-tr*.6-6,-64-tr*.5],[-tr*.6+4,-70-tr*.6],[tr*.6+6,-64-tr*.5],[tr*.6-3,-72-tr*.6]]) svg+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="3.2" fill="${F.b}" stroke="${F.o}" stroke-width="1.6"/>`;
    const knobs=`${circleP(-tr*.6,-60-tr*.5,tr)} ${circleP(tr*.6,-60-tr*.5,tr)}`;
    return {svg,rot:45,box:[-30,-60-tr*1.5-6,30,74],geo:{kind:"club",root:[0,20],tip:[0,-60-tr*1.4],grip:[22,46],gripX:0,flower:[10,-46],
      strike:[[0,-30],[0,-50],[-tr*.6,-64-tr*.5],[tr*.6,-64-tr*.5]],edges:[[-tr*1.4,-62,-1],[tr*1.4,-66,1],[-10,-30,-1]],metal:`<path d="${knobs} ${shaft}" fill="#fff"/>`}};
  }});

/* ---- Claws ---- */
T({n:"Claws",verb:"Swipe",mats:METAL,
  parts:[{n:"Claw",list:[{n:"Hooked"},{n:"Straight"},{n:"Serrated"},{n:"Crescent"}]},{n:"Count",list:[{n:"Three"},{n:"Four"}]},{n:"Cuff",list:[{n:"Leather"},{n:"Plated"},{n:"Fur trim"}]},{n:"Knuckles",list:[{n:"Plain"},{n:"Studs"},{n:"Gem"}]}],
  name:(w,M)=>`${M.n} ${["Hookclaws","Clawblades","Sawclaws","Moonclaws"][w.p1]}`,
  build(w){
    const M=METAL[w.mat],Wr=WRAP[w.wrap],F=FIT[w.fit],G=GEMS[w.gem]||GEMS[1];
    const n=w.p2?4:3,xs=n===3?[-14,0,14]:[-18,-6,6,18];
    let svg="",claws="",mask="";
    const back="M-28 -10 Q-30 -22 -16 -20 Q0 -26 16 -20 Q30 -22 28 -10 L26 22 L-26 22 Z";
    svg+=shaded(back,Wr,{hw:7,extra:`<path d="M-20 -4 Q0 4 20 -4" stroke="${Wr.o}" stroke-width="1.6" fill="none" opacity=".5"/>`});
    const bendL=[16,4,10,24][w.p1],lenL=[58,62,56,56][w.p1];
    xs.forEach((x,i)=>{
      const len=lenL+((n===3&&i===1)||(n===4&&(i===1||i===2))?6:0);
      const pts=[[x,-12],[x+bendL*.15,-12-len*.45],[x+bendL*.55,-12-len*.8],[x+bendL,-12-len]];
      const p=ribbon(pts,t=>6.6*(1-t)+.5,12);
      claws+=shaded(p,M,{hw:4.5,sw:2.6,cx:x+bendL*.3});
      if(w.p1===2) claws+=`<path d="${pathAlong(pts.slice(0,3))}" stroke="${M.o}" stroke-width="1.6" stroke-dasharray="2 3" fill="none" transform="translate(-3.4 0)"/>`;
      claws+=`<ellipse cx="${x}" cy="-12" rx="6" ry="3.4" fill="${Wr.s}" stroke="${Wr.o}" stroke-width="1.8"/>`;
      mask+=`<path d="${p}" fill="#fff"/>`;
    });
    svg+=claws;
    if(w.p4===1) xs.forEach(x=>svg+=`<circle cx="${x}" cy="-12" r="3.6" fill="${F.b}" stroke="${F.o}" stroke-width="1.6"/>`);
    if(w.p4===2) svg+=gemShape(G,0,6,8);
    // cuff
    let cx="";
    if(w.p3===0) cx+=`<path d="M-26 32 L26 32 M-26 42 L26 42" stroke="${Wr.l}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
    const cuffM=w.p3===1?F:{b:Wr.s,s:Wr.o,l:Wr.b,o:Wr.o};
    svg+=shaded("M-28 22 L28 22 L30 50 L-30 50 Z",cuffM,{hw:6,extra:cx});
    if(w.p3===1) for(const x of [-18,0,18]) svg+=`<circle cx="${x}" cy="36" r="2.4" fill="${F.l}" stroke="${F.o}" stroke-width="1.2"/>`;
    if(w.p3===2){let s="M-32 46";for(let i=0;i<=12;i++){s+=` Q${-32+i*5.3+2.6} ${i%2?60:58} ${-32+(i+1)*5.3} 47`;}svg+=`<path d="${s} L32 44 L-32 44 Z" fill="#f6f1e6" stroke="#5a4e3e" stroke-width="2" stroke-linejoin="round"/>`;}
    const tips=xs.map(x=>[x+bendL,-12-lenL]);
    return {svg,rot:-18,box:[-36,-86,50,62],geo:{kind:"claws",root:[0,-6],tip:tips[Math.floor(tips.length/2)],grip:null,flower:[22,12],
      strike:tips.map(([x,y])=>[x-4,y+14]),edges:tips.map(([x,y],i)=>[x-6,y+20,i%2?1:-1]),metal:`<g>${mask}</g>`}};
  }});

/* ---- Staff ---- */
const TOPS=[{n:"Crystal"},{n:"Crescent"},{n:"Clutched orb"},{n:"Antler crown"},{n:"Paw totem"}];
T({n:"Staff",verb:"Cast",mats:WOOD,
  parts:[{n:"Top",list:TOPS},{n:"Shaft",list:[{n:"Straight"},{n:"Twisted"},{n:"Rootbound"}]},{n:"Charms",list:[{n:"None"},{n:"Feathers"},{n:"Bells"},{n:"Beads"}]},{n:"Wrap",list:[{n:"None"},{n:"Cloth"},{n:"Vine"}]}],
  name:(w,M)=>`${M.n} ${["Crystal Staff","Moon Staff","Orb Staff","Antler Staff","Totem Staff"][w.p1]}`,
  build(w){
    const M=WOOD[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap],G=GEMS[w.gem]||GEMS[5];
    let svg="";
    const pts=w.p2===2?[[0,84],[-3,40],[3,0],[-2,-30],[0,-46]]:[[0,84],[0,20],[0,-46]];
    const wf=t=>5.4-1*t+(w.p2===2&&t<.12?(0.12-t)*40:0);
    let ex="";
    if(w.p2===1) for(let y=80;y>-46;y-=9) ex+=`<path d="M-7 ${y} Q0 ${y-3} 7 ${y-8}" stroke="${M.s}" stroke-width="2.6" fill="none"/>`;
    if(w.p4===1) ex+=`<rect x="-9" y="6" width="18" height="26" fill="${Wr.b}"/>`+[10,16,22,28].map(y=>`<path d="M-9 ${y} L9 ${y-4}" stroke="${Wr.o}" stroke-width="1.4" opacity=".6"/>`).join("");
    if(w.p2===2){svg+=shaded(ribbon([[0,74],[-10,82],[-16,92]],t=>3.2-2*t),M,{hw:3,sw:2.4})+shaded(ribbon([[0,74],[10,84],[14,94]],t=>3.2-2*t),M,{hw:3,sw:2.4});}
    svg+=shaded(ribbon(pts,wf),M,{hw:5,extra:ex});
    if(w.p4===2){let d="M0 40";for(let i=1;i<=8;i++){const y=40-i*7;d+=` Q${i%2?9:-9} ${y+3.5} 0 ${y}`;}svg+=`<path d="${d}" stroke="#1d4a22" stroke-width="4" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#5fbf5a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`+leaf(6,24,-20,10)+leaf(-6,4,200,10);}
    let top="",mask="",tipY=-80;
    if(w.p1===0){top+=crystal(0,-44,40,G)+`<g>${[-1,1].map(s=>shaded(`M${s*4} -46 Q${s*12} -56 ${s*8} -66 Q${s*8} -54 ${s*2} -46 Z`,F,{hw:3,sw:2})).join("")}</g>`;mask=`<path d="M0 -84 L11 -72 L9 -44 L-9 -44 L-11 -72 Z" fill="#fff"/>`;tipY=-84;}
    if(w.p1===1){const cm="M10 -88 A26 26 0 1 0 10 -40 A20 20 0 1 1 10 -88 Z";top+=shaded(cm,F,{hw:6,cx:-6})+gemShape(G,4,-64,6);mask=`<path d="${cm}" fill="#fff"/>`;tipY=-88;}
    if(w.p1===2){top+=roundShade(circleP(0,-64,14),{b:G.b,s:G.s,l:G.l,o:"#1a1030"},0,-64,14)+`<circle cx="-5" cy="-69" r="3.4" fill="#fff" opacity=".85"/>`+[-1,0,1].map(s=>shaded(ribbon([[s*3,-46],[s*14,-58],[s*12,-72],[s*5,-78]],t=>3-2*t),F,{hw:3,sw:2.2})).join("");mask=`<path d="${circleP(0,-64,14)}" fill="#fff"/>`;tipY=-80;}
    if(w.p1===3){const A=FIT[5];top+=[-1,1].map(s=>shaded(ribbon([[0,-44],[s*12,-60],[s*16,-80],[s*12,-94]],t=>4-2.6*t),A,{hw:3,sw:2.3})+shaded(ribbon([[s*12,-62],[s*24,-68],[s*28,-76]],t=>3-2*t),A,{hw:3,sw:2.1})+shaded(ribbon([[s*15,-78],[s*24,-88]],t=>2.6-1.8*t),A,{hw:3,sw:2})).join("")+gemShape(G,0,-50,6);mask=`<path d="${circleP(0,-70,22)}" fill="#fff"/>`;tipY=-94;}
    if(w.p1===4){top+=roundShade(`M-16 -52 Q-18 -66 -8 -70 Q0 -72 8 -70 Q18 -66 16 -52 Q0 -42 -16 -52 Z`,F,0,-60,16)+pawPads(F,0,-58,12)+gemShape(G,0,-80,5)+[-1,1].map(s=>`<circle cx="${s*12}" cy="-78" r="5" fill="${F.b}" stroke="${F.o}" stroke-width="1.8"/>`).join("");mask=`<path d="M-16 -52 Q-18 -66 -8 -70 Q0 -72 8 -70 Q18 -66 16 -52 Q0 -42 -16 -52 Z" fill="#fff"/>`;tipY=-86;}
    svg+=top;
    if(w.p3===1) svg+=[-1,1].map(s=>`<path d="M${s*8} -46 Q${s*12} -36 ${s*13} -26" stroke="#3a2a1a" stroke-width="1.2" fill="none"/><g transform="translate(${s*13} -26) rotate(${s*12})"><path d="M0 0 Q-5 10 0 22 Q5 10 0 0 Z" fill="${s<0?"#f4efe6":Wr.b}" stroke="#3a2a1a" stroke-width="1.3"/><path d="M0 2 L0 20" stroke="#3a2a1a" stroke-width=".8"/></g>`).join("");
    if(w.p3===2) svg+=[-1,1].map(s=>`<path d="M${s*7} -46 L${s*12} -32" stroke="#3a2a1a" stroke-width="1.2"/><path d="M${s*12-5} -24 Q${s*12-5} -33 ${s*12} -33 Q${s*12+5} -33 ${s*12+5} -24 Z" fill="${F.b}" stroke="${F.o}" stroke-width="1.6"/><circle cx="${s*12}" cy="-23" r="1.6" fill="${F.o}"/>`).join("");
    if(w.p3===3) svg+=`<path d="M-6 -44 Q-14 -30 -10 -18" stroke="#3a2a1a" stroke-width="1" fill="none"/>`+[-44,-38,-32,-26,-20].map((y,i)=>`<circle cx="${f1(-6-Math.sin(i*.7)*6)}" cy="${y+6}" r="2.6" fill="${["#ff8fc8","#ffe14a","#6ec6ff","#7dffb0","#c4a8ff"][i]}" stroke="#2a1a2a" stroke-width="1"/>`).join("");
    return {svg,rot:45,box:[-30,tipY-6,30,w.p2===2?98:88],geo:{kind:"staff",root:[0,-40],tip:[0,tipY],grip:[8,40],gripX:0,flower:[8,-40],
      strike:[[0,-56],[0,-66],[0,tipY+8],[0,tipY]],edges:[[-14,-60,-1],[14,-70,1],[-10,-78,-1]],metal:mask}};
  }});

/* ---- Bow ---- */
T({n:"Bow",verb:"Shoot",mats:WOOD,
  parts:[{n:"Limbs",list:[{n:"Simple"},{n:"Recurve"},{n:"Antler"},{n:"Bone"}]},{n:"String",list:[{n:"Plain"},{n:"Glowing"},{n:"Vine"}]},{n:"Arrow",list:[{n:"None"},{n:"Nocked"},{n:"Feathered"}]},{n:"Grip",list:[{n:"Plain"},{n:"Wrapped"},{n:"Gem"}]}],
  name:(w,M)=>w.p1>=2?["","","Antler Bow","Bonebow"][w.p1]:`${M.n} ${["Bow","Recurve"][w.p1]}`,
  build(w){
    const M=w.p1===3?BONE[0]:w.p1===2?FIT[5]:WOOD[w.mat],Wr=WRAP[w.wrap],F=FIT[w.fit],G=GEMS[w.gem]||GEMS[1];
    const arc=w.p1===1?[[14,-78],[6,-70],[-12,-40],[-18,0],[-12,40],[6,70],[14,78]]:[[6,-72],[-10,-40],[-17,0],[-10,40],[6,72]];
    const ends=[arc[0],arc[arc.length-1]];
    let svg="";
    const pulled=w.p3>0;
    const sCol=[["#f4efe6","#5a4e3e"],[GEMS[5].b,"#3a2a6a"],["#7fdc7a","#1d4a22"]][w.p2];
    const sp=pulled?`M${ends[0][0]} ${ends[0][1]} L26 0 L${ends[1][0]} ${ends[1][1]}`:`M${ends[0][0]} ${ends[0][1]} L${ends[1][0]} ${ends[1][1]}`;
    svg+=`<path d="${sp}" stroke="${sCol[1]}" stroke-width="3.4" fill="none"/><path d="${sp}" stroke="${sCol[0]}" stroke-width="1.6" fill="none" ${w.p2===1?`style="filter:drop-shadow(0 0 2px ${sCol[0]})"`:""}/>`;
    const limbs=ribbon(arc,t=>3+3.8*Math.sin(t*Math.PI),12);
    svg+=shaded(limbs,M,{hw:5,cx:-14});
    if(w.p1===2) for(const s of [-1,1]) svg+=shaded(ribbon([[-14*1,s*30],[-26,s*38],[-30,s*48]],t=>2.8-2*t),M,{hw:3,sw:2.2})+shaded(ribbon([[-6,s*58],[-14,s*70]],t=>2.4-1.6*t),M,{hw:3,sw:2});
    if(w.p1===3) for(const p of ends) svg+=roundShade(circleP(p[0],p[1],5.4),M,p[0],p[1],5.4);
    if(w.p2===2) svg+=leaf(ends[0][0],ends[0][1],-20,9)+leaf(ends[1][0],ends[1][1],30,9);
    if(w.p4===1) svg+=shaded("M-22 -10 L-12 -10 L-12 10 L-22 10 Z",Wr,{hw:4,sw:2.4,extra:[-6,0,6].map(y=>`<path d="M-23 ${y+2} L-11 ${y-2}" stroke="${Wr.o}" stroke-width="1.3" opacity=".6"/>`).join("")});
    if(w.p4===2) svg+=gemShape(G,-17,0,6);
    let tipX=-20;
    if(pulled){
      svg+=`<path d="M26 0 L-52 0" stroke="#5a3a1a" stroke-width="4.4" stroke-linecap="round"/><path d="M26 0 L-52 0" stroke="#c9945a" stroke-width="2.4" stroke-linecap="round"/>`;
      svg+=shaded("M-50 -5 L-64 0 L-50 5 Z",METAL[0],{hw:3,sw:2,cx:-56});
      const fc=w.p3===2?["#ff8fc8","#ffe14a"]:["#f4efe6","#d8443c"];
      svg+=`<path d="M26 0 L34 -8 L20 -8 L14 0 Z" fill="${fc[0]}" stroke="#3a2a1a" stroke-width="1.4"/><path d="M26 0 L34 8 L20 8 L14 0 Z" fill="${fc[1]}" stroke="#3a2a1a" stroke-width="1.4"/>`;
      tipX=-64;
    }
    return {svg,rot:45,box:[pulled?-68:-36,-84,pulled?38:30,84],geo:{kind:"bow",root:pulled?[20,0]:[-14,60],tip:pulled?[-64,0]:[6,-72],grip:[-10,10],gripX:-17,flower:[-12,-26],
      strike:pulled?[[-20,0],[-36,0],[-50,0],[-62,0]]:[[-12,-36],[-16,0],[-12,36],[6,-70]],edges:[[-12,-40,-1],[-18,0,-1],[-12,40,-1]],metal:pulled?`<path d="M-50 -5 L-64 0 L-50 5 Z M-50 -2.5 L26 -2.5 L26 2.5 L-50 2.5 Z" fill="#fff"/>`:`<path d="${limbs}" fill="#fff"/>`}};
  }});

/* ---- Shovel ---- */
T({n:"Shovel",verb:"Dig · bonk",mats:METAL,
  parts:[{n:"Blade",list:[{n:"Spade"},{n:"Scoop"},{n:"Trowel"},{n:"Flat"}]},{n:"Handle",list:[{n:"T-grip",v:0},{n:"Knob",v:2}]},{n:"Blade mark",list:[{n:"None"},{n:"Paw stamp"},{n:"Holes"},{n:"Rivets"}]},{n:"Wrap",list:[{n:"None"},{n:"Tape"},{n:"Twine"}]}],
  name:(w,M)=>`${M.n} ${["Spade","Scoop","Trowel","Shovel"][w.p1]}`,
  build(w){
    const M=METAL[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap],H=WOOD[w.wrap%WOOD.length];
    const blades=["M-18 -34 L18 -34 L19 -64 Q12 -82 0 -88 Q-12 -82 -19 -64 Z","M-20 -34 L20 -34 Q24 -60 18 -76 Q0 -90 -18 -76 Q-24 -60 -20 -34 Z","M-11 -34 L11 -34 Q12 -62 0 -84 Q-12 -62 -11 -34 Z","M-19 -34 L19 -34 L20 -84 L-20 -84 Z"];
    const bd=blades[w.p1];
    let svg="",hx="";
    if(w.p4===1) for(const y of [34,44]) hx+=`<rect x="-8" y="${y}" width="16" height="7" fill="#d8dce4"/><path d="M-8 ${y} L8 ${y}" stroke="#2a3038" stroke-width="1"/>`;
    if(w.p4===2) for(let y=30;y<52;y+=4) hx+=`<path d="M-8 ${y} Q0 ${y+2.5} 8 ${y+1}" stroke="#e2c88a" stroke-width="2.2" fill="none"/>`;
    svg+=shaded(`M-5.5 -36 L5.5 -36 L6 66 L-6 66 Z`,H,{hw:4,extra:hx});
    if(w.p2===0) svg+=shaded("M-18 64 L18 64 Q20 70 18 76 L-18 76 Q-20 70 -18 64 Z",H,{hw:6});
    if(w.p2===1) svg+=`<path d="M-14 60 L-14 78 Q0 92 14 78 L14 60" stroke="${F.o}" stroke-width="8" fill="none" stroke-linejoin="round"/><path d="M-14 60 L-14 78 Q0 92 14 78 L14 60" stroke="${F.b}" stroke-width="4.6" fill="none" stroke-linejoin="round"/><path d="M-12 78 L12 78" stroke="${H.o}" stroke-width="7" stroke-linecap="round"/><path d="M-12 78 L12 78" stroke="${H.b}" stroke-width="4" stroke-linecap="round"/>`;
    if(w.p2===2) svg+=roundShade(circleP(0,70,9),H,0,70,9);
    let bx=`<path d="M-30 -60 L30 -74" stroke="#fff" stroke-width="5" opacity=".18"/>`;
    if(w.p3===1) bx+=pawShape(0,-58,9,M.s,"none");
    if(w.p3===2) bx+=[[-7,-62],[7,-62],[0,-50]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="${M.o}" opacity=".85"/>`).join("");
    svg+=shaded(bd,M,{hw:7,extra:bx});
    svg+=shaded("M-8 -42 L8 -42 L7 -26 L-7 -26 Z",F,{hw:4,sw:2.4});
    if(w.p3===3) for(const [x,y] of [[-12,-40],[12,-40],[-14,-56],[14,-56]]) svg+=`<circle cx="${x}" cy="${y}" r="2.2" fill="${F.b}" stroke="${F.o}" stroke-width="1.2"/>`;
    return {svg,rot:45,box:[-26,-92,26,w.p2===1?92:82],geo:{kind:"shovel",root:[0,-36],tip:[0,-86],grip:[30,56],gripX:0,flower:[9,-28],
      strike:[[0,-46],[0,-62],[0,-76],[0,-86]],edges:[[-18,-50,-1],[18,-62,1],[-16,-74,-1]],metal:`<path d="${bd}" fill="#fff"/>`}};
  }});

/* ---- Collar chakram ---- */
const COLLAR_GEAR=({n:"Collar",verb:"Throw · returns",mats:METAL,
  parts:[{n:"Spikes",list:[{n:"None"},{n:"Six"},{n:"Eight"},{n:"Twelve"}]},{n:"Tag",list:[{n:"Bone tag"},{n:"Heart tag"},{n:"Star tag"},{n:"Paw tag"}]},{n:"Buckle",list:[{n:"None"},{n:"One"},{n:"Two"}]},{n:"Stitch",list:[{n:"Stitched"},{n:"Studded"},{n:"Plain"}]}],
  name:(w,M)=>`${WRAP[w.wrap].n.replace(/ (leather|cord|cloth|wood)$/,"")} ${["Collar","Spiked Collar","Spiked Collar","Sawcollar"][w.p1]}`,
  build(w){
    const M=METAL[w.mat],F=FIT[w.fit],Wr=WRAP[w.wrap];
    const ro=40,ri=29;
    let svg="";
    const nS=[0,6,8,12][w.p1];
    for(let i=0;i<nS;i++){const a=i/nS*Math.PI*2-Math.PI/2+.2,x=Math.cos(a),y=Math.sin(a);svg+=`<g transform="translate(${f1(x*(ro-2))} ${f1(y*(ro-2))}) rotate(${f1(a*180/Math.PI)})">${shaded("M0 -6 L15 0 L0 6 Z",F,{hw:3,sw:2})}</g>`;}
    const band=`${circleP(0,0,ro)} ${circleP(0,0,ri)}`;
    let ex="";
    if(w.p4===0) ex+=`<circle r="${(ro+ri)/2}" fill="none" stroke="${Wr.l}" stroke-width="1.6" stroke-dasharray="4 4"/>`;
    svg+=shaded(band,Wr,{hw:10,extra:ex,rule:true});
    if(w.p4===1) for(let i=0;i<12;i++){const a=i/12*Math.PI*2;svg+=`<circle cx="${f1(Math.cos(a)*34.5)}" cy="${f1(Math.sin(a)*34.5)}" r="2.6" fill="${F.b}" stroke="${F.o}" stroke-width="1.2"/>`;}
    for(let b=0;b<w.p3;b++){const a=b?-2.4:-.75;svg+=`<g transform="rotate(${f1(a*180/Math.PI)}) translate(34.5 0)">${shaded("M-5 -9 L5 -9 L5 9 L-5 9 Z",F,{hw:3,sw:2})}<path d="M-5 0 L5 0" stroke="${F.o}" stroke-width="1.6"/></g>`;}
    // tag hanging from the bottom
    svg+=`<circle cx="0" cy="${ro+3}" r="5" fill="none" stroke="${F.o}" stroke-width="3.6"/><circle cx="0" cy="${ro+3}" r="5" fill="none" stroke="${F.b}" stroke-width="2"/>`;
    const ty=ro+18;
    const tags=[`M-14 ${ty-4} L14 ${ty-4} L14 ${ty+4} L-14 ${ty+4} Z`,`M0 ${ty+12} C-18 ${ty} -14 ${ty-14} 0 ${ty-6} C14 ${ty-14} 18 ${ty} 0 ${ty+12} Z`,`M0 ${ty-14} L4 ${ty-4} L14 ${ty-4} L6 ${ty+2} L9 ${ty+12} L0 ${ty+6} L-9 ${ty+12} L-6 ${ty+2} L-14 ${ty-4} L-4 ${ty-4} Z`,`M-12 ${ty-8} Q0 ${ty-16} 12 ${ty-8} L12 ${ty+6} Q0 ${ty+14} -12 ${ty+6} Z`];
    let tg=shaded(tags[w.p2],M,{hw:5,sw:2.4});
    if(w.p2===0) tg=[[-15,-4],[-15,4],[15,-4],[15,4]].map(([x,y])=>roundShade(circleP(x,ty+y,5),M,x,ty+y,5)).join("")+tg;
    if(w.p2===3) tg+=pawShape(0,ty,7,M.s,"none");
    svg+=tg;
    return {svg,rot:0,box:[-58,-58,58,ty+16],geo:{kind:"ring",root:[-38,0],tip:[38,-10],grip:null,flower:[-26,-28],
      strike:[[-34,-20],[-10,-38],[16,-36],[38,-10]],edges:[[-40,0,-1],[0,-40,1],[40,0,1]],metal:`<path d="${band}" fill-rule="evenodd" fill="#fff"/>`}};
  }});

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
