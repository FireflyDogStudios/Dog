/* ===== Dingo Shop, coins, vault ===== */
const SHOP = [
  {id:"party", slot:"head", name:"Party Hat", price:150, icon:"🥳"},
  {id:"beanie", slot:"head", name:"Cozy Beanie", price:200, icon:"🧢"},
  {id:"flowers", slot:"head", name:"Flower Crown", price:250, icon:"🌸"},
  {id:"cowboy", slot:"head", name:"Cowboy Hat", price:300, icon:"🤠"},
  {id:"top", slot:"head", name:"Dapper Top Hat", price:300, icon:"🎩"},
  {id:"witch", slot:"head", name:"Spooky Witch Hat", price:300, icon:"🎃", month:"10"},
  {id:"santa", slot:"head", name:"Holiday Hat", price:300, icon:"🎄", month:"12"},
  {id:"band-blue", slot:"neck", name:"Blue Bandana", price:100, icon:"🟦", svg:"bandana", col:"#4f8fb8"},
  {id:"band-purple", slot:"neck", name:"Purple Bandana", price:100, icon:"🟪", svg:"bandana", col:"#8a7bff"},
  {id:"band-black", slot:"neck", name:"Black Bandana", price:120, icon:"⬛", svg:"bandana", col:"#1d1d24"},
  {id:"band-orange", slot:"neck", name:"Pumpkin Bandana", price:120, icon:"🟧", svg:"bandana", col:"#e8741c"},
  {id:"bow", slot:"neck", name:"Fancy Bow Tie", price:150, icon:"🎀"},
  {id:"collar", slot:"neck", name:"Collar + Name Tag", price:200, icon:"🏷️"},
  {id:"scarf", slot:"neck", name:"Striped Scarf", price:200, icon:"🧣"},
  {id:"nerd", slot:"eyes", name:"Smart Specs", price:150, icon:"👓"},
  {id:"shades", slot:"eyes", name:"Cool Shades", price:200, icon:"🕶️"},
  {id:"hearts", slot:"eyes", name:"Heart Glasses", price:250, icon:"💕"},
  {id:"visor", slot:"eyes", name:"VR Visor", price:400, icon:"🥽"},
  {id:"sunset", slot:"theme", name:"Sunset Woods", price:300, icon:"🌅"},
  {id:"dawn", slot:"theme", name:"Misty Dawn", price:300, icon:"🌫️"},
  {id:"auroranight", slot:"theme", name:"Aurora Night", price:400, icon:"🌌"},
  {id:"neon", slot:"theme", name:"Cyber Neon", price:500, icon:"💜"},
  {id:"harvest", slot:"theme", name:"Harvest Moon", price:0, icon:"🌕", hidden:true},
  {id:"haunted", slot:"theme", name:"Haunted Hollow", price:350, icon:"🕸️", month:"10"}
];
function shopState(){ const d = {coins:0, owned:{}, equipped:{}, vault:0, efund:0, vaultLog:[]}; state.shop = state.shop || {}; for (const k in d) if (state.shop[k] === undefined) state.shop[k] = d[k]; return state.shop; }
function coinsFmt(n){ return n >= 1e6 ? fmtMeat(n) : Math.round(n).toLocaleString("en-US"); }
function applyWardrobe(){
  const S = shopState(), eq = S.equipped;
  const apply = el => { if (!el) return; [...el.classList].filter(c => /^w-|^wear-|^cos-on-|^aura-/.test(c)).forEach(c => el.classList.remove(c));
    ["head","neck","eyes"].forEach(slot => { const it = SHOP.find(x => x.id === eq[slot]); if (!it) return; el.classList.add("wear-" + slot, "w-" + slot + "-" + (it.svg || it.id)); if (it.col) el.style.setProperty("--bcol", it.col); }); };
  apply($("#dingo")); ensureParallax(); syncStride(); applyTod(); applyHome(); seasonFx();
  { const d = $("#dingo"), W = state.hunt && state.hunt.hw; if (d){ d.classList.toggle("wraith", !!(W && W.wraith)); d.classList.toggle("destiny", compOn("destiny")); d.classList.toggle("titanslayer", !!(state.hunt && state.hunt.titanWins && Object.keys(state.hunt.titanWins).length)); d.classList.toggle("guardian", !!(state.hunt && state.hunt.hw && state.hunt.hw.guardian)); } }
  document.body.classList.toggle("halloween", false);
  { const d = $("#dingo"), c = wearingCostume(), W = state.hunt && state.hunt.hw; if (d){ [...d.classList].filter(x => x.startsWith("cos-on-") || x.startsWith("aura-")).forEach(x => d.classList.remove(x)); if (c) d.classList.add("cos-on-" + c); if (W && W.aura) d.classList.add("aura-spectral"); } }
  const pv = $("#dingo-preview"); if (pv){ if (!pv.innerHTML){ const src = document.querySelector("#dingo svg"); if (src) pv.innerHTML = src.outerHTML; } pv.className = "dingo-run still tier-1"; apply(pv); }
  const hero = document.querySelector("section.hero"); if (hero){ [...hero.classList].filter(c => c.startsWith("theme-")).forEach(c => hero.classList.remove(c)); if (eq.theme) hero.classList.add("theme-" + eq.theme); if (eq.theme === "auroranight") hero.classList.add("sc-aurora"); }
}

