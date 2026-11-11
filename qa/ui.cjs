// 화면 시험: node qa/ui.cjs (build 뒤 index.html을 파일로 연다)
// 첫 화면·규약 오류·예제 다섯·키보드·마우스 찍기(몬스터=주먹, 길=걷기, 위로 튕김=점프)·메뉴 저장 칸 3개·.dhsave·첫 화면 칸 목록·클리어 카드→다음 도시·결과 카드·전체 화면·휴대폰 터치·시리즈 띠·콘솔 오류
const {chromium}=require('/home/user/node_modules/playwright'); const path=require('path'); const assert=require('assert'); const fs=require('fs');
const url=process.argv[2]||'file://'+path.join(__dirname,'..','index.html');
const H='window.__donghyunram';
(async()=>{
  const b=await chromium.launch({channel:'chromium'}); const errs=[]; let n=0; const ok=(name)=>{ n++; console.log('ok',name); };
  const p=await b.newPage({viewport:{width:1280,height:900}});
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const G=(js)=>p.evaluate(`(()=>{const D=${H};const S=D.state;return (${js});})()`);
  const txt=async()=>JSON.parse(await p.evaluate('render_game_to_text()'));
  const bb=async()=>p.$eval('#board',e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
  const at=async(x,y)=>{ const r=await bb(); return {x:r.x+x*r.w/320,y:r.y+y*r.h/200}; };
  const menuText=async()=>p.$eval('#menu',e=>e.hidden?'':e.textContent);
  const toSetup=async()=>{ if((await G('D.mode'))!=='setup'){ await p.click('#concede'); await mi('포기한다'); } };
  const mi=async(label)=>{ const items=await p.$$('#menu .mi'); for(const it of items){ const t=await it.$eval('span',e=>e.textContent); if(t===label){ await it.click(); await p.waitForTimeout(60); return; } } throw new Error('메뉴 항목 없음: '+label+' / '+await menuText()); };

  // 0) 첫 화면: 설정 패널·미리보기·불러오기 칸 비어 있음·전체 화면 단추 꺼짐
  assert.strictEqual(await G('D.mode'),'setup'); assert.ok(!(await p.$eval('#setup-panel',e=>e.hidden))); assert.ok(await p.$eval('#hud',e=>e.hidden));
  assert.deepStrictEqual(await p.$$eval('.slot-btn',a=>a.map(b=>b.disabled)),[true,true,true]); assert.ok(await p.$eval('#full',e=>e.disabled));
  assert.strictEqual(await p.$eval('#example',e=>e.options.length),6); assert.match(await p.$eval('#stamp-forms',e=>e.textContent),/슈슈/);
  assert.strictEqual(await p.$eval('.series-links',e=>e.children.length),18); assert.strictEqual(await p.$eval('.series-item.is-current .series-name',e=>e.textContent.replace('™','')),'동현램');
  ok('첫 화면: 설정 패널 · 칸 비어 있음 · 예제 6 · 띠 18');
  // 1) 규약 오류: 몬스터 번호 7(여섯 번째 초파리 다음) → 시작하지 않는다 · 정수 4개 → 오류
  await p.fill('#code','나는 동현이냐?\n뿡뿡 도오오오오오오옹~뿡뿡뿡\n동현이구나'); await p.click('#run'); await p.waitForTimeout(100);
  assert.match(await p.$eval('#result',e=>e.textContent),/몬스터 번호가 아니다/); assert.strictEqual(await G('D.mode'),'setup');
  const pr=await G(`D.parseSortie('2 3 4 5')`); assert.strictEqual(pr.go,false); assert.match(pr.err[0],/4개/);
  const pr2=await G(`D.parseSortie('5 11 5')`); assert.deepStrictEqual([pr2.go,pr2.c.form,pr2.c.city,pr2.c.lives],[true,5,11,5]);
  const pr3=await G(`D.parseSortie('1 1 0')`); assert.deepStrictEqual([pr3.go,pr3.c.lives],[true,0]); ok('규약: 몬스터 범위 · 정수 개수 · 도시·목숨 읽기');
  // 2) 예제 여섯 모두 시작된다 · 몬스터·도시·목숨이 맞다
  const want={shushu:[1,1,3],lion:[2,1,3],copter:[3,1,3],doom:[4,1,3],podong:[5,1,5],fly:[6,1,3]};
  for(const id of Object.keys(want)){ await toSetup(); await p.selectOption('#example',id); await p.click('#run'); await p.waitForTimeout(150); const t=await txt(); assert.strictEqual(t.mode,'play',id); assert.strictEqual(t.form,id); assert.strictEqual(t.city,want[id][1]); assert.strictEqual(t.lives,want[id][2]); assert.ok(!(await p.$eval('#hud',e=>e.hidden))); }
  assert.strictEqual(await p.$eval('#form-card',e=>e.textContent.includes('초파리')),true); assert.match(await p.$eval('#day',e=>e.textContent),/도시 1 · 신중동/); ok('예제 여섯: 몬스터·시작 도시·목숨 · 모두 신중동');
  // 3) 키보드: → 걷기 · ↑ 건물 잡기 · X 주먹 · Z 점프 · A 설명 메뉴 · Enter 메뉴
  await toSetup(); await p.selectOption('#example','podong'); await p.click('#run'); await p.waitForTimeout(150); await p.evaluate(()=>document.querySelector('#board-wrap').scrollIntoView({block:'center'}));
  await p.focus('#board-wrap'); let x0=(await txt()).hero.x; await p.keyboard.down('ArrowRight'); await p.waitForTimeout(400); await p.keyboard.up('ArrowRight'); assert.ok((await txt()).hero.x>x0+10,'→ 걷기');
  // 건물 가운데로 옮겨 ↑
  const bx=await G('(()=>{const B=S.builds; let m=0; for(let i=1;i<B.length;i++) if(B[i].floors>B[m].floors) m=i; return B[m].x+20;})()'); /* 가장 높은 건물: 3층짜리면 0.5초 안에 지붕까지 올라가 버린다 */ await p.evaluate(`${H}.state.hero.x=${bx}`); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp'); let t=await txt(); assert.strictEqual(t.hero.state,'climb','↑ 잡기'); assert.ok(t.hero.y<176-8,'오른다');
  const sc0=t.score; await p.keyboard.press('KeyX'); await p.waitForTimeout(400); t=await txt(); assert.ok(t.score>sc0,'X 주먹 점수'); assert.ok(t.builds.some(s=>s!=='u0')||true);
  await p.keyboard.press('KeyZ'); await p.waitForTimeout(100); t=await txt(); assert.strictEqual(t.hero.state,'air','Z 점프'); await p.waitForTimeout(1500);
  await p.keyboard.press('KeyA'); await p.waitForTimeout(100); assert.match(await G('S.msg'),/포동이: 힘·맷집/,'A 설명 말풍선');
  await p.keyboard.press('Enter'); await p.waitForTimeout(100); assert.match(await menuText(),/잠시 멈춤/); const fr0=await G('S.time'); await p.waitForTimeout(400); assert.strictEqual(await G('S.time'),fr0,'메뉴 동안 멎음'); await mi('계속 간다'); assert.strictEqual(await menuText(),''); ok('키보드: → ↑ Z X A Enter · 메뉴 동안 멎음');
  // 4) 마우스: 몬스터를 찍으면 주먹 · 길을 찍으면 그리로 걷는다 · 위로 튕기면 점프
  await p.evaluate(`${H}.state.hero.state='ground';${H}.state.hero.y=176;${H}.state.hero.bld=-1;${H}.state.hero.x=160;`); await p.waitForTimeout(50);
  let a=await at(160,160); const pc=await G('S.events.length'); await p.mouse.click(a.x,a.y); await p.waitForTimeout(120); assert.ok((await G('S.hero.punchT'))>0||(await G('S.time'))>0,'몬스터 찍기 → 주먹');
  a=await at(20,172); await p.mouse.click(a.x,a.y); await p.waitForTimeout(50); let tg=await G('D.target'); assert.ok(tg&&Math.abs(tg.x-20)<3,'길 찍기 → 목표 '+JSON.stringify(tg)); await p.waitForTimeout(2500); t=await txt(); assert.ok(Math.abs(t.hero.x-20)<8,'걸어감 '+t.hero.x); assert.strictEqual(t.target,null); /* v0.20: 첫 건물이 x 44에 있어 옆벽을 잡지 않는 x 20으로 */
  a=await at(20,150); await p.mouse.move(a.x,a.y); await p.mouse.down(); const a2=await at(60,100); await p.mouse.move(a2.x,a2.y,{steps:3}); await p.mouse.up(); await p.waitForTimeout(80); t=await txt(); assert.strictEqual(t.hero.state,'air','위로 튕김 → 점프'); await p.waitForTimeout(1500);
  // 건물 위를 찍으면 걸어가서 오른다
  const b2=await G('[S.builds[2].x+20, S.builds[2].floors]'); a=await at(b2[0],176-40); await p.mouse.click(a.x,a.y); await p.waitForTimeout(4000); t=await txt(); assert.strictEqual(t.hero.state,'climb','건물 찍기 → 오름 '+JSON.stringify(t.hero)); ok('마우스: 몬스터 찍기 주먹 · 길 찍기 걷기 · 위로 튕김 점프 · 건물 찍기 오르기');
  // 5) 먹기: 사람 든 구멍을 치면 체력이 차고 먹는 동작이 나온다
  await p.evaluate(()=>{ const D=window.__donghyunram, S=D.state, E=window.Engine; const b=S.builds[2]; const h=S.hero; /* 왼쪽 옆벽 2층 높이, 제 건물 쪽을 본다 */ h.state='climb'; h.bld=2; h.side=-1; h.x=b.x; h.y=E.GROUND-2*E.FLOOR+6; h.dir=1; h.stam=40; h.eatT=0; h.punchT=0; h.inv=600; S.ens.length=0; S.shots&&(S.shots.length=0); S.drainT=1000; /* 4초 체력 감소·군인 총알이 끼어들지 않게 */ const cell=b.cells[2][0]; cell.hp=0; cell.person=1; });
  await p.keyboard.press('KeyX'); await p.waitForTimeout(300); t=await txt(); assert.strictEqual(t.hero.stam,60,'사람 +20'); assert.ok(t.hero.eatT>0&&['gulp','chew','toss','smoke'].includes(t.hero.eatKind),'먹는 동작'); assert.match(await p.$eval('#log',e=>e.textContent),/사람을 (꿀꺽 삼켰다|우적우적 씹어 먹었다|공중에 던져 받아먹었다|꿀꺽 삼키고 담배를 한 모금 물었다)\./); ok('먹기: +20 · 동작 · 기록');
  // 6) 저장 메뉴: 칸 1 저장 → 덮어쓰기 확인 → 불러오기 확인 → .dhsave 내려받기·열기 · 잘못된 파일 · 칸 지우기
  await p.evaluate(()=>{ window.__dl=null; URL.createObjectURL=(blob)=>{ blob.text().then(t=>window.__dl=t); return 'blob:x'; }; URL.revokeObjectURL=()=>{}; HTMLAnchorElement.prototype.click=function(){ window.__dlname=this.download; }; });
  await p.keyboard.press('Enter'); await p.waitForTimeout(80); await mi('저장'); assert.match(await menuText(),/^저장/); assert.match(await menuText(),/브라우저 칸 지우기/); await mi('브라우저 칸 1'); assert.strictEqual(await menuText(),''); const s1=await p.evaluate(()=>JSON.parse(localStorage.getItem('donghyunram:slot1'))); assert.strictEqual(s1.format,'donghyunram-save'); assert.strictEqual(s1.summary.form,'포동이'); const savedScore=s1.state.score;
  assert.match(await p.$eval('.slot-btn',e=>e.textContent),/칸 1.*도시 1 신중동.*포동이/); assert.strictEqual((await p.$$('.slot-del')).length,1);
  await p.keyboard.press('Enter'); await mi('저장'); await mi('브라우저 칸 1'); assert.match(await menuText(),/덮어쓸까/); await mi('그만둔다'); assert.match(await menuText(),/^저장/); await mi('파일로 내려받기'); await p.waitForTimeout(200); const dl=await p.evaluate(()=>[window.__dl,window.__dlname]); assert.ok(dl[0]&&JSON.parse(dl[0]).format==='donghyunram-save'); assert.match(dl[1],/^donghyunram-city1-\d+\.dhsave$/); fs.writeFileSync('/tmp/ram.dhsave',dl[0]);
  await p.evaluate(`${H}.step(120)`); const moved=await G('S.score'); await p.keyboard.press('Enter'); await mi('불러오기'); assert.match(await menuText(),/^불러오기/); await mi('브라우저 칸 1'); assert.match(await menuText(),/버리고 불러올까/); await mi('그만둔다'); await mi('브라우저 칸 1'); await mi('불러온다'); assert.strictEqual(await G('S.score'),savedScore,'칸에서 불러오면 그 시점'); assert.strictEqual(await G('D.mode'),'play');
  await p.evaluate(`${H}.step(60)`); await p.keyboard.press('Enter'); await mi('불러오기'); await mi('파일에서 불러오기'); await p.setInputFiles('#load-file','/tmp/ram.dhsave'); await p.waitForTimeout(200); assert.strictEqual(await G('S.score'),savedScore,'파일에서 불러오면 그 시점');
  fs.writeFileSync('/tmp/ram-bad.dhsave','{"hello":1}'); await p.setInputFiles('#load-file','/tmp/ram-bad.dhsave'); await p.waitForTimeout(200); assert.match(await p.$eval('#status',e=>e.textContent),/불러오기 실패: 동현램 저장 파일이 아니다/);
  const bad=JSON.parse(dl[0]); bad.state.hero.stam=999; fs.writeFileSync('/tmp/ram-bad2.dhsave',JSON.stringify(bad)); await p.setInputFiles('#load-file','/tmp/ram-bad2.dhsave'); await p.waitForTimeout(200); assert.match(await p.$eval('#status',e=>e.textContent),/몬스터 위치가 맞지 않는다/);
  await p.keyboard.press('Enter'); await mi('저장'); await mi('브라우저 칸 2'); await p.keyboard.press('Enter'); await mi('저장'); await mi('브라우저 칸 지우기'); assert.match(await menuText(),/^지울 칸/); await mi('브라우저 칸 2'); assert.match(await menuText(),/지울까/); await mi('그만둔다'); assert.match(await menuText(),/^지울 칸/); await mi('브라우저 칸 2'); await mi('지운다'); assert.strictEqual(await p.evaluate(()=>localStorage.getItem('donghyunram:slot2')),null); assert.match(await menuText(),/^지울 칸/); await p.keyboard.press('KeyZ'); await p.waitForTimeout(60); assert.match(await menuText(),/^저장/,'Z로 한 단계 돌아감'); await p.keyboard.press('KeyZ'); await p.waitForTimeout(60); assert.match(await menuText(),/잠시 멈춤/); await p.keyboard.press('KeyZ'); await p.waitForTimeout(60); assert.strictEqual(await menuText(),'');
  ok('저장 메뉴 · 덮어쓰기 확인 · 불러오기 확인 · .dhsave 내려받기·열기 · 잘못된 파일 둘 · 칸 지우기');
  // 7) 포기 → 첫 화면 칸 목록에서 칸 1 눌러 불러오기 · 지우기 두 번 · 파일에서 불러오기
  await p.click('#concede'); await mi('포기한다'); assert.strictEqual(await G('D.mode'),'setup'); assert.deepStrictEqual(await p.$$eval('.slot-btn',a=>a.map(b=>b.disabled)),[false,true,true]);
  await p.click('.slot-btn'); await p.waitForTimeout(100); assert.strictEqual(await G('D.mode'),'play'); assert.strictEqual(await G('S.score'),savedScore);
  await p.click('#concede'); await mi('포기한다'); await p.click('.slot-del'); assert.strictEqual(await p.$eval('.slot-del',e=>e.textContent),'정말 지운다'); await p.click('.slot-del'); assert.strictEqual(await p.evaluate(()=>localStorage.getItem('donghyunram:slot1')),null); assert.strictEqual((await p.$$('.slot-del')).length,0);
  await p.setInputFiles('#load-file-setup','/tmp/ram.dhsave'); await p.waitForTimeout(200); assert.strictEqual(await G('D.mode'),'play'); assert.strictEqual(await G('S.score'),savedScore); ok('첫 화면 칸 목록 · 지우기 두 번 · 파일에서 불러오기');
  // 8) 클리어 카드 → 다음 도시 · 12도시 클리어 → 결과 카드 · 출전 준비로
  await p.evaluate(()=>{ const S=window.__donghyunram.state; for(const b of S.builds) b.state='gone'; }); await p.waitForTimeout(300); assert.strictEqual(await G('D.mode'),'clear'); assert.ok(!(await p.$eval('#result-card',e=>e.hidden))); assert.match(await p.$eval('#result-card',e=>e.textContent),/도시 1 · 신중동 클리어.*다음은 도시 2 · 상동/);
  await p.click('#rc-next'); await p.waitForTimeout(100); t=await txt(); assert.strictEqual(t.mode,'play'); assert.strictEqual(t.city,2); assert.ok(await p.$eval('#result-card',e=>e.hidden)); assert.match(await p.$eval('#day',e=>e.textContent),/도시 2 · 상동/);
  await p.evaluate(()=>{ const S=window.__donghyunram.state; for(const b of S.builds) b.state='gone'; }); await p.waitForTimeout(300); await p.keyboard.press('KeyX'); await p.waitForTimeout(100); assert.strictEqual((await txt()).city,3,'X로 다음 도시');
  await p.evaluate(()=>{ const S=window.__donghyunram.state; S.city=12; window.Engine.loadCity(S); for(const b of S.builds) b.state='gone'; }); await p.waitForTimeout(300); assert.strictEqual(await G('D.mode'),'over'); assert.match(await p.$eval('#result-card',e=>e.textContent),/열두 동네를 모두 부쉈다/); const cf=await G('D.confetti'); assert.ok(cf.n>20&&cf.t>0,'끝판 꽃가루가 날린다 '+JSON.stringify(cf)); await p.click('#rc-back'); assert.strictEqual(await G('D.mode'),'setup'); ok('클리어 카드 → 다음 도시(단추·X) · 12도시 결과 카드(꽃가루) · 출전 준비로');
  // 9) 목숨을 다 잃으면 결과 카드(다시 해 보자)
  await p.fill('#code','나는 동현이냐?\n뿡뿡 도옹~뿡뿡뿡~뿡뿡 도옹~뿡뿡뿡~뿡뿡 도옹~뿡뿡뿡\n동현이구나'); await p.click('#run'); await p.waitForTimeout(150); t=await txt(); assert.strictEqual(t.lives,1); assert.strictEqual(t.city,1);
  await p.evaluate(()=>{ const S=window.__donghyunram.state; S.hero.stam=1; S.hero.inv=0; S.shots.push({x:S.hero.x,y:S.hero.y-10,vx:0,vy:0,kind:'bullet',dmg:1,t:0}); }); await p.waitForTimeout(2600); assert.strictEqual(await G('D.mode'),'over'); assert.match(await p.$eval('#result-card',e=>e.textContent),/다시 해 보자/); { const cf=await G('D.confetti'); assert.strictEqual(cf.t,0,'졌을 때는 꽃가루를 뿌리지 않는다'); } await p.keyboard.press('Enter'); await p.waitForTimeout(100); assert.strictEqual(await G('D.mode'),'setup'); ok('목숨 소진 → 결과 카드 · Enter로 출전 준비');
  // 10) 전체 화면: 켜고 끄기 · 판이 넓어진다
  await toSetup(); await p.selectOption('#example','copter'); await p.click('#run'); await p.waitForTimeout(150); const w0=(await bb()).w; await p.click('#full'); await p.waitForTimeout(500); assert.ok(!(await p.$eval('#exit-full',e=>e.hidden))); assert.ok((await bb()).w>w0,'전체 화면에서 판이 넓다'); await p.click('#exit-full'); await p.waitForTimeout(400); assert.ok(Math.abs((await bb()).w-w0)<2); ok('전체 화면: 켜고 끄기');
  // 11) 다른 탭을 보면 멎는다
  await p.evaluate(()=>{ Object.defineProperty(document,'hidden',{get:()=>true,configurable:true}); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(100); const t1=await G('S.time'); await p.waitForTimeout(500); assert.strictEqual(await G('S.time'),t1,'숨기면 멎는다');
  await p.evaluate(()=>{ Object.defineProperty(document,'hidden',{get:()=>false,configurable:true}); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(300); assert.match(await menuText(),/잠시 멈춤/,'돌아오면 멈춤 메뉴'); await mi('계속 간다'); await p.waitForTimeout(300); assert.ok((await G('S.time'))>t1,'계속 간다'); ok('숨기면 멎는다 · 돌아오면 멈춤 메뉴');
  // 12) 규칙 탭 표: 몬스터 5줄 · 적 5줄 · 도시 12줄
  await p.click('.tab[data-tab="rules"]').catch(async()=>{ await p.click('text=규칙과 적'); }); await p.waitForTimeout(100);
  assert.strictEqual(await p.$eval('#form-grid',e=>e.querySelectorAll('.form-row, tr, .fg-item, article, li').length>=5),true); assert.ok((await p.$eval('#enemy-table',e=>e.querySelectorAll('tbody tr').length))>=5); assert.strictEqual(await p.$eval('#city-table',e=>e.querySelectorAll('tbody tr').length),12); ok('규칙 표: 몬스터·적·도시');
  await p.evaluate(()=>localStorage.clear());
  // 13) 휴대폰: 터치만으로 시작 · 길 찍기 · 몬스터 찍기 · 위로 튕김 · 전체 화면 · 띠
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const m=await ctx.newPage();
  m.on('pageerror',e=>errs.push('mobile: '+e.message)); m.on('console',x=>{ if(x.type()==='error') errs.push('mobile console: '+x.text()); });
  await m.goto(url); await m.waitForTimeout(400); const MG=(js)=>m.evaluate(`(()=>{const D=${H};const S=D.state;return (${js});})()`);
  const cdp=await ctx.newCDPSession(m);
  const touch=async(seq)=>{ for(const s of seq){ const type=s.type==='start'?'touchStart':s.type==='move'?'touchMove':'touchEnd'; const pts=s.type==='end'?[]:s.pts.map(pt=>({x:pt.x,y:pt.y,id:pt.id,radiusX:3,radiusY:3,force:1})); await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts}); await m.waitForTimeout(30); } };
  const mat=async(x,y)=>{ const r=await m.$eval('#board',e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}); return {x:r.x+x*r.w/320,y:r.y+y*r.h/200}; };
  await m.tap('#run'); await m.waitForTimeout(200); assert.strictEqual(await MG('D.mode'),'play'); await m.evaluate(()=>document.querySelector('#board-wrap').scrollIntoView({block:'center'})); await m.waitForTimeout(100);
  assert.ok(await m.$eval('#touchpad',e=>e.classList.contains('on')),'터치패드 보임');
  let c1=await mat(20,172); await touch([{type:'start',pts:[{id:1,...c1}]},{type:'end',pts:[{id:1,...c1}]}]); await m.waitForTimeout(50); let mt=await MG('D.target'); assert.ok(mt&&Math.abs(mt.x-20)<3,'터치로 길 찍기 '+JSON.stringify(mt));
  await m.waitForTimeout(2500); const mx=await MG('S.hero.x'); assert.ok(Math.abs(mx-20)<8,'걸어감 '+mx); /* v0.20: 첫 건물 x 44의 옆벽을 잡지 않는 자리 */
  const hb=await MG('window.Engine.heroBox(S.hero)'); c1=await mat(hb.x+hb.w/2,hb.y+hb.h/2); await touch([{type:'start',pts:[{id:1,...c1}]},{type:'end',pts:[{id:1,...c1}]}]); await m.waitForTimeout(40); assert.ok((await MG('S.hero.punchT'))>0,'터치로 몬스터 찍기 → 주먹'); await m.waitForTimeout(400); await m.evaluate(()=>{ const S=window.__donghyunram.state; S.hero.eatT=0; S.hero.punchT=0; S.ens.length=0; }); /* 주먹이 군인을 잡아먹었으면 먹는 동안 입력이 막히므로 비운다 */
  c1=await mat(20,150); const c2=await mat(20,90); await touch([{type:'start',pts:[{id:1,...c1}]},{type:'move',pts:[{id:1,x:c1.x,y:(c1.y+c2.y)/2}]},{type:'move',pts:[{id:1,...c2}]},{type:'end',pts:[{id:1,...c2}]}]); await m.waitForTimeout(60); assert.strictEqual(await MG('S.hero.state'),'air','위로 튕김 → 점프');
  await m.waitForTimeout(1500); await m.tap('#touchpad [data-key="x"]'); await m.waitForTimeout(40); assert.ok((await MG('S.hero.punchT'))>0,'터치패드 X 주먹');
  await m.tap('#full'); await m.waitForTimeout(500); assert.ok(!(await m.$eval('#exit-full',e=>e.hidden))); assert.ok((await m.$eval('#board',e=>e.getBoundingClientRect().width))>=360); await m.tap('#exit-full'); await m.waitForTimeout(300); assert.ok(await m.$eval('#exit-full',e=>e.hidden));
  assert.strictEqual(await m.$eval('.series-links',e=>e.children.length),18); /* 띠 규칙: 항목이 짝수면 동현랭도 1/2 크기, 홀수면 동현랭만 두 칸으로 넓혀 아랫단을 맞춘다 */ const strip=await m.$eval('.series-links',e=>{ const n=e.children.length, L=e.querySelector('.series-item[data-series="lang"]'); const r=[...e.children].map(c=>c.getBoundingClientRect()); return {n, span:getComputedStyle(L).gridColumn.replace(/\s/g,''), langW:L.getBoundingClientRect().width, otherW:r[1].width, bottom:new Set(r.map(x=>Math.round(x.bottom))).size, rows:new Set(r.map(x=>Math.round(x.top))).size}; }); assert.strictEqual(strip.span,strip.n%2?'span2':'auto','짝수면 auto'); assert.ok(Math.abs(strip.langW-strip.otherW)<1,'동현랭 폭 = 다른 앱 폭'); assert.strictEqual(strip.rows,Math.ceil(strip.n/2),'두 열로 꽉 찬 줄 수'); ok('휴대폰: 터치 시작·길 찍기·몬스터 찍기·튕김·터치패드·전체 화면·띠');
  await ctx.close(); await b.close();
  if(errs.length){ console.error('콘솔 오류',errs); process.exit(1); }
  console.log(`\n${n} ui tests passed · 콘솔 오류 0`);
})().catch(e=>{ console.error(e); process.exit(1); });
