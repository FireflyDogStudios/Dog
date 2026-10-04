/* ===== Lungs: vaping weakens, passing strengthens ===== */
const LUNG = {smoke:{decay:10*60000, cap:20, per:0.03}, clear:{decay:20*60000, cap:15, per:0.03}};
function lungStacks(k){ const V = state.vape; if (!V || !V.lungs || !V.lungs[k]) return 0; const L = V.lungs[k]; return Math.max(0, L.n - (Date.now() - L.t) / LUNG[k].decay); }
function lungsActive(){ return false; }
function lungMult(kind){ if (!lungsActive()) return 1; const s = lungStacks("smoke"), c = lungStacks("clear");
  if (kind === "dmg") return (1 - LUNG.smoke.per * s) * (1 + LUNG.clear.per * c); if (kind === "spd") return (1 - 0.015 * s) * (1 + 0.01 * c); return 1; }
/* actions */
// Windows (.fkw) live outside #app, so action handlers listen on document and accept #app or any window.
const inUI = el => !!(el && el.closest && el.closest("#app, .fkw"));
document.addEventListener("change", ev => {
  const el = ev.target; if (!inUI(el)) return;
  if (el.dataset.sleep){ const S = sleepState(); if (/^\d\d:\d\d$/.test(el.value)){ S[el.dataset.sleep] = el.value; save("Sleep schedule saved"); } return; }
  if (el.matches && el.matches("[data-autoforgefull]")){ huntState().autoForgeFull = el.checked; save("Saved", true); return; }
  if (el.matches && el.matches("[data-autofusefull]")){ packState().autoFuseFull = el.checked; save("Saved", true); return; }
  if (el.matches && el.matches("[data-autobook]")){ tomeState().autoAccept = el.checked; save("Saved", true); return; }
  if (el.matches && el.matches("[data-bagq]")){ state.bagQ = el.value; render(); return; }
  if (el.matches && el.matches("[data-holdbig]")){ const H = huntState(); H.holdBig = el.checked; if (!el.checked && (H.overpower||0) >= OVERPOWER_MAX){ H.overpower = 0; setTimeout(summonTitan, 1500); } save(el.checked ? "Big bosses on hold ⏸️" : "Big bosses unleashed! ☠️"); return; }
  if (el.matches && el.matches("[data-autoclose]")){ huntState().autoClose = el.checked; save("Saved", true); return; }
  if (el.matches && el.matches("[data-wsort]")){ huntState().wsort = el.value; render(); return; }
  if (el.matches && el.matches("[data-wfilt]")){ huntState().wfilt = el.value; huntState().wpage = 0; render(); return; }
  if (el.matches && el.matches("[data-scrr]")){ huntState().scrR = el.value; render(); return; }
  if (el.matches && el.matches("[data-scrkeep]")){ huntState().scrKeep = el.value; render(); return; }
  if (el.matches && el.matches("[data-scrforged]")){ huntState().scrForged = el.checked; render(); return; }
  if (el.matches && el.matches("[data-screv]")){ huntState().scrEv = el.checked; render(); return; }
  if (el.matches && el.matches("[data-relr]")){ packState().relR = el.value; render(); return; }
  if (el.matches && el.matches("[data-relv]")){ packState().relV = el.value; render(); return; }
  if (el.matches && el.matches("[data-relkeep]")){ packState().relKeep = el.checked; render(); return; }
  if (el.matches && el.matches("[data-rune]")){ const M = gemState(); M.rsel = M.rsel || {}; M.rsel[el.dataset.rune] = el.value; render(); return; }
  if (el.matches && el.matches("[data-sock]")){ const [pid, i] = el.dataset.sock.split(":"), p = packState().pups.find(x => x.id === pid); if (!p || !el.value) return; p.sockets = p.sockets || []; p.sockets[parseInt(i,10)] = el.value; sfx("chest"); save("Gem set 💎"); return; }
  if (el.matches && el.matches("[data-pupsort]")){ packState().sort = el.value; render(); return; }
  if (el.matches && el.matches("[data-pupfilt]")){ packState().filt = el.value; render(); return; }
  if (el.matches && el.matches("[data-tod]")){ huntState().todOverride = el.value || ""; applyTod(); save(el.value ? "Time set to " + TOD[el.value].name : "Following your clock"); return; }
  if (el.matches && el.matches("[data-pin]")){ scripState().pin = el.value; save("Tracking", true); render(); return; }
  if (el.matches && el.matches("[data-canonly]")){ scripState().canOnly = el.checked; render(); return; }
  if (el.matches && el.matches("[data-rslot]")){ const S = scripState(); S.slots[parseInt(el.dataset.rslot,10)] = el.value; S.pin = S.cur; save("Rune placed", true); render(); return; }
  
  if (el.matches && el.matches("[data-autohatchn]")){ const K = packState(); K.autoHatchN = parseInt(el.value,10) || 3; if (K.autoHatch) K.autoHatch.n = K.autoHatchN; save("Auto-rescue size saved"); return; }
  
  if (el.dataset.a === "autoseason"){ state.collection.autoSeason = el.checked; save(el.checked ? "Seasonal decorations on" : "Seasonal decorations off"); return; }
});

document.addEventListener("submit", ev => { const f = ev.target; if (!f || f.matches("[data-devform]")) return; ev.preventDefault();
  const kind = f.dataset.f, v = n => f.elements[n] ? String(f.elements[n].value).trim() : "";
  
  if (kind === "pup-name"){ const p = packState().pups.find(x => x.id === v("id")); if (!p) return; p.nick = v("nick").slice(0,20); save(p.nick ? "Named " + p.nick + " 🐾" : "Name cleared"); render(); return; } }, true);
document.addEventListener("click", ev => {
  const el = ev.target.closest("[data-a]"); if (!el || el.tagName === "INPUT" || !inUI(el)) return;
  const id = el.dataset.id, a = el.dataset.a;
  if (a === "bandana"){ const S = bandanaState(); if (!S.owned[id]) return; S.color = id; applyBandana(); save("Bandana changed", true); render(); return; }
  if (a === "lib-view"){ libState().view = id; render(); return; }
  if (a === "dev-login"){ openDevLogin(); return; }
  if (a === "dev-off"){ setDev(false); return; }
  if (a === "dev-reset"){ devResetAsk(); return; }
  if (a === "trial-start"){ startTrial(id); return; }
  if (a === "trial-meta"){ startTrial(id, true); return; }
  if (a === "pass-claim"){ const S = trialState(), i = parseInt(id,10), r = TRIAL_PASS[i]; if (!r || S.passClaimed[i] || S.tp < r[0]) return; S.passClaimed[i] = Date.now(); passReward(r); save("Pass reward claimed"); return; }
  if (a === "gift-claim"){ claimGift(parseInt(id,10)); save("Gift opened"); return; }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (a === "snf-key"){ snfPress(id); }
  
  
  
  
  
  
  
  
  
  
  if (a === "meat-convert"){ const H = huntState(); if (H.meats < MEAT_PER_COIN) return; const n = Math.min(parseInt(id,10) || 1, Math.floor(H.meats / MEAT_PER_COIN)); H.meats -= n*MEAT_PER_COIN; shopState().coins += n; floatText("+" + n + " 🪙"); sfx("chest"); save("Meats traded"); }
  
  
  if (a === "transcend"){ const K = packState(), p = K.pups.find(x => x.id === id); if (!p || p.v < 2 || p.v > 4) return; const c = transCost(p), dc = dustCost(p); if ((K.spirit||0) < c || ess("arcane") < dc) return; K.spirit -= c; if (dc) addEss("arcane", -dc); p.v++; if (K.autoEquip) packAutoEquip(); syncPups(); save("Transcended!"); showHatchFx([p], "✨"); return; }
  if (a === "pup-release"){ const s = releasePup(id); if (s){ floatText("+" + coinsFmt(s) + " ✨"); sfx("chest"); save("Settled into the Sanctuary 🏡"); } }
  if (a === "release-filter"){ const list = releaseList(); let tot = 0; list.forEach(p => tot += releasePup(p.id)); if (list.length){ toast("🏡 " + list.length + " pups settled into the Sanctuary, and their joy filled the air with ✨ " + coinsFmt(tot) + " spirit"); sfx("chest"); } save("Settled into the Sanctuary"); return; }
  if (a === "release-commons"){ const K = packState(), eq = new Set(K.equipped), keep = {}; let tot = 0, n = 0; K.pups.slice().forEach(p => { if (eq.has(p.id) || !["common","uncommon"].includes(p.r) || (p.v||0) > 0) return; const kk = p.key; keep[kk] = (keep[kk]||0) + 1; if (keep[kk] > 5){ tot += releasePup(p.id); n++; } }); if (n) toast("🏡 " + n + " pups settled into the Sanctuary, and their joy filled the air with " + coinsFmt(tot) + " spirit"); else toast("Keeping 5 of each for fusing. Nobody extra needs a new home right now."); save("Sanctuary"); }
  
  if (a === "fuse-all"){ const made = fuseAll(); syncPups(); save("Fused everything"); if (made.length) showHatchFx(made.slice(0,10), "✨"); else toast("Nothing to fuse yet. You need 5 of the same pup."); return; }
  if (a === "w-salvage"){ const H = huntState(); H.autoSalvage = H.autoSalvage === false; save(H.autoSalvage ? "Auto-salvage on" : "Auto-salvage off"); }
  
  if (a === "autohatch"){ const K = packState(); K.autoHatch = {b: id, n: K.autoHatchN || 3}; save("Auto-rescue on"); }
  if (a === "autohatch-stop"){ packState().autoHatch = null; save("Auto-rescue off"); }
  if (a === "alm"){ const [k, n] = id.split(":"), A = ASP[k], times = parseInt(n,10) || 1; let made = 0; for (let i=0;i<times;i++){ if (ess(A.of[0]) < 2 || ess(A.of[1]) < 2) break; addEss(A.of[0], -2); addEss(A.of[1], -2); addEss(k, 1); made++; } if (made){ floatText("+" + made + " " + A.n); sfx("bubble"); if (!scripState().seenAlm){ scripState().seenAlm = 1; } } save("Distilled"); }
  if (a === "hunt-view"){ huntState().view = id; render(); return; }
  if (a === "inv-tab"){ INV_TAB = id; render(); return; }
  if (a === "inv-shut"){ const I = invState(); I.shut[id] = !I.shut[id]; save("Saved", true); render(); return; }
  if (a === "inv-tidy"){ invTidyBag(id); return; }
  if (a === "inv-tidyall"){ invTidyAll(); return; }
  if (a === "inv-cfg"){ INV_CFG = INV_CFG === id ? "" : id; if (INV_CFG) invState().shut[id] = false; render(); if (INV_CFG) setTimeout(() => { const c = document.querySelector(".fkw .ibcfg"), bd = c && c.closest(".fkw-b"); if (!bd) return; const cr = c.getBoundingClientRect(), br = bd.getBoundingClientRect(), z = fkScale || 1; if (cr.bottom > br.bottom - 60 * z) bd.scrollTop += (cr.bottom - br.bottom) / z + 70; }, 40); return; }
  if (a === "inv-gather"){ invGather(id); return; }
  if (a === "inv-undo"){ invUndo(+id); return; }
  if (a === "inv-seen"){ invState().newK = {}; save("All marked as seen", true); render(); fkTick(true); return; }
  if (a === "inv-ren"){ INV_REN = INV_REN === id ? "" : id; render(); setTimeout(() => { const q = document.querySelector(`input[data-invname="${id}"]`); if (q){ q.focus(); q.select(); } }, 30); return; }
  if (a === "inv-junk"){ invSalvageBag(id); return; }
  if (a === "w-open"){ const H = huntState(); H.wsel = H.wsel === id ? "" : id; render(); return; }
  if (a === "w-lock"){ const w = huntState().weapons.find(x => x.id === id); if (!w) return; if (w.hung && w.lock){ toast("🛡️ This one is hanging on your den wall. Take it down first to unlock it."); return; } w.lock = !w.lock; sfx("click"); save(w.lock ? "Locked 🔒" : "Unlocked"); return; }
  if (a === "scrap-go"){ const H = huntState(), list = scrapList(); let m = 0, d = 0; const ids = new Set(list.map(w => w.id)); list.forEach(w => { m += sellValue(w); d += SCRAP_DUST[w.r] || 0; logItem("sell", "Scrapped " + w.name); }); H.weapons = H.weapons.filter(w => !ids.has(w.id)); H.meats += m; if (d) addEss("arcane", d); if (list.length){ toast("🗑️ Scrapped " + list.length + " weapons for " + fmtMeat(m) + " meats" + (d ? " and " + d + " 💠" : "")); sfx("chest"); } save("Scrapped"); return; }
  if (a === "page"){ const [k, n] = id.split(":"), obj = k === "wpage" ? huntState() : packState(); obj[k] = Math.max(0, parseInt(n,10) || 0); render(); return; }
  if (a === "mine-view"){ gemState().view = id; render(); return; }
  if (a === "mine"){ mineTile(parseInt(id,10)); save("Dug", true); render(); return; }
  if (a === "refine"){ openRefine(id); return; }
  if (a === "infuse"){ infuseGem(id, (gemState().rsel || {})[id] || ""); const M = gemState(); if (M.rsel) delete M.rsel[id]; save("Infused"); return; }
  if (a === "shatter"){ const g = gemState().gems.find(x => x.id === id); if (!g) return; if (!g.confirm){ g.confirm = true; toast("Tap Shatter again to break this gem into Arcane Dust."); setTimeout(() => { delete g.confirm; }, 4000); return; } shatterGem(id); save("Shattered"); return; }
  if (a === "unsock"){ const [pid, i] = id.split(":"), p = packState().pups.find(x => x.id === pid); if (p && p.sockets) p.sockets[parseInt(i,10)] = null; save("Gem removed"); return; }
  
  
  if (a === "medal-craft"){ if (ess("hallow") < 6 || evCur() < 2500) return; addEss("hallow", -6); addEvCur(-2500); hw2().medals++; sfx("level"); toast("🌕 You crafted a Pumpkin Moon Medallion!"); save("Medallion crafted"); }
  
  if (a === "vin"){ const [k, ...rest] = id.split(":"); vaultDeposit(k, rest.join(":")); save("Stored in the vault 🔐"); return; }
  if (a === "vout"){ const [k, ...rest] = id.split(":"); vaultWithdraw(k, rest.join(":")); save("Taken out of the vault"); return; }
  if (a === "vdep"){ state.vdep = id; render(); return; }
  if (a === "hang"){ hangWeapon(id); applyHome(); save("Weapon hung 🛡️"); return; }
  if (a === "unhang"){ unhangWeapon(id); applyHome(); save("Weapon taken down"); return; }
  if (a === "go-home"){ if (atTown()) huntState().town = false; goHome(); return; }
  
  
  if (a === "leave-home"){ leaveHome(); return; }
  if (a === "decor"){ const [slot, iid] = id.split(":"), D = homeState(), it = decorItem(slot, iid); if (!it) return; const key = slot + ":" + iid, own = it[3] === 0 || D.own[key];
    if (!own){ const candy = it[4] === "oct"; if (candy ? evCur() < it[3] : shopState().coins < it[3]) return; if (candy) addEvCur(-it[3]); else shopState().coins -= it[3]; D.own[key] = todayIso(); sfx("chest"); }
    D.eq[slot] = iid; applyHome(); save("Den decorated 🏠"); return; }
  if (a === "eat"){ eatTreat(id); save("Treat eaten"); return; }
  if (a === "bag-view"){ state.bagView = id; render(); return; }
  if (a === "bag-go"){ tab = id; try { localStorage.setItem("dengame-tab", tab); } catch(e){} render(); window.scrollTo(0,0); return; }
  if (a === "travel"){ travelTo(id); save("Traveled"); return; }
  if (a === "pack-view"){ packState().view = id; render(); return; }
  if (a === "pup-open"){ const K = packState(); K.sel = K.sel === id ? "" : id; render(); return; }
  if (a === "seal"){ const S = compState(), c = sealCost(id); if ((S.lv[id]||0) < 5 || !Object.entries(c).every(([k,v]) => ess(k) >= v)) return; Object.entries(c).forEach(([k,v]) => addEss(k, -v)); S.sealed[id] = (S.sealed[id]||0) + 1; sfx("chest"); toast("🔏 Sealed a copy of " + SCROLLS[id].n + " V"); save("Sealed"); }
  if (a === "bind-comp"){ const S = compState(), C = COMPS[id]; if (!compCanBind(id)) return; Object.entries(C.need).forEach(([s,n]) => S.sealed[s] -= n); S.comps[id] = Date.now(); if (S.cshelf.length < compSlots()) S.cshelf.push(id); sfx("level"); happy(); save("Compendium bound!");
    if (!calm){ const ov = document.createElement("div"); ov.className = "roll-ov"; ov.innerHTML = `<div class="roll-wrap"><div class="cbook" style="--cc:${C.col};width:120px;height:156px;animation:tomein 1s cubic-bezier(.3,1.5,.5,1) both"><span class="cspine"></span>${emoImg(C.i).replace('class="emo', 'style="width:60px;height:60px" class="emo')}</div><h3 class="tdrop-h">📕 ${esc(C.n)}</h3><p style="color:#fff;text-align:center;max-width:420px" class="small">${esc(C.d)}</p><button class="go" data-close>Place it on the shelf</button></div>`; document.body.appendChild(ov); document.body.classList.add("shake"); setTimeout(() => document.body.classList.remove("shake"), 500); setTimeout(() => { const r = ov.querySelector(".cbook").getBoundingClientRect(); for (let i=0;i<3;i++) setTimeout(() => rollBurst(r.left + r.width/2, r.top + r.height/2, [C.col,"#ffd34d","#fff"][i], 30), i*200); }, 500); ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); }); } }
  if (a === "cshelf"){ const S = compState(); if (S.cshelf.includes(id)) S.cshelf = S.cshelf.filter(x => x !== id); else if (S.comps[id] && S.cshelf.length < compSlots()) S.cshelf.push(id); sfx("click"); save("Compendium shelf updated"); }
  if (a === "rselect"){ const S = scripState(); if (S.done[id]) return; S.cur = id; S.slots = []; S.pin = id; save("Research switched", true); render(); return; }
  if (a === "scrip-view"){ scripState().view = id; render(); return; }
  if (a === "asp-inspect"){ const S = scripState(); S.inspect = S.inspect === id ? "" : id; render(); return; }
  if (a === "pin"){ scripState().pin = id; save("Tracking " + SCROLLS[id].n, true); render(); return; }
  if (a === "distill-missing"){ const S = scripState(), nm = needMapFor(S.pin); let made = 0; Object.entries(nm ? nm.need : {}).forEach(([k,v]) => { if (ASP[k].of && ess(k) < v) made += distillToward(k, v); }); if (made){ sfx("chest"); toast("⚗️ Distilled " + made + " aspect" + (made===1?"":"s") + " toward your goal"); } else toast("Not enough raw essences yet. Keep hunting!"); save("Distilled"); }
  if (a === "rclear"){ scripState().slots = []; save("Research cleared", true); render(); }
  if (a === "research"){ const S = scripState(), cur = curProject(); if (!cur) return; const sc = SCROLLS[cur], [A, Bk] = sc.r, chain = [A, ...S.slots, Bk]; if (!S.slots.every(x => x) || !chain.every((x,i) => i === 0 || aspLinked(chain[i-1], x))) return;
    const need = {}; S.slots.forEach(x => need[x] = (need[x]||0) + 2); if (!Object.entries(need).every(([k,v]) => ess(k) >= v)) return; Object.entries(need).forEach(([k,v]) => addEss(k, -v));
    S.done[cur] = Date.now(); S.slots = []; S.cur = ""; sfx("level"); happy(); toast("📜 Research complete: " + sc.n + "! Scribe it at the desk."); save("Research complete"); }
  if (a === "scribe"){ const S = scripState(), c = scribeCost(id), lv = S.lv[id]||0; if (!S.done[id] || lv >= 5 || !Object.entries(c).every(([k,v]) => ess(k) >= v)) return; Object.entries(c).forEach(([k,v]) => addEss(k, -v)); S.lv[id] = lv + 1; if (!lv && S.rack.length < rackSlots()) S.rack.push(id); sfx("quill"); toast("✒️ " + SCROLLS[id].n + " " + ROMAN7[lv] + " scribed!"); save("Scribed"); }
  if (a === "rack"){ const S = scripState(); if (S.rack.includes(id)) S.rack = S.rack.filter(x => x !== id); else if (S.rack.length < rackSlots() && S.lv[id]) S.rack.push(id); sfx("click"); save("Scroll rack updated"); }
  if (a === "tome-eq"){ const T = tomeState(); if (T.eq.length >= tomeSlots() || (T.inv[id]||0) - T.eq.filter(x => x === id).length < 1) return; T.eq.push(id); sfx("chest"); toast("📖 " + tomeName(id) + " is on your shelf!"); save("Tome equipped"); }
  if (a === "tome-uneq"){ const T = tomeState(); T.eq.splice(parseInt(id,10), 1); sfx("click"); save("Tome removed"); }
  if (a === "tome-bind"){ const T = tomeState(), p = tomeKeyParts(id); if (p.special || p.tier >= 9) return; const need = BIND_NEED[p.tier], free = (T.inv[id]||0) - T.eq.filter(x => x === id).length; if (free < need) return; T.inv[id] -= need; const nk = p.type + (p.tier+1); giveTome(nk, false, "bind"); logItem("tome", "Bound " + need + " into " + tomeName(nk)); save("Bound!"); }
  if (a === "ach-claim"){ const T = tomeState(), A = TOME_ACH.find(x => x.id === id); if (!A || T.ach[id] || A.stat() < A.goal) return; T.ach[id] = Date.now(); giveTome(A.reward, false, "ach"); save("Achievement claimed"); }
  
  
  
  
  
  
  
  
  
  
  
  
  if (a === "bait-craft"){ const i = parseInt(id,10), c = baitCost(i), E = gameEvent(), H = huntState(); if (E ? evCur() < c : H.meats < c) return; if (E) addEvCur(-c); else H.meats -= c; const S = baitState(); S.inv[i] = (S.inv[i]||0) + 1; sfx("coin"); floatText("+1 🪤"); save("Bait crafted"); }
  if (a === "bait-use"){ const i = parseInt(id,10), S = baitState(); if ((S.inv[i]||0) < 1) return; S.inv[i]--; const now = Date.now(); S.acts[i] = Math.max(S.acts[i]||0, now) + BAITS[i].min*60000; S.active = null; const bv = baitVal(); sfx("chest"); toast(baitName(i) + " set out! Up to " + bv.max + " creatures at " + bv.rate.toFixed(1) + "× speed 🐾"); save("Bait used"); }
  if (a === "pot-buy"){ if (!canBrew(id)) return; Object.entries(brewCost(id)).forEach(([a,n]) => addEss(a, -n)); const B2 = boostState(); B2.inv[id+"0"] = (B2.inv[id+"0"]||0) + 1; sfx("bubble"); floatText("+1 🧪"); save("Brewed " + potName(id,0)); }
  if (a === "pot-drink"){ const [t, tr] = id.split(":"), tier = parseInt(tr,10); if (!drinkPot(t, tier)) return; sfx("chest"); happy(); toast(potName(t, tier) + ": " + POT_TYPES[t].desc(POT_TYPES[t].vals[tier]) + " for " + POT_MIN[tier] + " min!"); save("Drank a brew"); }
  if (a === "pot-up"){ const [t, tr] = id.split(":"), tier = parseInt(tr,10), B2 = boostState(); if ((B2.inv[t+tier]||0) < 3 || tier >= 2) return; B2.inv[t+tier] -= 3; B2.inv[t+(tier+1)] = (B2.inv[t+(tier+1)]||0) + 1; sfx("level"); toast("Brewed a " + potName(t, tier+1) + "! ✨"); save("Brewed up"); }
  if (a === "upg"){ const H = huntState(), c = upgCost(id), u = UPGRADES[id]; if (!u || upgLv(id) >= u.max || H.meats < c) return; H.meats -= c; state.upg = state.upg || {}; state.upg[id] = upgLv(id) + 1; sfx("level"); happy(); toast(u.name + " is now level " + state.upg[id] + "!"); save("Upgraded"); }
  if (a === "evupg"){ const E = gameEvent(); if (!E) return; const lv = evUpg(id), c = 200 * Math.pow(2, lv); if (lv >= 5 || evCur() < c) return; addEvCur(-c); const U = state.evUpg = state.evUpg || {}; U[E.id] = U[E.id] || {}; U[E.id][id] = lv + 1; sfx("level"); toast(E.upg[id][0] + " ★" + (lv+1)); save("Event upgrade"); }
  if (a === "hatch"){ const [bid, n] = id.split(":"); const b = basketList().find(x => x.id === bid), got = hatch(bid, parseInt(n,10)); if (!got.length) return; syncPups(); save("Rescued"); showHatchFx(got, b.icon); }
  if (a === "fuse"){ const [k, v] = id.split(":"); const np = fuse(k, parseInt(v,10)); if (!np) return; syncPups(); save("Fused"); showHatchFx([np], np.v === 2 ? "🌈" : "✨"); }
  if (a === "pack-auto"){ const K = packState(); K.autoEquip = !K.autoEquip; if (K.autoEquip) packAutoEquip(); syncPups(); save("Auto-equip " + (K.autoEquip ? "on" : "off")); }
  if (a === "pup-eq"){ const K = packState(); if (K.equipped.includes(id)) K.equipped = K.equipped.filter(x => x !== id); else if (K.equipped.length < packSlots()) K.equipped.push(id); K.autoEquip = false; syncPups(); save("Pack updated"); }
  if (a === "pack-release"){ const K = packState(), eq = new Set(K.equipped), before = K.pups.length; const keep = {}; K.pups = K.pups.filter(p => { if (eq.has(p.id) || p.r !== "common" || (p.v||0) > 0) return true; keep[p.key] = (keep[p.key]||0) + 1; return keep[p.key] <= 5; }); const n = before - K.pups.length; if (n) toast("🏡 " + n + " extra Common pups found happy homes in the Sanctuary"); save("Pack tidied"); }
  
  if (a === "w-autoeq"){ const H = huntState(); H.autoEquip = !H.autoEquip; if (H.autoEquip) autoEquip(); syncGhosts(); save("Auto-equip " + (H.autoEquip ? "on" : "off")); }
  if (a === "w-eq"){ const H = huntState(); if (H.equipped.includes(id)) H.equipped = H.equipped.filter(x => x !== id); else if (H.equipped.length < 5) H.equipped.push(id); H.autoEquip = false; syncGhosts(); save("Equipment changed"); }
  if (a === "w-sell"){ const H = huntState(), w = H.weapons.find(x => x.id === id); if (!w || H.equipped.includes(id)) return; logItem("sell", "Sold " + w.name + " (" + W_RARITY.find(r => r.k === w.r).label + ")"); if (w.lock) return; H.meats += sellValue(w); if (SCRAP_DUST[w.r]) addEss("arcane", SCRAP_DUST[w.r]); H.weapons = H.weapons.filter(x => x.id !== id); if (H.wsel === id) H.wsel = ""; floatText("+" + fmtMeat(sellValue(w)) + " 🍖"); sfx("coin"); save("Sold"); }
  if (a === "w-sellweak"){ const H = huntState(), eq = new Set(H.equipped); let tot = 0; H.weapons = H.weapons.filter(w => { if (!eq.has(w.id) && !w.lock && (w.r === "junk" || w.r === "common")){ tot += sellValue(w); return false; } return true; }); H.meats += tot; if (tot) floatText("+" + fmtMeat(tot) + " 🍖"); save("Sold junk"); }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
});

/* boot */
function useLocal(){
  mode = "local";
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  state = norm(s || blank());
  setStatus("Saving on this device only");
  render();
}
async function boot(){
  let db = null;
  try { if (window.claude && typeof window.claude.use === "function") db = await window.claude.use("db"); } catch(e){ db = null; }
  if (!db) return useLocal();
  let uid = null; try { const U = await window.claude.use("user"); uid = U ? await U.id() : null; } catch(e){ uid = null; }
  if (!uid) return useLocal();
  mode = "db"; dbRef = db.doc("data/users/" + uid + "/save");
  let first = true;
  dbRef.onSnapshot(snap => {
    if (pending > 0){ if (snap.exists){ const sd = snap.data(); if (sd.savedAt && sd.savedAt > lastLocalSave) extSnap = JSON.parse(JSON.stringify(sd)); } return; }
    if (snap.exists && !first){ const sd = snap.data(); if (!sd.savedAt || sd.savedAt <= lastLocalSave) return; }
    if (snap.exists){ state = norm(JSON.parse(JSON.stringify(snap.data())));
      if (first){ let bk = null; try { bk = JSON.parse(localStorage.getItem(BACKUP_KEY)); } catch(e){}
        if (bk && bk.savedAt && (!state.savedAt || bk.savedAt > state.savedAt) && ((bk.treats && bk.treats.earned) || 0) >= ((state.treats && state.treats.earned) || 0) && ((bk.hunt && bk.hunt.kills) || 0) >= ((state.hunt && state.hunt.kills) || 0)){ state = norm(bk); setStatus("Restored changes saved on this device, syncing…"); render(); first = false; save("Synced"); return; }
        setStatus("Up to date"); }
      render();
      }
    else if (!state){ state = norm(blank()); setStatus("A new dingo sets out"); render(); }
    first = false;
  }, err => { if (!state) return useLocal(); setStatus("Lost the connection. Reload to try again.", true); });
  /* Inbox: game-wide mail arrives here and is applied on top of each save */
  try { db.doc("game/inbox").onSnapshot(snap => { if (!snap.exists) return; const ops = (snap.data() || {}).ops || []; const tryApply = () => { if (!state){ setTimeout(tryApply, 500); return; } applyInbox(ops); }; tryApply(); }); } catch(e){}
}
function applyInbox(ops){ state.appliedOps = state.appliedOps || []; let changed = 0;
  ops.forEach(op => { if (!op || !op.id || state.appliedOps.includes(op.id)) return;
    if (op.mail){ const M = mailState(); if (!M.some(x => x.id === op.mail.id)){ const nm = Object.assign({read:false, claimed:false, ts: Date.now()}, op.mail); M.push(nm); setTimeout(() => mailNotice(nm), 600); } }
    if (op.note) toast("🐾 " + op.note);
    state.appliedOps.push(op.id); changed++; });
  if (changed){ state.appliedOps = state.appliedOps.slice(-60); save("Mail arrived"); } }
boot();
let lastDay = null;
function dayTick(){ if (!state || pending > 0) return; lastDay = todayIso(); render(); }
setInterval(() => { if (state && lastDay && lastDay !== todayIso()) dayTick(); }, 60000);
setTimeout(() => { lastDay = todayIso(); }, 0);
document.addEventListener("visibilitychange", () => { if (!document.hidden && state && lastDay && lastDay !== todayIso()) dayTick(); });
})();
