// Compare the shipped game, not just source files, to both immutable release tags.
const pw=require('playwright'),path=require('node:path'),{execFileSync:git}=require('node:child_process');
const root=path.resolve(__dirname,'..'),browser=process.argv[2]||'chromium';
const reference=tag=>git('git',['show',tag+':src/sprites.js'],{cwd:root,encoding:'utf8'});
(async()=>{const b=await pw[browser].launch(browser==='chromium'?{channel:'chromium'}:{});try{
  const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.argv[3]||'file://'+root+'/index.html');await p.click('#run');
  const out=await p.evaluate(([old,current])=>{
    const ok=(v,m)=>{if(!v)throw Error(m);},E=Engine,D=__donghyunram,base=D.snapshot(),ref=code=>{let env={Engine:E};new Function('window',code)(env);return env.Sprites;};
    const render=(api,f,h)=>{let c=document.createElement('canvas');c.width=c.height=128;api.drawMonster(c.getContext('2d'),f,h,19,64,86);return c.toDataURL();};
    let counts={legacy:0,monster:0,hits:0,misses:0,saves:0};
    let refs={legacy:ref(old),monster:ref(current)};
    const opts=[...document.querySelector('#example').options].map(x=>x.value);
    for(let i=0;i<6;i++){const k=E.FORMS[2*i].key;ok(opts.slice(3*i,3*i+3).join('/')===[k,k+'-monster',k+'-legacy'].join('/'),k);}
    for(const f of E.FORMS){
      let save=structuredClone(base);save.state.formI=f.id-1;D.restore(save);ok(D.snapshot().state.formI===f.id-1&&E.form(D.state).name===f.name,'저장 '+f.name);counts.saves++;
      if(f.look==='origin'){
        for(const side of [-1,1])for(const dy of [-1,0,1])for(const hit of [true,false]){
          const s=E.newGame({form:f.id,city:8,seed:34}),h=s.hero,b=s.builds.find(b=>b.floors>=4);
          Object.assign(h,{state:'climb',side,x:b.x+(side>0?b.w:0),bld:b.i,dir:-side,y:E.GROUND-2*E.FLOOR+2,inv:0});
          for(const row of b.cells)for(const cell of row){cell.person=0;if(!hit){cell.hp=0;cell.cut=15;}}
          E.step(s,{punchPressed:true,up:dy<0,down:dy>0});for(let n=0;n<5;n++)E.step(s,{});
          ok(h.punchT===11&&!!h.wallContact===hit,f.name+' 접점 '+side+'/'+dy+'/'+hit);
          if(hit){ok(Math.abs(h.wallContact.x-h.x)===10,'창 내부 10px');counts.hits++;}else counts.misses++;
          ok(render(Sprites,f,h)!==render(Sprites,f,{...h,state:'ground',wallContact:null}),f.name+' 벽 자세');
        }
        if(f.key==='copter'){const h=save.state.hero;ok(render(Sprites,f,{...h,dir:-1})!==render(Sprites,f,{...h,dir:1}),'꼬리콥터 좌우');}
        continue;
      }
      for(const state of ['ground','roof','air','climb','ride','sit'])for(const side of [-1,1])for(const dir of [-1,1]){
        const h={...save.state.hero,state,side,dir,pdx:dir,walkT:6,climbT:10,inv:0};
        for(const extra of [{},{punchT:11},{punchT:6,pdy:-1},{punchT:4,pdy:1},{eatT:29,eatKind:'chew'},{eatT:17,eatKind:'gulp'},{eatT:42,eatKind:'toss'},{eatT:33,eatKind:'smoke'},{hurtT:8},{shrinkT:72}]){
          const v={...h,...extra};ok(render(Sprites,f,v)===render(refs[f.look],f,v),f.name+'/'+state+'/'+dir);counts[f.look]++;
        }
      }
    }return counts;
  },[reference('v0.28'),reference('v1.01')]);
  if(errors.length)throw Error(errors.join(';'));console.log(browser,out);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
