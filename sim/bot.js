// Page-side bot, evaluated inside the game's closure via __E.
(function(mode, simT){
  const act = (a, id) => { const r = document.getElementById("rest") || document.body; const b = document.createElement("button"); b.dataset.a = a; if (id !== undefined) b.dataset.id = id; r.appendChild(b); try { b.click(); } catch(e){} b.remove(); };
  const clean = () => document.querySelectorAll(".welcomeov,.lvlup,.roll-ov,.reveal,.mailnote,.sos-ov,.hatch-ov,.devov").forEach(e => e.remove());
  clean();
  const H = huntState(), log = [];
  const power = mode === "power";
  // mail
  mailState().forEach(m => { m.read = true; if (!m.claimed && (m.items||[]).length) { claimMail(m.id); log.push("mail:" + m.id); } });
  // daily gifts + pass
  if (isUnlocked("events")) { const d = new Date().getDate(); for (let i = 1; i <= d; i++) claimGift(i); const S = trialState(); TRIAL_PASS.forEach((r,i) => { if (!S.passClaimed[i] && S.tp >= r[0]) { S.passClaimed[i] = Date.now(); passReward(r); log.push("pass:" + i); } }); }
  H.autoCast = true;
  // upgrades
  if (isUnlocked("upgrades") && (power || Math.random() < 0.4)) { for (let n = 0; n < 20; n++) { const ks = Object.keys(UPGRADES).filter(k => upgLv(k) < UPGRADES[k].max).sort((a,b) => upgCost(a) - upgCost(b)); if (!ks.length || upgCost(ks[0]) > H.meats * (power ? 0.6 : 0.3)) break; act("upg", ks[0]); log.push("upg:" + ks[0]); } }
  // rescue pups
  if (isUnlocked("pack")) { const b = basketList()[0]; if (b && playerLevel() >= b.lvl) { const want = power ? 10 : 3; if (H.meats > b.cost * want * (power ? 2 : 3)) { act("hatch", b.id + ":" + want); log.push("rescue:" + want); } } act("fuse-all"); packAutoEquip(); syncPups(); }
  // v0.17: no rolling; weapons drop from kills
  // forge + tidy
  if (isUnlocked("hunt-forge") && (power || Math.random() < 0.5)) { act("forge-all"); if (power) act("w-sellweak"); }
  autoEquip(); syncGhosts();
  // tomes
  if (isUnlocked("tomes")) { const T = tomeState();
    if (power || Math.random() < 0.5) Object.keys(T.inv).forEach(k => { const p = tomeKeyParts(k); if (p.special || p.tier >= 9) return; for (let n = 0; n < 5; n++){ const free = (T.inv[k]||0) - T.eq.filter(x => x === k).length; if (free >= BIND_NEED[p.tier]) act("tome-bind", k); else break; } });
    const score = k => { const p = tomeKeyParts(k); return (p.type === "gather" ? 1000 : 0) + (p.special ? 50 : p.tier * 10 + (p.type === "fangs" ? 5 : 0)); };
    if (power || Math.random() < 0.5) { T.eq = []; Object.keys(T.inv).filter(k => T.inv[k] > 0).sort((a,b) => score(b) - score(a)).forEach(k => { while (T.eq.length < tomeSlots() && (T.inv[k]||0) - T.eq.filter(x => x === k).length > 0 && !(tomeKeyParts(k).special && T.eq.includes(k))) T.eq.push(k); }); }
  }
  // brews
  if (power && isUnlocked("lib-alembic")) { ["str","cur","swift","luck"].forEach(t => { Object.entries(POT_BREW[t]).forEach(([k,v]) => { if (ASP[k].of && ess(k) < v) distillToward(k, v); }); if (isUnlocked("lib-apo")) { for (let n=0;n<3;n++) if (canBrew(t)) act("pot-buy", t); const B2 = boostState(); for (const tier of [2,1,0]) { if ((B2.inv[t+tier]||0) > 0 && !(B2.active[t] && B2.active[t].until > Date.now())) { act("pot-drink", t + ":" + tier); log.push("drink:" + t + tier); break; } } } }); }
  // travel: hardest zone where creatures die in < 5s (power) / when 2 levels over (casual)
  const zs = Object.keys(ZONES), L = playerLevel(); let best = "meadow";
  zs.forEach(z => { if (L < ZONES[z].lvl) return; if (power) { const hp = 300 * Math.pow(1.5, L-1) * (1 + 0.003*(H.kills||0)) * ZONES[z].hp; if (hp / Math.max(0.1, dingoDps()) < 5) best = z; } else if (L >= ZONES[z].lvl + 2) best = z; });
  if (!B.trial && zoneId() !== best) { travelTo(best); log.push("travel:" + best); }
  // trials
  if (!B.trial && !B.mega && !B.titan && isUnlocked("events") && (power || Math.random() < 0.25)) { const z = zoneId(); if (L >= trialLvl(z) && trialReady(z)) { const meta = zoneOP(z) && Math.random() < 0.5; startTrial(z, meta); log.push((meta ? "meta:" : "trial:") + z); } }
  clean();
  return log.join(" ");
})
