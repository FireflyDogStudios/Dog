/* ===== Seasons (Meadow), winter zones, seasonal Mine ===== */
const SEASONS = {
  spring:{name:"Spring", icon:"🌸", fx:"🌸", bonus:"+10% essence finds", mons:[["🐛","Hungry Caterpillar"],["🐝","Spring Bee"],["🐌","Garden Snail"],["🦗","Meadow Cricket"]]},
  summer:{name:"Summer", icon:"🌻", fx:"🦋", bonus:"+10% attack speed", mons:[["🦟","Mosquito Swarm"],["🐍","Sun Snake"],["🦂","Dune Scorpion"],["🐜","Picnic Ant"]]},
  fall:{name:"Fall", icon:"🍂", fx:"🍂", bonus:"+10% drops", mons:[["🍄","Toadstool Stalker"],["🦃","Grumpy Turkey"],["🐿️","Acorn Bandit"],["🦔","Prickly Hedgehog"]]},
  winter:{name:"Winter", icon:"❄️", fx:"❄️", bonus:"+10% crit chance", mons:[["☃️","Grumpy Snowman"],["🐧","Bossy Penguin"],["🦉","Snowy Owl"],["🐻‍❄️","Polar Bear"]]}
};
function seasonKey(){ const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "fall" : "winter"; }
function season(){ return SEASONS[seasonKey()]; }
function seasonBonus(kind){ const k = seasonKey(); return (k === "spring" && kind === "ess") || (k === "summer" && kind === "spd") || (k === "fall" && kind === "loot") || (k === "winter" && kind === "crit") ? 0.1 : 0; }
function snowyMonths(){ const m = new Date().getMonth() + 1; return m === 11 || m === 12 || m === 1 || m === 2; }
function mineOpen(){ return true; }
const WINTER_ZONES = {
  forest:{name:"Frostpine Woods", icon:"🌲", sky:"linear-gradient(180deg,#6a8aa8 0%,#a8c4d8 55%,#e8f0f6 100%)", pine:"#2a4a5a", desc:"The old forest, hushed under deep snow. Quiet, cold, and peaceful.",
    monsters:[["☃️","Grumpy Snowman"],["🧊","Ice Cube Imp"],["🦉","Snowy Owl"],["🐧","Bossy Penguin"],["🐻‍❄️","Polar Bear"],["🦌","Frost Stag"],["🦣","Woolly Mammoth"],["🦖","Snowdrift Rex"],["🐉","Frost Wyrm"]],
    bases:[["🧊","Icicle Dagger"],["❄️","Snowflake Star"],["☃️","Snowball Sling"],["🌲","Frosted Pine Spear"],["🧣","Scarf Whip"],["🛷","Sled Hammer"]]},
  moon:{name:"Aurora Ridge", icon:"🌌", sky:"linear-gradient(180deg,#0a1a2a 0%,#1a4a4a 45%,#3a2a6a 75%,#a8c8e8 100%)", pine:"#0a1a24", desc:"Snowy peaks under dancing northern lights. The coldest, calmest place in the woods.",
    monsters:[["❄️","Snowflake Sprite"],["🌨️","Snow Cloud"],["🧊","Glacier Golem"],["🦅","Ice Hawk"],["🐧","Emperor Penguin"],["🐻‍❄️","Ice Bear"],["👾","Frost Invader"],["🦖","Ice Rex"],["🐉","Aurora Dragon"]],
    bases:[["🌌","Aurora Staff"],["❄️","Crystal Snowflake"],["🧊","Glacier Maul"],["🌙","Frostmoon Blade"],["⭐","North Star Sling"],["🪐","Frozen Orbit"]]}
};
function zoneData(k){ const base = ZONES[k]; if (!base) return base; return snowyMonths() && WINTER_ZONES[k] ? Object.assign({}, base, WINTER_ZONES[k]) : base; }
function seasonFx(){ const hero = document.querySelector("section.hero"); if (!hero) return; let fx = hero.querySelector(".seasonfx"); const show = zone().home && !atHome() && !calm && seasonKey() !== "fall"; const key = seasonKey() + (show ? "" : "-off");
  if (fx && fx.dataset.k === key) return; if (fx) fx.remove(); if (!show) return; fx = document.createElement("div"); fx.className = "seasonfx " + seasonKey(); fx.dataset.k = key; fx.setAttribute("aria-hidden","true");
  fx.innerHTML = Array.from({length:10}, (_,i) => `<i style="left:${(i*10 + Math.random()*8).toFixed(1)}%;--d:${(7 + Math.random()*6).toFixed(1)}s;--dl:${(-Math.random()*10).toFixed(1)}s;--x:${(Math.random()*60 - 30).toFixed(0)}px">${emoImg(season().fx)}</i>`).join(""); hero.appendChild(fx); }

