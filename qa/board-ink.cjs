// node qa/board-ink.cjs chromium|firefox|webkit [url]
const {chromium,firefox,webkit}=require('playwright'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const name=process.argv[2]||'chromium',browser=await ({chromium,firefox,webkit})[name].launch(name==='chromium'?{channel:'chromium'}:{});
try{let n=0;for(const [w,h,dpr] of [[1280,900,1],[390,844,3],[320,640,2],[844,390,2]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:dpr}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[3]||'file://'+path.resolve(__dirname,'../index.html'));await page.click('#run');await page.evaluate(()=>document.fonts.ready);
  for(const fs of [false,true]){
    if(fs){await page.click('#full');await page.waitForSelector('#stage-full.fs');}
    for(let i=0;i<18;i++){
      const expected=await page.evaluate(i=>{const D=__donghyunram,s=D.snapshot();s.state.formI=i;s.state.score=12345678;s.state.city=12;s.state.lives=5;D.restore(s);return Engine.FORMS[i].name;},i);
      await page.waitForFunction(n=>document.querySelector('.ink-name').textContent===n&&document.querySelector('.ink-score').textContent==='12345678',expected);
      await page.evaluate(()=>{const bar=document.querySelector('.ink-bar'),bounds=document.querySelector('#board').getBoundingClientRect(),area=e=>e.getBoundingClientRect(),rects=[];
        for(const el of bar.children){const r=area(el);if(r.width<=0||r.left<bounds.left-1||r.right>bounds.right+1||el.scrollWidth>el.clientWidth+1)throw Error('clipped '+el.className);for(const a of rects)if(Math.min(a.right,r.right)-Math.max(a.left,r.left)>1&&Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top)>1)throw Error('overlap '+el.className);rects.push(r);}
        if(document.querySelector('.ink-score').textContent!=='12345678')throw Error('score');
      });n++;
    }
    if(!fs&&name==='chromium'&&[1280,390].includes(w))await page.locator('.board-stage').screenshot({path:`/tmp/ram105-${w}.png`});
  }assert.deepEqual(errors,[]);await page.close();
}console.log(name,n,'layouts passed');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
