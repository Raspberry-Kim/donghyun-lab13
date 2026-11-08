/* 동현램 그림: 다섯 괴물·사람·군인·차·전차·헬기를 모두 코드로 새로 그린다. 원작 게임의 그림은 한 점도 쓰지 않는다.
   괴물은 부위(머리·몸·팔·다리·꼬리)를 자세에 따라 조립해 그린다. 다섯 괴물의 몸 비율은 일부러 제각각이다:
   포동이(둥근 강아지 괴물) · 슈슈(빨간 글러브의 사람형 복서) · 라이언(기생충 같은 긴 분홍 선충) · 꼬리콥터(작은 강아지+청록 꼬리 날개) · 둠가이(크고 무거운 초록 갑옷).
   먹는 동작은 네 가지(gulp 꿀꺽 · chew 우적우적 · toss 던져 받아먹기 · smoke 식후 담배 한 모금)로 크게 과장한다. */
(function(root){
'use strict';
const C={
  line:'#2e2a38', eye:'#ffffff', pupil:'#1a1620', tongue:'#e2576a', mouth:'#5a1c2a', teeth:'#fff8ea',
  skin:'#efc7a6', skin2:'#d48a78', hair:'#63483a', hair2:'#4b382e', glove:'#cf6157', glove2:'#ef9a8b', short:'#3b3b55',
  fur:'#f6ecd6', fur2:'#c9aa78', collar:'#d6403a', ear:'#ffffff',
  worm:'#f0a3a3', worm2:'#d97b86', worm3:'#87546a', worm4:'#ffd2d2',
  cop:'#2bb0c8', cop2:'#1b7f93', cop3:'#fbfdfd',
  armor:'#5a8f3a', armor2:'#6fb04a', armor3:'#3d6a26', helm:'#8d919c', helm2:'#c7c9d1', visor:'#1b2430', boot:'#6b4a2e',
  smoke:'rgba(230,230,240,.85)', cig:'#f4f0e6', ember:'#ff7a3a',
  person:'#efc7a6', pshirt:['#3a78e8','#e5483a','#f2b705','#5fb44a','#c98fd2'], ppants:'#2a2a3a',
  soldier:'#4e6b3a', soldier2:'#2f4523', rifle:'#2a2a2a',
  copcar:'#f4f6f8', copcar2:'#1c2a44', light:'#3a78e8', light2:'#ff5a5a', taxi:'#f2c230', taxi2:'#1a1a1a', glass:'#9fd3ea', wheel:'#1a1a1a',
  tank:'#5b6b3e', tank2:'#3f4b2a', tank3:'#8a9a6a', heli:'#8d919c', heli2:'#5d5b53', heli3:'#c7c9d1', rotor:'#2a2a2a',
  bullet:'#ffe27a', shell:'#444', rocket:'#e5483a', fire:'#ff9f3a', dust:'#cfc3ad', dust2:'#9a8f7c', spark:'#ffd36a', boom:'#ff7a3a', boom2:'#ffd36a'
};
function px(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),w,h); }
/* 굵은 선: 사각 붓으로 점을 찍어 이어 준다(관절 하나짜리 팔다리) */
function limb(g,x0,y0,x1,y1,w,c,o){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0; const r=Math.floor(w/2);
  if(o){ for(let i=0;i<=n;i++){ const t=n?i/n:0; px(g,x0+(x1-x0)*t-r-1,y0+(y1-y0)*t-r-1,w+2,w+2,o); } }
  for(let i=0;i<=n;i++){ const t=n?i/n:0; px(g,x0+(x1-x0)*t-r,y0+(y1-y0)*t-r,w,w,c); } }
/* 둥근 덩어리: 원을 가로줄로 채운다 */
function blob(g,cx,cy,rx,ry,c,o){ if(o) blobRaw(g,cx,cy,rx+1,ry+1,o); blobRaw(g,cx,cy,rx,ry,c); }
function blobRaw(g,cx,cy,rx,ry,c){ for(let y=-ry;y<=ry;y++){ const t=y/(ry+0.5); const w=Math.round(rx*Math.sqrt(Math.max(0,1-t*t))); px(g,cx-w,cy+y,w*2+1,1,c); } }
function rrect(g,x,y,w,h,c,o){ if(o){ px(g,x-1,y,w+2,h,o); px(g,x,y-1,w,h+2,o); } px(g,x,y,w,h,c); }

/* ---------- 작은 사람(창문 안·길·괴물 손 안) ---------- */
function person(g,x,y,f,wave,c){ /* 발 기준 x,y · 높이 8 */
  const sh=C.pshirt[(c||0)%C.pshirt.length];
  px(g,x-1,y-8,3,3,C.person); px(g,x-1,y-9,3,1,C.hair); px(g,x-1,y-5,3,3,sh); px(g,x-1,y-2,1,2,C.ppants); px(g,x+1,y-2,1,2,C.ppants);
  if(wave){ const u=(f>>3)&1; px(g,x-2,y-7-u,1,2,C.person); px(g,x+3,y-6+u,1,2,C.person); } else { px(g,x-2,y-5,1,2,C.person); px(g,x+3,y-5,1,2,C.person); }
}

/* ---------- 괴물 ---------- */
/* 자세 계산: 상태와 프레임으로 부위 위치를 만든다. 오른쪽 보기 기준(dir=1), 발 중심이 (0,0), 위가 음수.
   괴물마다 키(HGT)가 달라 어깨 높이 sh·입 높이 my를 키에서 구하고, 손 위치는 A(dx,dy)=어깨에서 dx 옆·dy 아래로 적는다 */
/* 키(발에서 머리 꼭대기까지). 원작 괴물처럼 두 층 남짓: 어깨가 넓고 팔이 길며 다리가 짧은, 땅딸막한 비율 */
const HGT={podong:30,shushu:30,lion:33,copter:25,doom:33};
/* 주먹 팔: 방향키대로 앞·위·아래로 뻗는다 */
function punchArm(A,h,ext,len){ const pd=h.pdy||0; if(pd<0) return A(4+Math.round(ext*8),2-Math.round(ext*22)); if(pd>0) return A(4+Math.round(ext*8),4+Math.round(ext*14)); return A(6+Math.round(ext*len),2-Math.round(ext*4)); }

function poseOf(h,t,f){
  const HG=HGT[f.key]||36, sh=-Math.round(HG*0.67), my=-(HG-4);
  const A=(dx,dy)=>[dx,sh+dy];
  const P={arm:[A(5,14),A(-5,14)],leg:[[3,0],[-3,0]],body:0,head:0,mouth:0,eyes:'open',item:null,back:false,extra:[],lean:0,sh,my,HG};
  const walk=Math.sin(t/4), w2=Math.sin(t/4+Math.PI);
  if(h.shrinkT>0) return P;
  if(h.state==='sit'){ /* 무너진 건물과 함께 떨어져 주저앉음: 몸이 내려앉고 다리는 앞으로, 손은 바닥, 눈은 빙글 */
    P.sit=true; P.body=5; P.leg=[[9,0],[-7,0]]; P.arm=[A(10,15),A(-9,15)]; P.eyes='x'; P.mouth=0.5; P.head=1; P.extra.push({k:'stars',a:0.5}); return P; }
  if(h.state==='ride'){ /* 무너지는 건물에 매달려 내려가는 중: 두 손으로 꽉 잡고 눈이 커진다 */
    const inw=-(h.side||1)*(h.dir||1); P.arm=[A(inw*8,-13),A(inw*6,-9)]; P.leg=[[inw*4,-3],[inw*1,-1]]; P.lean=inw*2; P.eyes='wide'; P.mouth=0.7; P.head=-1; return P; }
  if(h.state==='climb'){ /* 옆벽에 붙어 오른다: 몸은 바라보는 쪽, 두 손은 벽 모서리를 번갈아 잡는다 */
    const c=Math.floor(h.climbT/8)%2; const inw=-(h.side||1)*(h.dir||1); /* 바라보는 기준으로 벽이 있는 쪽(+1 앞, -1 뒤) */
    P.arm=[A(inw*8,c?-14:-6),A(inw*5,c?-6:-14)]; P.leg=[[inw*4,c?-4:0],[inw*1,c?0:-4]]; P.lean=inw*2;
    if(h.punchT>0){ const k=1-h.punchT/16; const ext=k<0.6?k/0.6:1-(k-0.6)/0.4*0.4; P.arm=[punchArm(A,h,ext,(h.pdx||h.dir)===h.side?34:20),A(inw>0?-6:6,-8)]; /* 옆 건물 쪽은 골목 너머까지 팔을 뻗는다 */ P.mouth=0.4; P.leg=[[inw*4,-2],[inw*1,0]]; P.lean=0; }
  } else if(h.state==='air'){ const fly=h.hang>1.5; P.arm=fly?[A(9,-6),A(-9,-6)]:[A(8,-8),A(-6,0)]; P.leg=fly?[[3,2],[-3,2]]:[[5,-3],[-4,1]]; P.mouth=0.3; P.eyes=fly?'open':'wide'; }
  else { /* 땅 */
    if(h.punchT>0){ const k=1-h.punchT/16; const ext=k<0.5?k/0.5:1-(k-0.5)/0.5*0.5; P.arm=[punchArm(A,h,ext,22),A(-6,10)]; P.lean=h.pdy?0:Math.round(ext*3); P.mouth=0.6; P.leg=[[5,0],[-4,0]]; }
    else if(h.walkT>0){ P.leg=[[Math.round(3+walk*4),0],[Math.round(-3+w2*4),0]]; P.arm=[A(Math.round(4+w2*4),13),A(Math.round(-4+walk*4),13)]; P.body=Math.abs(walk)>0.7?-1:0; }
    else { P.arm=[A(5,14),A(-5,14)]; P.body=(t>>4)&1?0:-1; }
  }
  if(h.hurtT>0&&h.eatT<=0){ P.eyes='x'; P.mouth=0.8; P.arm=[A(9,-6),A(-9,-6)]; P.back=false; }
  if(h.eatT>0) eatPose(P,h,t,A);
  return P;
}
/* 먹는 동작 네 가지. eatT는 남은 시간이라 진행도 k=1-eatT/총길이. 손 안의 사람은 발이 손 위치에 온다 */
function eatPose(P,h,t,A){
  P.back=false; const kind=h.eatKind||'gulp'; const tot=kind==='smoke'?70:kind==='toss'?54:kind==='chew'?48:36; const k=1-h.eatT/tot; const my=P.my;
  P.leg=[[4,0],[-4,0]]; P.arm=[A(6,12),A(-6,12)]; P.mouthBoost=1.7; P.sx=1; P.sy=1; /* 먹을 때는 입이 크고 몸이 늘었다 줄었다 한다(과장) */
  const hold=(dx,dy)=>{ P.arm[0]=A(dx,dy); P.item={kind:'person',x:P.arm[0][0],y:P.arm[0][1]-2,fl:1,wave:1}; };
  const squash=(a)=>{ const q=Math.sin(a*Math.PI); P.sy=1-q*0.18; P.sx=1+q*0.16; }; const stretch=(a)=>{ const q=Math.sin(a*Math.PI); P.sy=1+q*0.14; P.sx=1-q*0.08; };
  if(kind==='gulp'){ /* 사람을 머리 위로 번쩍 들었다가 벌린 입에 떨어뜨리고 목이 불룩하게 삼킨다 */
    if(k<0.35){ const a=k/0.35; hold(Math.round(10-a*4),Math.round(10-a*38)); P.mouth=0.3+a*0.7; P.head=-1; P.eyes='wide'; stretch(a); P.lean=-Math.round(a*3); }
    else if(k<0.6){ const a=(k-0.35)/0.25; P.arm=[A(12,-20),A(-12,-20)]; P.mouth=1; P.item={kind:'person',x:9,y:Math.round(my-14+a*18),fl:1,spin:Math.floor(a*4)}; P.eyes='wide'; P.head=-2; P.sy=1.14; P.sx=0.94; }
    else { const a=(k-0.6)/0.4; P.mouth=0; P.eyes=a<0.6?'closed':'happy'; P.extra.push({k:'gulp',a}); squash(Math.min(1,a*1.4)); P.arm=[A(7,10),A(-7,10)]; if(a>0.6){ P.extra.push({k:'heart'}); P.extra.push({k:'stars',a:(a-0.6)/0.4}); } }
  } else if(kind==='chew'){ /* 입에 물고 우적우적 세 번 씹는다. 부스러기가 튄다 */
    if(k<0.2){ const a=k/0.2; hold(Math.round(10-a*2),Math.round(10-a*24)); P.mouth=0.6+a*0.4; P.eyes='wide'; stretch(a*0.8); }
    else if(k<0.85){ const a=(k-0.2)/0.65; const ch=Math.sin(a*Math.PI*4); const q=Math.max(0,ch); P.mouth=q; P.head=ch>0?2:-1; P.lean=ch>0?2:-2; P.eyes=ch>0.5?'closed':'wide'; P.extra.push({k:'crumb',a}); P.arm=[A(9,6-Math.round(q*4)),A(-9,8-Math.round(q*4))]; P.sy=1-q*0.14; P.sx=1+q*0.14; if(a<0.5) P.item={kind:'legs',x:11,y:my-1,fl:1,kick:1}; }
    else { const a=(k-0.85)/0.15; P.eyes='happy'; P.extra.push({k:'heart'}); P.extra.push({k:'stars',a}); P.body=-1; }
  } else if(kind==='toss'){ /* 하늘로 휙 던져 올리고 입을 쩍 벌려 받아먹는다 */
    if(k<0.25){ const a=k/0.25; hold(Math.round(8+a*2),Math.round(12-a*40)); P.mouth=0.2+a*0.3; if(a<0.5) squash(a*2); else stretch((a-0.5)*2); P.lean=Math.round((0.5-a)*4); }
    else if(k<0.7){ const a=(k-0.25)/0.45; const top=my-44; const fy=a<0.5?(my-28)-(Math.sin(a*Math.PI))*18:(top+10)+(a-0.5)*2*((my-6)-(top+10)); P.item={kind:'person',x:Math.round(11-a*3),y:Math.round(fy),fl:1,spin:Math.floor(a*12),wave:1}; P.mouth=0.3+a*0.7; P.head=-3; P.eyes='wide'; P.arm=[A(12,-14),A(-12,-14)]; P.sy=1.1; P.sx=0.95; P.lean=-2; }
    else { const a=(k-0.7)/0.3; P.mouth=a<0.2?1:0; P.eyes=a<0.5?'closed':'happy'; P.extra.push({k:'snap',a}); squash(Math.min(1,a*1.3)); if(a>0.5){ P.extra.push({k:'heart'}); P.extra.push({k:'stars',a:(a-0.5)*2}); } P.arm=[A(7,10),A(-7,10)]; }
  } else { /* smoke: 급히 꿀꺽 삼키고, 담배를 물고 한 모금. 연기 고리가 올라간다 */
    if(k<0.2){ const a=k/0.2; hold(Math.round(10-a*4),Math.round(10-a*36)); P.mouth=0.9+a*0.1; P.eyes='wide'; stretch(a); }
    else if(k<0.3){ const a=(k-0.2)/0.1; P.mouth=0; P.eyes='closed'; P.extra.push({k:'gulp',a}); squash(a); }
    else { const a=(k-0.3)/0.7; P.eyes='half'; P.arm[0]=A(11,my-P.sh+2); P.item={kind:'cig',x:12,y:my+1}; P.mouth=0.15; P.lean=-2; const br=Math.sin(a*Math.PI*2); P.sy=1+br*0.04; P.sx=1-br*0.02; P.head=br>0?-1:0; P.extra.push({k:'smoke',a}); if(a>0.3) P.extra.push({k:'ring',a:(a-0.3)/0.7}); if(a>0.5) P.extra.push({k:'ring',a:(a-0.5)/0.5}); }
  }
}

/* 공통 장식: 손 안의 사람·담배, 연기·부스러기·하트. 위치는 입 높이 my 기준 */
function items(g,P,t){
  const my=P.my;
  for(const e of P.extra){
    if(e.k==='smoke'){ for(let i=0;i<4;i++){ const a=(e.a*3+i*0.25)%1; const y=my-4-a*30, x=17+Math.sin(a*6+i)*4+a*5; const r=2+Math.round(a*4); g.fillStyle='rgba(236,236,246,'+(0.9-a*0.7)+')'; g.beginPath(); g.ellipse(x,y,r,r*0.8,0,0,Math.PI*2); g.fill(); if(a<0.5){ g.fillStyle='rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(x-1,y-1,r*0.5,r*0.4,0,0,Math.PI*2); g.fill(); } } }
    else if(e.k==='stars'){ const a=e.a; for(let i=0;i<4;i++){ const ang=t/6+i*Math.PI/2; const r=10+a*6; const x=Math.cos(ang)*r, y=my-6+Math.sin(ang)*r*0.5-a*4; px(g,x-1,y,3,1,C.spark); px(g,x,y-1,1,3,C.spark); } }
    else if(e.k==='ring'){ const a=e.a; const y=my-12-a*26, r=2+Math.round(a*6); g.strokeStyle='rgba(235,235,245,'+(1-a*0.8)+')'; g.lineWidth=1.5; g.beginPath(); g.ellipse(15+a*4,y,r,r*0.6,0,0,Math.PI*2); g.stroke(); }
    else if(e.k==='crumb'){ const a=e.a; for(let i=0;i<7;i++){ const ph=(a*4+i*0.14)%1; const dir=i%2?1:-1; px(g,13+i*2+dir*ph*9,my-ph*12+ph*ph*20,1+(i%3===0?1:0),1+(i%3===0?1:0),i%2?C.person:C.pshirt[i%5]); } }
    else if(e.k==='heart'){ const bob=Math.sin(t/4)*1; const y=my-14+bob; px(g,-9,y,2,2,C.glove); px(g,-6,y,2,2,C.glove); px(g,-9,y+2,5,2,C.glove); px(g,-8,y+4,3,1,C.glove); px(g,-7,y+5,1,1,C.glove); }
    else if(e.k==='snap'&&e.a<0.3){ px(g,16,my-4,6,1,C.spark); px(g,18,my,5,1,C.spark); px(g,17,my-8,4,1,C.spark); }
    else if(e.k==='gulp'){ const a=e.a; if(a<0.7){ const y=my+6+a*14; blob(g,1,y,4,3,'rgba(255,255,255,.35)'); } }
  }
  if(P.item){ const it=P.item; if(it.kind==='person'){ g.save(); g.translate(it.x,it.y); g.scale(2,2); if(it.spin) g.rotate(it.spin*Math.PI/6); person(g,0,0,t*2,1,3); g.restore(); }
    else if(it.kind==='legs'){ const kk=it.kick?((t>>1)&1?1:-1):0; px(g,it.x,it.y-1,2,5,C.ppants); px(g,it.x+3,it.y-1+kk,2,5,C.ppants); px(g,it.x-1,it.y-2,7,2,C.pshirt[3]); px(g,it.x,it.y+4,2,1,C.line); px(g,it.x+3,it.y+4+kk,2,1,C.line); }
    else if(it.kind==='cig'){ px(g,it.x,it.y,6,1,C.cig); px(g,it.x+6,it.y,1,1,((t>>2)&1)?C.ember:C.glove); } }
}
function face(g,P,cx,cy,fw,opts){ /* 눈·입: 중심 cx,cy(얼굴 중앙) · fw 얼굴 폭 · opts.muzzle 주둥이 여부 */
  const ex=cx+Math.round(fw*0.2), ey=cy-2;
  if(P.eyes==='closed'){ px(g,ex-1,ey,4,1,C.line); } else if(P.eyes==='happy'){ px(g,ex-1,ey,1,1,C.line); px(g,ex,ey-1,2,1,C.line); px(g,ex+2,ey,1,1,C.line); }
  else if(P.eyes==='x'){ px(g,ex-1,ey-1,1,1,C.line); px(g,ex+1,ey-1,1,1,C.line); px(g,ex,ey,1,1,C.line); px(g,ex-1,ey+1,1,1,C.line); px(g,ex+1,ey+1,1,1,C.line); }
  else if(P.eyes==='half'){ px(g,ex-1,ey-1,4,2,C.eye); px(g,ex-1,ey-1,4,1,C.line); px(g,ex+1,ey,1,1,C.pupil); }
  else { const big=P.eyes==='wide'; px(g,ex-1,ey-1-(big?1:0),3+(big?1:0),3+(big?1:0),C.eye); px(g,ex+(big?1:0),ey,1+(big?1:0),1+(big?1:0),C.pupil); }
  const mh=Math.round(P.mouth*(opts.bigMouth||6)*(P.mouthBoost||1)); const mx=cx+Math.round(fw*0.3)+(opts.mdx||0), my=cy+(opts.mdy||3);
  if(mh>0){ px(g,mx-2,my,opts.mw||7,mh,C.mouth); if(mh>2) px(g,mx-2,my,opts.mw||7,1,C.teeth); if(mh>3) px(g,mx-1,my+mh-1,(opts.mw||7)-3,1,C.tongue); } else px(g,mx-1,my,opts.mw?opts.mw-2:5,1,C.line);
}

/* 포동이: 고릴라 몸에 강아지 얼굴. 넓은 어깨·긴 팔·짧은 다리, 목 없이 머리가 어깨에 얹힌다. 높이 30(귀까지 36) */
function podong(g,P,t){
  const up=P.body, L=C.line, legs=P.leg, arms=P.arm; const FUR=C.fur, FUR2=C.fur2, FUR3='#fdf7ea';
  const hand=(x,y,front)=>{ blob(g,x,y,4,3,front?FUR:FUR2,L); px(g,x-2,y+1,1,1,L); px(g,x,y+1,1,1,L); px(g,x+2,y+1,1,1,L); };
  const foot=(x,y,front)=>{ px(g,x-4,y-2,8,2,front?FUR2:'#b8955f'); px(g,x-4,y-1,8,1,L); px(g,x-3,y-2,1,1,L); px(g,x,y-2,1,1,L); };
  if(P.back){ /* 뒷모습: 넓은 등·등 무늬·꼬리·양옆 귀 */
    limb(g,-5,-9+up,legs[1][0],legs[1][1]-1,6,FUR,L); limb(g,5,-9+up,legs[0][0],legs[0][1]-1,6,FUR,L); foot(legs[1][0],0,0); foot(legs[0][0],0,0);
    blob(g,0,-15+up,10,8,FUR,L); blob(g,0,-17+up,7,5,FUR2); blob(g,-11,-13+up,3,3,FUR,L); px(g,-12,-16+up,2,2,FUR);
    limb(g,-8,-20+up,arms[1][0],arms[1][1]+up,5,FUR,L); limb(g,8,-20+up,arms[0][0],arms[0][1]+up,5,FUR,L); hand(arms[1][0],arms[1][1]+up,0); hand(arms[0][0],arms[0][1]+up,0);
    px(g,-6,-23+up,12,2,C.collar); blob(g,0,-28+up,8,5,FUR,L); px(g,-8,-36+up,3,5,C.ear,L); px(g,5,-36+up,3,5,C.ear,L); px(g,-8,-36+up,3,5,C.ear); px(g,5,-36+up,3,5,C.ear); return; }
  /* 옆모습(오른쪽 보기): 뒤쪽 팔다리 → 몸 → 앞 다리 → 목걸이 → 머리 → 앞 팔 순서 */
  blob(g,-11,-18+up,3,3,FUR,L); px(g,-12,-21+up,2,2,FUR); /* 말린 꼬리 */
  limb(g,-5,-9+up,legs[1][0],legs[1][1]-1,6,FUR2,L); foot(legs[1][0],0,0);
  limb(g,-6,-20+up,arms[1][0]-1,arms[1][1]+up,5,FUR2,L); hand(arms[1][0]-1,arms[1][1]+up,0);
  blob(g,P.lean,-15+up,10,8,FUR,L); blob(g,3+P.lean,-12+up,6,4,FUR3); px(g,-9+P.lean,-17+up,1,5,FUR2); /* 몸통·배·등선 */
  limb(g,4,-9+up,legs[0][0],legs[0][1]-1,6,FUR,L); foot(legs[0][0],0,1);
  px(g,-5+P.lean,-24+up,13,3,C.collar); px(g,-5+P.lean,-22+up,13,1,'#a8302c'); px(g,3+P.lean,-21+up,2,2,'#f2b705'); /* 목걸이와 이름표 */
  const hx=3+P.lean, hy=-28+up+P.head; blob(g,hx,hy,8,5,FUR,L); blob(g,hx-2,hy-3,5,2,FUR3); blob(g,hx+7,hy+1,3,2,FUR,L); px(g,hx+9,hy,2,2,L); px(g,hx+9,hy,1,1,'#4a4454'); /* 머리·이마 빛·주둥이·코 */
  px(g,hx-7,hy-9,3,5,C.ear,L); px(g,hx-7,hy-9,3,5,C.ear); px(g,hx-6,hy-8,1,3,'#f3c9c9'); px(g,hx+2,hy-10,3,5,C.ear,L); px(g,hx+2,hy-10,3,5,C.ear); px(g,hx+3,hy-9,1,3,'#f3c9c9');
  face(g,P,hx,hy,8,{bigMouth:6,mdy:3,mdx:1,mw:6});
  limb(g,6,-20+up,arms[0][0]+1,arms[0][1]+up,5,FUR,L); hand(arms[0][0]+1,arms[0][1]+up,1);
  items(g,P,t);
}
/* 슈슈: 늑대인간처럼 구부정하고 넓은 몸에 사람 얼굴(갈색 단발). 빨간 민소매와 큰 글러브. 높이 30(머리카락까지 35) */
function shushu(g,P,t){
  const up=P.body, L=C.line, legs=P.leg, arms=P.arm;
  const glove=(x,y)=>{ blob(g,x,y,4,3,C.glove,L); px(g,x-2,y-2,3,1,C.glove2); px(g,x-4,y+1,2,2,'#a8302c'); };
  const shoe=(x,y)=>{ px(g,x-3,y-2,7,2,C.hair2); px(g,x-3,y-1,7,1,L); px(g,x+1,y-2,2,1,'#fff'); };
  if(P.back){ limb(g,-4,-9+up,legs[1][0],legs[1][1]-1,5,C.skin,L); limb(g,4,-9+up,legs[0][0],legs[0][1]-1,5,C.skin,L); shoe(legs[1][0],0); shoe(legs[0][0],0);
    blob(g,0,-15+up,9,8,C.skin,L); px(g,-8,-22+up,16,8,C.glove); px(g,-4,-21+up,8,1,C.glove2); px(g,-7,-10+up,14,4,C.short);
    limb(g,-8,-21+up,arms[1][0],arms[1][1]+up,4,C.skin,L); limb(g,8,-21+up,arms[0][0],arms[0][1]+up,4,C.skin,L); glove(arms[1][0],arms[1][1]+up); glove(arms[0][0],arms[0][1]+up);
    blob(g,0,-28+up,7,5,C.hair,L); px(g,-7,-34+up,14,5,C.hair); px(g,-7,-30+up,3,7,C.hair); px(g,4,-30+up,3,7,C.hair); px(g,-4,-35+up,6,1,'#7a5a48'); return; }
  limb(g,-4,-9+up,legs[1][0],legs[1][1]-1,5,C.skin2,L); shoe(legs[1][0],0);
  limb(g,-6,-21+up,arms[1][0]-1,arms[1][1]+up,4,C.skin2,L); glove(arms[1][0]-1,arms[1][1]+up);
  blob(g,P.lean,-15+up,9,8,C.skin,L); px(g,-8+P.lean,-22+up,16,8,C.glove); px(g,-8+P.lean,-15+up,16,1,'#a8302c'); px(g,-4+P.lean,-21+up,7,2,C.glove2); px(g,-7+P.lean,-10+up,14,4,C.short); px(g,-7+P.lean,-10+up,14,1,'#5a5a7a'); /* 몸통·민소매·반바지 */
  limb(g,4,-9+up,legs[0][0],legs[0][1]-1,5,C.skin,L); shoe(legs[0][0],0);
  const hx=3+P.lean, hy=-28+up+P.head; blob(g,hx,hy,7,5,C.skin,L); px(g,hx-7,hy-7,14,4,C.hair,L); px(g,hx-7,hy-7,14,4,C.hair); px(g,hx-7,hy-4,3,7,C.hair); px(g,hx-8,hy-5,2,4,C.hair2); px(g,hx+2,hy-5,5,2,C.hair2); px(g,hx-4,hy-8,6,1,'#7a5a48'); px(g,hx+6,hy-4,2,2,C.hair); /* 단발머리·앞머리 */
  px(g,hx+1,hy-1,1,1,'#e2576a'); /* 볼터치 */ face(g,P,hx,hy,6,{bigMouth:6,mdy:2,mdx:0,mw:6});
  limb(g,6,-21+up,arms[0][0]+1,arms[0][1]+up,4,C.skin,L); glove(arms[0][0]+1,arms[0][1]+up);
  items(g,P,t);
}
/* 라이언: 기생충에 가까운 긴 분홍 선충. 다리가 없고 몸을 꿈틀거리며 간다. 높이 40 */
function lion(g,P,t,h){
  const L=C.line; const wig=h.state==='ground'&&h.walkT>0?Math.sin(t/3)*2:0; const stretch=P.body;
  if(P.back){ /* 벽에 붙은 몸: 세로로 긴 몸통, 꼬리는 아래로 늘어진다 */
    for(let i=0;i<8;i++){ const y=-4-i*3.5+stretch, w=i>5?6:8; blob(g,Math.round(Math.sin(i*0.9+t/10)*1.5),y,w,3,(i%2)?C.worm2:C.worm,L); }
    limb(g,-6,-26,P.arm[1][0],P.arm[1][1],3,C.worm,L); limb(g,6,-26,P.arm[0][0],P.arm[0][1],3,C.worm,L); blob(g,P.arm[1][0],P.arm[1][1],2,2,C.worm2,L); blob(g,P.arm[0][0],P.arm[0][1],2,2,C.worm2,L);
    blob(g,0,-33+stretch,6,5,C.worm,L); px(g,-2,-35+stretch,4,2,C.worm2); return; }
  /* 꼬리: 뒤쪽 바닥에 S자로 깔린다 */
  for(let i=0;i<6;i++){ const x=-8-i*3, y=-3-Math.sin(i*0.8+t/9)*2; blob(g,x,y,3,2,(i%2)?C.worm2:C.worm,L); }
  /* 몸통: 둥근 마디가 위로 갈수록 가늘어진다 */
  const segs=[[0,-4,8],[1,-9,8],[2,-14,7],[3,-19,7],[4,-24,6],[4,-28,6]];
  for(let i=0;i<segs.length;i++){ const s=segs[i]; const x=Math.round(s[0]+wig*(i/6)+P.lean*(i/6)), y=s[1]+stretch*(i/6); blob(g,x,y,s[2],4,(i%2)?C.worm:C.worm2,L); if(i%2) px(g,x-2,y-1,4,1,C.worm4); }
  /* 팔: 짧고 가늘지만 뻗으면 멀리 간다 */
  limb(g,-3+P.lean,-21,P.arm[1][0],P.arm[1][1],2,C.worm3,L); blob(g,P.arm[1][0],P.arm[1][1],2,2,C.worm3,L);
  /* 머리: 고리 모양 입(기생충의 구강)·작은 눈점 */
  const hx=4+P.lean, hy=-32+stretch+P.head; blob(g,hx,hy,6,5,C.worm,L); blob(g,hx+6,hy+1,3,3,C.worm2,L);
  const mo=Math.round(P.mouth*4); g.strokeStyle=C.worm3; g.lineWidth=1; for(let r=1;r<=2+mo;r++){ g.beginPath(); g.ellipse(hx+8,hy+1,r,r*0.9,0,0,Math.PI*2); g.stroke(); } if(mo>1){ px(g,hx+7,hy,3,3,C.mouth); px(g,hx+8,hy+2,1,1,C.tongue); }
  px(g,hx+1,hy-2,1,1,P.eyes==='closed'||P.eyes==='happy'?C.worm3:C.pupil); px(g,hx+3,hy-3,1,1,P.eyes==='closed'||P.eyes==='happy'?C.worm3:C.pupil); if(P.eyes==='x'){ px(g,hx,hy-3,3,1,C.line); }
  limb(g,3+P.lean,-21,P.arm[0][0],P.arm[0][1],2,C.worm3,L); blob(g,P.arm[0][0],P.arm[0][1],2,2,C.worm3,L);
  items(g,P,t);
}
/* 꼬리콥터: 작은 흰 강아지. 땅딸막하고 꼬리 끝의 청록 날개가 돈다. 높이 25 */
function copter(g,P,t,h){
  const up=P.body, L=C.line, legs=P.leg, arms=P.arm; const fast=h.state==='air'; const ph=fast?(t>>0)&3:(t>>2)&3; const bw=[14,9,3,9][ph];
  const rotor=(x,y)=>{ px(g,x,y-5,2,5,C.cop2); px(g,x+1-Math.floor(bw/2),y-6,bw,2,C.cop); px(g,x+1-Math.floor(bw/2),y-6,bw,1,'#7fd6e6'); px(g,x,y-7,2,1,C.cop3); };
  const paw=(x,y)=>{ blob(g,x,y,3,2,C.cop3,L); px(g,x-1,y+1,1,1,L); px(g,x+1,y+1,1,1,L); };
  if(P.back){ limb(g,-4,-6+up,legs[1][0],legs[1][1]-1,4,C.cop3,L); limb(g,4,-6+up,legs[0][0],legs[0][1]-1,4,C.cop3,L);
    blob(g,0,-11+up,9,6,C.cop3,L); px(g,-3,-14+up,6,3,C.fur2); limb(g,-7,-13+up,arms[1][0],arms[1][1]+up,4,C.cop3,L); limb(g,7,-13+up,arms[0][0],arms[0][1]+up,4,C.cop3,L); paw(arms[1][0],arms[1][1]+up); paw(arms[0][0],arms[0][1]+up);
    blob(g,0,-20+up,7,5,C.cop3,L); blob(g,-7,-23+up,2,2,C.cop3,L); blob(g,7,-23+up,2,2,C.cop3,L); rotor(-1,-16+up); return; }
  rotor(-11,-13+up); limb(g,-8,-10+up,-10,-13+up,3,C.cop3,L); /* 꼬리 */
  limb(g,-3,-6+up,legs[1][0],legs[1][1]-1,4,C.fur2,L); px(g,legs[1][0]-2,-2,5,2,'#d9c28f');
  limb(g,-6,-13+up,arms[1][0]-2,arms[1][1]+up-2,3,C.fur2,L); paw(arms[1][0]-2,arms[1][1]+up-2);
  blob(g,0,-10+up,9,6,C.cop3,L); blob(g,-3,-13+up,5,2,'#e6e9ee'); blob(g,3,-8+up,5,3,'#fff');
  limb(g,4,-6+up,legs[0][0],legs[0][1]-1,4,C.cop3,L); px(g,legs[0][0]-2,-2,5,2,C.fur2);
  px(g,-2,-16+up,10,2,C.cop); px(g,3,-15+up,2,1,'#f2b705');
  const hx=4+P.lean, hy=-20+up+P.head; blob(g,hx,hy,7,5,C.cop3,L); blob(g,hx+6,hy+1,3,2,C.cop3,L); px(g,hx+8,hy,2,2,L); px(g,hx+8,hy,1,1,'#4a4454');
  blob(g,hx-5,hy-5,2,2,C.cop3,L); blob(g,hx+3,hy-6,2,2,C.cop3,L); px(g,hx-5,hy-5,1,1,'#f3c9c9'); px(g,hx+3,hy-6,1,1,'#f3c9c9'); /* 동그란 귀 */
  face(g,P,hx,hy,6,{bigMouth:6,mdy:2,mdx:1,mw:6});
  limb(g,5,-13+up,arms[0][0]-2,arms[0][1]+up-2,3,C.cop3,L); paw(arms[0][0]-2,arms[0][1]+up-2);
  items(g,P,t);
}
/* 둠가이: 크고 무거운 초록 갑옷, 회색 철모. 어깨가 넓고 다리가 굵고 짧다. 높이 33·폭 26 */
function doom(g,P,t){
  const up=P.body, L=C.line, legs=P.leg, arms=P.arm;
  const fist=(x,y)=>{ rrect(g,x-3,y-3,7,6,C.helm,L); px(g,x-2,y-2,5,1,C.helm2); px(g,x-2,y,1,1,'#6a6e78'); px(g,x,y,1,1,'#6a6e78'); px(g,x+2,y,1,1,'#6a6e78'); };
  const boot=(x,y)=>{ px(g,x-4,y-3,9,3,C.boot); px(g,x-4,y-1,9,1,L); px(g,x-3,y-3,7,1,'#8a6440'); };
  const legW=7;
  if(P.back){ limb(g,-6,-9+up,legs[1][0]-2,legs[1][1]-2,legW,C.armor,L); limb(g,6,-9+up,legs[0][0]+2,legs[0][1]-2,legW,C.armor,L); boot(legs[1][0]-2,0); boot(legs[0][0]+2,0);
    rrect(g,-12,-25+up,24,16,C.armor,L); px(g,-10,-23+up,20,4,C.armor2); px(g,-4,-18+up,8,8,C.armor3); px(g,-12,-25+up,5,4,C.helm); px(g,7,-25+up,5,4,C.helm);
    limb(g,-12,-21+up,arms[1][0]-3,arms[1][1]+up,6,C.armor,L); limb(g,12,-21+up,arms[0][0]+3,arms[0][1]+up,6,C.armor,L); fist(arms[1][0]-3,arms[1][1]+up); fist(arms[0][0]+3,arms[0][1]+up);
    blob(g,0,-30+up,7,6,C.helm,L); px(g,-6,-32+up,12,3,C.helm2); return; }
  limb(g,-6,-9+up,legs[1][0]-1,legs[1][1]-2,legW,C.armor3,L); boot(legs[1][0]-1,0);
  limb(g,-10,-21+up,arms[1][0]-2,arms[1][1]+up,5,C.armor3,L); fist(arms[1][0]-2,arms[1][1]+up);
  limb(g,6,-9+up,legs[0][0]+1,legs[0][1]-2,legW,C.armor,L); boot(legs[0][0]+1,0);
  rrect(g,-11+P.lean,-25+up,22,16,C.armor,L); px(g,-9+P.lean,-23+up,18,5,C.armor2); px(g,-7+P.lean,-17+up,14,7,C.armor3); px(g,-11+P.lean,-25+up,6,4,C.helm); px(g,-10+P.lean,-24+up,4,1,C.helm2); px(g,-3+P.lean,-16+up,5,4,C.ember); px(g,-2+P.lean,-15+up,2,2,'#ffd36a'); px(g,-11+P.lean,-11+up,22,2,C.boot);
  const hx=2+P.lean, hy=-30+up+P.head; blob(g,hx,hy,7,6,C.helm,L); px(g,hx-6,hy-5,12,3,C.helm2); px(g,hx-7,hy-3,14,1,'#a6aab4'); px(g,hx-3,hy-1,10,4,C.visor); /* 철모·면갑 사이로 얼굴 */
  px(g,hx-1,hy,8,3,C.skin); face(g,P,hx+1,hy+1,6,{bigMouth:6,mdy:2,mdx:0,mw:6});
  limb(g,10+P.lean,-21+up,arms[0][0]+2,arms[0][1]+up,5,C.armor,L); fist(arms[0][0]+2,arms[0][1]+up);
  items(g,P,t);
}
/* 작아져 사람으로 돌아간 모습: 두 손으로 가리고 종종걸음 */
function shrunk(g,h,t){ const k=h.shrinkT; const sc=k>90?1-(120-k)/30*0.6:0.4; if(k>90){ g.save(); g.scale(sc,sc); g.globalAlpha=0.6; g.restore(); }
  const f=(t>>2)&1; px(g,-2,-10,5,5,C.skin); px(g,-2,-11,5,1,C.hair); px(g,-2,-5,5,3,C.pshirt[1]); px(g,-2,-2,2,2+f,C.ppants); px(g,1,-2,2,3-f,C.ppants); px(g,-3,-6,1,2,C.skin); px(g,3,-6,1,2,C.skin); px(g,-2,-8,5,2,C.skin); }

const DRAW={podong,shushu,lion,copter,doom};
/* 괴물 한 마리 그리기: form 객체, 상태 h, 시간 t, 발 기준 좌표 (x,y) */
function drawMonster(g,form,h,t,x,y){
  g.save(); g.translate(Math.round(x),Math.round(y));
  if(h.shrinkT>0){ if(h.dir<0) g.scale(-1,1); if(h.shrinkT>96&&((t>>1)&1)){ g.globalAlpha=0.5; } shrunk(g,h,t); g.restore(); return; }
  if(h.hurtT>0&&((t>>1)&1)&&h.eatT<=0) g.globalAlpha=0.55;
  const P=poseOf(h,t,form); if(!P.back&&h.dir<0) g.scale(-1,1); if(P.sx&&P.sy&&(P.sx!==1||P.sy!==1)) g.scale(P.sx,P.sy);
  DRAW[form.key==='podong'?'podong':form.key==='shushu'?'shushu':form.key==='lion'?'lion':form.key==='copter'?'copter':'doom'](g,P,t,h);
  g.restore();
}
/* 표지·머리글용 서 있는 괴물(가짜 상태) */
function drawIdle(g,form,t,x,y,dir){ drawMonster(g,form,{state:'ground',dir:dir||1,punchT:0,eatT:0,hurtT:0,shrinkT:0,walkT:0,climbT:0,hang:form.hang},t,x,y); }

/* ---------- 적 ---------- */
function soldier(g,e,t){ const d=e.dir; g.save(); g.translate(Math.round(e.x),Math.round(e.y)); if(d<0) g.scale(-1,1);
  const f=(t>>3)&1; const L=C.line;
  px(g,-3,-11,7,1,L); px(g,-3,-13,7,3,C.soldier2); px(g,-3,-13,7,1,'#5f7c4a'); /* 철모 */
  px(g,-2,-10,5,3,C.skin); px(g,1,-9,1,1,L); /* 얼굴·눈 */
  px(g,-2,-7,5,4,C.soldier); px(g,-2,-5,5,1,C.soldier2); px(g,-1,-7,1,1,'#7a9a5a'); /* 상의·허리띠 */
  px(g,-2,-3,2,3,C.soldier2); px(g,1,-3+f,2,3-f,C.soldier2); px(g,-2,0,2,1,L); px(g,1,0,2,1,L); /* 바지·군화 */
  px(g,2,-7,6,1,C.rifle); px(g,1,-6,2,1,C.rifle); px(g,6,-8,2,1,C.rifle); px(g,3,-6,1,1,C.skin); g.restore(); }
function car(g,e,t){ const taxi=e.type==='taxi'; g.save(); g.translate(Math.round(e.x),Math.round(e.y)); if(e.dir<0) g.scale(-1,1);
  const L=C.line; const b=taxi?C.taxi:C.copcar, b2=taxi?'#c99a1a':C.copcar2, hi=taxi?'#ffe27a':'#ffffff';
  px(g,-13,-6,26,1,L); px(g,-12,-1,24,1,L); px(g,-13,-5,1,4,L); px(g,12,-5,1,4,L); /* 차체 윤곽 */
  px(g,-12,-5,24,4,b); px(g,-12,-5,24,1,hi); px(g,-12,-2,24,1,b2);
  px(g,-8,-10,15,1,L); px(g,-8,-9,1,3,L); px(g,6,-9,1,3,L); px(g,-7,-9,13,3,b); px(g,-7,-9,13,1,hi); /* 지붕·기둥 */
  px(g,-6,-9,5,3,C.glass); px(g,0,-9,5,3,C.glass); px(g,-6,-9,2,1,'#e4f4fb'); px(g,0,-9,2,1,'#e4f4fb'); px(g,-1,-9,1,3,L);
  if(taxi){ px(g,-3,-12,6,2,C.taxi2); px(g,-2,-12,4,1,'#fff6c9'); for(let i=0;i<12;i++) px(g,-12+i*2,-3,1,1,(i&1)?C.taxi2:'#fff'); }
  else { px(g,-2,-12,6,2,C.copcar2); px(g,-2,-12,2,2,((t>>3)&1)?C.light:C.light2); px(g,2,-12,2,2,((t>>3)&1)?C.light2:C.light); px(g,-12,-4,24,2,C.copcar2); px(g,-5,-5,1,4,C.copcar2); px(g,-3,-4,1,1,'#f2b705'); }
  px(g,-9,-3,5,4,C.wheel); px(g,5,-3,5,4,C.wheel); px(g,-8,-2,3,2,'#8a8d92'); px(g,6,-2,3,2,'#8a8d92'); px(g,-7,-2,1,1,'#c9ccd1'); px(g,7,-2,1,1,'#c9ccd1');
  px(g,11,-5,1,2,'#fff2b0'); px(g,-12,-5,1,2,'#ff5a5a'); /* 전조등·후미등 */ g.restore(); }
function tank(g,e,t){ g.save(); g.translate(Math.round(e.x),Math.round(e.y)); if(e.dir<0) g.scale(-1,1); const L=C.line; const tr=(t>>2)&1;
  px(g,-15,-6,30,6,L); px(g,-14,-5,28,4,C.tank2); for(let i=0;i<7;i++) px(g,-13+i*4+tr,-5,2,1,C.tank3); for(let i=0;i<7;i++) px(g,-13+i*4+(1-tr),-2,2,1,C.tank3); /* 궤도와 도는 쇠판 */
  for(let i=0;i<3;i++){ px(g,-9+i*8,-4,4,2,'#2a3020'); px(g,-8+i*8,-4,2,1,C.tank3); } /* 바퀴 */
  px(g,-13,-10,26,1,L); px(g,-12,-9,24,4,C.tank); px(g,-12,-9,24,1,C.tank3); px(g,-12,-6,24,1,C.tank2); px(g,-13,-9,1,3,L); px(g,12,-9,1,3,L);
  px(g,-7,-14,14,1,L); px(g,-6,-13,12,4,C.tank); px(g,-6,-13,12,1,C.tank3); px(g,-7,-13,1,3,L); px(g,6,-13,1,3,L); px(g,-3,-12,4,1,C.tank2); px(g,-2,-14,3,1,C.tank3); /* 포탑·해치 */
  px(g,5,-12,14,2,C.tank2); px(g,5,-12,14,1,'#6a7a4a'); px(g,17,-13,3,4,L); px(g,18,-12,1,2,C.tank2); /* 포신·포구 */ g.restore(); }
function heli(g,e,t){ g.save(); g.translate(Math.round(e.x),Math.round(e.y)); if(e.dir<0) g.scale(-1,1); const L=C.line;
  const ph=t&3, w=[28,18,8,18][ph]; px(g,-w/2,-11,w,1,C.rotor); px(g,-w/2+2,-11,w-4,1,'#5a5a5a'); px(g,-1,-10,2,2,C.heli2); px(g,-2,-9,4,1,L);
  blob(g,0,-3,10,5,C.heli,L); blob(g,-1,-5,7,2,C.heli3); px(g,-8,-1,16,1,C.heli2); px(g,3,-6,6,3,C.glass); px(g,4,-6,2,1,'#e4f4fb'); px(g,8,-5,1,2,L); px(g,-3,-6,1,5,C.heli2); px(g,-3,-4,1,1,L); /* 몸통·유리·문 */
  px(g,-22,-5,14,1,L); px(g,-22,-1,14,1,L); px(g,-21,-4,13,3,C.heli); px(g,-21,-3,13,1,C.heli2); px(g,-23,-11,3,8,C.heli2); px(g,-22,-10,1,6,C.heli3); px(g,-24,-7+((t>>1)&1)*2,6,1,C.rotor); /* 꼬리 붐·수직 날개·꼬리 날개 */
  px(g,-7,3,14,1,C.heli2); px(g,-5,2,1,1,C.heli2); px(g,4,2,1,1,C.heli2); px(g,-7,4,14,1,'rgba(0,0,0,.3)'); /* 착륙 활대 */ g.restore(); }
function shot(g,s){ if(s.kind==='bullet') px(g,s.x-1,s.y-1,2,2,C.bullet); else if(s.kind==='shell'){ px(g,s.x-2,s.y-1,4,3,C.shell); px(g,s.x-3,s.y,1,1,C.fire); } else { px(g,s.x-3,s.y-1,6,3,C.rocket); px(g,s.x-5-(s.t&1),s.y-1,2,3,C.fire); px(g,s.x+3,s.y,1,1,C.teeth); } }
function fx(g,x){ const a=x.t;
  if(x.k==='dust'){ for(let i=0;i<5;i++){ const ang=i*1.26+x.x*0.1; const r=a*0.8+2; px(g,x.x+Math.cos(ang)*r-1,x.y+Math.sin(ang)*r*0.6-a*0.3,3-(a>10?1:0),2,i%2?C.dust:C.dust2); } }
  else if(x.k==='spark'){ for(let i=0;i<4;i++){ const ang=i*1.57+0.5; px(g,x.x+Math.cos(ang)*a*0.9,x.y+Math.sin(ang)*a*0.9,2,1,C.spark); } }
  else if(x.k==='boom'){ const r=Math.min(14,a*1.2); blob(g,x.x,x.y,r,r*0.8,a<10?C.boom2:C.boom); if(a>6) blob(g,x.x,x.y-2,r*0.5,r*0.4,a<16?C.boom:C.dust2); }
  else if(x.k==='cloud'){ /* 분진: 커지며 옅어지는 뭉게구름 */ const r=4+a*0.45, al=Math.max(0,1-a/44); g.save(); g.globalAlpha=al*0.85; blob(g,x.x,x.y-a*0.35,r,r*0.7,C.dust); g.globalAlpha=al*0.6; blob(g,x.x-r*0.5,x.y-a*0.25+2,r*0.6,r*0.45,C.dust2); blob(g,x.x+r*0.55,x.y-a*0.4,r*0.55,r*0.4,'#e8dfcc'); g.restore(); }
  else if(x.k==='chunk'){ /* 벽돌 조각 */ const col=(x.wall||C.dust2); const sz=x.sz||2; px(g,x.x,x.y-sz,sz,sz,col); if(sz>2) px(g,x.x,x.y-sz,1,1,'#fff6'); }
  else if(x.k==='glass'){ /* 유리 조각 */ px(g,x.x,x.y-1,1,1,(a>>1)&1?'#d8f1fa':'#7eb6cc'); } }

root.Sprites={C,px,blob,limb,person,drawMonster,drawIdle,poseOf,soldier,car,tank,heli,shot,fx};
})(typeof window!=='undefined'?window:module.exports);
