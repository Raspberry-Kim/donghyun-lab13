// 소리 시험: node qa/sound.cjs (build 뒤 index.html을 파일로 연다)
// 1) 진짜 AudioContext: 키 입력 뒤 장치가 열리고(running) 모든 효과음을 틀어도 예외가 없다
// 2) OfflineAudioContext로 바꿔 끼워 실제 신호를 렌더링: 효과음마다 RMS가 0이 아니고(소리가 난다) 클리핑(|x|≥1)이 없다
const {chromium}=require('/home/user/node_modules/playwright'); const path=require('path'); const assert=require('assert');
const url='file://'+path.join(__dirname,'..','index.html');
const SOUNDS=['jump','thud','paw','swish','hurt','die','pop','lose','win','cheer','rumble','explode','fall','tramBell','clank','flap','boomHeli','boomTank','boomCar','boomTaxi','boomTram','bone','stomp','gun','cannon','rocket','zone'];
const GAP=2.0;
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const errs=[];
  // 1) 진짜 장치
  { const p=await b.newPage(); p.on('pageerror',e=>errs.push('page: '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
    await p.goto(url); await p.waitForTimeout(300); await p.focus('body'); await p.keyboard.press('Shift'); await p.waitForTimeout(200);
    const r=await p.evaluate((S)=>{ const D=window.__donghyunram; const out={on:D.snd.on,thrown:[]}; for(const k of S){ try{ D.snd.play(k,0); }catch(e){ out.thrown.push(k+': '+e.message); } } return out; },SOUNDS);
    assert.strictEqual(r.on,true,'효과음 켜짐'); assert.deepStrictEqual(r.thrown,[],'예외 없음');
    // 게임을 돌려 사건 소리도 흘려 본다(60초 분량)
    await p.selectOption('#example','shushu'); await p.click('#run'); await p.waitForTimeout(150); await p.evaluate(()=>{ const D=window.__donghyunram; D.step(3600); });
    console.log('ok 진짜 AudioContext: 켜짐 · 효과음 '+SOUNDS.length+'개 예외 없음 · 게임 3600프레임 진행'); await p.close(); }
  // 2) 오프라인 렌더링
  { const p=await b.newPage(); p.on('pageerror',e=>errs.push('page: '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
    await p.addInitScript(({n})=>{ const Off=window.OfflineAudioContext; window.AudioContext=function(){ const c=new Off(1,44100*n,44100); window.__ac=c; return c; }; window.webkitAudioContext=window.AudioContext; },{n:Math.ceil(SOUNDS.length*GAP+2)});
    await p.goto(url); await p.waitForTimeout(300); await p.focus('body'); await p.keyboard.press('Shift'); await p.waitForTimeout(100);
    const res=await p.evaluate(async ({S,GAP})=>{ const D=window.__donghyunram; const ac=window.__ac; if(!ac) return {err:'no ctx'}; S.forEach((k,i)=>D.snd.play(k,i*GAP)); const buf=await ac.startRendering(); const d=buf.getChannelData(0); const sr=buf.sampleRate; const out=[]; let clip=0, nan=0; for(let i=0;i<d.length;i++){ if(!(Math.abs(d[i])<=1)) { if(Number.isNaN(d[i])) nan++; else clip++; } }
      S.forEach((k,i)=>{ const a=Math.floor((i*GAP)*sr), e=Math.min(d.length,Math.floor(((i+1)*GAP)*sr)); let s=0, pk=0; for(let j=a;j<e;j++){ s+=d[j]*d[j]; pk=Math.max(pk,Math.abs(d[j])); } let last=a; for(let j=a;j<e;j++) if(Math.abs(d[j])>0.002) last=j; out.push({k,rms:Math.sqrt(s/(e-a)),peak:pk,len:(last-a)/sr}); });
      return {sr,out,clip,nan,state:ac.state}; },{S:SOUNDS,GAP});
    assert.ok(!res.err,res.err); assert.strictEqual(res.nan,0,'NaN 없음'); assert.strictEqual(res.clip,0,'클리핑 없음');
    for(const o of res.out){ assert.ok(o.peak>0.02,`${o.k} 소리가 난다(peak ${o.peak})`); assert.ok(o.len<GAP-0.05,`${o.k} 다음 칸으로 넘치지 않는다(${o.len}s)`); }
    console.log('ok 오프라인 렌더링 '+res.sr+'Hz: 효과음 '+res.out.length+'개 모두 신호 있음 · 클리핑 0 · NaN 0'); console.log(res.out.map(o=>`  ${o.k.padEnd(9)} rms ${o.rms.toFixed(3)} peak ${o.peak.toFixed(2)} ${o.len.toFixed(2)}s`).join('\n'));
    await p.close(); }
  await b.close(); if(errs.length){ console.log('콘솔 오류', errs); process.exit(1); } console.log('\n소리 시험 통과 · 콘솔 오류 0');
})().catch(e=>{ console.error(e); process.exit(1); });
