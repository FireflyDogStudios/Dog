/* ===== Loot 2.0 step 1: weapons drop from creatures (v0.17). Each area has one material look and a few types. ===== */
const ARSENAL = {
  meadow:{mats:["Oak","Classic","Cream","Bronze"], infs:["Bloom","Ember"], types:[{t:3,cls:"blunt"},{t:4,cls:"boomer"},{t:6,cls:"yank"},{t:7,cls:"ranged"},{t:12,cls:"scoop"}]},
  forest:{mats:["Pine","Mossjade"], infs:["Bloom","Shadow"], types:[{t:11,cls:"ranged"},{t:2,p1:2,cls:"blunt"},{t:2,p1:4,cls:"pierce"},{t:10,cls:"zap"},{t:9,cls:"blade"}]},
  moon:{mats:["Ghostwood","Moonsilver","Purple"], infs:["Moon","Frost","Storm"], types:[{t:0,cls:"blade"},{t:5,cls:"boomer"},{t:11,cls:"ranged"},{t:2,p1:3,cls:"pick"}]}
};
/* v0.21 Loot 2.0 step 2: rarity = number of affixes. Affixes are the weapon traits; elemental ones also set the look. */
const AFFIX = {
  blazing:{pre:"Blazing", suf:"of Cinders", inf:"Ember"}, frost:{pre:"Frostbitten", suf:"of the Long Winter", inf:"Frost"}, shock:{pre:"Crackling", suf:"of Thunder", inf:"Storm"},
  lucky:{pre:"Clover", suf:"of Good Fortune", inf:"Bloom"}, keen:{pre:"Keen", suf:"of the Hawk", inf:"Moon"}, execute:{pre:"Merciless", suf:"of the Last Bite", inf:"Shadow"},
  savage:{pre:"Savage", suf:"of the Wild Hunt"}, hungry:{pre:"Hungry", suf:"of the Feast"}, swift:{pre:"Swift", suf:"of Zoomies"}
};
const AFFIX_N = {common:0, uncommon:1, rare:2, epic:3, legendary:3};
const SIG_TITLE = {starfall:"Stargazer's", howl:"Moonhowler's", feast:"Feastmaker's"};
const DROP_W = [["common",62],["uncommon",26],["rare",9],["epic",2.4],["legendary",0.6]];
function rollDrop(){ const H = huntState(), L = luckMult(), ws = DROP_W.map(([k,w], i) => [k, w * (i >= 2 ? L : 1)]), tot = ws.reduce((a,x) => a + x[1], 0); let x = Math.random()*tot, rk = "common";
  for (const [k,w] of ws){ if (x < w){ rk = k; break; } x -= w; }
  H.pity = (H.pity||0) + 1; if (H.charm > 0 && tierIdx(rk) < 4){ H.charm--; rk = Math.random() < 0.2 ? "legendary" : "epic"; toast("🍀 The Four-Leaf Charm glows!"); }
  if (H.pity >= PITY && tierIdx(rk) < 4) rk = Math.random() < 0.2 ? "legendary" : "epic"; if (tierIdx(rk) >= 4) H.pity = 0; return rk; }
function rollAffixes(n, lean){ const keys = Object.keys(AFFIX), out = []; while (out.length < n){ const pool = keys.filter(k => !out.includes(k)); if (!pool.length) break;
  const leaned = pool.filter(k => lean && lean.includes(AFFIX[k].inf)); const from = leaned.length && Math.random() < 0.4 ? leaned : pool; out.push(from[Math.floor(Math.random()*from.length)]); } return out; }
function affixName(w, base){ const t = w.traits || [], a = t[0] && AFFIX[t[0]], b = t[1] && AFFIX[t[1]];
  return [(w.sig && SIG_TITLE[w.sig]) || "", a ? a.pre : "", base, b && !w.sig ? b.suf : ""].filter(Boolean).join(" "); }
const COUNTER = {armored:["blunt","pick"], shield:["pick"], flying:["ranged"], fast:["ranged"], swarm:["boomer","pierce","zap"], splitter:["zap","pierce"], healer:["blade"]};
function dropChance(E){ const H = huntState(); let c = (H.drops||0) < 6 ? 0.25 : 0.07; if (E && E.elite) c *= 3; if (E && E.boss) c = 1; return c; }
function dropWeapon(E, quiet, force){ const H = huntState(), zid = zoneId(), A = ARSENAL[zid] || ARSENAL.meadow;
  const want = new Set(); ((E && E.traits) || []).forEach(t => (COUNTER[t] || []).forEach(c => want.add(c)));
  const match = A.types.filter(x => want.has(x.cls)), pick = (match.length && Math.random() < 0.5) ? match[Math.floor(Math.random()*match.length)] : A.types[Math.floor(Math.random()*A.types.length)];
  let rk = force || rollDrop(); if (!force && E && E.boss && tierIdx(rk) < 5) rk = TIER_ORDER[Math.max(2, tierIdx(rk) + 1)] || rk; if (rk === "junk") rk = "common";
  const w = makeWeapon(enemyHP(false), rk); w.ax = 2; w.traits = rollAffixes(AFFIX_N[rk] || 0, A.infs); if (rk === "legendary") w.sig = SIGNATURES[Math.floor(Math.random()*SIGNATURES.length)][0];
  const el = w.traits.map(t => AFFIX[t].inf).find(Boolean) || "None";
  w.code = SMITHY.forWeapon({seed: w.id + ":d", type: pick.t, p1: pick.p1, mats: A.mats, inf: el, rar: tierIdx(rk), zone: zid});
  w.name = affixName(w, SMITHY.baseOf(w.code)); w.cls = pick.cls; w.icon = WCLASS[pick.cls].i; w.zone = zid; w.from = E ? E.name : ""; w.found = Date.now(); delete w.ev;
  H.drops = (H.drops||0) + 1;
  const eqW = H.equipped.map(id => H.weapons.find(x => x.id === id)).filter(Boolean), worst = eqW.length >= 5 ? Math.min(...eqW.map(wDps)) : -1;
  const sl = invSalvLevel();
  if (sl && tierIdx(rk) <= (sl === 1 ? 1 : 2) && (sl === 3 || wDps(w) <= worst)){ const m = sellValue(w); H.meats += m; H.salvaged = (H.salvaged||0) + 1; invRecent(w, m, 0); return {w, salvaged:true, meat:m}; }
  if (!weaponRoom() || (invAutoJunk(w) && !invPlaceFor(invState(), "w:" + w.id, w))){ const m = sellValue(w); H.meats += m; H.salvaged = (H.salvaged||0) + 1; invRecent(w, m, 0); return {w, salvaged:true, meat:m}; }
  H.weapons.push(w); if (H.autoEquip) autoEquip(); if (!quiet) syncGhosts();
  if (tierIdx(rk) >= 3){ logItem("drop", (E ? E.name + " dropped " : "Found ") + w.name + " (" + W_RARITY.find(r => r.k === w.r).label + ")"); tlog("drop", w.r); }
  return {w, salvaged:false}; }
function dropFx(E, res){ if (!res || !E) return; const ey = parseFloat(E.el.style.top) || 0, w = res.w, R = W_RARITY.find(r => r.k === w.r);
  if (res.salvaged){ setTimeout(() => { dmgPop(E.x, ey - 26, "♻️"); feed("♻️", "Salvaged into meat", "#9fb3a6"); }, 250); return; }
  spawnLoot({x: E.x, y: ey + 10, html: wImg(w, "still"), tier: w.r, col: R.col, chest: tierIdx(w.r) >= 3, onPick: () => feed(wImg(w, "still"), w.name, R.col)});
  if (tierIdx(w.r) >= 3) setTimeout(() => dmgPop(E.x, ey - 28, "✨ " + R.label + "!", true), 200);
  if (tierIdx(w.r) >= 4 && !calm){ const hb = document.querySelector("section.hero"); if (hb){ const q = stageToScreen(E.x, ey + 20); rollBurst(q.x, q.y, R.col, 22); } } }
const WTRAITS = {
  blazing:{n:"Blazing", i:"🔥", d:"Sets creatures on fire"}, frost:{n:"Frostbite", i:"❄️", d:"Slows creatures down"}, shock:{n:"Shocking", i:"⚡", d:"Hits arc to a nearby creature"},
  savage:{n:"Savage", i:"💥", d:"Crits hit much harder"}, keen:{n:"Keen", i:"🎯", d:"+10% crit chance"}, hungry:{n:"Hungry", i:"🍖", d:"+25% meats when it finishes a creature"},
  lucky:{n:"Lucky", i:"🍀", d:"Finishing blows are more likely to find coins"}, execute:{n:"Executioner", i:"🪓", d:"+60% damage to creatures under 30% health"}, swift:{n:"Swift", i:"💨", d:"+20% attack speed"},
  haunted:{n:"Haunted", i:"👻", d:"Halloween exclusive: a ghost sometimes flies off to strike another creature"}
};
const SIGNATURES = [["starfall","Starfall","Every 8th hit calls down stars on every creature"],["howl","Moon Howl","Every 8th hit howls, stunning every creature"],["feast","Great Feast","Every 8th hit that kills drops a feast of meat"]];
function idHash(s){ let x = 0; for (const c of String(s)) x = (x * 31 + c.charCodeAt(0)) | 0; return Math.abs(x); }
function ensureTraits(w){ if (w && w.ax === 2){ w.traits = w.traits || []; return w; } const hw = w.ev && (w.ev.startsWith("hw") || w.ev === "pmoon"), n = ({epic:1, legendary:2, godly:3, mythic:3, titan:4}[w.r] || 0) + (hw ? 1 : 0); w.traits = w.traits || []; if (w.traits.length >= n && ((w.r !== "mythic" && w.r !== "titan") || w.sig)) return w;
  const keys = Object.keys(WTRAITS).filter(k => k !== "haunted"); if (w.ev && (w.ev.startsWith("hw") || w.ev === "pmoon") && !w.traits.includes("haunted")) w.traits.push("haunted"); let h = idHash(w.id); while (w.traits.length < n){ const k = keys[h % keys.length]; if (!w.traits.includes(k)) w.traits.push(k); h = Math.floor(h / 7) + 13; }
  if ((w.r === "mythic" || w.r === "titan") && !w.sig) w.sig = SIGNATURES[idHash(w.id + "s") % SIGNATURES.length][0]; return w; }
function hasTrait(w, t){ return !!(w && w.traits && w.traits.includes(t)); }
function wTagHtml(w){ ensureTraits(w); const C = WCLASS[wClass(w)]; return `<span class="wtags">${w.zone && ZONES[w.zone] ? `<span class="wtag" title="Rolled in ${esc(ZONES[w.zone].name)}">${emoImg(ZONES[w.zone].icon)}</span>` : ""}<span class="wtag cls" title="${esc(C.n)}: ${esc(C.d)}">${emoImg(C.i)} ${esc(C.n)}</span>${(w.traits||[]).map(t => `<span class="wtag" title="${esc(WTRAITS[t].d)}">${emoImg(WTRAITS[t].i)} ${esc(WTRAITS[t].n)}</span>`).join("")}${w.sig ? `<span class="wtag sig" title="${esc(SIGNATURES.find(s => s[0] === w.sig)[2])}">✦ ${esc(SIGNATURES.find(s => s[0] === w.sig)[1])}</span>` : ""}</span>`; }
const CTRAITS = {
  armored:{n:"Armored", i:"🛡️", d:"Tough hide: takes half damage unless hit by Blunt or Breaker weapons"},
  fast:{n:"Quick", i:"💨", d:"Moves fast and dodges some attacks. Ranged weapons never miss"},
  flying:{n:"Flying", i:"🪽", d:"Hovers above the ground. Ranged weapons hit it 50% harder"},
  swarm:{n:"Swarm", i:"🐜", d:"Comes in a group of three smaller creatures"},
  shield:{n:"Shielded", i:"🔰", d:"A shield soaks damage first. Breakers shred it"},
  splitter:{n:"Splitter", i:"🧬", d:"Splits into two little ones when defeated"},
  healer:{n:"Healer", i:"💚", d:"Slowly heals the creatures around it"},
  phasing:{n:"Phasing", i:"🌫️", d:"Drifts right through you when you aren't hitting it, then circles back around"},
  shover:{n:"Shover", i:"💢", d:"Sometimes shoves your dingo back, scattering your weapons for a moment"},
  thrower:{n:"Thrower", i:"🎯", d:"Tosses little creatures over your head. They land behind you and circle back"},
  summoner:{n:"Summoner", i:"🔮", d:"Calls helpers up out of the ground behind you"}
};
const ABILITY_KIDS = {"🕸️":["🕷️","Web Spiderling"],"🦅":["🐍","Dropped Snake"],"🌳":["🐿️","Angry Squirrel"],"🎃":["🦇","Pumpkin Bat"],"🪦":["💀","Risen Skull"],"🕯️":["👻","Candle Wisp"],"🍄":["🍄","Sporeling"]};
const EXTRA_TRAITS = {"👻":["phasing"],"🦏":["shover"],"🐗":["shover"],"🦣":["shover"],"🐻":["shover"],"🦖":["shover"],"🕸️":["thrower"],"🦅":["thrower"],"🌳":["thrower"],"🎃":["thrower"],"🪦":["summoner"],"🕯️":["summoner"],"🍄":["summoner"]};
const CREATURE_TRAITS = {"🦬":["armored"],"🦟":["swarm","flying"],"🐝":["swarm","flying"],"🐜":["swarm"],"🦗":["swarm","fast"],"🕸️":["splitter"],"🕷️":["splitter"],"🐗":["armored"],"🦏":["armored"],"🐻":["armored"],"🦣":["armored"],"🪨":["armored","shield"],"🐊":["armored"],"🪲":["shield"],"🦂":["shield","fast"],
  "🐍":["fast"],"🦎":["fast"],"🐀":["fast"],"🐿️":["fast"],"🪳":["fast"],"🦇":["flying","fast"],"🦅":["flying"],"🦉":["flying"],"👻":["flying"],"❄️":["flying"],"🌨️":["flying"],"🍄":["healer"],"🌳":["healer","armored"],"🌾":["swarm"],"🐌":["armored"],"🦃":["armored"],"🦨":["healer"],"🐈‍⬛":["fast"],"💀":["shield"],"🧊":["armored"],"⛄":["shield"],"🐻‍❄️":["armored"],"🐛":["splitter"],"☃️":["shield"],"🐧":["fast"],"🎃":["armored"],"🐺":["fast","armored"],"🪵":["splitter"],"🕯️":["healer"],"🌑":["shield","flying"],"👾":["shield","flying"],"🦖":["armored"],"🐉":["flying","shield"]};
const ELITES = [["Ironhide","armor"],["Swift","swift"],["Giant","giant"],["Warded","ward"],["Frenzied","frenzy"]];
function applyArchetype(E, el, kind){ const tr = (CREATURE_TRAITS[E.icon] || []).concat(EXTRA_TRAITS[E.icon] || []); E.traits = tr;
  if (tr.includes("phasing")) E.phasing = true; if (!kind && !E.boss){ if (tr.includes("shover")) E.ab = "shove"; else if (tr.includes("thrower") && ABILITY_KIDS[E.icon]) E.ab = "throw"; else if (tr.includes("summoner") && ABILITY_KIDS[E.icon]) E.ab = "summon"; if (E.ab){ E.abCd = E.ab === "shove" ? 6 + Math.random()*3 : 7 + Math.random()*4; E.abT = Math.random()*3; } }
  const TS = {armored:"armored", shield:"shielded", flying:"flying", fast:"quick", healer:"healer", phasing:"phasing"}; tr.forEach(t => { if (TS[t]) SE.apply(E, TS[t]); });
  if (tr.includes("fast")) E.speed *= 1.4; if (tr.includes("flying")) E.flying = true;
  if (tr.includes("shield")){ E.shield = E.max * 0.35; E.shieldMax = E.shield; } if (tr.includes("splitter")) E.split = true; if (tr.includes("healer")) E.healer = true;
  if (!E.boss && !kind && Math.random() < 0.06){ const EL = isOct() && zone().home ? ELITES.concat([["Cursed","curse"],["Cursed","curse"]]) : ELITES, [pre, fx] = EL[Math.floor(Math.random()*EL.length)]; E.elite = pre; el.classList.add("elite");
    if (fx === "armor") SE.apply(E, "armored", {mods:[{stat:"armor", add:.65}]}); if (fx === "swift"){ E.speed *= 1.5; SE.apply(E, "quick", {mods:[{stat:"dodge", add:.3}]}); } if (fx === "giant"){ E.hp *= 2.5; E.max *= 2.5; el.classList.add("giant"); }
    if (fx === "ward"){ E.shield = E.max * 0.6; E.shieldMax = E.shield; } if (fx === "frenzy") E.speed *= 1.3; if (fx === "curse"){ E.shield = E.max * 0.4; E.shieldMax = E.shield; E.cursed = true; el.classList.add("cursed"); }
    const nm = document.createElement("span"); nm.className = "ename"; nm.textContent = "★ " + pre + " " + E.name; el.appendChild(nm); }
  if (E.shield) el.querySelector(".ehp").insertAdjacentHTML("afterend", `<span class="eshield"><i></i></span>`);
  const badges = (E.traits || []).map(t => CTRAITS[t].i).join(""); if (badges) el.insertAdjacentHTML("afterbegin", `<span class="ebadge">${badges}</span>`);
  return E; }
function wHit(g, E, crit){ const w = g.w, cls = wClass(w), P = dingoPos(); let dmg = w.dmg * (crit ? wxMult("critx") + 0.2*scrollLv("piercing") + (hasTrait(w,"savage") ? 1 : 0) : 1) * dmgMult() * (E.boss ? 1 + 0.1*scrollLv("mark") + gemBonus("boss") + (cls === "pick" ? 0.3 : 0) : 1) * bestMult(E);
  if (megaDebuff("blind") && Math.random() < 0.3){ dmgPop(E.x, (parseFloat(E.el.style.top)||0) - 4, "miss"); return 0; }
  const dodge = SE.sum(E, "dodge"); if (dodge > 0 && cls !== "ranged" && Math.random() < dodge){ dmgPop(E.x, (parseFloat(E.el.style.top)||0) - 4, "miss"); return 0; }
  if (E.flying && cls === "ranged") dmg *= 1.5; if (hasTrait(w,"execute") && E.hp < E.max * 0.3) dmg *= 1.6;
  const armor = SE.sum(E, "armor"); if (armor && cls !== "blunt" && cls !== "pick") dmg *= 1 - armor;
  if (E.shield > 0){ const sd = dmg * (cls === "pick" ? 2.5 : 1); const used = Math.min(E.shield, sd); E.shield -= used; dmg = Math.max(0, (sd - used) / (cls === "pick" ? 2.5 : 1)); const sb = E.el.querySelector(".eshield i"); if (sb) sb.style.width = Math.max(0, 100*E.shield/E.shieldMax) + "%"; if (E.shield <= 0){ const s = E.el.querySelector(".eshield"); if (s) s.remove(); spark(E.x, (parseFloat(E.el.style.top)||0) + 14, "#6ab0ff", true); } }
  dmg = Math.round(dmg); E.lastW = w;
  if (cls === "blade") SE.apply(E, "burrs", {per: Math.round(w.dmg * dmgMult() * 0.08), src:"blade"});
  if (cls === "blunt" && !E.boss){ E.kb = Math.max(E.kb||0, 26); SE.apply(E, "stunned", {dur:.35, src:"blunt"}); }
  if (cls === "stone" && Math.random() < 0.2){ SE.apply(E, "stunned", {dur:1, src:"stone"}); dmgPop(E.x, (parseFloat(E.el.style.top)||0) - 16, "💫"); }
  if (hasTrait(w,"blazing")) SE.apply(E, "scorched", {per: Math.max(1, Math.round(dmg * 0.06)), dur:2, src:"blazing"});
  if (hasTrait(w,"frost")) SE.apply(E, "frostbit", {dur:2, src:"frost"});
  const others = B.enemies.filter(x => x !== E && !x.dead && P && x.x - P.x < 300);
  if (cls === "ranged" && others[0]) setTimeout(() => { if (!others[0].dead) hitEnemy(others[0], Math.round(dmg * 0.5), false); }, 80);
  if (cls === "yank" && others[0] && P){ const t = others[0]; if (!t.boss && !t.passing) t.x = Math.max(P.x + 40, t.x - 60); setTimeout(() => { if (!t.dead) hitEnemy(t, Math.round(dmg * 0.35), false); }, 90); }
  if (cls === "zap") others.slice(0,3).forEach((x,i) => setTimeout(() => { if (!x.dead){ spark(x.x, (parseFloat(x.el.style.top)||0) + 10, "#b98cf0", false); hitEnemy(x, Math.round(dmg * 0.35), false); } }, 70 + i*60));
  if (cls === "pierce") others.forEach((x,i) => setTimeout(() => { if (!x.dead) hitEnemy(x, Math.round(dmg * 0.4), false); }, 60 + i*40));
  if (hasTrait(w,"shock") && others.length){ const t2 = others[Math.floor(Math.random()*others.length)]; setTimeout(() => { if (!t2.dead){ spark(t2.x, (parseFloat(t2.el.style.top)||0) + 10, "#ffe066", false); hitEnemy(t2, Math.round(dmg * 0.3), false); } }, 70); }
  if (hasTrait(w,"haunted") && others.length && Math.random() < 0.25){ const t3 = others[Math.floor(Math.random()*others.length)]; setTimeout(() => { if (!t3.dead){ spark(t3.x, (parseFloat(t3.el.style.top)||0) + 12, "#cfe8ff", true); dmgPop(t3.x, (parseFloat(t3.el.style.top)||0) - 14, "👻"); hitEnemy(t3, Math.round(dmg * 0.5), false); } }, 140); }
  if (w.sig){ w.sigN = (w.sigN||0) + 1; if (w.sigN >= 8){ w.sigN = 0; sigFire(w, E, dmg); } }
  return dmg; }
function sigFire(w, E, dmg){ const all = B.enemies.filter(x => !x.dead);
  if (w.sig === "starfall"){ all.forEach((x,i) => setTimeout(() => { if (!x.dead){ lightning(x.x); spark(x.x, (parseFloat(x.el.style.top)||0) + 14, "#ffd34d", true); hitEnemy(x, dmg * 3, true); } }, i*90)); heroShake(5, 260); floatText("✦ Starfall!"); }
  if (w.sig === "howl"){ all.forEach(x => x.stun = 1.5); ringFx("#b98cf0", true); howlSound(); floatText("✦ Moon Howl!"); }
  if (w.sig === "feast"){ E.feast = true; floatText("✦ Great Feast!"); } }
function bestiaryState(){ state.bestiary = state.bestiary || {}; return state.bestiary; }
const BEST_TIERS = [10, 100, 1000, 10000];
function bestTier(name){ const k = (state.bestiary && state.bestiary[name]) || 0; return BEST_TIERS.filter(x => k >= x).length; }
function bestMult(E){ return 1 + 0.05 * bestTier(E.name); }
function bestiaryBody(){ const H = huntState(); return `<label class="small" style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><input type="checkbox" data-autoclose ${H.autoClose ? "checked" : ""}> Auto-close boss reward windows after 3 seconds</label><label class="small" style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><input type="checkbox" data-holdbig ${H.holdBig ? "checked" : ""}> Hold Mega Bosses and Gods until I turn this off (great for sleeping, so none escape while you're away)</label>${H.holdBig && ((H.megaCount||0) >= 5 || (H.overpower||0) >= OVERPOWER_MAX) ? `<p class="small">⏸️ Waiting for you: ${(H.megaCount||0) >= 5 ? "a Mega Boss" : ""}${(H.megaCount||0) >= 5 && (H.overpower||0) >= OVERPOWER_MAX ? " and " : ""}${(H.overpower||0) >= OVERPOWER_MAX ? "a God" : ""}. Turn off the hold when you're ready.</p>` : ""}<h3 class="pack-h" style="margin-top:0">⚠️ Gods</h3>${titanSection()}<h3 class="pack-h">☠️ Mega bosses</h3>${megaSection()}<h3 class="pack-h">📖 Creatures</h3>` + bestiarySection(); }
function bestiaryGroups(){ const megaOf = z => MEGAS.filter(m => (m.zone || "meadow") === z).flatMap(m => [[m.icon, m.name], m.add]);
  return Object.entries(ZONES).map(([z, Z]) => { const src = Z.home ? [MONSTERS].concat(Object.values(TOD_MONSTERS), Object.values(SEASONS).map(s => s.mons)) : [Z.monsters || []].concat(WINTER_ZONES[z] ? [WINTER_ZONES[z].monsters || []] : []); const all = {}; src.concat([megaOf(z)]).flat().forEach(([i,n]) => { if (n && !all[n]) all[n] = i; }); return [z, Z, all]; }); }
function bestiarySection(){ const BS = bestiaryState(), groups = bestiaryGroups(); let tot = 0, found = 0; groups.forEach(([z,Z,all]) => Object.keys(all).forEach(n => { tot++; if (BS[n]) found++; }));
  const card = (n, i) => { const k = BS[n] || 0, tr = CREATURE_TRAITS[i] || [], tier = bestTier(n), next = BEST_TIERS.find(x => k < x);
    return `<div class="bcard${k ? "" : " bunk"}"><span class="bart">${emoImg(i)}</span><b>${k ? esc(n) : "???"}</b><span class="stars">${"★".repeat(tier)}${"☆".repeat(4 - tier)}</span><span class="small">${k.toLocaleString()} defeated${next ? " · next ★ at " + next.toLocaleString() : ""}</span>${k ? `<span class="btraits">${tr.map(t => `<span class="wtag" title="${esc(CTRAITS[t].d)}">${emoImg(CTRAITS[t].i)} ${esc(CTRAITS[t].n)}</span>`).join("") || `<span class="small">No special traits</span>`}</span>` : ""}</div>`; };
  return `<p class="small">Every creature you defeat fills its page. At <b>10, 100, 1,000, and 10,000</b> defeats, you hit it <b>5% harder and get 5% more drops</b> from it, per star (this counts even before you can read the pages). Each area's pages open once you're overpowered there. ${found} / ${tot} discovered.</p>
    ${groups.map(([z, Z, all]) => { const names = Object.keys(all).sort((a,b) => (BS[b]||0) - (BS[a]||0)), M = zm(z);
      return `<h3 class="pack-h">${emoImg(zoneData(z).icon)} ${esc(zoneData(z).name)}</h3>${zoneOP(z) ? `<div class="bgrid">${names.map(n => card(n, all[n])).join("")}</div>` : `<div class="trialrow locked"><span class="tz">🔒</span><span class="tn"><b>These pages are still sealed</b><span class="small">Become overpowered here to read them: ${M.o}/${OP_KILLS}</span>${mbar(M.o, OP_KILLS, "#a77bd6")}</span></div>`}`; }).join("")}
    <h3 class="pack-h">Hunter's notes</h3><div class="hnotes">${Object.values(CTRAITS).map(t => `<div>${emoImg(t.i)} <b>${esc(t.n)}:</b> <span class="small">${esc(t.d)}</span></div>`).join("")}<div>★ <b>Elites:</b> <span class="small">Rare champions (Ironhide, Swift, Giant, Warded, Frenzied) that are tougher and drop triple loot.</span></div></div>`; }
