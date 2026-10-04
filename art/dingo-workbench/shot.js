const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1180,height:500}});await p.goto('file://'+__dirname+'/hand.html');await p.screenshot({path:__dirname+'/hand.png'});await b.close();})();
