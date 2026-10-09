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
  {n:"Junk",k:"junk",c:"#8a8f93",adj:"Chewed"},
  {n:"Common",k:"common",c:"#93a399",adj:"Trusty"},
  {n:"Uncommon",k:"uncommon",c:"#4f8fb8",adj:"Sturdy"},
  {n:"Rare",k:"rare",c:"#a77bd6",adj:"Howling"},
  {n:"Epic",k:"epic",c:"#e8741c",adj:"Feral"},
  {n:"Legendary",k:"legendary",c:"#e3b23c",adj:"Ancient"},
  {n:"Godly",k:"godly",c:"#ff4fd8",adj:"Divine"},
  {n:"Mythic",k:"mythic",c:"#00e5ff",adj:"Celestial"},
  {n:"Godforged",k:"titan",c:"#ff2d55",adj:"Godforged"},
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

