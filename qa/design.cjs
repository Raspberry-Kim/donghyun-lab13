// node qa/design.cjs [URL]: 12동네×6몬스터×5손상 단계, 순수 렌더와 반응형 검사.
const {chromium}=require('/home/user/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=path.join(__dirname,'tmp','design');fs.mkdirSync(out,{recursive:true});
const url=process.argv[2]||'file://'+path.join(__dirname,'..','index.html');
(async()=>{
  const b=await chromium.launch({channel:'chromium'});
  try{
    const p=await b.newPage({viewport:{width:1440,height:1000}});
    const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(url);await p.waitForFunction(()=>window.Render&&window.Engine);
    const report=await p.evaluate(()=>{
      const c=document.createElement('canvas');c.width=320;c.height=200;const g=c.getContext('2d');
      const scenes=[],fail=[];let checks=0;const covers=new Set();
      for(let city=1;city<=12;city++)for(let form=1;form<=6;form++)for(let stage=0;stage<5;stage++){
        const S=Engine.newGame({city,form,seed:42});S.msgT=0;S.time=180;
        S.fx=[{k:'chunk',n:0,sz:3,x:100,y:100,t:12,vx:0,vy:0}];
        if(stage>0)for(const b of S.builds){
          for(let r=0;r<b.floors;r++)for(let col=0;col<b.cols;col++){
            const cell=b.cells[r][col];cell.hp=[3,2,1,0][(r+col)%4];
            cell.cut=cell.hp===0?2|4|8:0;
          }
          if(stage===2){b.state='warn';b.warn=70;}
          if(stage===3){b.state='falling';b.drop=18;b.fall=12;}
          if(stage===4)b.state='gone';
        }
        const before=JSON.stringify(S);
        Render.render(g,S,180);const a=c.toDataURL();
        Render.render(g,S,180);const aa=c.toDataURL();
        if(a!==aa)fail.push(`${city}/${form}/${stage}: non-deterministic image`);
        if(before!==JSON.stringify(S))fail.push(`${city}/${form}/${stage}: mutated state`);
        if(form===5&&(stage===0||[1,10,12].includes(city)))scenes.push({city,stage,image:a});
        if(stage===0&&form===5)covers.add(a);
        checks++;
      }
      return {checks,fail,uniqueCities:covers.size,scenes};
    });
    assert.equal(report.checks,360);assert.deepEqual(report.fail,[]);assert.equal(report.uniqueCities,12);
    for(const s of report.scenes)fs.writeFileSync(path.join(out,`city-${s.city}-stage-${s.stage}.png`),Buffer.from(s.image.split(',')[1],'base64'));
    console.log('PASS 360장: 12동네×6몬스터×5손상 단계 · 상태 불변 · 반복 그림 동일');
    await p.click('#run');await p.waitForFunction(()=>__donghyunram.mode==='play');
    // Real controls: walk, jump, menu roundtrip, fullscreen. Full input suite lives in ui.cjs.
    await p.locator('#board').click();await p.keyboard.down('ArrowRight');await p.waitForTimeout(150);await p.keyboard.up('ArrowRight');
    await p.keyboard.press('z');await p.keyboard.press('Enter');
    assert(await p.locator('#menu').isVisible());await p.keyboard.press('z');
    for(const size of [{width:1440,height:1000},{width:375,height:812},{width:1440,height:650}]){
      await p.setViewportSize(size);await p.click('#full');
      await p.waitForTimeout(100);
      await p.screenshot({path:path.join(out,`fullscreen-${size.width}-${size.height}.png`)});
      assert(await p.locator('#exit-full').isVisible());
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await p.click('#exit-full');
    }
    await p.click('#theme');await p.screenshot({path:path.join(out,'dark-page.png')});await p.click('#theme');
    // 브라우저 Gamepad API 입력 경로. 물리 패드 연결 시험을 대신한다고 주장하지 않는다.
    await p.evaluate(()=>{
      window.__qaPad={id:'Design QA Standard Pad',connected:true,mapping:'standard',axes:[0,0],
        buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
      Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.__qaPad]});
    });
    await p.evaluate(()=>window.__qaPad.axes[0]=1);
    await p.waitForFunction(()=>__donghyunram.keys.right);
    await p.evaluate(()=>window.__qaPad.axes[0]=0);
    await p.waitForFunction(()=>!__donghyunram.keys.right);
    for(const [button,key] of [[1,'punch'],[0,'jump']]){
      await p.evaluate(i=>window.__qaPad.buttons[i]={pressed:true,value:1},button);
      await p.waitForFunction(k=>__donghyunram.keys[k],key);
      await p.evaluate(i=>window.__qaPad.buttons[i]={pressed:false,value:0},button);
      await p.waitForFunction(k=>!__donghyunram.keys[k],key);
    }
    await p.evaluate(()=>window.__qaPad.connected=false);
    console.log('PASS 표준 게임패드 API: 이동·주먹·점프·입력 해제(합성 입력)');
    assert.deepEqual(errors,[]);
    console.log('PASS 출전·키보드·메뉴·전체 화면·375px·짧은 화면·테마 · 브라우저 오류 0');
    fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({checks:report.checks,uniqueCities:report.uniqueCities,errors},null,2));
  }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
