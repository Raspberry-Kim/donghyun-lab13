// Adjacent facade: both walls, three rows, all 18 appearances; keyboard and pointer integration.
const pw=require('playwright'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const name=process.argv[2]||'chromium',b=await pw[name].launch(name==='chromium'?{channel:'chromium'}:{});try{
 const page=await b.newPage({viewport:{width:1280,height:960},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[3]||'file://'+path.resolve(__dirname,'../index.html'));await page.click('#run');
 let report=await page.evaluate(()=>{
  const E=Engine,D=__donghyunram,ok=(v,m)=>{if(!v)throw Error(m);};
  window.alleySetup=(id,side,warn=false)=>{
   const s=E.newGame({form:id,city:8,seed:34}),h=s.hero;
   const b=s.builds.find(b=>b.floors>=3&&s.builds[b.i+side]?.floors>=3),adj=s.builds[b.i+side];
   Object.assign(h,{state:'climb',side,dir:-side,x:b.x+(side>0?b.w:0),y:E.GROUND-26,bld:b.i,inv:600});
   if(warn)b.state='warn';for(const b of s.builds)for(const row of b.cells)for(const c of row)c.person=0;
   return {s,h,b,adj,col:side<0?adj.cols-1:0};
  };
  const cv=document.createElement('canvas');cv.width=cv.height=128;const ctx=cv.getContext('2d',{willReadFrequently:true});
  let hits=0,miss=0,contact=0,meals=0;
  for(const f of E.FORMS){
   for(const side of [-1,1])for(const dy of [-1,0,1])for(const warn of [false,true])for(const input of ['keys','tap']){
    const {s,h,b,adj,col}=alleySetup(f.id,side,warn),row=2-dy,cell=adj.cells[row][col],hp=cell.hp,own=JSON.stringify(b.cells);
    const x=adj.x+(col+.5)*E.CELL_W,y=E.GROUND-(row+.5)*E.FLOOR;
    const k=input==='tap'?E.autoKeys(s,{x,y},{}):{punchPressed:true,up:dy<0,down:dy>0};
    E.step(s,k);for(let n=1;n<=5;n++)E.step(s,input==='keys'&&n===1?{left:side<0,right:side>0}:{});
    ok(h.state==='climb'&&h.bld===b.i&&h.punchT===11&&cell.hp<hp&&JSON.stringify(b.cells)===own,'잘못된 건물/층 '+[f.name,side,dy,warn,input]);
    ok(s.fx.some(v=>v.n===adj.i&&(v.k==='glass'||v.k==='chunk')),'옆 창 파편');hits++;
    if(f.look==='origin'){
     ok(h.wallContact?.b===adj.i&&h.wallContact.x===x&&h.wallContact.y===y,'손끝 접점');contact++;
     if(f.key==='copter')ok(h.rotorContact.x===x&&h.rotorContact.y===y,'꼬리 끝');
     ctx.clearRect(0,0,128,128);Sprites.drawMonster(ctx,f,h,s.time,64,64);
     const px=ctx.getImageData(Math.round(64+x-h.x)-2,Math.round(64+y-h.y)-2,5,5).data;
     ok(px.some((v,i)=>i%4===3&&v>120),'실제 그림이 맞은 창에 닿지 않음: '+f.name);
    }
   }
   for(const side of [-1,1]){
    const {s,h,b,adj}=alleySetup(f.id,side);adj.state='gone';const own=JSON.stringify(b.cells);
    E.step(s,{punchPressed:true,left:side<0,right:side>0});for(let n=0;n<5;n++)E.step(s,{});
    ok(!h.wallContact&&s.events.some(e=>e.t==='whiff')&&JSON.stringify(b.cells)===own,'빈 골목');miss++;
   }
   if(f.look!=='origin')continue;
   let kinds=new Set();
   for(let seed=1;seed<=120;seed++){
    for(const type of ['soldier','taxi','cop','tram','person']){
     const {s,h,b}=alleySetup(f.id,-1);s.rs=seed*113113;h.stam=40;
     if(type==='person'){const c=b.cells[2][0];c.hp=0;c.person=1;E.step(s,{punchPressed:true,right:true});for(let n=0;n<5;n++)E.step(s,{});}
     else E.killEn(s,{type,x:h.x,y:E.GROUND,dir:1,hp:0,alive:true});
     ok(h.eats===1&&h.stam>40&&['gulp','chew','toss'].includes(h.eatKind),'먹기 '+f.name+'/'+type);kinds.add(h.eatKind);meals++;
    }
   }ok(kinds.size===3,'세 먹기 동작');
   const old=D.snapshot();old.state.formI=f.id-1;old.state.hero.eatKind='smoke';old.state.hero.eatT=35;D.restore(old);ok(D.state.hero.eatKind==='gulp'&&D.state.hero.eatT===18,'과거 저장');
  }return {hits,miss,contact,meals};
 });
 await page.evaluate(()=>{window.alleyInput=[];for(const k of ['pointerdown','pointerup','pointercancel','touchstart','touchend','mousedown','mouseup','error'])window.addEventListener(k,e=>alleyInput.push([k,e.target?.id,e.pointerType,e.clientX,e.clientY,e.message]),true);});
 for(const transport of ['keyboard','pointer','touch']){
  await page.evaluate(()=>{const D=__donghyunram,{s}=alleySetup(1,-1);const save=D.snapshot();save.state=s;D.restore(save);});
  await page.locator('#board').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const xy=await page.evaluate(()=>{const s=__donghyunram.state,adj=s.builds[s.hero.bld-1],col=adj.cols-1;
   const c=document.querySelector('#board'),r=c.getBoundingClientRect(),x=adj.x+(col+.5)*Engine.CELL_W,y=Engine.GROUND-2.5*Engine.FLOOR;
   const xx=r.left+x*r.width/c.width,yy=r.top+y*r.height/c.height;if(document.elementFromPoint(xx,yy)!==c)throw Error('게임판이 아닌 곳에 입력');return {x:xx,y:yy};});
  if(transport==='keyboard'){await page.keyboard.down('ArrowLeft');await page.keyboard.press('KeyX');}else if(transport==='touch')await page.touchscreen.tap(xy.x,xy.y);else await page.mouse.click(xy.x,xy.y);
  await page.waitForFunction(()=>{const s=__donghyunram.state,h=s.hero,b=s.builds[h.bld-1];return h.state==='climb'&&b?.cells[2][b.cols-1].hp===0&&h.wallContact?.b===b.i;},{},{timeout:5000}).catch(async e=>{throw Error(transport+' '+JSON.stringify([xy,errors,await page.evaluate(()=>alleyInput)])+': '+e.message);});
  if(transport==='keyboard')await page.keyboard.up('ArrowLeft');
 }assert.deepEqual(errors,[]);console.log(name,report,'슈슈 왼쪽 창: 키보드·마우스·합성 터치 통과');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
