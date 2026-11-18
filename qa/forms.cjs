// node qa/forms.cjs chromium|firefox|webkit [공개 URL]
const pw=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const browser=process.argv[2]||'chromium',url=process.argv[3]||'file://'+path.resolve(__dirname,'../index.html');
(async()=>{const b=await pw[browser].launch(browser==='chromium'?{channel:'chromium'}:{});
try{const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);
assert.equal(await p.locator('#example option:checked').innerText(),'01 · 슈슈(동현파)');
await p.click('#run');
const result=await p.evaluate(async reference=>{
 const ok=(v,msg)=>{if(!v)throw Error(msg);},D=window.__donghyunram,forms=Engine.FORMS;
 const ref=new Image();ref.src='data:image/png;base64,'+reference;await ref.decode();
 const canvas=()=>{const c=document.createElement('canvas');c.width=96;c.height=80;return c.getContext('2d');};
 const g=canvas(),r=canvas(),start=D.snapshot();
 ok(start.state.formI===0&&start.version===2,'기본 출전');let poses=0,saves=0,eats=0;
 const rows=['shushu','podong','lion','fly','doom','copter'];
 for(let i=0;i<12;i++){
   const f=forms[i],family=forms[i^1];ok(f.key===family.key&&f.look!==family.look,'짝 순서');
   for(const k of ['speed','atk','def','reach','fly','hang'])ok(f[k]===family[k],k);
   const s=structuredClone(start);s.state.formI=i;D.restore(s);ok(D.snapshot().state.formI===i,'새 저장');saves++;
   if(i%2)continue;
   const old=structuredClone(start);old.version=1;old.state.formI=i/2;D.restore(old);ok(D.snapshot().state.formI===i+1&&old.state.formI===i/2,'구판 저장');saves++;
   for(let m=0;m<6;m++){
    const seen=new Set();
    for(let n=0;n<(m===0?1:m===1?8:16);n++){
     const h={...s.state.hero,dir:m===2?-1:1,pdx:m===2?-1:1,pdy:m===4?-1:m===5?1:0,punchT:m>=2?16-n:0,state:m===1?'climb':'ground',side:-1,climbT:n*2};
     g.clearRect(0,0,96,80);Sprites.drawMonster(g,f,h,0,48,68);
     const a=g.getImageData(0,0,96,80).data;ok(a.some(v=>v),f.name+' 빈 그림');seen.add(g.canvas.toDataURL());
     if(f.key!=='copter'){
       r.clearRect(0,0,96,80);r.drawImage(ref,96*n,(rows.indexOf(f.key)*7+m)*80,96,80,0,0,96,80);
       const c=r.getImageData(0,0,96,80).data;ok(a.every((v,j)=>v===c[j]),`${f.name} ${m}/${n}`);
     }poses++;
    }
    if(m>=2)ok(seen.size>=4,f.name+' 타격 동작 부족');
   }
   for(const [kind,total] of Object.entries({chew:48,gulp:36,toss:54})){
     const frames=new Set();for(let t=0;t<total;t+=3){
       g.clearRect(0,0,96,80);Sprites.drawMonster(g,f,{...s.state.hero,dir:1,eatT:total-t,eatKind:kind,eatWhat:'person'},t,38,61);frames.add(g.canvas.toDataURL());
     }ok(frames.size>=5,f.name+kind);eats++;
   }
 }
 return {poses,saves,eats};
},fs.readFileSync(path.join(__dirname,'../src/origin.png')).toString('base64'));
const old=await p.evaluate(()=>{const D=window.__donghyunram,s=D.snapshot();s.version=1;s.state.formI=4;s.summary.form='포동이';localStorage.setItem('donghyunram:slot1',JSON.stringify(s));return s;});
await p.reload();await p.locator('.slot-btn').first().click();
assert.equal(await p.evaluate(()=>Engine.form(window.__donghyunram.state).name),'포동이(몬스터)');
old.state.formI=5;await p.setInputFiles('#load-file',{name:'old.dhsave',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});
await p.waitForFunction(()=>Engine.form(window.__donghyunram.state).name==='초파리(몬스터)');
assert.deepEqual(errors,[]);console.log(browser,result,'구판 칸·파일 복원');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
