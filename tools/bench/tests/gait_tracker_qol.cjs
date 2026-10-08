// Gait Tracker ease-of-use test: manual mode, auto-next joint and frame, undo/redo, copy/paste, delete, clear frame, auto adjust + revert, right-click menu, fill.
// usage: node tools/bench/tests/gait_tracker_qol.cjs <dir holding vid/fox_test.webm>
const {chromium}=require('/home/user/Dog/node_modules/playwright');
(async()=>{const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error'&&!/CERT|fonts/.test(m.text())) errs.push(m.text());});
 await pg.goto('file:///home/user/Dog/apps/gait-tracker/index.html'); await pg.setInputFiles('#file',process.argv[2]+'/vid/fox_test.webm'); await pg.waitForFunction(()=>st.n>0,null,{timeout:60000}); await pg.selectOption('#flow','joints');
 const scr=async(x,y)=>pg.evaluate(([x,y])=>{const b=cv.getBoundingClientRect(); const p=toScr(x,y); return [b.left+p[0],b.top+p[1]];},[x,y]);
 const ev=f=>pg.evaluate(f); const log=(...a)=>console.log(...a);
 log('mode',await ev(()=>st.mode));
 // hide far legs + head groups so placing walks one leg; place 4 near front joints on frame 1
 await ev(()=>{hiddenGroups.add('fF');hiddenGroups.add('fH');hiddenGroups.add('body');hiddenGroups.add('nH'); st.sel='nSh'; goTo(0);});
 for(const [x,y] of [[200,128],[203,150],[222,180],[238,204]]){const [X,Y]=await scr(x,y); await pg.mouse.click(X,Y); await pg.waitForTimeout(60);}
 log('after 4 clicks: frame',await ev(()=>st.cur+1),'sel',await ev(()=>st.sel),'keys f0',await ev(()=>Object.keys(st.keys).filter(j=>st.keys[j][0]).join(',')));
 log('filled shown in manual?',await ev(()=>isNaN(st.res.nCa.x[3])?'no':'yes'));
 await pg.keyboard.press('Control+z'); log('undo -> paw key at f0?',await ev(()=>!!keyAt('nFp',0)),'banner',await pg.textContent('#banner'));
 await pg.keyboard.press('Control+Shift+z'); log('redo -> paw key at f0?',await ev(()=>!!keyAt('nFp',0)));
 await ev(()=>goTo(0)); await pg.keyboard.press('Control+c'); await ev(()=>goTo(2)); await pg.keyboard.press('Control+v'); log('pasted on f3',await ev(()=>Object.keys(st.keys).filter(j=>st.keys[j][2]).length));
 await ev(()=>{st.sel='nCa';}); await pg.keyboard.press('Delete'); log('delete wrist f3',await ev(()=>!!keyAt('nCa',2)));
 await pg.keyboard.press('Shift+Delete'); log('clear f3',await ev(()=>Object.keys(st.keys).filter(j=>st.keys[j][2]).length));
 // place frame 2 roughly offset, then auto adjust
 await ev(()=>goTo(1)); await ev(()=>{st.sel='nSh';}); for(const [x,y] of [[198,129],[201,151],[218,183],[232,205]]){const [X,Y]=await scr(x,y); await pg.mouse.click(X,Y); await pg.waitForTimeout(60);}
 await pg.click('#adjust'); await pg.waitForTimeout(200); log('adjust toast',await pg.textContent('#banner'), 'orig on f2 wrist', await ev(()=>JSON.stringify(keyAt('nCa',1))));
 await pg.click('#revertAdj'); log('reverted', await ev(()=>JSON.stringify(keyAt('nCa',1))));
 // right-click menu on a point
 await ev(()=>goTo(0)); const [X,Y]=await scr(222,180); await pg.mouse.click(X,Y,{button:'right'}); await pg.waitForTimeout(150);
 log('menu', await pg.$$eval('#cmenu button',B=>B.map(b=>b.firstChild.textContent).join(' | ')));
 await pg.screenshot({path:process.argv[2]+'/gt_menu.png'}); await pg.keyboard.press('Escape');
 await pg.keyboard.press('f'); await pg.waitForTimeout(600); log('after F filled?',await ev(()=>isNaN(st.res.nCa.x[5])?'no':'yes'));
 log('errors',errs.length?errs:'none'); await b.close();})();
