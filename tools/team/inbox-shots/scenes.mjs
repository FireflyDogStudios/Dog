export default async ({run,W,open,fld})=>{
 const rep=async p=>{await p.click('[data-act="reply"]');await p.fill('#c-body','- Thanks, looks good.\n'+await p.inputValue('#c-body'));await p.fill('#c-re','Re: Gear fit pass done, needs a look');};
 const comp=async p=>{await p.click('.compose-btn');await p.fill('#c-to-in','fo');};
 for(const sch of ['dark','light']){
  await run('d',...W.desktop,sch,[[`desktop-${sch}`,open('Gear fit')]]);
  await run('d',...W.desktop,sch,[[`desktop-reply-${sch}`,async p=>{await open('Gear fit')(p);await rep(p);}],[`desktop-compose-${sch}`,async p=>{await p.click('[data-act="cmp-discard"]');await comp(p);}]]);
 }
 await run('d',...W.desktop,'dark',[['desktop-mail-dark',async p=>{await fld('mail')(p);await open('style hook')(p);}]]);
 await run('d',...W.desktop,'light',[['desktop-mail-light',async p=>{await fld('mail')(p);await open('style hook')(p);}]]);
 await run('p',...W.phone,'dark',[['phone-mail-dark',async p=>{await p.click('.back >> nth=0');await fld('mail')(p);await open('style hook')(p);}]]);
 await run('d',...W.desktop,'dark',[['desktop-search-dark',async p=>{await p.fill('#q','gear');}],['desktop-help-dark',async p=>{await p.fill('#q','');await p.click('body',{position:{x:5,y:5}});await p.keyboard.press('?');}]]);
 await run('p',...W.phone,'light',[['phone-search-light',async p=>{await p.fill('#q','moss');}]]);
 await run('d',...W.desktop,'dark',[['desktop-compose-moved-dark',async p=>{await p.keyboard.press('Escape');await p.evaluate(()=>{});await p.click('.compose-btn');const r=await p.evaluate(()=>{const b=document.getElementById('cmp').getBoundingClientRect();return [b.left,b.top,b.width,b.height]});await p.mouse.move(r[0]+250,r[1]+18);await p.mouse.down();await p.mouse.move(r[0]-120,r[1]+60,{steps:5});await p.mouse.up();const q=await p.evaluate(()=>{const b=document.getElementById('cmp').getBoundingClientRect();return [b.right,b.bottom]});await p.mouse.move(q[0]-6,q[1]-6);await p.mouse.down();await p.mouse.move(q[0]-150,q[1]-90,{steps:5});await p.mouse.up();await p.fill('#c-body','Window moved and shrunk.');}]]);
 await run('d',...W.desktop,'dark',[['desktop-team-dark',fld('team')],['desktop-outbox-dark',async p=>{await fld('outbox')(p);await open('Moss tone')(p);}]]);
 for(const sch of ['dark','light']){
  await run('h',...W.half,sch,[[`half-list-${sch}`,null],[`half-read-${sch}`,open('Gear fit')]]);
  await run('p',...W.phone,sch,[[`phone-list-${sch}`,null],[`phone-read-${sch}`,open('Gear fit')],[`phone-folders-${sch}`,async p=>{await p.click('.back >> nth=0')}],[`phone-compose-${sch}`,async p=>{await p.click('[data-f="inbox"]');await p.click('#fab');await p.fill('#c-to-in','f');}]]);
 }
 for(const v of ['default','blocked','noconn']) await run('d',...W.desktop,'dark',[[`conn-${v}-dark`,fld('conn')]],v);
 await run('p',...W.phone,'light',[['conn-blocked-phone-light',async p=>{await p.click('#conn-chip')}]],'blocked');
 await run('d',...W.desktop,'dark',[['outbox-blocked-dark',async p=>{await fld('outbox')(p);await open('Moss tone')(p)}]],'blocked');
};
