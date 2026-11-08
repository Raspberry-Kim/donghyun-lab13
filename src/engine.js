/* 동현램 엔진: 화면 하나 크기의 거리(320×200)에 선 건물의 옆벽을 괴물이 타고 올라 부수는 고전 규칙.
   괴물은 건물의 왼쪽·오른쪽 옆벽에 붙어 오르내리고, 주먹은 바라보는 쪽(제 건물 또는 옆 건물)의 위·가운데·아래 칸을 친다. 맨 아래에서 아래로 치면 길의 차·군인을 잡는다.
   그림·소리와 떨어진 순수 상태 기계라 node에서도 돈다. 난수는 상태 안의 rs 하나로만 돌려 저장·복원이 그대로 된다. */
(function(root){
'use strict';
const W=320, H=200, GROUND=176, FLOOR=16, BW=40, GAP=24, SLOT=BW+GAP, COLS=2, CELL_W=BW/COLS, HAND=14, WALL_TOP=16, FX_MAX=180; /* 건물 사이 골목 24px: 괴물이 서서 어느 쪽 벽을 탈지 고를 수 있다(원작도 건물 사이에 골목이 있다). */ /* 손은 발에서 14px 위. 옆벽의 가장 높은 자리는 꼭대기에서 16px 아래(거기서 가운데 주먹이 꼭대기 층에 닿는다) */
const MAX_STAM=100, DRAIN_EVERY=240; /* 4초에 1칸: 가만히 있어도 6~7분은 버틴다. 맞아도 조금만 깎이고 먹으면 크게 차서 거의 가득 찬 채로 논다 */
const FORMS=[
  {id:1,key:'podong',name:'포동이',from:'실험실의 강아지',color:'#f6ecd6',atk:1.0,def:1.0,reach:1,speed:1.0,hang:1.0,
   desc:'기본 괴물. 힘·맷집·손 길이·걸음·점프가 모두 기준값이다. 처음이라면 포동이로 시작하자.'},
  {id:2,key:'shushu',name:'슈슈',from:'동현파의 복서',color:'#cf6157',atk:1.5,def:0.7,reach:1,speed:1.0,hang:1.0,
   desc:'빨간 글러브의 한 방이 세다(힘 150%, 창 하나를 한 방에 뚫는다). 대신 맷집이 약해 총알·포탄에 체력이 더 많이 깎인다(맷집 70%).'},
  {id:3,key:'lion',name:'라이언',from:'동현파의 분홍 선충',color:'#f0a3a3',atk:0.7,def:0.8,reach:2,speed:1.0,hang:1.0,
   desc:'힘은 약하지만(70%, 맷집 80%) 팔이 길다. 한 번 치면 창이 두 칸씩 패이고, 옆 건물과 길 위의 경찰차·택시를 멀리서도 잡아먹는다.'},
  {id:4,key:'copter',name:'꼬리콥터',from:'동현콥의 꼬리 날개',color:'#2bb0c8',atk:0.7,def:0.8,reach:1,speed:1.0,hang:3.0,
   desc:'힘·맷집은 약하지만(80%) 꼬리 날개 덕에 점프가 아주 느리게 떨어진다. 공중에서 좌우로 방향을 바꿔 원하는 건물에 내려앉는다.'},
  {id:5,key:'doom',name:'둠가이',from:'동현둠의 철모',color:'#5a8f3a',atk:1.5,def:1.4,reach:1,speed:0.75,hang:1.0,
   desc:'힘 150%에 맷집 140%로 둘 다 세다. 대신 무거워서 걷고 오르는 것이 느리다(75%).'}
];
const CITIES=[
  {name:'인천',nB:3,hMin:3,hMax:6,soldier:1,heli:0,tank:0,car:1,sky:['#7fb5e6','#dbe9f5'],fog:'#9fb9cf'},
  {name:'서울',nB:4,hMin:3,hMax:7,soldier:1,heli:0,tank:0,car:1,sky:['#6aa3dc','#d6e6f3'],fog:'#93aec7'},
  {name:'수원',nB:4,hMin:4,hMax:7,soldier:2,heli:1,tank:0,car:1,sky:['#f0b27a','#fbe3c4'],fog:'#d3a07e'},
  {name:'춘천',nB:4,hMin:3,hMax:8,soldier:2,heli:1,tank:0,car:2,sky:['#86c0a6','#dff0e3'],fog:'#9fc3af'},
  {name:'강릉',nB:5,hMin:4,hMax:8,soldier:2,heli:1,tank:1,car:2,sky:['#5f8fcc','#cfe0f2'],fog:'#8aa6c6'},
  {name:'대전',nB:5,hMin:4,hMax:8,soldier:3,heli:1,tank:1,car:2,sky:['#c98fd2','#efdcf2'],fog:'#b596bd'},
  {name:'전주',nB:5,hMin:5,hMax:9,soldier:3,heli:2,tank:1,car:2,sky:['#e58f6e','#f8d9c6'],fog:'#cf9a84'},
  {name:'광주',nB:5,hMin:5,hMax:9,soldier:3,heli:2,tank:1,car:3,sky:['#4f6fa8','#b7c8e2'],fog:'#7f93b5'},
  {name:'대구',nB:5,hMin:5,hMax:9,soldier:4,heli:2,tank:2,car:3,sky:['#ec8a5a','#f6d2b5'],fog:'#d59b7c'},
  {name:'울산',nB:5,hMin:6,hMax:9,soldier:4,heli:2,tank:2,car:3,sky:['#3f5d8c','#9fb3cf'],fog:'#6f85a6'},
  {name:'부산',nB:5,hMin:6,hMax:9,soldier:4,heli:3,tank:2,car:3,sky:['#2f4f7f','#8da4c4'],fog:'#5f779c'},
  {name:'제주',nB:5,hMin:6,hMax:9,soldier:5,heli:3,tank:3,car:3,sky:['#1f2f55','#6f7fa6'],fog:'#4a5a80'}
];
const EN={
  soldier:{name:'군인',hp:1,score:150,stam:14,edible:true,dmg:1},
  cop:{name:'경찰차',hp:2,score:250,stam:12,edible:true,dmg:0},
  taxi:{name:'택시',hp:1,score:200,stam:18,edible:true,dmg:0},
  tank:{name:'전차',hp:3,score:600,stam:0,edible:false,dmg:3},
  heli:{name:'헬기',hp:1,score:500,stam:0,edible:false,dmg:2}
};
const SCORE={punch:10,hole:25,person:300,building:1000,city:2000};

function rng(S){ S.rs=(S.rs+0x6D2B79F5)|0; let t=S.rs; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }
function ri(S,a,b){ return a+Math.floor(rng(S)*(b-a+1)); }
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function form(S){ return FORMS[S.formI]; }

function makeCity(S,ci){
  const C=CITIES[(ci-1)%CITIES.length], nB=C.nB, x0=Math.floor((W-(nB*SLOT-GAP))/2);
  const builds=[];
  for(let i=0;i<nB;i++){
    const hMax=C.hMax+Math.min(2,Math.floor((ci-1)/CITIES.length));
    let floors=ri(S,C.hMin,hMax);
    /* 옆 건물과 두 층 이상 차이 나게: 높낮이가 들쭉날쭉해야 어느 건물에 붙었는지 한눈에 보인다 */
    if(i>0){ const prev=builds[i-1].floors; if(Math.abs(floors-prev)<2){ floors=prev+2<=hMax?prev+2:prev-2; if(floors<C.hMin) floors=C.hMin; if(floors>hMax) floors=hMax; } }
    const cells=[]; for(let r=0;r<floors;r++){ const row=[]; for(let c=0;c<COLS;c++) row.push({hp:3,person:0}); cells.push(row); }
    builds.push({i,x:x0+i*SLOT,w:BW,floors,cells,state:'up',fall:0,drop:0,tint:ri(S,0,3),holes:0});
  }
  return {C,builds};
}
function newGame(cfg){
  const formI=Math.max(0,FORMS.findIndex(f=>f.id===(cfg.form||1)));
  const S={status:'play',formI,city:cfg.city||1,lives:cfg.lives==null?3:cfg.lives,score:0,time:0,rs:(cfg.seed==null?Date.now():cfg.seed)|0,
    hero:null,builds:[],ens:[],shots:[],fx:[],events:[],msg:'',msgT:0,spawnT:120,heliT:600,carT:200,drainT:DRAIN_EVERY,cleared:0,citiesDone:0,carry:cfg.carry||null};
  if(cfg.carry){ S.score=cfg.carry.score||0; S.lives=cfg.carry.lives==null?S.lives:cfg.carry.lives; S.citiesDone=cfg.carry.citiesDone||0; }
  loadCity(S);
  return S;
}
function loadCity(S){
  const {C,builds}=makeCity(S,S.city); S.builds=builds; S.ens=[]; S.shots=[]; S.fx=[]; S.cleared=0; S.spawnT=90; S.heliT=C.heli?540:1e9; S.carT=160;
  const f=form(S);
  S.hero={x:W/2,y:GROUND,vx:0,vy:0,dir:1,state:'ground',bld:-1,punchT:0,eatT:0,eatKind:'gulp',eats:S.hero?S.hero.eats||0:0,hurtT:0,stam:S.hero?S.hero.stam:MAX_STAM,shrinkT:0,inv:60,walkT:0,climbT:0,steps:0,hang:f.hang,side:0,pdx:0,pdy:0,airT:0,from:null,downT:0};
  if(S.hero.stam<40) S.hero.stam=40;
  S.events.push({t:'city',city:S.city,name:C.name});
}
function nextCity(S){ if(S.status!=='clear') return false; S.city++; S.status='play'; loadCity(S); return true; }
function cityOf(S){ return CITIES[(S.city-1)%CITIES.length]; }
function heroBox(h){ return {x:h.x-12,y:h.y-36,w:24,h:36}; }
function buildAt(S,x){ for(const b of S.builds) if(b.state==='up'&&x>=b.x&&x<=b.x+b.w) return b; return null; }
function topY(b){ return GROUND-b.floors*FLOOR; }
/* 틈까지 포함해 가장 가까운 선 건물 */
function buildNear(S,x,tol){ let best=null,bd=1e9; for(const b of S.builds){ if(b.state!=='up') continue; const d=x<b.x?b.x-x:x>b.x+b.w?x-b.x-b.w:0; if(d<=tol&&d<bd){ best=b; bd=d; } } return best; }
/* 손 높이의 칸 */
function cellAt(b,x,y){ const r=Math.floor((GROUND-y)/FLOOR), c=clamp(Math.floor((x-b.x)/CELL_W),0,COLS-1); if(r<0||r>=b.floors) return null; return {r,c,cell:b.cells[r][c]}; }
function addFx(S,kind,x,y,n){ if(S.fx.length>=FX_MAX) S.fx.shift(); S.fx.push({k:kind,x,y,t:0,n:n||0}); }
/* 잔해: 벽돌 조각(chunk)·유리 조각(glass)이 튀어 떨어져 길에 쌓인다. n=건물 번호(색) */
function debris(S,x,y,bi,count,kind){ for(let i=0;i<count;i++){ if(S.fx.length>=FX_MAX) S.fx.shift(); S.fx.push({k:kind,x:x+ri(S,-6,6),y:y+ri(S,-5,5),t:0,n:bi,vx:(rng(S)-0.5)*(kind==='glass'?3.2:2.4),vy:-(0.6+rng(S)*2.2),sz:kind==='glass'?1:ri(S,2,3),life:ri(S,70,110)}); } }

function hitCell(S,b,r,c,atk){
  const cell=b.cells[r][c]; if(!cell) return 0;
  let got=0;
  if(cell.person){ cell.person=0; S.score+=SCORE.person; eat(S,SCORE.person,20,'사람'); S.events.push({t:'eat',what:'person',kind:S.hero.eatKind}); got=1; }
  if(cell.hp<=0) return got;
  const cx=b.x+c*CELL_W+CELL_W/2, cy=GROUND-r*FLOOR-FLOOR/2; cell.hp-=atk; S.score+=SCORE.punch; S.events.push({t:'hit'}); addFx(S,'dust',cx,cy,0);
  debris(S,cx,cy,b.i,cell.hp<=0?6:3,'glass'); debris(S,cx,cy,b.i,cell.hp<=0?5:2,'chunk');
  if(cell.hp<=0){ cell.hp=0; b.holes++; S.score+=SCORE.hole; addFx(S,'cloud',cx,cy+4,b.i); if(rng(S)<0.4) cell.person=1;
    const total=b.floors*COLS; if(b.holes>=Math.ceil(total*0.5)) collapse(S,b); }
  return 1;
}
const EAT_KINDS=['gulp','chew','toss','smoke']; /* 꿀꺽 · 우적우적 씹기 · 공중에 던져 받아먹기 · 담배 한 모금(사람을 먹은 뒤의 여유) */
function eat(S,score,stam,what){ const h=S.hero; h.stam=Math.min(MAX_STAM,h.stam+stam); h.eatKind=EAT_KINDS[Math.floor(rng(S)*EAT_KINDS.length)]; h.eatT=h.eatKind==='smoke'?70:h.eatKind==='toss'?54:h.eatKind==='chew'?48:36; h.eats=(h.eats||0)+1; const c=what.charCodeAt(what.length-1); S.msg=`${what}${(c>=0xac00&&c<=0xd7a3&&(c-0xac00)%28)?'을':'를'} 먹었다 +${stam}`; S.msgT=90; }
function collapse(S,b){ if(b.state!=='up') return; b.state='falling'; b.fall=0; S.score+=SCORE.building; S.events.push({t:'collapse',i:b.i});
  for(let i=0;i<4;i++) addFx(S,'cloud',b.x+ri(S,0,b.w),GROUND-6-ri(S,0,10),b.i); debris(S,b.x+b.w/2,topY(b)+10,b.i,8,'chunk');
  for(const e of S.ens) if(e.type==='soldier'&&e.x>b.x-4&&e.x<b.x+b.w+4){ e.alive=false; S.score+=50; }
  const h=S.hero; if(h.bld===b.i&&(h.state==='climb'||h.state==='roof')){ h.state='air'; h.vy=0.5; h.vx=0; h.bld=-1; h.side=0; h.hurtT=30; addFx(S,'quake',0,0,0); } }

function hurt(S,dmg,by){ const h=S.hero; if(h.inv>0||S.status!=='play'||h.shrinkT) return; const f=form(S); const real=Math.max(1,Math.round(dmg/f.def));
  h.stam-=real; h.hurtT=18; h.inv=50; S.events.push({t:'hurt',by,dmg:real});
  if(h.stam<=0){ h.stam=0; h.shrinkT=120; h.state=(h.state==='climb'||h.state==='roof')?'air':h.state; h.vx=0; h.vy=0; h.bld=-1; h.side=0; S.events.push({t:'shrink'}); } }

function spawnSoldier(S){ const side=rng(S)<0.5?-1:1; S.ens.push({type:'soldier',x:side<0?-10:W+10,y:GROUND,dir:-side,hp:1,alive:true,t:0,shootT:ri(S,60,120)}); }
function spawnCar(S){ const C=cityOf(S); const type=rng(S)<0.5?'cop':'taxi'; const side=rng(S)<0.5?-1:1; S.ens.push({type,x:side<0?-20:W+20,y:GROUND,dir:-side,hp:EN[type].hp,alive:true,t:0,spd:(type==='cop'?1.3:1.0)+C.car*0.1}); }
function spawnTank(S){ const side=rng(S)<0.5?-1:1; S.ens.push({type:'tank',x:side<0?-24:W+24,y:GROUND,dir:-side,hp:3,alive:true,t:0,shootT:150}); }
function spawnHeli(S){ const side=rng(S)<0.5?-1:1; const top=Math.min(...S.builds.filter(b=>b.state==='up').map(topY),GROUND-64); S.ens.push({type:'heli',x:side<0?-24:W+24,y:clamp(top-10+ri(S,-16,16),20,GROUND-70),dir:-side,hp:1,alive:true,t:0,shootT:90,life:ri(S,600,900)}); }

function step(S,k){
  if(S.status!=='play') return;
  S.time++; const h=S.hero, f=form(S), C=cityOf(S);
  if(S.msgT>0) S.msgT--;
  if(h.inv>0) h.inv--; if(h.hurtT>0) h.hurtT--; if(h.eatT>0) h.eatT--;
  /* 체력은 천천히 준다 */
  if(--S.drainT<=0){ S.drainT=DRAIN_EVERY; if(!h.shrinkT&&S.lives!==Infinity){ h.stam--; if(h.stam<=0){ h.stam=0; h.shrinkT=120; if(h.state==='climb'||h.state==='roof'){ h.state='air'; h.vy=0.5; h.vx=0; h.bld=-1; h.side=0; } S.events.push({t:'shrink'}); } } }
  if(h.shrinkT>0){ /* 사람으로 돌아가 걸어 나간다 */
    h.shrinkT--; if(h.state==='air'){ h.vy+=0.25; h.y+=h.vy; if(h.y>=GROUND){ h.y=GROUND; h.state='ground'; } }
    if(h.shrinkT===0){ if(S.lives===Infinity||S.lives>1){ if(S.lives!==Infinity) S.lives--; h.stam=MAX_STAM; h.x=W/2; h.y=GROUND; h.state='ground'; h.bld=-1; h.inv=90; h.vx=h.vy=0; S.events.push({t:'respawn'}); } else { S.lives=0; S.status='over'; S.events.push({t:'over'}); } }
    stepWorld(S); return; }
  /* 입력 */
  const spd=1.25*f.speed, climbSpd=1.0*f.speed;
  if(h.punchT>0) h.punchT--;
  if(h.eatT>0&&h.state!=='air'){ /* 먹는 동안은 멈춰 서서 동작을 다 보여 준다 */ if(h.state==='ground') h.y=GROUND; stepWorld(S); checkClear(S); return; }
  if(h.state==='ground'){
    h.y=GROUND; h.bld=-1; h.side=0;
    let moved=false; if(h.punchT<=0||h.punchT<6){ if(k.left){ h.x-=spd; h.dir=-1; moved=true; } else if(k.right){ h.x+=spd; h.dir=1; moved=true; } } h.walkT=moved?h.walkT+1:0;
    h.x=clamp(h.x,12,W-12);
    if(k.up&&h.punchT<=0){ const w=wallNear(S,h.x,CELL_W+4); if(w) grab(S,w.b,w.side,GROUND-4); }
    if(k.jumpPressed&&h.punchT<=0){ h.state='air'; h.vy=-4.2; h.vx=(k.left?-1:k.right?1:0)*1.4; h.airT=0; h.from=null; S.events.push({t:'jump'}); }
  } else if(h.state==='climb'){ h.walkT=0;
    const b=S.builds[h.bld]; if(!b||b.state!=='up'){ h.state='air'; h.vy=0; h.bld=-1; h.side=0; }
    else {
      const top=topY(b); h.x=b.x+(h.side>0?b.w:0);
      if(h.punchT<6){
        if(k.up){ if(h.y<=top+WALL_TOP){ /* 꼭대기를 넘어 지붕에 올라선다 */ h.state='roof'; h.y=top; h.x=clamp(h.x,b.x+2,b.x+b.w-2); h.side=0; S.events.push({t:'roof'}); } else { h.y-=climbSpd; h.climbT++; } }
        if(h.state==='climb'&&k.down){ h.y+=climbSpd; h.climbT++; }
        /* ←→는 옆벽에 붙은 채 바라보는 쪽만 바꾼다: 제 건물 쪽이나 옆 건물 쪽 */
        if(k.left) h.dir=-1; else if(k.right) h.dir=1;
      }
      if(h.state==='climb'){
        h.y=clamp(h.y,top+WALL_TOP,GROUND-4);
        /* 맨 아래에서 ↓를 잠시 누르고 있으면 내려선다. 짧게 ↓+Z는 길을 향한 아래 주먹 */
        if(h.y>=GROUND-4&&k.down&&h.punchT<=0&&!k.punchPressed){ h.downT=(h.downT||0)+1; if(h.downT>=10){ h.downT=0; h.state='ground'; h.y=GROUND; h.bld=-1; h.side=0; S.events.push({t:'land'}); } } else h.downT=0;
        if(h.state==='climb'&&k.jumpPressed){ /* 매달린 채 뛰기: 바라보는 쪽으로 짧게. 옆 건물 쪽이면 그 옆벽을 잡고, 제 건물 쪽이면 건너편 옆벽·지붕으로 */ const dx=k.left?-1:k.right?1:h.dir; h.state='air'; h.vy=-2.8; h.vx=dx*1.3; h.dir=dx; h.from={bld:h.bld,side:h.side}; h.airT=0; h.bld=-1; h.side=0; S.events.push({t:'jump'}); }
      }
    }
  } else if(h.state==='roof'){
    const b=S.builds[h.bld]; if(!b||b.state!=='up'){ h.state='air'; h.vy=0; h.bld=-1; }
    else {
      h.y=topY(b); let moved=false;
      if(h.punchT<=0||h.punchT<6){ if(k.left){ h.x-=spd; h.dir=-1; moved=true; } else if(k.right){ h.x+=spd; h.dir=1; moved=true; } } h.walkT=moved?h.walkT+1:0;
      if(h.x<b.x-2||h.x>b.x+b.w+2){ /* 지붕 끝을 넘으면 그 옆벽을 잡고 매달린다 */ grab(S,b,h.x<b.x?-1:1,topY(b)+WALL_TOP); }
      else if(k.down&&h.punchT<=0){ grab(S,b,h.x<b.x+b.w/2?-1:1,topY(b)+WALL_TOP); }
      else if(k.jumpPressed&&h.punchT<=0){ h.state='air'; h.vy=-4.2; h.vx=(k.left?-1:k.right?1:0)*1.4; h.bld=-1; h.from=null; h.airT=0; S.events.push({t:'jump'}); }
    }
  } else if(h.state==='air'){ h.walkT=0; h.airT=(h.airT||0)+1;
    const g=0.22/h.hang; h.vy+=g; h.vy=Math.min(h.vy,4.5);
    if(h.hang>1.5){ /* 꼬리콥터: 공중에서 방향을 바꾼다 */ if(k.left){ h.vx=Math.max(-1.6,h.vx-0.12); h.dir=-1; } else if(k.right){ h.vx=Math.min(1.6,h.vx+0.12); h.dir=1; } }
    const py=h.y; h.x+=h.vx; h.y+=h.vy; h.x=clamp(h.x,12,W-12);
    /* 지붕에 내려앉기 */
    if(h.vy>0){ const b=buildAt(S,h.x); if(b){ const top=topY(b); if(py<=top&&h.y>=top){ h.state='roof'; h.bld=b.i; h.y=top; h.vx=h.vy=0; stomp(S,b); } } }
    /* 옆벽 잡기: 떨어지거나 스치며 지나는 옆벽을 잡는다(방금 떠난 옆벽은 잠시 제외) */
    if(h.state==='air'){ const w=wallNear(S,h.x,6); if(w&&h.y>topY(w.b)+WALL_TOP-2&&h.y<GROUND-2&&!(h.from&&h.airT<14&&h.from.bld===w.b.i&&h.from.side===w.side)){ grab(S,w.b,w.side,h.y); h.vx=h.vy=0; } }
    if(h.state==='air'&&h.y>=GROUND){ h.y=GROUND; h.state='ground'; h.vx=0; h.vy=0; S.events.push({t:'land'}); }
  }
  /* 주먹: 방향키를 누른 채 치면 그쪽(위·아래·옆)을 친다 */
  if(k.punchPressed&&h.punchT<=0&&(h.state==='ground'||h.state==='climb'||h.state==='roof')){ h.punchT=16; const dx=k.left?-1:k.right?1:0, dy=k.up?-1:k.down?1:0; if(dx) h.dir=dx; h.pdx=h.dir; h.pdy=dy; S.events.push({t:'punch'}); }
  if(h.punchT===11) punch(S);
  stepWorld(S); checkClear(S);
}
/* 옆벽에 붙는다: side=-1 왼쪽 옆벽, +1 오른쪽 옆벽. 발은 벽면 모서리 위에 둔다 */
function grab(S,b,side,y){ const h=S.hero; h.state='climb'; h.bld=b.i; h.side=side; h.x=b.x+(side>0?b.w:0); h.y=clamp(y,topY(b)+WALL_TOP,GROUND-4); h.dir=-side; h.from=null; S.events.push({t:'grab'}); }
/* x에서 가장 가까운 옆벽(건물 모서리). 골목(24px)에 서면 더 가까운 쪽 */
function wallNear(S,x,tol){ let best=null,bd=1e9; for(const b of S.builds){ if(b.state!=='up') continue; for(const side of [-1,1]){ const ex=b.x+(side>0?b.w:0); const d=Math.abs(x-ex); if(d<=tol&&d<bd){ best={b,side,ex}; bd=d; } } } return best; }
function stomp(S,b){ const f=form(S); const r=b.floors-1; for(let c=0;c<COLS;c++) hitCell(S,b,r,c,f.atk*2); addFx(S,'quake',0,0,0); S.events.push({t:'stomp',i:b.i}); }
function checkClear(S){ const h=S.hero; if(S.builds.every(b=>b.state==='gone')&&S.status==='play'){ S.cleared=1; S.citiesDone++; S.score+=SCORE.city+Math.round(h.stam)*10;
    if(S.city>=CITIES.length){ S.status='win'; S.events.push({t:'win'}); } else { S.status='clear'; S.events.push({t:'clear',city:S.city}); } } }
function punch(S){
  const h=S.hero, f=form(S), reach=f.reach, dx=h.pdx||h.dir, dy=h.pdy||0, atk=f.atk*2;
  const hy=h.y-HAND+dy*FLOOR; /* 가운데는 손 높이, 위·아래는 한 층 위·아래 */
  let hitAny=false;
  /* 길의 군인·차·전차: 보는 쪽으로 손 한 뼘 반, 등 뒤로도 조금. 기물 폭(군인 10 · 차 28 · 전차 34)만큼 더 넓게 인정한다 */
  const sweepRoad=()=>{ const range=30+reach*20; const x0=Math.min(h.x-10,h.x+dx*range), x1=Math.max(h.x+10,h.x+dx*range);
    for(const e of S.ens){ if(!e.alive||e.type==='heli') continue; const hw=e.type==='soldier'?5:e.type==='tank'?17:14; if(e.x+hw>=x0&&e.x-hw<=x1){ e.hp-=f.atk>=1.4?2:1; hitAny=true; S.events.push({t:'hit'}); if(e.hp<=0) killEn(S,e); else addFx(S,'spark',e.x,e.y-8,0); } } };
  if(h.state==='climb'){
    const b=S.builds[h.bld]; if(!b||b.state!=='up') return;
    const r=Math.floor((GROUND-hy)/FLOOR);
    if(r>=0){
      if(dx===-h.side){ /* 제 건물 쪽: 붙은 모서리의 칸부터 */ const c0=h.side<0?0:COLS-1; if(r<b.floors){ if(hitCell(S,b,r,c0,atk)) hitAny=true; if(reach>1){ const c1=c0-h.side; if(c1>=0&&c1<COLS&&hitCell(S,b,r,c1,atk)) hitAny=true; } } }
      else { /* 옆 건물 쪽: 틈 너머 가까운 칸부터 */ const nb=S.builds.find(o=>o.state==='up'&&o.i===b.i+h.side); if(nb&&r<nb.floors){ const c0=h.side>0?0:COLS-1; if(hitCell(S,nb,r,c0,atk)) hitAny=true; if(reach>1){ const c1=c0+h.side; if(c1>=0&&c1<COLS&&hitCell(S,nb,r,c1,atk)) hitAny=true; } } }
    }
    /* 아래 두 층에서 아래로 치면 길의 차·군인·전차도 맞는다 */
    if(r<=1&&dy>0) sweepRoad();
  } else if(h.state==='ground'){
    if(dy>=0) sweepRoad();
    if(hitPoint(S,h.x+dx*10,hy,atk)) hitAny=true; if(reach>1&&hitPoint(S,h.x+dx*(10+CELL_W),hy,atk)) hitAny=true;
  } else if(h.state==='roof'){
    if(hitPoint(S,h.x+dx*10,hy,atk)) hitAny=true; if(reach>1&&hitPoint(S,h.x+dx*(10+CELL_W),hy,atk)) hitAny=true;
  }
  /* 손이 닿는 헬기 */
  const hx=h.x+dx*12;
  for(const e of S.ens){ if(!e.alive||e.type!=='heli') continue; if(Math.abs(e.x-hx)<16+reach*8&&Math.abs(e.y-hy)<16){ killEn(S,e); hitAny=true; } }
  if(!hitAny) S.events.push({t:'whiff'});
}
/* 손끝 자리의 건물 칸을 찾아 친다(길·지붕에서). 건물 사이 틈은 가까운 건물로 본다 */
function hitPoint(S,x,y,atk){ const b=buildNear(S,x,8); if(!b) return 0; const at=cellAt(b,clamp(x,b.x+1,b.x+b.w-1),y); if(!at) return 0; return hitCell(S,b,at.r,at.c,atk); }
function killEn(S,e){ e.alive=false; const d=EN[e.type]; S.score+=d.score; S.events.push({t:'kill',type:e.type}); addFx(S,e.type==='heli'||e.type==='tank'?'boom':'spark',e.x,e.y-8,0);
  if(d.edible&&S.hero.shrinkT===0){ eat(S,d.score,d.stam,d.name); S.events.push({t:'eat',what:e.type}); } }

function stepWorld(S){
  const h=S.hero, C=cityOf(S);
  /* 건물 무너짐 */
  for(const b of S.builds){ if(b.state==='falling'){ b.fall++; b.drop=Math.min(b.floors*FLOOR,b.fall*b.fall*0.08);
      if(b.fall%3===0){ addFx(S,'cloud',b.x+ri(S,-6,b.w+6),GROUND-4-ri(S,0,8),b.i); debris(S,b.x+(rng(S)<0.5?0:b.w),GROUND-ri(S,0,Math.max(8,b.floors*FLOOR-b.drop)),b.i,2,'chunk'); }
      if(b.drop>=b.floors*FLOOR){ b.state='gone'; S.events.push({t:'gone',i:b.i}); for(let i=0;i<6;i++) addFx(S,'cloud',b.x+ri(S,-10,b.w+10),GROUND-6-ri(S,0,16),b.i); debris(S,b.x+b.w/2,GROUND-12,b.i,14,'chunk'); } } }
  /* 창문의 사람은 잠시 뒤 숨는다 */
  if(S.time%240===0) for(const b of S.builds) if(b.state==='up') for(const row of b.cells) for(const c of row) if(c.person&&rng(S)<0.5) c.person=0;
  /* 등장 */
  const up=S.builds.some(b=>b.state==='up');
  if(--S.spawnT<=0&&up){ S.spawnT=ri(S,240,420)-C.soldier*25; const alive=S.ens.filter(e=>e.alive&&e.type==='soldier').length; if(alive<C.soldier) spawnSoldier(S); if(C.tank&&S.ens.filter(e=>e.alive&&e.type==='tank').length<C.tank&&rng(S)<0.5) spawnTank(S); }
  if(--S.carT<=0){ S.carT=ri(S,300,520)-C.car*40; if(S.ens.filter(e=>e.alive&&(e.type==='cop'||e.type==='taxi')).length<2) spawnCar(S); }
  if(--S.heliT<=0&&up){ S.heliT=ri(S,600,900)-C.heli*100; if(S.ens.filter(e=>e.alive&&e.type==='heli').length<C.heli) spawnHeli(S); }
  /* 적 */
  for(const e of S.ens){ if(!e.alive) continue; e.t++;
    if(e.type==='soldier'){ const d=h.x-e.x; if(Math.abs(d)>56){ e.x+=Math.sign(d)*0.55; e.dir=Math.sign(d)||1; } else e.dir=Math.sign(d)||e.dir;
      if(--e.shootT<=0&&h.shrinkT===0){ e.shootT=ri(S,110,170); shoot(S,e.x,GROUND-8,h.x,h.y-20,2.4,'bullet',EN.soldier.dmg); } }
    else if(e.type==='cop'||e.type==='taxi'){ e.x+=e.dir*e.spd; if(e.x<-30||e.x>W+30) e.alive=false; }
    else if(e.type==='tank'){ const d=h.x-e.x; if(Math.abs(d)>90){ e.x+=Math.sign(d)*0.3; e.dir=Math.sign(d)||1; } else e.dir=Math.sign(d)||e.dir;
      if(--e.shootT<=0&&h.shrinkT===0){ e.shootT=ri(S,150,210); shoot(S,e.x+e.dir*12,GROUND-10,h.x,h.y-18,2.0,'shell',EN.tank.dmg); } }
    else if(e.type==='heli'){ const d=h.x-e.x; if(Math.abs(d)>40){ e.x+=Math.sign(d)*0.9; e.dir=Math.sign(d)||1; } else { e.dir=Math.sign(d)||e.dir; }
      e.y+=Math.sin(e.t/20)*0.25; if(--e.shootT<=0&&h.shrinkT===0){ e.shootT=ri(S,100,150); shoot(S,e.x,e.y+6,h.x,h.y-18,2.6,'rocket',EN.heli.dmg); }
      if(--e.life<=0){ e.x+=e.dir*1.5; if(e.x<-30||e.x>W+30) e.alive=false; } }
  }
  S.ens=S.ens.filter(e=>e.alive||e.t<2);
  /* 탄 */
  const hb=heroBox(h);
  for(const s of S.shots){ s.x+=s.vx; s.y+=s.vy; s.t++;
    if(s.x<-8||s.x>W+8||s.y<-8||s.y>GROUND+2){ s.dead=true; continue; }
    if(h.shrinkT===0&&s.x>hb.x&&s.x<hb.x+hb.w&&s.y>hb.y&&s.y<hb.y+hb.h){ s.dead=true; hurt(S,s.dmg,s.kind); addFx(S,'spark',s.x,s.y,0); continue; }
    /* 건물에 박히면 창이 깨진다 */
    const b=buildAt(S,s.x); if(b&&s.y>topY(b)&&s.kind!=='bullet'&&s.t>20){ const at=cellAt(b,s.x,s.y); if(at&&at.cell.hp>0){ at.cell.hp-=1; if(at.cell.hp<=0){ at.cell.hp=0; b.holes++; const total=b.floors*COLS; if(b.holes>=Math.ceil(total*0.5)) collapse(S,b); } } s.dead=true; addFx(S,'spark',s.x,s.y,0); }
  }
  S.shots=S.shots.filter(s=>!s.dead);
  for(const x of S.fx){ x.t++; if(x.k==='chunk'||x.k==='glass'){ if(x.y<GROUND-1||x.vy<0){ x.vy+=x.k==='glass'?0.18:0.25; x.x+=x.vx; x.y+=x.vy; if(x.y>=GROUND-1){ x.y=GROUND-1; if(x.vy>1.2&&x.k==='chunk'){ x.vy=-x.vy*0.3; x.vx*=0.5; } else { x.vy=0; x.vx=0; } } } } }
  S.fx=S.fx.filter(x=>x.t<(x.k==='boom'?30:x.k==='quake'?20:x.k==='cloud'?44:(x.k==='chunk'||x.k==='glass')?x.life:18));
}
function shoot(S,x,y,tx,ty,spd,kind,dmg){ const dx=tx-x, dy=ty-y, L=Math.hypot(dx,dy)||1; S.shots.push({x,y,vx:dx/L*spd,vy:dy/L*spd,kind,dmg,t:0}); S.events.push({t:'shot',kind}); }

/* 손가락·마우스로 찍은 자리로 가는 자동 조종: 찍은 곳이 괴물 자신이면 주먹, 건물이면 가까운 옆벽으로 걸어가 오른다.
   매달린 채 옆 건물을 찍으면 그쪽을 보고 뛰어 건너고, 지붕 위를 찍으면 꼭대기를 넘어 올라선다 */
function autoKeys(S,target,k){
  k.left=k.right=k.up=k.down=false; if(!target) return k;
  const h=S.hero; const dx=target.x-h.x; const tb=buildNear(S,target.x,4);
  const toward=(x)=>{ const d=x-h.x; if(d<0) k.left=true; else k.right=true; };
  if(h.state==='ground'){
    if(tb&&target.y<GROUND-12){ const side=target.x<tb.x+tb.w/2?-1:1; const ex=tb.x+(side>0?tb.w:0); if(Math.abs(h.x-ex)<=3) k.up=true; else toward(ex); }
    else if(Math.abs(dx)>4) toward(target.x); else target.done=true; }
  else if(h.state==='climb'){ const b=S.builds[h.bld];
    if(target.y>=GROUND-8){ k.down=true; }
    else if(tb&&tb.i===b.i){ if(target.y<topY(b)-2) k.up=true; else { const dy=target.y-(h.y-HAND); if(Math.abs(dy)>4){ if(dy<0) k.up=true; else k.down=true; } else { if(h.dir!==-h.side){ if(h.side>0) k.left=true; else k.right=true; } target.done=true; } } }
    else if(tb&&tb.i===b.i+h.side){ /* 바로 옆 건물: 그쪽을 보고 뛴다 */ if(h.dir!==h.side){ if(h.side>0) k.right=true; else k.left=true; } else k.jumpPressed=true; }
    else { k.down=true; /* 먼 건물·빈터: 내려가서 걷는다 */ } }
  else if(h.state==='roof'){ const b=S.builds[h.bld];
    if(tb&&tb.i===b.i&&target.y>topY(b)+4){ const side=target.x<b.x+b.w/2?-1:1; const ex=b.x+(side>0?b.w:0); if(Math.abs(h.x-ex)<=4) k.down=true; else toward(ex); }
    else if(Math.abs(dx)>4) toward(target.x); else target.done=true; }
  else if(h.hang>1.5){ if(Math.abs(dx)>6) toward(target.x); }
  return k;
}

root.Engine={W,H,GROUND,FLOOR,BW,GAP,SLOT,COLS,CELL_W,HAND,MAX_STAM,DRAIN_EVERY,EAT_KINDS,FORMS,CITIES,EN,SCORE,newGame,loadCity,nextCity,step,autoKeys,form,cityOf,topY,buildAt,buildNear,wallNear,cellAt,heroBox,rng,WALL_TOP};
})(typeof window!=='undefined'?window:module.exports);
