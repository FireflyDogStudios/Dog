export default async ({run,W,open,fld})=>{
 for(const sch of ['dark','light']){
  await run('d',...W.desktop,sch,[[`desktop-${sch}`,open('Gear fit')]]);
 }
 await run('d',...W.desktop,'dark',[['desktop-team-dark',fld('team')],['desktop-outbox-dark',fld('outbox')]]);
 for(const sch of ['dark','light']){
  await run('h',...W.half,sch,[[`half-list-${sch}`,null],[`half-read-${sch}`,open('Gear fit')]]);
  await run('p',...W.phone,sch,[[`phone-list-${sch}`,null],[`phone-read-${sch}`,open('Gear fit')],[`phone-folders-${sch}`,async p=>{await p.click('.back >> nth=0')}]]);
 }
};
