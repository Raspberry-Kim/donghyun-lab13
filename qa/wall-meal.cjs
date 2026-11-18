// Compare the visible support pixels to the corresponding non-eating wall frame, not to a ground pose.
const pw=require('playwright'),path=require('node:path');
(async()=>{const name=process.argv[2]||'chromium',browser=await pw[name].launch(name==='chromium'?{channel:'chromium'}:{});
try{const page=await browser.newPage();await page.goto(process.argv[3]||'file://'+path.resolve(__dirname,'../index.html'));await page.click('#run');
console.log(name,await page.evaluate(()=>{
 const E=Engine,cut={shushu:-10,podong:-10,lion:-5,fly:-20,doom:-18,copter:-7};
 const cv=document.createElement('canvas');cv.width=128;cv.height=144;
 const g=cv.getContext('2d',{willReadFrequently:true}),Y=100;
 const image=(f,h,t)=>{g.clearRect(0,0,128,144);Sprites.drawMonster(g,f,h,t,64,Y);return new Uint32Array(g.getImageData(0,0,128,144).data.buffer);};
 const ok=(v,m)=>{if(!v)throw Error(m);};let frames=0,windows=0;
 for(const f of E.FORMS)for(const side of [-1,1]){
   const s=E.newGame({form:f.id,city:8,seed:34}),h=s.hero,b=s.builds.find(b=>b.floors>=3);
   Object.assign(h,{state:'climb',side,dir:-side,bld:b.i,x:b.x+(side>0?b.w:0),y:E.GROUND-2*E.FLOOR+2,stam:40});
   for(const row of b.cells)for(const c of row)c.person=0;
   const c=b.cells[2][side<0?0:b.cols-1];c.hp=0;c.person=1;
   E.step(s,{punchPressed:true});for(let i=0;i<5;i++)E.step(s,{});
   ok(h.state==='climb'&&h.eats===1&&h.eatWhat==='person'&&h.stam>40,'실제 창 '+f.name);windows++;
   const split=(Y+(f.look==='origin'?cut[f.key]:-7))*128;
   for(const state of ['climb','ride'])for(const climbT of [0,10])for(const dir of [-1,1]){
     const base={...h,state,dir,climbT,eatT:0,punchT:0,wallContact:null,rotorContact:null,hurtT:0};
     for(const [kind,N] of Object.entries({gulp:36,chew:48,toss:54,...(f.look==='origin'?{}:{smoke:70})})){
       let changing=false,prev;
       for(const [j,ratio] of [0,.32,.52,.78,.97].entries()){
         const t=13+j,ref=image(f,base,t),meal=image(f,{...base,eatWhat:j%2?'soldier':'person',eatKind:kind,eatT:N-Math.floor(N*ratio)},t);
         ok(ref.subarray(split).some(x=>x!==0)&&meal.subarray(split).every((v,i)=>v===ref[split+i]),'지지 자세 '+[f.name,side,state,dir,climbT,kind,j]);
         if(prev&&meal.subarray(0,split).some((v,i)=>v!==prev[i]))changing=true;
         prev=meal;frames++;
       }ok(changing,'먹기 상체 정지 '+f.name+'/'+kind);
     }
   }
 }return {frames,windows};
}));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
