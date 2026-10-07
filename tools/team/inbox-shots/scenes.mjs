export default async ({run,W,open,fld})=>{
 const rep=async p=>{await p.click('[data-act="reply"]');await p.fill('#c-body','- Thanks, looks good.\n'+await p.inputValue('#c-body'));await p.fill('#c-re','Re: Gear fit pass done, needs a look');};
 const comp=async p=>{await p.click('.compose-btn');await p.fill('#c-to-in','fo');};
 for(const sch of ['dark','light']){
  await run('d',...W.desktop,sch,[[`desktop-${sch}`,open('Gear fit')]]);
  await run('d',...W.desktop,sch,[[`desktop-reply-${sch}`,async p=>{await open('Gear fit')(p);await rep(p);}],[`desktop-compose-${sch}`,async p=>{await p.click('[data-act="cmp-discard"]');await comp(p);}]]);
 }
 await run('d',...W.desktop,'dark',[['desktop-team-dark',fld('team')],['desktop-outbox-dark',async p=>{await fld('outbox')(p);await open('Moss tone')(p);}]]);
 for(const sch of ['dark','light']){
  await run('h',...W.half,sch,[[`half-list-${sch}`,null],[`half-read-${sch}`,open('Gear fit')]]);
  await run('p',...W.phone,sch,[[`phone-list-${sch}`,null],[`phone-read-${sch}`,open('Gear fit')],[`phone-folders-${sch}`,async p=>{await p.click('.back >> nth=0')}],[`phone-compose-${sch}`,async p=>{await p.click('[data-f="inbox"]');await p.click('#fab');await p.fill('#c-to-in','f');}]]);
 }
};
