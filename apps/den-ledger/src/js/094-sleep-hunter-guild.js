/* ===== Sleep hygiene: side quests, rested/sleepy effects, sleep mode ===== */
const DREAM_SET = {id:"dream", name:"Dreamland", badge:"🌙", rarity:"rare", bonus:15, dream:true, perkText:"The Dreamer badge", cards:[
  ["sheep","🐑","Counting Sheep","One... two... zzz."],["snore","💤","Snore Cloud","Floats over sleeping pups."],["pillow","🛏️","Cloud Bed","Softest spot in the den."],
  ["dreammoon","🌙","Dream Moon","Only visible with your eyes closed."],["starpup",{e:"🐶", o:"⭐"},"Star Pup","Runs through dreams chasing comets."],["nightowl2",{e:"🦉", o:"💤"},"Sleepy Owl","Finally off shift."],
  ["dreamdingo",{custom:"spirit"},"Dream Dingo","Waits for you every night you rest well.","legendary"]]};
SETS.push(DREAM_SET);
function sleepState(){ const d = {bed:"23:00", wake:"07:00", start:0, startMult:1, lastSleepNight:"", lastWakeDay:"", restedUntil:0, groggyUntil:0, streak:0, best:0}; state.sleep = state.sleep || {}; for (const k in d) if (state.sleep[k] === undefined) state.sleep[k] = d[k]; return state.sleep; }
function sleepyMult(){ return 1; }
function restMult(kind){ return 1; }
document.addEventListener("keydown", e => { if (document.querySelector(".sleep-ov")){ e.preventDefault(); const c = document.querySelector(".sleep-ov .sleep-confirm"); if (c) c.hidden = false; } }, true);
setInterval(() => { if (!state || document.hidden || tab === "selfcare") return; const ae = document.activeElement; if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
  if (document.querySelector(".roll-ov,.reveal,.lvlup,.sos-ov,.sleep-ov,.morning-ov")) return; if (["collect","glow","train"].includes(tab)) return; render(); }, 8000);

/* ===== One active hunter per device (prevents two devices overwriting each other) ===== */
const SID = uid();
function isHost(){ const h = state && state.host; return !h || h.id === SID || Date.now() - (h.seen||0) > 90000; }
function claimHost(){ if (!state) return; state.host = {id: SID, seen: Date.now()}; }
document.addEventListener("pointerdown", () => { if (!state) return; const n = document.getElementById("hostnote"); if (!isHost() || n){ claimHost(); save("Hunting on this device now", true); if (n) n.remove(); } }, true);
/* ===== Forge & roll history ===== */
function logItem(kind, text){ const H = huntState(); H.itemLog = H.itemLog || []; H.itemLog.unshift({t: Date.now(), kind, text}); if (H.itemLog.length > 40) H.itemLog.length = 40; }
/* ===== Morning gift + woods forecast ===== */
function seededRand(seed){ let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) | 0; return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function todaysForecast(){ const r = seededRand("wx" + todayIso()), mo = todayIso().slice(5,7), ws = Object.keys(WEATHER).filter(k => !WEATHER[k].months || WEATHER[k].months.includes(mo)), es = ["raccoon","stampede"];
  return {w: ws[Math.floor(r()*ws.length)], e: es[Math.floor(r()*es.length)], when: ["this morning","around midday","this afternoon","this evening"][Math.floor(r()*4)]}; }
/* ===== The Pack Guild: daily repeating tasks ===== */
/* ===== Bounties: dreaded, not-daily chores with big rewards ===== */
