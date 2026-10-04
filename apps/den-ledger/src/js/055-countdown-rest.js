const SNF_START = "2026-09-28";
let snfAnswers = null, snfValid = null, snfCur = "", snfShake = false, snfReveal = -1, snfWinBounce = false;
function snfLists(){ if (!snfAnswers){ snfAnswers = SNF_ANS.match(/.{5}/g); snfValid = new Set(SNF_VALID.match(/.{5}/g)); snfAnswers.forEach(w => snfValid.add(w));
  let s = 20260928; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  for (let i = snfAnswers.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [snfAnswers[i], snfAnswers[j]] = [snfAnswers[j], snfAnswers[i]]; } } }
function snfNum(){ return Math.max(0, Math.round((pd(todayIso()) - pd(SNF_START))/86400000)); }
const SNF_HW = ["ghost","witch","skull","grave","crypt","haunt","candy","spook","scare","broom","cloak","creep","eerie","feast","treat","trick","raven","spell","charm","night","shade","slime","fangs","lunar","howls","bones","tombs","mummy","gourd","curse","wails"];
function snfWord(){ snfLists(); SNF_HW.forEach(w => snfValid.add(w)); if (isOct()) return SNF_HW[(octDay() - 1) % SNF_HW.length]; return snfAnswers[snfNum() % snfAnswers.length]; }
function snfState(){ const dd = {day:"", guesses:[], status:"playing", streak:0, maxStreak:0, played:0, wins:0, dist:[0,0,0,0,0,0]}; state.sniffle = state.sniffle || {}; for (const k in dd) if (state.sniffle[k] === undefined) state.sniffle[k] = dd[k]; const S = state.sniffle;
  if (S.day !== todayIso()){ if (S.day && S.status === "playing" && S.guesses.length){ S.streak = 0; } S.day = todayIso(); S.guesses = []; S.status = "playing"; snfCur = ""; } return S; }
function snfScore(guess, word){ const res = Array(5).fill("absent"), counts = {};
  for (let i=0;i<5;i++){ if (guess[i] === word[i]) res[i] = "correct"; else counts[word[i]] = (counts[word[i]]||0) + 1; }
  for (let i=0;i<5;i++){ if (res[i] !== "correct" && counts[guess[i]] > 0){ res[i] = "present"; counts[guess[i]]--; } } return res; }
function snfKeyState(){ const S = snfState(), w = snfWord(), ks = {}, rank = {absent:1, present:2, correct:3};
  S.guesses.forEach(g => snfScore(g, w).forEach((r,i) => { if (!ks[g[i]] || rank[r] > rank[ks[g[i]]]) ks[g[i]] = r; })); return ks; }
const SNF_WIN = ["Top dog! 🏆","Incredible nose!","Great sniffing!","Tracked it down!","Good pup, got it!","Phew, found it! 🐾"];
function sniffleSection(){
  const S = snfState(), w = snfWord(), ks = snfKeyState(), rows = [];
  for (let r=0;r<6;r++){ const g = S.guesses[r], isCur = r === S.guesses.length && S.status === "playing", letters = g || (isCur ? snfCur : ""), sc = g ? snfScore(g, w) : null;
    rows.push(`<div class="snf-row${isCur && snfShake ? " shake" : ""}${S.status === "won" && r === S.guesses.length-1 && snfWinBounce ? " win" : ""}">${Array.from({length:5}, (_,i) => { const ch = letters[i] || "";
      return `<div class="snf-tile${sc ? " " + sc[i] : ch ? " filled" : ""}${isCur && ch && i === letters.length-1 ? " new" : ""}${sc && r === snfReveal ? " flip" : ""}" style="--i:${i}">${esc(ch.toUpperCase())}</div>`; }).join("")}</div>`); }
  const kb = ["qwertyuiop","asdfghjkl","zxcvbnm"].map((row,ri) => `<div class="kb-row">${ri===2?`<button class="kb wide" data-a="snf-key" data-id="enter">Enter</button>`:""}${[...row].map(c => `<button class="kb ${ks[c]||""}" data-a="snf-key" data-id="${c}">${c.toUpperCase()}</button>`).join("")}${ri===2?`<button class="kb wide" data-a="snf-key" data-id="back" aria-label="Backspace">⌫</button>`:""}</div>`).join("");
  const winPct = S.played ? Math.round(100*S.wins/S.played) : 0, maxD = Math.max(1, ...S.dist);
  return `<section class="box" aria-labelledby="snf-h">
    <div class="jar-top"><h2 id="snf-h">🐾 Sniffle #${snfNum()+1}</h2><span class="small">Sniff out today's 5-letter word · solve it for +1 🦴</span></div>
    <div class="snf-board" aria-label="Guesses">${rows.join("")}</div>
    ${S.status === "playing" ? `<div class="snf-kb">${kb}</div>` : `<div class="snf-done">${S.status === "won" ? `<b>${SNF_WIN[Math.min(5, S.guesses.length-1)]}</b> You found <b>${w.toUpperCase()}</b> in ${S.guesses.length}. +1 bone earned today.` : `The word was <b>${w.toUpperCase()}</b>. Good try, new sniff tomorrow! 🐾`}</div>`}
    <div class="snf-stats"><div><b>${S.played}</b><span>Played</span></div><div><b>${winPct}%</b><span>Wins</span></div><div><b>${S.streak}</b><span>Streak</span></div><div><b>${S.maxStreak}</b><span>Best</span></div></div>
    <div class="snf-dist">${S.dist.map((n,i) => `<div class="dist-row"><span>${i+1}</span><i style="width:${Math.max(6, Math.round(100*n/maxD))}%" class="${S.status==="won" && S.guesses.length===i+1 ? "hot" : ""}">${n}</i></div>`).join("")}</div>
    <p class="small" style="margin-top:10px">Green: right letter, right spot. Yellow: in the word, wrong spot. Gray: not in the word. Type on your keyboard or tap the keys.</p>
  </section>`;
}
function snfPress(k){
  const S = snfState(); if (S.status !== "playing") return;
  if (k === "back"){ snfCur = snfCur.slice(0,-1); render(); return; }
  if (k === "enter"){
    if (snfCur.length < 5){ snfBad("Not enough letters"); return; }
    snfLists(); if (!snfValid.has(snfCur)){ snfBad("Not in the word list"); return; }
    S.guesses.push(snfCur); snfReveal = S.guesses.length - 1; const w = snfWord(), won = snfCur === w; snfCur = "";
    if (won || S.guesses.length >= 6){
      S.status = won ? "won" : "lost"; S.played++;
      if (won){ S.wins++; S.streak++; S.maxStreak = Math.max(S.maxStreak, S.streak); S.dist[S.guesses.length-1]++; }
      else S.streak = 0;
      setTimeout(() => { if (won){ snfWinBounce = true; earn(1); grantBuff("nose"); happy(); sfx("chest"); toast(SNF_WIN[Math.min(5, S.guesses.length-1)] + " +1 🦴"); } else { toast("The word was " + w.toUpperCase()); } save(won ? "Sniffle solved!" : "Sniffle done"); }, calm ? 0 : 1600);
    }
    save("Guess in"); setTimeout(() => { snfReveal = -1; snfWinBounce = false; }, 2600); return;
  }
  if (/^[a-z]$/.test(k) && snfCur.length < 5){ snfCur += k; sfx("click"); render(); }
}
function snfBad(msg){ snfShake = true; toast(msg); sfx("oops"); render(); setTimeout(() => { snfShake = false; }, 450); }
document.addEventListener("keydown", ev => {
  if (tab !== "sniffle" || ev.ctrlKey || ev.metaKey || ev.altKey) return; const t = ev.target; if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
  if (ev.key === "Enter"){ ev.preventDefault(); snfPress("enter"); } else if (ev.key === "Backspace"){ ev.preventDefault(); snfPress("back"); } else if (/^[a-zA-Z]$/.test(ev.key)) snfPress(ev.key.toLowerCase());
});

