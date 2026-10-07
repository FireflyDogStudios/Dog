// Functional check of compose -> outbox -> sent against the mock store (nothing is written anywhere real).
import { chromium } from 'playwright';
import { init, initFor } from './mock.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(init);
await p.addInitScript("window.__call=async(s,t,a)=>{(window.calls=window.calls||[]).push(a.session_id); if(a.session_id==='s2'&&!window.okAll) throw {code:'server_unavailable'};}");
await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
const ok=(c,m)=>console.log(c?'PASS':'FAIL',m);
await p.click('.compose-btn'); await p.fill('#c-to-in','for'); await p.keyboard.press('Enter');
await p.click('[data-act="cmp-all"]');
ok((await p.textContent('#c-to-chips')).includes('Forge')&&(await p.textContent('#c-cc-chips')).includes('Firefly'),'everyone fills To and Cc');
await p.fill('#c-re','Test'); await p.fill('#c-body','hello');
await p.waitForTimeout(1200); ok((await p.textContent('#c-saved')).includes('saved'),'autosave to drafts');
await p.click('[data-act="cmp-send"]'); ok(await p.isVisible('#c-confirm'),'confirm shown');
await p.click('[data-act="cmp-go"]'); await p.waitForTimeout(500);
ok((await p.textContent('#list')).includes('Test'),'failed send sits in outbox');
ok((await p.textContent('#nav')).match(/Outbox\s*2/)!==null,'outbox count 2');
await p.evaluate(()=>{window.okAll=true}); await p.click('.row:has-text("Test")'); await p.click('[data-act="retry"]'); await p.waitForTimeout(500);
await p.click('[data-f="sent"]'); ok((await p.textContent('#list')).includes('Test'),'retry delivers, message lands in Sent');
await p.click('[data-f="drafts"]'); ok((await p.textContent('#list')).includes('Next round')&&!(await p.textContent('#list')).includes('Test'),'draft removed after send');
// team mail folder
await p.click('[data-f="mail"]'); ok((await p.textContent('#nav')).match(/Team mail\s*1/)!==null,'team mail unread count 1');
ok((await p.textContent('#list')).includes('Lever → Palette')&&(await p.textContent('#list')).includes('Forge → Scout'),'member-to-member rows shown');
await p.click('.row:has-text("style hook")'); ok((await p.textContent('#read')).includes('Roster colours later')&&(await p.textContent('#read')).includes('claude/team-palette'),'thread read with both messages and branch');
ok(!(await p.textContent('#read')).includes('Archive')&&!(await p.textContent('#read')).includes('Trash'),'mail is read-only (no archive or trash)');
ok((await p.textContent('#nav')).match(/Team mail\s*1/)===null,'opening marks it read');
await p.click('[data-act="reply"]'); ok((await p.inputValue('#c-re')).startsWith('Re: ')&&(await p.textContent('#c-to-chips')).includes('Lever'),'reply goes to the sender of the latest message'); await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
// phase 3: search and shortcuts
await p.click('[data-f="inbox"]'); await p.fill('#q','moss'); await p.waitForTimeout(150);
ok((await p.textContent('#list')).includes('Style note')&&!(await p.textContent('#list')).includes('Missing-found'),'search finds across folders');
await p.fill('#q','Moss tone'); ok((await p.textContent('#list')).includes('Moss tone')&&(await p.textContent('#list')).includes('Outbox'),'search reaches the outbox, row tagged');
await p.keyboard.press('Escape'); ok((await p.inputValue('#q'))==='','Esc clears search'); 
await p.click('[data-f="inbox"]'); await p.click('body',{position:{x:5,y:5}});
await p.keyboard.press('j'); ok((await p.textContent('#read')).includes('Gear fit'),'j opens first message');
await p.keyboard.press('j'); ok((await p.textContent('#read')).includes('Missing-found'),'j moves on');
await p.keyboard.press('k'); ok((await p.textContent('#read')).includes('Gear fit'),'k moves back');
await p.keyboard.press('s'); ok(await p.isVisible('.rh .on'),'s stars');
await p.keyboard.press('r'); ok(await p.isVisible('#cmp')&&(await p.inputValue('#c-re')).startsWith('Re: '),'r opens reply');
await p.keyboard.press('Escape'); ok(!(await p.isVisible('#cmp')),'Esc closes compose');
await p.keyboard.press('e'); await p.click('[data-f="archive"]'); ok((await p.textContent('#list')).includes('Gear fit'),'e archives');
await p.keyboard.press('c'); ok(await p.isVisible('#cmp'),'c composes'); await p.keyboard.press('Escape'); ok(!(await p.isVisible('#cmp')),'Esc closes compose');
await p.keyboard.press('c'); await p.click('#c-to-in'); await p.waitForTimeout(120); ok(await p.isVisible('#c-to-sug'),'clicking the To field shows suggestions'); await p.keyboard.press('Escape'); ok(await p.isVisible('#cmp'),'Esc with suggestions open only closes the suggestions'); await p.keyboard.press('Escape');
await p.keyboard.press('?'); ok(await p.isVisible('#help'),'? shows help');
// movable and resizable compose window
await p.keyboard.press('Escape'); await p.click('[data-f="inbox"]'); await p.keyboard.press('c');
const box=async()=>p.evaluate(()=>{const r=document.getElementById('cmp').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
const b0=await box(); await p.mouse.move(b0.x+200,b0.y+18); await p.mouse.down(); await p.mouse.move(b0.x+100,b0.y+18-30,{steps:6}); await p.mouse.up();
const b1=await box(); ok(Math.abs((b1.x-b0.x)+100)<3&&Math.abs((b1.y-b0.y)+30)<4,'dragging the header moves the window');
await p.mouse.move(b1.x+b1.w-6,b1.y+b1.h-6); await p.mouse.down(); await p.mouse.move(b1.x+b1.w+120,b1.y+b1.h+60,{steps:6}); await p.mouse.up();
const b2=await box(); ok(b2.w>b1.w+100&&b2.h>b1.h+50,'dragging the grip resizes it');
await p.mouse.move(0,0); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.keyboard.press('c'); const b3=await box(); ok(Math.abs(b3.x-b2.x)<2&&Math.abs(b3.w-b2.w)<2,'position and size are remembered');
await p.dblclick('#c-head h2'); const b4=await box(); ok(b4.w<b2.w&&b4.y>b2.y,'double-click on the header resets it');
await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
// connection check and blocked sends
for (const [v, chip] of [['blocked','Sending blocked'],['noconn','Live sessions off'],['default','Connected']]) {
  const q = await (await b.newContext({viewport:{width:1280,height:800}})).newPage(); q.on('pageerror',e=>errs.push(e.message));
  await q.addInitScript(initFor(v)); await q.goto('file://'+process.argv[2]); await q.waitForTimeout(500);
  ok((await q.textContent('#conn-chip')).toLowerCase().includes(chip.toLowerCase()), 'status chip says "'+chip+'" ('+v+')');
  if (v==='blocked') {
    await q.click('[data-f="conn"]'); ok((await q.textContent('#conn')).includes('blocked_by_policy')&&(await q.textContent('#conn')).includes('Open Permissions')&&!(await q.textContent('#conn')).includes('Connectors'),'connection view names the code, offers Permissions and does not send you to Connectors');
    await q.click('.compose-btn'); await q.click('[data-act="cmp-all"]'); await q.fill('#c-re','Blocked test'); await q.fill('#c-body','x'); await q.click('[data-act="cmp-send"]');
    ok((await q.textContent('#c-confirm-text')).includes('Sending is blocked'),'confirm warns that it will wait in the Outbox');
    await q.click('[data-act="cmp-go"]'); await q.waitForTimeout(500);
    ok((await q.textContent('#list')).includes('Not delivered'),'blocked send stays in the Outbox as "Not delivered"');
    ok((await q.textContent('#toast')).includes('Not delivered'),'toast says it was not delivered, with the reason');
  }
  await q.context().close();
}
console.log('errors:',errs.length?errs:'none'); await b.close();
