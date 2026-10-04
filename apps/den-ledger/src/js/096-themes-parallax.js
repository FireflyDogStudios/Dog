/* ===== Daily themes ===== */
const DAY_THEMES = [
  {k:"sun", name:"Lucky Sunday", hw:"Spooky Sunday", icon:"🍀", desc:"2× luck on rolls and rescues, and pups hit 50% harder", fun:true},
  {k:"mon", name:"Cozy Monday", hw:"Moonlit Monday", icon:"☕", desc:"Guild tasks and bounties pay double"},
  {k:"tue", name:"Tome Tuesday", hw:"Tombstone Tuesday", icon:"📚", desc:"Books drop twice as often"},
  {k:"wed", name:"Wild Wednesday", hw:"Witchy Wednesday", icon:"🌦️", desc:"Weather and wildlife events happen twice as often"},
  {k:"thu", name:"Thrifty Thursday", hw:"Thriller Thursday", icon:"🏷️", desc:"Brews, bait, and upgrades cost 25% less"},
  {k:"fri", name:"Frenzy Friday", hw:"Frightful Friday", icon:"🔥", desc:"+50% drops, an extra creature on the field, and a Stampede every 15 minutes", fun:true},
  {k:"sat", name:"Showdown Saturday", hw:"Scream Saturday", icon:"👑", desc:"A boss every 8 fights, and bosses drop double", fun:true}
];
function dayTheme(){ return DAY_THEMES[new Date().getDay()]; }
function dayIs(k){ return dayTheme().k === k; }
function dayName(){ const d = dayTheme(); return false ? d.hw : d.name; }

/* ===== Parallax woods ===== */
const PLX_FAR = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="90" viewBox="0 0 600 90"><path d="M0 90V60L40 30 80 55 130 18 180 50 220 32 270 60 320 22 370 48 410 28 460 58 510 20 560 46 600 60V90Z" fill="#000"/></svg>');
const PLX_NEAR = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="26" viewBox="0 0 300 26"><path d="M0 26V18C8 10 16 10 24 18 30 12 38 12 44 18 56 8 70 8 80 18 90 14 98 14 104 20 116 10 130 10 140 18 150 12 160 12 168 20 180 12 192 12 200 18 214 8 228 8 238 18 248 14 256 14 262 20 274 10 288 10 300 18V26Z" fill="#000"/></svg>');
function ensureParallax(){ const hero = document.querySelector("section.hero"); if (!hero || hero.querySelector(".plx-far")) return;
  const far = document.createElement("div"); far.className = "plx plx-far"; far.style.setProperty("--img", `url("${PLX_FAR}")`); const near = document.createElement("div"); near.className = "plx plx-near"; near.style.setProperty("--img", `url("${PLX_NEAR}")`);
  far.setAttribute("aria-hidden","true"); near.setAttribute("aria-hidden","true"); hero.appendChild(far); hero.appendChild(near); }

