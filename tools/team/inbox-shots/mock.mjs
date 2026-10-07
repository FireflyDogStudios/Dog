export const notes=[
 {id:'a',nick:'Forge',from:'forge',headline:'Gear fit pass done, needs a look',needs:'a review of the helm set',body:'- fitted 6 helms\n- lint clean\n- two need a second pass on the brow line',branch:'claude/team-forge',path:'docs/team/forge/helms.md',date:'2026-10-07',state:'new'},
 {id:'a2',nick:'Forge',from:'forge',headline:'Re: Gear fit pass done, needs a look',needs:'nothing',body:'Second pass done on the brow line.',date:'2026-10-07',state:'new'},
 {id:'b',nick:'Scout',from:'scout',headline:'Missing-found round',needs:'nothing (FYI)',body:'Wolf skulls and joint ranges fetched. Licences all CC BY or PD.',path:'ref/research/missingfound/',date:'2026-10-07',state:'read',starred:true},
 {id:'c',nick:'Lever',from:'lever',headline:'Lever is here: inbox works',needs:'nothing',date:'2026-10-06',state:'done'},
 {id:'d',nick:'Palette',from:'palette',headline:'Style note on the bestiary colours',needs:'a decision on the moss tone',body:'Two options attached.',date:'2026-10-05',state:'read'}];
export const members=[{id:'firefly',nick:'Firefly',role:'Lead',tier:'lead',order:1,session_id:'s1',working:'Reading the inbox'},
 {id:'forge',nick:'Forge',role:'Gear',tier:'role',order:2,session_id:'s2',working:'Helm fit',blocked:'no'},
 {id:'lever',nick:'Lever',role:'Tools and admin panel',tier:'role',order:3,session_id:'s3',working:'Inbox rebuild',blocked:'no'},
 {id:'scout',nick:'Scout',role:'Research',tier:'role',order:4,state:'planned'}];
export const sent=[{id:'s1',at:'2026-10-07T20:10:00Z',to:['Forge'],cc:['Firefly'],re:'Gear fit pass done, needs a look',type:'answer',body:'- Looks good, go ahead with the brow-line pass.',results:[{nick:'Forge',ok:true}]},
 {id:'s0',at:'2026-10-06T09:00:00Z',to:['Lever'],cc:[],re:'Welcome',type:'welcome',results:[{nick:'Lever',ok:true}]}];
export const drafts=[{id:'d1',at:'2026-10-07T21:00:00Z',to:['Scout'],cc:[],re:'Next round',body:'Ideas for the next fetch'}];
export const outbox=[{id:'o1',at:'2026-10-07T21:30:00Z',to:['Palette'],cc:['Firefly'],re:'Moss tone: option 2',body:'Go with option 2.',status:'failed'}];
export const init=`
const D=${JSON.stringify({notes,members,sent,drafts,outbox})};
const mk=(a)=>a.map(x=>({id:x.id,data:()=>x}));
window.claude={use:async(k)=>k==='db'?{collection:(c)=>({orderBy:()=>({onSnapshot:(f)=>f({docs:mk(D[c]||[])})}),add:async()=>{}}),doc:()=>({onSnapshot:(f)=>f({exists:true,data:()=>({checked_at:new Date().toISOString()})}),update:async()=>{}})}:{watchTool:()=>{},callTool:async()=>{}}};`;
