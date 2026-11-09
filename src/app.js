/* 동현램 앱: 동현랭 편집기 → 출전 규약(몬스터·시작 도시·목숨) → 키보드·게임패드·손가락(마우스) 조작. 동현전·동현워·동현크와 같은 키 배치와 저장 방식. */
(function(){
const HINT0='<span><kbd>X</kbd>주먹</span><span><kbd>Z</kbd>점프</span><span><kbd>A</kbd>설명</span><span><kbd>↵</kbd>메뉴</span>';
const $=s=>document.querySelector(s), E=window.Engine, R=window.Render, SP=window.Sprites, {FORMS,CITIES,EN}=E;
const canvas=$('#board'), g=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------- 화면 전환·소리·탭 ---------- */
$('#theme').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark));};
const SND=DHSFX('donghyunram:sound');
function sndUI(){ const b=$('#sound'); b.setAttribute('aria-pressed',String(SND.on)); b.classList.toggle('muted',!SND.on); b.title=SND.on?'효과음 끄기 (M)':'효과음 켜기 (M)'; }
$('#sound').onclick=()=>{ SND.set(!SND.on); sndUI(); }; sndUI();
document.addEventListener('keydown',e=>{ if(e.code!=='KeyM'||e.metaKey||e.ctrlKey||e.altKey) return; const el=document.activeElement; if(el&&(el.tagName==='TEXTAREA'||el.tagName==='INPUT'||el.tagName==='SELECT')) return; SND.set(!SND.on); sndUI(); });
let tab='play';
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
  tab=b.dataset.tab;
  document.querySelectorAll('.tabs button').forEach(x=>{const on=x.dataset.tab===tab;x.classList.toggle('active',on);on?x.setAttribute('aria-current','page'):x.removeAttribute('aria-current');});
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!=='tab-'+tab);
  if(tab==='play') fit();
});
$('.brand').onclick=e=>{e.preventDefault();document.querySelector('[data-tab=play]').click();scrollTo({top:0,behavior:'smooth'});};

/* ---------- 규칙 탭 표 ---------- */
const pct=v=>Math.round(v*100)+'%';
$('#form-grid').innerHTML=FORMS.map(f=>`<article><h4>${f.id} · ${f.name}<small>${f.from}</small></h4><p>${f.desc}</p><p class="stat">힘 ${pct(f.atk)} · 맷집 ${pct(f.def)} · 걸음 ${pct(f.speed)}${f.reach>1?' · 손 길이 2배':''}${f.hang>1?' · 낙하 1/3':''}</p></article>`).join('');
$('#enemy-table').innerHTML='<thead><tr><th>적</th><th>먹기</th><th>체력 회복</th><th>공격</th><th>점수</th><th>습성</th></tr></thead><tbody>'+[
 ['soldier','길에서 주먹','총알 1','몬스터를 따라다니며 총을 쏜다. 길에서 한 대 치면 잡아먹는다. 무너지는 건물 아래 있으면 깔린다'],
 ['cop','길에서 주먹 두 번','없음','길을 지나간다. 두 번 치면 멈추고 잡아먹는다(슈슈·둠가이는 한 번)'],
 ['taxi','길에서 주먹','없음','길을 지나간다. 한 번 치면 잡아먹는다'],
 ['tank','못 먹는다 · 세 번 쳐서 부순다','포탄 3','느리게 다가와 포탄을 쏜다. 빗나간 포탄은 창을 깬다. 슈슈·둠가이는 두 번에 부순다'],
 ['heli','못 먹는다 · 건물에 매달려 손이 닿으면 떨어뜨린다','로켓 2','건물 높이로 날아와 로켓을 쏜다. 라이언은 더 멀리서도 친다']
].map(([k,eat,atk,note])=>{ const d=EN[k]; return `<tr><td>${d.name}</td><td>${eat}</td><td>${d.stam?'+'+d.stam:'—'}</td><td>${atk}</td><td>${d.score}</td><td>${note}</td></tr>`; }).join('')+'</tbody>';
$('#city-table').innerHTML='<thead><tr><th>도시</th><th>건물</th><th>층</th><th>군인</th><th>헬기</th><th>전차</th></tr></thead><tbody>'+CITIES.map((c,i)=>`<tr><td>${i+1} ${c.name}</td><td>${c.nB}</td><td>${c.hMin}~${c.hMax}</td><td>${c.soldier}</td><td>${c.heli||'—'}</td><td>${c.tank||'—'}</td></tr>`).join('')+'</tbody>';

/* ---------- 동현랭 편집기(동현랭 시리즈와 같은 모양) ---------- */
for(const ex of examples){const o=document.createElement('option');o.value=ex.id;o.textContent=ex.title;$('#example').append(o);}
const DH_TOKEN=/(ㅋㅋ.*$)|(나는 동현이냐\?|동현이구나)|(오겡끼데스까)|(신중동역|신중동|뭉치)|(뿡뿡뿡|뿡뿡|포동이)|(꽥꽥)|(동+현아)|(동+현)|(도오*옹)|(ㅠ+)|(뚱띠|또치)/g;
const DH_CLS=[null,'t-cmt','t-frame','t-halt','t-ctl','t-out','t-in','t-assign','t-var','t-num','t-minus','t-op'];
function dhLine(line){let html='',last=0;line.replace(DH_TOKEN,(m,...gr)=>{const idx=gr[gr.length-2];html+=esc(line.slice(last,idx));const k=gr.slice(0,11).findIndex(x=>x!==undefined)+1;html+=`<span class="${DH_CLS[k]}">${esc(m)}</span>`;last=idx+m.length;return m;});return html+esc(line.slice(last));}
const code=$('#code'), area=document.createElement('div'), hl=document.createElement('div');
area.className='code-area'; hl.id='hl'; hl.setAttribute('aria-hidden','true'); code.parentNode.insertBefore(area,code); area.append(hl,code);
function hlSync(){hl.scrollTop=code.scrollTop;hl.scrollLeft=code.scrollLeft;}
function hlMetrics(){const cs=getComputedStyle(code);for(const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','lineHeight','tabSize','letterSpacing'])hl.style[p]=cs[p];}
function highlight(){hlMetrics();hl.innerHTML=code.value.split('\n').map(l=>`<span class="ln">${dhLine(l)||' '}</span>`).join('')+'<span class="ln"> </span>';hlSync();}
code.addEventListener('scroll',()=>{hlSync();$('#lines').scrollTop=code.scrollTop;});addEventListener('resize',()=>{highlight();fit();});
function indent(){
  const text=code.value,lines=text.split('\n'),lead=l=>l.length-l.replace(/^[ \t]+/,'').length;
  const next=lines.map(l=>{const b=l.slice(lead(l));if(!b)return '';if(b.startsWith('ㅋㅋ'))return '   '+b;const s=b.split('~')[0].replace(/ㅋㅋ.*$/,'').trim();return (s==='나는 동현이냐?'||s==='동현이구나'?'':'  ')+b;});
  const {selectionStart:a,selectionEnd:b,selectionDirection:dir,scrollTop:y,scrollLeft:x}=code;
  const moved=p=>{let o=0,n=0;for(let i=0;i<lines.length;i++){const L=lines[i].length;if(p<=o+L){const c=p-o,ol=lead(lines[i]),nl=lead(next[i]);return n+Math.min(next[i].length,c<ol?nl:c-ol+nl);}o+=L+1;n+=next[i].length+1;}return n;};
  const value=next.join('\n'),na=moved(a),nb=moved(b);if(value===text&&na===a&&nb===b)return;if(value!==text)code.value=value;code.setSelectionRange(na,nb,dir);code.scrollTop=y;code.scrollLeft=x;
}
function codeChanged(e){if(!e?.isComposing)indent();const n=code.value.split('\n').length;$('#line-count').textContent=n+'줄';$('#lines').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');highlight();autoPreview();}
code.addEventListener('compositionend',()=>codeChanged());
function codeLead(){const a=code.selectionStart,v=code.value,ls=v.lastIndexOf('\n',a-1)+1,le=v.indexOf('\n',ls);return {a,ls,lead:/^[ \t]*/.exec(v.slice(ls,le<0?v.length:le))[0].length};}
document.addEventListener('selectionchange',()=>{if(document.activeElement!==code||code.selectionStart!==code.selectionEnd)return;const {a,ls,lead}=codeLead();if(a-ls<lead)code.setSelectionRange(ls+lead,ls+lead);});
code.addEventListener('beforeinput',e=>{const {a,ls,lead}=codeLead();if(a!==code.selectionEnd)return;if(e.inputType==='deleteContentBackward'&&ls>0&&a>ls&&a-ls<=lead){e.preventDefault();code.setRangeText('',ls-1,a,'end');codeChanged();}});
code.oninput=codeChanged;
code.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();sortie();}});
function selectExample(){const ex=examples.find(e=>e.id===$('#example').value);code.value=ex.code;$('#example-note').textContent=ex.note;codeChanged();}
$('#example').onchange=selectExample;
$('#save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code.value+'\n'],{type:'text/plain;charset=utf-8'}));a.download='sortie.dh';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('#open').onchange=async e=>{const f=e.target.files[0];if(!f)return;code.value=(await f.text()).replace(/\r/g,'').replace(/\n$/,'');codeChanged();e.target.value='';};
$('#run').onclick=()=>sortie();

/* ---------- 출전 규약: 첫 정수 몬스터(필수) · 둘째 시작 도시(선택) · 셋째 목숨(선택, 0 무한) ---------- */
const DEFAULT={form:1,city:1,lives:3};
let cfg={...DEFAULT};
function parseSortie(out){
  const tok=out.split(/\s+/).filter(Boolean).map(Number), c={...DEFAULT}, err=[];
  if(tok.length===0){ return {c,go:false,err:[]}; }
  const [f,ci,li]=tok;
  if(!(Number.isInteger(f)&&f>=1&&f<=FORMS.length)) err.push(`첫 정수 ${f}은(는) 몬스터 번호가 아니다. 1 포동이 · 2 슈슈 · 3 라이언 · 4 꼬리콥터 · 5 둠가이 중 하나를 출력하자.`);
  else c.form=f;
  if(!err.length&&tok.length>=2){ if(!(Number.isInteger(ci)&&ci>=1&&ci<=CITIES.length)) err.push(`둘째 정수 ${ci}은(는) 시작 도시가 아니다. 1~${CITIES.length}만 된다.`); else c.city=ci; }
  if(!err.length&&tok.length>=3){ if(!(Number.isInteger(li)&&li>=0&&li<=9)) err.push(`셋째 정수 ${li}은(는) 목숨 수가 아니다. 1~9 또는 0(무한)만 된다.`); else c.lives=li; }
  if(!err.length&&tok.length>3) err.push(`정수가 ${tok.length}개 나왔다. 몬스터 · 시작 도시 · 목숨 세 개까지만 읽는다.`);
  return {c,go:!err.length,err};
}
const formOf=c=>FORMS[c.form-1];
function sortieCard(c){
  const f=formOf(c);
  $('#sortie-card').innerHTML=[['몬스터',`${f.name} · ${f.from}`],['시작 도시',`${c.city} · ${CITIES[c.city-1].name} → ${CITIES.length} 마라도까지`],['목숨',c.lives===0?'무한':String(c.lives)],['조작','←→↑↓ 이동·오르기 · X 주먹 · Z 점프 · 화면을 직접 찍어도 된다']].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');
  $('#stamp-forms').innerHTML=`${f.name} <span>몬스터</span>`;
}
function result(text,kind){ const r=$('#result'); r.textContent=text; r.dataset.kind=kind||''; }
function status(t,kind){ const s=$('#status'); s.textContent=t; s.dataset.kind=kind||''; }
let previewT=0;
function autoPreview(){ clearTimeout(previewT); previewT=setTimeout(()=>{ if(S) return; try{ const r=Donghyun.run(code.value,{maxSteps:300000}); const p=parseSortie(r.output); if(!p.err.length&&p.go){ cfg=p.c; sortieCard(cfg); preview(cfg); } }catch(e){} },250); }
function sortie(){
  if(S) return;
  let out;
  try{ const r=Donghyun.run(code.value,{maxSteps:300000}); out=r.output; }
  catch(e){ result(`동현랭 오류${e.line?` (${e.line}줄)`:''}: ${e.message}`,'error'); status('동현랭 오류','error'); return; }
  const p=parseSortie(out);
  if(p.err.length){ result('출전 규약 오류: '+p.err[0],'error'); status('출전 규약 오류','error'); return; }
  if(!p.go){ result('정수가 하나도 출력되지 않았다. 첫 정수로 몬스터 번호(1~5)를 출력해야 나선다.','error'); status('출전 규약 오류','error'); return; }
  cfg=p.c; sortieCard(cfg); preview(cfg);
  startGame(cfg);
}

/* ---------- 상태·화면 ---------- */
let S=null, previewS=null, mode='setup', paused=false, menu=null, T=0;
const keys={left:false,right:false,up:false,down:false,jump:false,jumpPressed:false,punch:false,punchPressed:false};
let target=null; /* 손가락·마우스로 찍은 자리 */
function preview(c){ previewS=E.newGame({form:c.form,city:c.city,lives:c.lives===0?Infinity:c.lives,seed:1}); previewS.hero.x=E.W/2; $('#day').textContent=`도시 ${c.city} · ${CITIES[c.city-1].name}`; $('#tile-info').textContent=`${formOf(c).name}가 ${CITIES[c.city-1].name}에 나타난다. 건물 ${CITIES[c.city-1].nB}채를 모두 무너뜨리면 다음 도시로.`; fit(); }
function fit(){
  if(!canvas.width) return;
  const full=document.getElementById('stage-full');
  if(full&&full.classList.contains('fs')){
    const side=full.classList.contains('side'), cs=getComputedStyle(full), h=el=>el&&el.offsetHeight||0;
    let aw=full.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight), ah=full.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    if(side) aw-=2*190+20; else ah-=h(full.querySelector('.board-top'))+h(full.querySelector('.board-bottom'))+h(full.querySelector('.touchpad'))+30;
    canvas.style.width=Math.max(120,Math.min(aw,ah*canvas.width/canvas.height))+'px'; canvas.style.margin='0 auto'; return; }
  const st=canvas.parentElement, w=st.clientWidth; if(!w) return;
  const maxH=Math.max(240,innerHeight-230), byH=maxH*canvas.width/canvas.height;
  canvas.style.width=Math.min(w,byH)+'px'; canvas.style.margin='0 auto';
}
let last=0, acc=0; const STEP=1000/60;
function tick(){ if(target){ E.autoKeys(S,target,keys); if(target.done) target=null; } E.step(S,keys); keys.jumpPressed=false; keys.punchPressed=false; events(); }
function frame(now){
  T++;
  if(S&&S.status==='play'&&!paused){
    if(!last) last=now; acc=Math.min(acc+(now-last),100); last=now;
    while(acc>=STEP){ tick(); acc-=STEP; }
  } else { last=now; acc=0; }
  if(S&&S.status!=='play'&&$('#result-card').hidden){ if(mode==='over') resultCard(S.status==='win'); else if(mode==='clear') clearCard(); }
  const s=S||previewS;
  if(s){ R.render(g,s,S?S.time:T); if(!S) previewOverlay(); if(S&&target&&!target.done) drawTarget(); if(S&&paused&&menu) drawPauseDim(); }
  requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&S&&mode==='play'&&!menu) mainMenu(); /* 다른 탭을 보는 동안 멈추고, 돌아오면 멈춤 메뉴가 떠 있다 */ });
}
requestAnimationFrame(frame);
function drawPauseDim(){ g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(0,0,canvas.width,canvas.height); }
function drawTarget(){ const r=3+((T>>2)&1); g.strokeStyle='rgba(255,255,255,.9)'; g.lineWidth=1; g.beginPath(); g.arc(target.x,target.y,r,0,Math.PI*2); g.stroke(); }
function previewOverlay(){ const f=formOf(cfg), c=CITIES[cfg.city-1];
  g.fillStyle='rgba(20,18,30,.72)'; g.fillRect(40,60,240,78); g.fillStyle='#fff'; g.font='12px Pretendard, sans-serif'; g.textAlign='center'; g.textBaseline='top';
  g.fillText(`도시 ${cfg.city} · ${c.name}`,160,66); g.font='bold 8px Pretendard, sans-serif'; g.fillText(`${f.name} · ${f.from}`,160,84); g.fillText(`목숨 ${cfg.lives===0?'무한':cfg.lives} · 건물 ${c.nB}채`,160,96);
  g.fillStyle=f.color; g.fillText('출전을 누르면 시작한다',160,118); g.textAlign='left';
  SP.drawIdle(g,f,T,160,E.GROUND,1); }

/* ---------- 사건 → 소리·기록 ---------- */
const SNDMAP={jump:'jump',land:'thud',grab:'paw',letgo:'swish',punch:'swish',hit:'thud',whiff:'swish',hurt:'hurt',shrink:'die',respawn:'pop',over:'lose',win:'win',clear:'cheer',collapse:'explode',gone:'fall'};
const eatName={person:'사람',soldier:'군인',cop:'경찰차',taxi:'택시'};
const eul=w=>{ const c=w.charCodeAt(w.length-1); return (c>=0xac00&&c<=0xd7a3&&(c-0xac00)%28)?w+'을':w+'를'; };
const eatVerb={gulp:'꿀꺽 삼켰다',chew:'우적우적 씹어 먹었다',toss:'공중에 던져 받아먹었다',smoke:'꿀꺽 삼키고 담배를 한 모금 물었다'};
function events(){
  for(const ev of S.events){
    if(ev.t==='eat'){ SND.play(ev.what==='person'?'bone':'stomp'); log(`${eul(eatName[ev.what]||ev.what)} ${eatVerb[S.hero.eatKind]||'먹었다'}. 체력 ${Math.round(S.hero.stam)}.`); }
    else if(ev.t==='kill'){ SND.play(ev.type==='tank'||ev.type==='heli'?'explode':'pop'); if(ev.type==='tank'||ev.type==='heli') log(`${eul(EN[ev.type].name)} 부쉈다.`); }
    else if(ev.t==='shot'){ SND.play(ev.kind==='bullet'?'gun':ev.kind==='shell'?'cannon':'rocket'); }
    else if(ev.t==='city'){ SND.play('zone'); }
    else if(SNDMAP[ev.t]) SND.play(SNDMAP[ev.t]);
    if(ev.t==='hurt') log(`${({bullet:'총알',shell:'포탄',rocket:'로켓'})[ev.by]||ev.by}에 맞았다 −${ev.dmg}. 체력 ${Math.round(S.hero.stam)}.`);
    if(ev.t==='collapse') log(`건물 ${ev.i+1}이(가) 무너진다.`);
    if(ev.t==='shrink') log('체력이 다해 사람으로 돌아갔다.');
    if(ev.t==='respawn') log(`다시 몬스터로. 남은 목숨 ${S.lives===Infinity?'∞':S.lives}.`);
    if(ev.t==='clear') cityClear();
    if(ev.t==='win') finish(true);
    if(ev.t==='over') finish(false);
  }
  S.events.length=0; hud();
}
function log(html){ const li=document.createElement('li'); li.innerHTML=esc(html); const l=$('#log'); l.prepend(li); while(l.children.length>40) l.lastChild.remove(); }
function hud(){
  const h=S.hero, f=E.form(S), c=E.cityOf(S);
  $('#form-card').innerHTML=`<div class="form-now" style="--fc:${f.color}"><b>${f.name}</b><small>${f.from}</small><p>${f.desc}</p></div>`;
  const left=S.builds.filter(b=>b.state!=='gone').length;
  $('#info-card').innerHTML=[['도시',`${S.city} / ${CITIES.length} ${c.name}`],['체력',`${Math.round(h.stam)} / ${E.MAX_STAM}`],['목숨',S.lives===Infinity?'무한':String(S.lives)],['남은 건물',`${left} / ${S.builds.length}`],['먹은 것',String(h.eats||0)],['점수',S.score.toLocaleString('ko-KR')],['시간',Math.floor(S.time/60)+'초']].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');
  $('#turn-badge').textContent=`${f.name} · 체력 ${Math.round(h.stam)} · 목숨 ${S.lives===Infinity?'∞':S.lives}`; $('#turn-badge').className='';
}

/* ---------- 시작·종료 ---------- */
function liveUI(){ $('#setup-panel').hidden=true; $('#hud').hidden=false; $('#board-wrap').classList.add('live'); $('#touchpad').classList.add('on'); $('#full').disabled=false; fit(); $('#board-wrap').focus({preventScroll:true}); }
function startGame(c){
  S=E.newGame({form:c.form,city:c.city,lives:c.lives===0?Infinity:c.lives}); mode='play'; paused=false; target=null; closeMenu(); $('#result-card').hidden=true;
  liveUI(); $('#board-wrap').scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'});
  $('#log').innerHTML=''; log(`${formOf(c).name}가 도시 ${c.city} ${CITIES[c.city-1].name}에 나타났다. 목숨 ${c.lives===0?'무한':c.lives}.`);
  $('#day').textContent=`도시 ${c.city} · ${CITIES[c.city-1].name}`; $('#tile-info').textContent=`건물 ${CITIES[c.city-1].nB}채. 창을 쳐서 구멍을 반 넘게 내면 무너진다.`;
  $('#hint').innerHTML=HINT0; status('진행 중'); hud();
}
function cityClear(){
  mode='clear'; status('도시 '+S.city+' 클리어'); resetKeys(); target=null;
  log(`도시 ${S.city} ${eul(E.cityOf(S).name)} 다 부쉈다. 점수 ${S.score.toLocaleString('ko-KR')}. 다음은 도시 ${S.city+1} · ${CITIES[S.city].name}.`);
  $('#hint').innerHTML='<span><kbd>X</kbd><kbd>↵</kbd>다음 도시로</span>';
}
function clearCard(){
  const next=CITIES[S.city];
  $('#result-card').innerHTML=`<div><h3 class="win">도시 ${S.city} · ${E.cityOf(S).name} 클리어</h3><div class="rc-grid"><div><span>점수</span><strong>${S.score.toLocaleString('ko-KR')}</strong></div><div><span>먹은 것</span><strong>${S.hero.eats||0}</strong></div><div><span>시간</span><strong>${Math.floor(S.time/60)}초</strong></div><div><span>체력</span><strong>${Math.round(S.hero.stam)}</strong></div></div><p>다음은 도시 ${S.city+1} · ${next.name}(건물 ${next.nB}채). X 또는 Enter, 화면을 찍어도 간다.</p><button type="button" id="rc-next">다음 도시로</button></div>`;
  $('#result-card').hidden=false; $('#rc-next').onclick=nextCity;
}
function nextCity(){
  if(!S||mode!=='clear') return;
  E.nextCity(S); mode='play'; paused=false; target=null; closeMenu(); $('#result-card').hidden=true; last=0;
  const c=E.cityOf(S); log(`도시 ${S.city} · ${c.name} 출발. 건물 ${c.nB}채.`);
  $('#day').textContent=`도시 ${S.city} · ${c.name}`; $('#tile-info').textContent=`건물 ${c.nB}채. 창을 쳐서 구멍을 반 넘게 내면 무너진다.`;
  $('#hint').innerHTML=HINT0; status('진행 중'); hud(); $('#board-wrap').focus({preventScroll:true});
}
function backToSetup(){
  S=null; mode='setup'; paused=false; target=null; closeMenu(); $('#result-card').hidden=true;
  $('#setup-panel').hidden=false; $('#hud').hidden=true; $('#board-wrap').classList.remove('live'); $('#touchpad').classList.remove('on'); exitFull(); $('#full').disabled=true;
  preview(cfg); status('출전 준비'); result('다시 나서려면 코드를 고치거나 그대로 출전을 누르자.'); $('#hint').innerHTML=HINT0; renderSlotList();
}
function finish(win){
  mode='over'; status(win?'열두 도시 완료':'모든 목숨을 잃음',win?'':'error'); resetKeys(); target=null;
  log(win?`마라도까지 열두 도시를 모두 부쉈다. 점수 ${S.score.toLocaleString('ko-KR')}.`:'모든 목숨을 잃었다.'); $('#hint').innerHTML='<span><kbd>X</kbd><kbd>↵</kbd>출전 준비로</span>';
}
function resultCard(win){
  $('#result-card').innerHTML=`<div><h3 class="${win?'win':'lose'}">${win?'열두 도시를 모두 부쉈다':'다시 해 보자'}</h3><div class="rc-grid"><div><span>점수</span><strong>${S.score.toLocaleString('ko-KR')}</strong></div><div><span>부순 도시</span><strong>${S.citiesDone}</strong></div><div><span>먹은 것</span><strong>${S.hero.eats||0}</strong></div><div><span>시간</span><strong>${Math.floor(S.time/60)}초</strong></div></div><p>X 또는 Enter로 출전 준비로 돌아간다.</p><button type="button" id="rc-back">출전 준비로</button></div>`;
  $('#result-card').hidden=false; $('#rc-back').onclick=backToSetup;
}
$('#concede').onclick=()=>{ if(!S||mode==='over') return; confirmMenu('포기하고 출전 준비로 돌아갈까?',[['포기한다',backToSetup],['계속 간다',()=>{}]]); };
function resetKeys(){ keys.left=keys.right=keys.up=keys.down=keys.jump=keys.punch=false; }

/* ---------- 메뉴(일시정지) ---------- */
function openMenu(title,items,onCancel){ paused=true; menu={title,items:items.map(it=>Array.isArray(it)?{label:it[0],fn:it[1]}:it),onCancel}; menu.i=Math.max(0,menu.items.findIndex(it=>!it.off)); drawMenu(); resetKeys(); target=null; }
function drawMenu(){ const m=$('#menu'); if(!menu){ m.hidden=true; return; } m.hidden=false; m.className='game-menu center'; m.innerHTML=(menu.title?`<h4>${esc(menu.title)}</h4>`:'')+menu.items.map((it,i)=>`<div class="mi ${i===menu.i?'sel':''} ${it.off?'off':''}" role="menuitem" data-i="${i}"><span>${esc(it.label)}</span>${it.note?`<small>${esc(it.note)}</small>`:''}</div>`).join(''); m.querySelectorAll('.mi').forEach(el=>el.onclick=e=>{e.stopPropagation();menu.i=+el.dataset.i;pick();}); m.querySelector('.sel')?.scrollIntoView({block:'nearest'}); }
function closeMenu(){ menu=null; $('#menu').hidden=true; paused=false; last=0; }
function cancelMenu(){ const c=menu&&menu.onCancel; closeMenu(); if(c) c(); }
function pick(){ const it=menu.items[menu.i]; if(!it||it.off) return; closeMenu(); it.fn(); }
function confirmMenu(q,opts,back){ openMenu(q,opts.map(([label,fn])=>({label,fn})),back); }
function mainMenu(){ openMenu('잠시 멈춤',[['계속 간다',()=>{}],['몬스터 설명',()=>{ const f=E.form(S); openMenu(`${f.name} · ${f.from}: ${f.desc}`,[['닫기',()=>{}]],mainMenu); }],['저장',saveMenu],['불러오기',loadMenu],['포기하고 출전 준비로',()=>confirmMenu('포기하고 출전 준비로 돌아갈까?',[['포기한다',backToSetup],['계속 간다',()=>{}]],mainMenu)]]); }

/* ---------- 저장·불러오기: 동현전·동현워·동현몬과 같은 브라우저 칸 3개 + .dhsave 파일 ---------- */
const SAVE_FORMAT='donghyunram-save', SAVE_VERSION=1, SLOT_KEY=n=>'donghyunram:slot'+n, SLOTS=3;
function snapshot(){
  const state=JSON.parse(JSON.stringify(S,(k,v)=>k==='events'?[]:(v===Infinity?'inf':v)));
  const logs=[...$('#log').children].reverse().map(li=>li.textContent);
  return {format:SAVE_FORMAT,version:SAVE_VERSION,savedAt:new Date().toISOString(),summary:{city:S.city,cityName:E.cityOf(S).name,lives:S.lives===Infinity?'∞':S.lives,score:S.score,form:E.form(S).name,stam:Math.round(S.hero.stam)},state,logs};
}
function restore(data){
  if(!data||data.format!==SAVE_FORMAT) throw new Error('동현램 저장 파일이 아니다.');
  if(data.version!==SAVE_VERSION) throw new Error('지원하지 않는 저장 형식 버전이다('+data.version+').');
  const st=data.state;
  if(!st||!(Number.isInteger(st.city)&&st.city>=1&&st.city<=CITIES.length)) throw new Error('도시 정보가 맞지 않는다.');
  if(!(Number.isInteger(st.formI)&&FORMS[st.formI])) throw new Error('몬스터 정보가 맞지 않는다.');
  if(!Array.isArray(st.builds)||!st.builds.length||st.builds.some(b=>!Array.isArray(b.cells)||b.cells.length!==b.floors)) throw new Error('건물 정보가 맞지 않는다.');
  if(!Array.isArray(st.ens)||st.ens.some(e=>!EN[e.type])) throw new Error('적 정보가 맞지 않는다.');
  if(st.lives==='inf') st.lives=Infinity; else if(!(Number.isInteger(st.lives)&&st.lives>=1&&st.lives<=9)) throw new Error('목숨 정보가 맞지 않는다.');
  if(!st.hero||!(st.hero.x>=0&&st.hero.x<=E.W)||!(st.hero.stam>=0&&st.hero.stam<=E.MAX_STAM)) throw new Error('몬스터 위치가 맞지 않는다.');
  if(st.status!=='play') throw new Error('이미 끝난 판이다.');
  st.events=[]; st.shots=st.shots||[]; st.fx=st.fx||[]; st.msgT=0; st.rs=st.rs|0;
  closeMenu(); $('#result-card').hidden=true;
  S=st; mode='play'; target=null; cfg={form:FORMS[S.formI].id,city:S.city,lives:S.lives===Infinity?0:S.lives};
  liveUI(); $('#day').textContent=`도시 ${S.city} · ${E.cityOf(S).name}`;
  const l=$('#log'); l.innerHTML=''; for(const t of (data.logs||[]).slice(-39)) log(String(t).replace(/<[^>]*>/g,''));
  log('저장한 판을 불러왔다.'); $('#hint').innerHTML=HINT0; status('진행 중'); hud();
}
function readSlot(n){ try{ const t=localStorage.getItem(SLOT_KEY(n)); return t?JSON.parse(t):null; }catch(e){ return null; } }
function slotNote(d){ if(!d) return '비어 있음'; const t=new Date(d.savedAt); const pad=v=>String(v).padStart(2,'0'); return `도시 ${d.summary.city} ${d.summary.cityName} · 목숨 ${d.summary.lives} · ${t.getMonth()+1}/${t.getDate()} ${pad(t.getHours())}:${pad(t.getMinutes())}`; }
function toast(t){ log(t); status(t); }
function saveToSlot(n){ try{ localStorage.setItem(SLOT_KEY(n),JSON.stringify(snapshot())); toast(`브라우저 칸 ${n}에 저장했다.`); renderSlotList(); } catch(e){ toast('브라우저 저장에 실패했다. 파일로 내려받아 저장하자.'); } }
function deleteSlot(n){ try{ localStorage.removeItem(SLOT_KEY(n)); }catch(e){} renderSlotList(); }
function saveToFile(){ const d=snapshot(), a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'})); a.download=`donghyunram-city${d.summary.city}-${d.summary.score}.dhsave`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); toast('저장 파일을 내려받았다.'); }
function saveMenu(){
  const items=[];
  for(let n=1;n<=SLOTS;n++){ const d=readSlot(n); items.push({label:`브라우저 칸 ${n}`,note:slotNote(d),fn:()=>{ if(d) confirmMenu(`칸 ${n}에 덮어쓸까?`,[['덮어쓴다',()=>saveToSlot(n)],['그만둔다',saveMenu]],saveMenu); else saveToSlot(n); }}); }
  items.push({label:'파일로 내려받기',note:'.dhsave',fn:saveToFile});
  items.push({label:'브라우저 칸 지우기',note:'',off:!Array.from({length:SLOTS},(_,i)=>readSlot(i+1)).some(Boolean),fn:deleteMenu});
  openMenu('저장',items,mainMenu);
}
function deleteMenu(){
  const items=[];
  for(let n=1;n<=SLOTS;n++){ const d=readSlot(n); items.push({label:`브라우저 칸 ${n}`,note:slotNote(d),off:!d,fn:()=>confirmMenu(`칸 ${n}${n===2?'를':'을'} 지울까? 되돌릴 수 없다.`,[['지운다',()=>{ deleteSlot(n); toast(`브라우저 칸 ${n}${n===2?'를':'을'} 지웠다.`); deleteMenu(); }],['그만둔다',deleteMenu]],deleteMenu)}); }
  openMenu('지울 칸',items,saveMenu);
}
function loadFrom(d){ try{ restore(d); }catch(e){ const msg='불러오기 실패: '+e.message; if(S){ toast(msg); } else { result(msg,'error'); status('불러오기 실패','error'); } } }
function loadMenu(){
  const items=[];
  for(let n=1;n<=SLOTS;n++){ const d=readSlot(n); items.push({label:`브라우저 칸 ${n}`,note:slotNote(d),off:!d,fn:()=>confirmMenu('지금 판을 버리고 불러올까?',[['불러온다',()=>loadFrom(readSlot(n))],['그만둔다',loadMenu]],loadMenu)}); }
  items.push({label:'파일에서 불러오기',note:'.dhsave',fn:()=>$('#load-file').click()});
  openMenu('불러오기',items,mainMenu);
}
$('#load-file').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(!f) return; try{ loadFrom(JSON.parse(await f.text())); }catch(err){ loadFrom(null); } };
$('#load-file-setup').onchange=$('#load-file').onchange;
document.querySelector('.load-head label').addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); $('#load-file-setup').click(); } });
function renderSlotList(){
  const box=$('#slot-list'); box.innerHTML='';
  for(let n=1;n<=SLOTS;n++){ const d=readSlot(n); const b=document.createElement('button'); b.className='slot-btn'; b.disabled=!d;
    b.innerHTML=`<b>칸 ${n}</b><span>${esc(slotNote(d))}</span>${d?`<small>${esc(d.summary.form)} · 체력 ${esc(d.summary.stam)} · ${Number(d.summary.score).toLocaleString('ko-KR')}점</small>`:''}`;
    b.onclick=()=>loadFrom(readSlot(n));
    const row=document.createElement('div'); row.className='slot-row'; row.append(b);
    if(d){ const x=document.createElement('button'); x.className='slot-del'; x.type='button'; x.textContent='지우기'; x.setAttribute('aria-label',`칸 ${n} 지우기`);
      let t=0; x.onclick=()=>{ if(!x.classList.contains('armed')){ x.classList.add('armed'); x.textContent='정말 지운다'; t=setTimeout(()=>{ x.classList.remove('armed'); x.textContent='지우기'; },4000); return; } clearTimeout(t); deleteSlot(n); status(`브라우저 칸 ${n}${n===2?'를':'을'} 지웠다.`); };
      row.append(x); }
    box.append(row); }
}

/* ---------- 키보드: 동현전·동현워·동현크와 같은 배치 ---------- */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyX:'x',KeyZ:'z',KeyS:'s',KeyA:'a',Enter:'enter',NumpadEnter:'enter',Space:'z'};
function keyOf(e){ return KEYMAP[e.code]||({x:'x',z:'z',s:'s',a:'a',X:'x',Z:'z',S:'s',A:'a',Enter:'enter',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'})[e.key]||null; }
document.addEventListener('keydown',e=>{
  if(!S||tab!=='play') return;
  const el=document.activeElement; if(el&&(el.tagName==='TEXTAREA'||el.tagName==='SELECT'||el.tagName==='INPUT')) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const k=keyOf(e); if(!k) return; e.preventDefault(); if(e.repeat&&!/^(left|right|up|down)$/.test(k)) return; keyDown(k);
});
document.addEventListener('keyup',e=>{ const k=keyOf(e); if(!k) return; keyUp(k); });
GP.start({hint:'A 점프 · B 주먹 · Y 설명 · + 메뉴',status:t=>status(t),
  down(k){ if(!S||tab!=='play') return; keyDown(k); }, up(k){ if(!S) return; keyUp(k); }});
function keyDown(k){
  if(!S) return;
  if(mode==='over'){ if(k==='x'||k==='enter'||k==='z') backToSetup(); return; }
  if(mode==='clear'){ if(k==='x'||k==='enter') nextCity(); return; }
  if(menu){ if(k==='up'||k==='down'){ const n=menu.items.length; menu.i=(menu.i+(k==='up'?-1:1)+n)%n; drawMenu(); } else if(k==='x'||k==='enter'){ pick(); } else if(k==='z'){ cancelMenu(); } return; }
  if(/^(left|right|up|down)$/.test(k)){ target=null; keys[k]=true; }
  else if(k==='x'){ keys.punch=true; keys.punchPressed=true; }
  else if(k==='z'){ keys.jump=true; keys.jumpPressed=true; }
  else if(k==='a'){ const f=E.form(S); S.msg=`${f.name}: ${f.desc}`; S.msgT=160; }
  else if(k==='enter') mainMenu();
}
function keyUp(k){ if(/^(left|right|up|down)$/.test(k)) keys[k]=false; else if(k==='x') keys.punch=false; else if(k==='z') keys.jump=false; }
document.querySelectorAll('#touchpad [data-key]').forEach(b=>{
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',x:'x',z:'z',s:'s',a:'a',Enter:'enter'}[b.dataset.key];
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keyDown(m);});
  const up=e=>{e.preventDefault();keyUp(m);}; b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('lostpointercapture',up);
});
addEventListener('blur',()=>{ resetKeys(); });

/* ---------- 화면을 직접 찍기(마우스·손가락): 몬스터를 찍으면 주먹, 다른 곳을 찍으면 그리로 간다(건물 위쪽이면 올라간다), 위로 튕기면 점프 ---------- */
let press=null;
function boardPos(e){ const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}; }
canvas.addEventListener('pointerdown',e=>{
  if(!S) return; e.preventDefault(); canvas.setPointerCapture(e.pointerId);
  if(mode==='over'){ backToSetup(); return; } if(mode==='clear'){ nextCity(); return; } if(menu) return;
  const p=boardPos(e); press={x:p.x,y:p.y,t:performance.now(),id:e.pointerId};
});
canvas.addEventListener('pointerup',e=>{
  if(!S||!press||press.id!==e.pointerId) return; e.preventDefault(); const p=boardPos(e), dt=performance.now()-press.t, dy=p.y-press.y, dx=p.x-press.x; const pr=press; press=null;
  if(menu||mode!=='play') return;
  if(dt<400&&dy<-24&&Math.abs(dx)<Math.abs(dy)*1.5){ /* 위로 튕김: 점프(꼬리콥터는 공중에서 좌우 방향도) */ keys.jumpPressed=true; if(S.hero.hang>1.5&&Math.abs(dx)>10) target={x:p.x,y:p.y}; return; }
  const h=S.hero, hb=E.heroBox(h);
  if(pr.x>=hb.x-6&&pr.x<=hb.x+hb.w+6&&pr.y>=hb.y-6&&pr.y<=hb.y+hb.h+6){ /* 몬스터 자신: 주먹 */ keys.punchPressed=true; target=null; return; }
  if(pr.y>=E.GROUND+2){ pr.y=E.GROUND-4; }
  target={x:pr.x,y:pr.y}; h.dir=pr.x<h.x?-1:1;
});
canvas.addEventListener('pointercancel',()=>{ press=null; });
$('#result-card').addEventListener('pointerdown',e=>{ if(e.target.tagName==='BUTTON') return; if(mode==='clear') nextCity(); else if(mode==='over') backToSetup(); });

/* ---------- 시험용 연결 ---------- */
window.render_game_to_text=()=>JSON.stringify(S?{mode,paused,city:S.city,status:S.status,lives:S.lives===Infinity?'inf':S.lives,score:S.score,form:E.form(S).key,
  hero:{x:Math.round(S.hero.x),y:Math.round(S.hero.y),stam:Math.round(S.hero.stam),state:S.hero.state,eatT:S.hero.eatT,eatKind:S.hero.eatKind},builds:S.builds.map(b=>b.state[0]+b.holes),
  enemies:S.ens.filter(e=>e.alive).map(e=>({t:e.type,x:Math.round(e.x),y:Math.round(e.y),hp:e.hp})),target}:{mode:'setup',cfg});
window.__donghyunram={get state(){return S;},snapshot,restore,readSlot,saveToSlot,keyDown,keyUp,keys,get mode(){return mode;},get target(){return target;},start:()=>startGame(cfg),nextCity,parseSortie,
  step:(n=1)=>{for(let i=0;i<n;i++){if(S.status!=='play')break;tick();}}};
selectExample(); sortieCard(cfg); preview(cfg); renderSlotList();
/* ---------- 전체 화면(동현둠·동현크와 같은 규칙) ---------- */
const stageFull=$('#stage-full');
const fullEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const canNativeFull=!!((document.fullscreenEnabled||document.webkitFullscreenEnabled)&&(stageFull.requestFullscreen||stageFull.webkitRequestFullscreen));
const isPseudo=()=>stageFull.classList.contains('pseudo-full');
const isFull=()=>fullEl()===stageFull||isPseudo();
const SIDE_MQ=matchMedia('(orientation: landscape) and (pointer: coarse)');
function setPseudo(on){ stageFull.classList.toggle('pseudo-full',on); document.documentElement.classList.toggle('pseudo-full-on',on); onFull(); }
function exitFull(){ if(isPseudo()) return setPseudo(false); if(fullEl()===stageFull) (document.exitFullscreen||document.webkitExitFullscreen||(()=>{})).call(document); }
let hintTimer=0;
function onFull(){ const on=isFull(); stageFull.classList.toggle('fs',on); stageFull.classList.toggle('side',on&&SIDE_MQ.matches);
  $('#exit-full').hidden=!on; $('#full').textContent=on?'전체 화면 닫기':'전체 화면';
  clearTimeout(hintTimer); $('#full-hint').hidden=!on; if(on) hintTimer=setTimeout(()=>$('#full-hint').hidden=true,5000);
  fit(); setTimeout(fit,60); if(on) $('#full').blur(); if(S) hud(); }
document.addEventListener('fullscreenchange',onFull); document.addEventListener('webkitfullscreenchange',onFull);
SIDE_MQ.addEventListener?SIDE_MQ.addEventListener('change',onFull):SIDE_MQ.addListener(onFull);
$('#exit-full').onclick=exitFull;
$('#full').onclick=()=>{ if(isFull()) return exitFull(); if(!S) return;
  if(!canNativeFull) return setPseudo(true);
  try{ const r=stageFull.requestFullscreen?stageFull.requestFullscreen():stageFull.webkitRequestFullscreen();
    if(r&&r.catch) r.catch(()=>setPseudo(true)); }catch(e){ setPseudo(true); } };
})();
