/* The Den's statuses and skills, as data for the engine. Names are ours (DEN-GAME-COMBAT.md). Icons are game-icons ids. */
function registerDen(SE){
  const D = SE.define, K = SE.defineSkill;
  /* ----- boons on the dingo ----- */
  D({id:"hackles", name:"Hackles Up", icon:"wolf-head", cls:"boon", stack:"stacks", max:5, dur:8, mods:[{stat:"dmg", mul:1.1, perStack:true}], desc:"Hits harder. Stacks up to 5.", tell:"hackles"});
  D({id:"zoomies", name:"Zoomies", icon:"sprint", cls:"boon", stack:"refresh", dur:8, mods:[{stat:"spd", mul:1.4}, {stat:"move", mul:1.3}], desc:"Attacks and moves faster.", tell:"ears-up"});
  D({id:"thickcoat", name:"Thick Coat", icon:"bordered-shield", cls:"boon", stack:"refresh", dur:10, mods:[{stat:"armor", add:.5}], desc:"Takes half damage.", tell:"fluff"});
  D({id:"sharpnose", name:"Sharp Nose", icon:"sniffing-dog", cls:"boon", stack:"refresh", dur:7200, mods:[{stat:"crit", add:.15}], desc:"+15% crit chance."});
  D({id:"secondwind", name:"Second Wind", icon:"regeneration", cls:"boon", stack:"refresh", dur:6, tick:{stat:"heal", per:1, every:1}, desc:"Mending a little every second."});
  D({id:"rally", name:"Rally Howl", icon:"wolf-howl", cls:"boon", stack:"refresh", dur:8, mods:[{stat:"dmg", mul:1.6}, {stat:"spd", mul:1.4}], desc:"+60% damage and +40% attack speed.", tell:"howl"});
  D({id:"feast", name:"Feast Frenzy", icon:"meat", cls:"boon", stack:"refresh", dur:12, mods:[{stat:"loot", mul:3}], desc:"Triple drops."});
  D({id:"windy", name:"Windy", icon:"wind-slap", cls:"boon", stack:"unique", dur:0, mods:[{stat:"spd", mul:1.25}], desc:"Weapons ride the wind: +25% attack speed."});
  /* brews and treats become statuses too: one entry per kind, strength carried in `per`-like data via mods on apply (see brew helper) */
  D({id:"brew-str", name:"Strength Brew", icon:"crystal-ball", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"dmg", mul:1.25}], desc:"+25% damage."});
  D({id:"brew-swift", name:"Zoomies Tonic", icon:"crystal-ball", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"spd", mul:1.15}], desc:"+15% attack speed."});
  D({id:"brew-luck", name:"Lucky Nose", icon:"clover", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"luck", mul:1.5}], desc:"Luckier finds."});
  D({id:"brew-treasure", name:"Treasure Sniffer", icon:"coins", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"coin", mul:2}], desc:"Rare coins twice as often."});
  D({id:"treat-kibble", name:"Crunchy Kibble", icon:"meat", cls:"boon", stack:"refresh", dur:900, mods:[{stat:"spd", mul:1.2}], desc:"+20% attack speed."});
  D({id:"treat-broth", name:"Warm Bone Broth", icon:"meat", cls:"boon", stack:"refresh", dur:1200, mods:[{stat:"dmg", mul:1.25}], desc:"+25% damage."});
  D({id:"treat-apple", name:"Apple Chew", icon:"meat", cls:"boon", stack:"refresh", dur:900, mods:[{stat:"luck", mul:1.4}], desc:"+40% luck."});
  D({id:"treat-jerky", name:"Pepper Jerky", icon:"meat", cls:"boon", stack:"refresh", dur:600, mods:[{stat:"crit", add:.15}], desc:"+15% crit chance."});
  /* ----- conditions on the dingo (what creatures do to him; the icon is the only announcement) ----- */
  D({id:"weakened", name:"Weakened", icon:"footprint", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"dmg", mul:.7}], desc:"−30% damage.", tell:"head-low"});
  D({id:"sluggish", name:"Sluggish", icon:"snowflake-1", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"spd", mul:.7}], desc:"−30% attack speed.", tell:"head-low"});
  D({id:"dazzled", name:"Dazzled", icon:"ghost", cls:"cond", stack:"extend", maxDur:14, dur:7, mods:[{stat:"dodge", add:-.25}], desc:"Some attacks miss.", tell:"shake"});
  D({id:"muddypaws", name:"Muddy Paws", icon:"footprint", cls:"cond", stack:"stacks", max:3, dur:6, mods:[{stat:"move", mul:.8, perStack:true}, {stat:"spd", mul:.92, perStack:true}], desc:"Slowed. Stacks up to 3.", tell:"paw-shake"});
  D({id:"spooked", name:"Spooked", icon:"ghost", cls:"cond", stack:"extend", maxDur:8, dur:4, mods:[{stat:"dmg", mul:.85}], flags:["flee"], desc:"Backs off for a moment.", tell:"ears-back"});
  D({id:"dazed", name:"Dazed", icon:"sleepy", cls:"cond", stack:"refresh", dur:1, flags:["noact"], desc:"Can't act for a moment.", tell:"shake"});
  /* ----- conditions on creatures (what weapons do) ----- */
  D({id:"burrs", name:"Burrs", icon:"thorny-vine", cls:"cond", stack:"stacks", max:5, dur:6, tick:{stat:"hp", every:.5, perStack:true}, desc:"Bleeding. Every burr bleeds on its own."});
  D({id:"scorched", name:"Scorched", icon:"flame", cls:"cond", stack:"stacks", max:5, dur:4, tick:{stat:"hp", every:.5, perStack:true}, desc:"Burning. Every stack burns on its own."});
  D({id:"frostbit", name:"Frostbit", icon:"snowflake-1", cls:"cond", stack:"extend", maxDur:6, dur:3, mods:[{stat:"move", mul:.5}], desc:"Moves at half speed."});
  D({id:"stunned", name:"Stunned", icon:"sleepy", cls:"cond", stack:"refresh", dur:.5, flags:["noact"], desc:"Can't act."});
  D({id:"shocked", name:"Shocked", icon:"lightning-frequency", cls:"cond", stack:"stacks", max:10, dur:6, mods:[{stat:"armor", add:-.03, perStack:true}], desc:"Takes 3% more damage per stack. Pile it on."});
  /* ----- creature boons (from traits; the status engine replaces one-off trait checks) ----- */
  D({id:"armored", name:"Armored", icon:"bordered-shield", cls:"boon", stack:"unique", dur:0, mods:[{stat:"armor", add:.5}], desc:"Takes half damage unless hit by Blunt or Breaker weapons."});
  D({id:"shielded", name:"Shielded", icon:"checked-shield", cls:"boon", stack:"unique", dur:0, desc:"A shield soaks damage first. Breakers shred it."});
  D({id:"flying", name:"Flying", icon:"feather", cls:"boon", stack:"unique", dur:0, flags:["flying"], desc:"Hovers. Ranged weapons hit it harder."});
  D({id:"quick", name:"Quick", icon:"sprint", cls:"boon", stack:"unique", dur:0, mods:[{stat:"dodge", add:.2}, {stat:"move", mul:1.5}], desc:"Fast and dodgy. Ranged weapons never miss."});
  D({id:"healer", name:"Healer", icon:"regeneration", cls:"boon", stack:"unique", dur:0, flags:["healer"], desc:"Slowly mends the creatures around it."});
  D({id:"phasing", name:"Phasing", icon:"ghost", cls:"boon", stack:"unique", dur:0, flags:["phasing"], desc:"Can't be hit while it isn't solid."});
  D({id:"enraged", name:"Enraged", icon:"fangs", cls:"boon", stack:"refresh", dur:20, mods:[{stat:"dmg", mul:1.5}, {stat:"spd", mul:1.3}], desc:"Hits the field harder and faster."});
  /* ----- skills (keys 1–5 today; weapon-driven later) ----- */
  K({id:"pounce", name:"Pounce", icon:"paw", lvl:1, cd:12, needs:"target", steps:[{do:"hit", to:"target", mult:8}], shout:"Pounce!"});
  K({id:"whirl", name:"Zoomies Whirl", icon:"spiral", lvl:2, cd:25, needs:"targets", steps:[{do:"hit", to:"targets", mult:3}, {do:"status", to:"self", id:"zoomies", dur:3}], shout:"Zoomies!"});
  K({id:"howl", name:"Rally Howl", icon:"wolf-howl", lvl:3, cd:45, steps:[{do:"status", to:"self", id:"rally", dur:8}], shout:"Awooo!"});
  K({id:"shadow", name:"Shadow Pack", icon:"ghost", lvl:5, cd:60, steps:[{do:"call", fn:"ghosts", args:{n:3, dur:10}}], shout:"The pack runs with me!"});
  K({id:"feast", name:"Feast Frenzy", icon:"meat", lvl:7, cd:90, steps:[{do:"status", to:"self", id:"feast", dur:12}], shout:"Feast!"});
}
if (typeof module !== "undefined") module.exports = registerDen;
