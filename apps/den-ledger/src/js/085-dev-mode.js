/* ===== Developer mode ===== */
const DEV_HASH = "3d1b2d2e98974d1adf9a4505bc03de13edf8d90b54314114a843767fe6d9c569";
async function devHash(s){ try { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join(""); } catch(e){ return ""; } }
function setDev(on){ devOn = on; try { localStorage.setItem("dengame-dev", on ? "1" : "0"); } catch(e){} syncGhosts(); render(); toast(on ? "🛠️ Dev mode on: power ×10,000, every buff active" : "🛠️ Dev mode off"); }
function openDevLogin(){ if (document.querySelector(".devov")) return; const ov = document.createElement("div"); ov.className = "lvlup devov";
  ov.innerHTML = `<div class="card"><h3>🛠️ Developer mode</h3><p>Enter the password.</p><form data-devform style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><input type="password" name="pw" autocomplete="off" aria-label="Password" style="flex:1 1 140px"><button class="go" type="submit">Unlock</button></form><p class="small devmsg" aria-live="polite"></p><button data-close>Cancel</button></div>`;
  document.body.appendChild(ov); const inp = ov.querySelector("input"); setTimeout(() => inp.focus(), 50);
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); });
  ov.querySelector("form").addEventListener("submit", async e => { e.preventDefault(); const ok = (await devHash(inp.value)) === DEV_HASH; if (ok){ ov.remove(); setDev(true); } else { ov.querySelector(".devmsg").textContent = "That's not it."; inp.value = ""; inp.focus(); } }); }
function devResetAsk(){ if (document.querySelector(".devov")) return; const ov = document.createElement("div"); ov.className = "lvlup devov";
  ov.innerHTML = `<div class="card"><h3>Reset this save?</h3><p>Everything in this game save goes back to a brand-new dingo. This can't be undone.</p><div class="btns" style="justify-content:center"><button class="go" data-yes style="background:var(--warn);border-color:var(--warn);color:#fff">Yes, reset it</button><button data-close>Keep my save</button></div></div>`;
  document.body.appendChild(ov); ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-close]")){ ov.remove(); return; } if (e.target.closest("[data-yes]")){ ov.remove(); devReset(); } }); }
function devReset(){ B.trial = null; B.mega = null; B.titan = null; B.enemies.forEach(E => E.el.remove()); B.enemies = []; try { localStorage.removeItem(BACKUP_KEY); localStorage.removeItem(KEY); } catch(e){}
  state = norm(blank()); save("Save reset"); toast("🧹 Save reset. Starting fresh…"); setTimeout(() => location.reload(), 1800); }
function devSection(){ return devOn ? `<div class="devbox"><b>🛠️ Dev mode is on</b> <span class="small">Power ×10,000 · every buff active</span><div class="btns" style="margin-top:8px"><button data-a="dev-off">Turn off</button><button data-a="dev-reset">Reset my save</button></div></div>` : `<button class="devlink" data-a="dev-login">🛠️ Developer</button>`; }

