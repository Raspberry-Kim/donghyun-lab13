// node qa/climber.cjs [chromium|firefox|webkit] [정식 페이지 URL]
// 기존 태그를 읽기만 한다. 몸체 원본은 승인된 64×64 여덟 칸이다.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {execFileSync}=require('child_process'),pw=require('playwright');
const root=path.join(__dirname,'..'),name=process.argv[2]||'chromium',url=process.argv[3]||'file://'+path.join(root,'index.html');
const prev=execFileSync('git',['show','v0.28:src/sprites.js'],{cwd:root,encoding:'utf8'});
const fixture=fs.readFileSync(path.join(__dirname,'fixtures','climber.png')).toString('base64');
(async()=>{const b=await pw[name].launch(name==='chromium'?{channel:'chromium'}:{});
try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 const result=await p.evaluate(async({prev,fixture})=>{
  const ok=(v,m)=>{if(!v)throw Error(m);},code=[...document.scripts].map(s=>s.textContent).find(s=>s.includes('const RamClimberPixels='));
  ok(code,'등반형 배포 코드 없음');
  const piece=code.slice(code.indexOf('/* 동현램 그림:'),code.indexOf('})(typeof window',code.indexOf('/* 동현램 그림:')))+'})(window);';
  function traced(source){
   const env={log:[]},mark=(fn,str)=>{source=source.replace(fn,fn+str);};
   mark('function drawFace(g,P,key,x0,y0){','root.log.push(["face",key,x0,y0,P.eyes,P.mouth,P.mouthBoost,...Array.from(g.getTransform().toFloat64Array())]);');
   mark('function items(g,P,t){','root.log.push(["items",P.item,P.extra,P.my,t,...Array.from(g.getTransform().toFloat64Array())]);');
   new Function('window',source)(env);return env;
  }
  const old=traced(prev),now=traced(piece);const make=()=>{let c=document.createElement('canvas');c.width=144;c.height=144;return c.getContext('2d');};
  const ga=make(),gb=make(),forms=Engine.FORMS.filter(f=>f.look==='monster'),base={dir:1,state:'ground',walkT:0,punchT:0,eatT:0,hurtT:0,shrinkT:0,climbT:0};
  let eats=0;for(const f of forms)for(const [kind,total] of [['gulp',36],['chew',48],['toss',54],['smoke',70]])for(let rem=total;rem>0;rem--)for(const what of ['person','taxi','cop','tram']){
   const h={...base,dir:rem%2?1:-1,eatT:rem,eatKind:kind,eatWhat:what,eatCity:4};
   old.log.length=now.log.length=0;let t=total-rem;old.Sprites.drawMonster(ga,f,h,t,70,115);now.Sprites.drawMonster(gb,f,h,t,70,115);
   ok(old.log.length===2&&JSON.stringify(old.log)===JSON.stringify(now.log),[f.key,kind,rem,what]);eats++;
  }
  const sprite=new Image();sprite.src='data:image/png;base64,'+fixture;await sprite.decode();
  const ref=document.createElement('canvas');ref.width=512;ref.height=64;let rg=ref.getContext('2d');rg.drawImage(sprite,0,0);
  const names=['idle','walk','punch','climb','pass','brace','coil','step'];
  let match=0;for(const [n,frame] of names.entries()){
   const ctx=make();ctx.translate(26,53);const [x,y,rows]=RamClimberPixels.frames[frame];
   rows.forEach((r,i)=>[...r].forEach((v,j)=>{if(v!=='.'){ctx.fillStyle=RamClimberPixels.colors.podong[v];ctx.fillRect(x+j,y+i,1,1);}}));
   const a=ctx.getImageData(0,0,64,64).data,b=rg.getImageData(n*64,0,64,64).data;
   ok(a.every((v,i)=>v===b[i]),frame);match++;
  }
  // Verify the shipped drawMonster actually selects each approved frame; suppress only the head.
  const env={};new Function('window',piece.replace('function drawFace(g,P,key,x0,y0){','function drawFace(g,P,key,x0,y0){return;'))(env);
  const states=[{}, {walkT:1},{punchT:8},{state:'climb',side:-1},{walkT:4},{punchT:2},{punchT:16},{state:'climb',side:-1,climbT:8}];
  for(const [n,s] of states.entries()){
   let g=make();env.Sprites.drawMonster(g,{key:'podong'},{...base,...s},0,26,53);
   let a=g.getImageData(0,0,64,64).data,b=rg.getImageData(n*64,0,64,64).data;
   ok(a.every((v,i)=>v===b[i]),'실제 몸체 '+names[n]);
  }
  for(const f of forms)for(const state of ['ground','roof','air','climb','sit','ride'])for(const dir of [-1,1])for(const pdy of [-1,0,1]){
   const h={...base,state,dir,pdy,punchT:8,hang:f.hang,side:1};gb.clearRect(0,0,144,144);Sprites.drawMonster(gb,f,h,8,72,112);
   ok(gb.getImageData(0,0,144,144).data.some(v=>v),'빈 그림');
  }
  return {eats,match};
 },{prev,fixture});assert.deepEqual(errors,[]);console.log(name,JSON.stringify(result),'page errors 0');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
