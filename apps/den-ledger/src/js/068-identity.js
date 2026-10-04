/* ===== Identity: weapon classes & traits, creature archetypes & elites, bestiary ===== */
const WCLASS = {
  blade:{n:"Blade", i:"🗡️", d:"Fast cuts that make creatures bleed over time"},
  blunt:{n:"Blunt", i:"🔨", d:"Heavy hits that stagger creatures and smash through armor"},
  ranged:{n:"Ranged", i:"🏹", d:"Never misses fast creatures, hits flyers harder, and pierces into a second creature"},
  boomer:{n:"Returning", i:"🪃", d:"Strikes on the way out and again on the way back"},
  pierce:{n:"Piercing", i:"🔱", d:"Skewers through every creature in reach"},
  pick:{n:"Breaker", i:"⛏️", d:"Ignores armor, shreds shields, and hits bosses harder"},
  scoop:{n:"Scoop", i:"🥄", d:"Scoops up extra meat when it lands the final blow"},
  stone:{n:"Stunning", i:"🪨", d:"Can knock creatures dizzy for a moment"},
  yank:{n:"Tugging", i:"🪢", d:"Yanks the next creature in line into reach and gives it a tug for extra damage"},
  zap:{n:"Arcane", i:"✨", d:"Zaps up to three nearby creatures with chain sparks"}
};
const ICON_CLASS = {"☃️":"ranged","🧣":"blade","🛷":"blunt","🌌":"pick","🌿":"pierce","🦌":"blunt","🍂":"blade","🐝":"ranged","🌲":"pierce","🌙":"blade","💎":"blunt","🔭":"pierce","☄️":"blunt","🪐":"boomer","🌠":"ranged","🗡️":"blade","⚔️":"blade","🦴":"blunt","🪵":"blunt","🔨":"blunt","💀":"blunt","🎃":"blunt","🔔":"blunt","🎁":"blunt","🌳":"blunt","🏹":"ranged","🌰":"ranged","🎾":"ranged","🍬":"ranged","🐦‍⬛":"ranged","🕯️":"ranged","🕸️":"ranged","⭐":"ranged","🪃":"boomer","🥏":"boomer","❄️":"boomer","🔱":"pierce","🧹":"pierce","🍭":"pierce","🧊":"pierce","🌾":"pierce","⛏️":"pick","🪓":"pick","🌕":"pick","🥄":"scoop","🪨":"stone"};
function wClass(w){ return (w && w.cls) || ICON_CLASS[w.icon] || "blunt"; }
