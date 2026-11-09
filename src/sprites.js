/* 동현램 그림: 다섯 괴물·사람·군인·차·전차·헬기를 모두 코드로 새로 그린다. 원작 게임의 그림은 한 점도 쓰지 않는다.
   괴물은 시리즈의 기존 얼굴(포동이 동현몬 · 슈슈 동현파 · 나머지 동현주)을 정면으로 붙이고, 몸은 원작처럼 단순한 토막으로 다섯 모두 같은 틀에 색만 바꾼다.
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
/* 얼굴은 시리즈의 기존 그림을 그대로 쓴다(글자 격자 · 동현몬·동현주와 같은 팔레트). 정면을 본다.
   포동이: 동현몬의 뒤따르는 포동이(pet_down) 머리 부분(앞다리 윤곽만 털로 메움). 슈슈: 동현파의 슈슈 얼굴을 16×16으로 옮긴 동현주의 그림. 라이언·꼬리콥터·둠가이: 동현주의 얼굴.
   몸은 원작 괴물처럼 단순한 앞모습 토막(몸통 14×10 · 다리 둘 · 긴 팔)으로 다섯 모두 같고, 색과 작은 장식만 다르다. 라이언만 다리 대신 꼬리. */
const PAL={'.':null,'K':'#2e2a38','E':'#ffffff','W':'#f6ecd6','G':'#c9aa78','R':'#d6403a','M':'#e5483a','d':'#9a2620','I':'#8d919c','i':'#c7c9d1','h':'#6b4a2e','c':'#8c7a63','a':'#9a978c','A':'#5d5b53','s':'#efc7a6','S':'#d9a785','p':'#f0a3a3','P':'#d97b86','w':'#f6f2e8','Y':'#f2b705','g':'#6fb04a','5':'#3f8a3a','C':'#2bb0c8','8':'#b5dcf2','7':'#5fa8e0','e':'#49392f','L':'#ff9f86','O':'#d98a3c','k':'#231d18','t':'#7a4a22'};
const FACE={
podong:{rows:`
.....KKKKKK.....
...KKWWWWWWKK...
..KWWWWWWWWWWK..
.KWWWWWWWWWWWWK.
KWWWEKWWWWEKWWWK
KWWWKKWWWWKKWWWK
KWWKWWWKKWWWKWWK
KWWKWWWKKWWWKWWK
.KKKWWWWWWWWKKK.
...KWWWWWWWWK...
....KRRRRRRK....`,eyes:[[4,4,2,2],[10,4,2,2]],mouth:[8,9,6],skin:'W'},
shushu:{rows:`
....ooo..............ooo....
...oHHHo............oHHHo...
..oHhHHHo..oooooo..oHhHHHo..
..oHhHHHo.oHHHHHHo.oHhHHHo..
..oHHHHHooHHhhHBqHqoHHHHHo..
...oHHHooHhhHHHBBkBBoHHHo...
....ooooHHHHHHHrHHHroooo....
......oHHHHHHHHHHHHHHo......
.....oHHHHHHHHHHHHHHHHo.....
.....oHHHHHHHHHHHHHHHHo.....
....oHHHHHHHHHHHHHHHHHHo....
....oHHHsssHHHssssHHHHHo....
....oHsswesssswessssHHHo....
.....osseesssseessssHHo.....
.....oHseesssseessssHHo.....
.....obbssssssssbbssHHo.....
......ossssmmssssssHHo......
.......osssssssssssHo.......
........ossssssssHHo........
.........ooHsssHHoo.........
...........osssso...........
..........oossssoo..........`,pal:{o:'#63483a',H:'#4b382e',h:'#775242',s:'#efc7a6',e:'#49392f',w:'#fbf4db',b:'#dc9c83',m:'#a87362',c:'#f5ead1',D:'#d48a78',d:'#ad6e62',y:'#edc776',S:'#f4e8cd',R:'#cf6157',r:'#a64b44',L:'#f4e8cd',W:'#f4e8cd',B:'#cf6157',k:'#a64b44',q:'#ef9a8b'},eyes:[[8,12,2,3],[14,12,2,3]],mouth:[12,17,6],skin:'s'},
lion:{rows:`
.......KK.......
....KKKppKKK....
...KppppppppK...
..KppppppppppK..
.KPPPPPPPPPPPPK.
.KppppppppppppK.
.KpppKKppKKpppK.
KppppKKppKKppppK
KPPPPPPPPPPPPPPK
.KpppKppppKpppK.
.KppppKKKKppppK.
.KppppppppppppK.
..KPPPPPPPPPPK..
...KppppppppK...
....KKKppKKK....
.......KK.......`,eyes:[[5,6,2,2],[9,6,2,2]],mouth:[8,10,6],skin:'p'},
copter:{rows:`
...KKKKKKKKKK...
..KiiiiiiiiiiK..
...KKKKaaKKKK...
.....KKaaKK.....
....KCCCCCCK....
...KCCCCCCCCK...
..K888CCCC888K..
..K8E8CCCC8E8K..
.KC888CCCC888CK.
.KCCCCCCCCCCCCK.
..KCCCCCCCCCCK..
..KCCCCKKCCCCK..
...KCCCCCCCCK...
....KCKCCKCK....
...KKKKKKKKKK...
....KKKKKKKK....`,eyes:[[3,6,3,3],[10,6,3,3]],mouth:[8,11,4],skin:'C',eye:'8'},
doom:{rows:`
................
...KKKKKKKKKK...
..Kggg5555gggK..
.KggggggggggggK.
.KggggggggggggK.
K55555555555555K
.KssssssssssssK.
.KsKKssssssKKsK.
.KssKKssssKKssK.
.KssKKssssKKssK.
.KssssssssssssK.
.KssssssssssssK.
..KsssKKKKsssK..
...KssssssssK...
....KKKKKKKK....
................`,eyes:[[2,7,3,3],[11,7,3,3]],mouth:[8,12,6],skin:'s'}
};
for(const k in FACE){ const f=FACE[k]; f.grid=f.rows.trim().split('\n'); f.h=f.grid.length; f.w=f.grid[0].length; }
/* 키(발에서 머리 꼭대기까지): 얼굴 줄 수 + 몸통 10 + 다리 6. 포동이 27, 나머지 32 */
const HGT={podong:27,shushu:38,lion:32,copter:32,doom:32};
/* 글자 격자 그리기: (x0,y0)가 왼쪽 위 */
function grid(g,rows,x0,y0,pal){ pal=pal||PAL; for(let r=0;r<rows.length;r++){ const row=rows[r]; for(let c=0;c<row.length;c++){ const col=pal[row[c]]; if(col) px(g,x0+c,y0+r,1,1,col); } } }
/* 얼굴 + 표정: 눈(open·closed·x·wide·happy·half)과 입(0~1) */
function drawFace(g,P,key,x0,y0){
  const F=FACE[key], pal=F.pal||PAL; grid(g,F.grid,x0,y0,pal); const skin=pal[F.skin], eyeBg=pal[F.eye||'E'];
  if(P.eyes!=='open'){ for(const [c,r,w,h] of F.eyes){ const x=x0+c, y=y0+r; px(g,x,y,w,h,skin);
    if(P.eyes==='closed') px(g,x,y+h-1,w,1,C.line);
    else if(P.eyes==='x'){ px(g,x,y,1,1,C.line); px(g,x+w-1,y,1,1,C.line); px(g,x+((w-1)>>1),y+((h-1)>>1),1,1,C.line); px(g,x,y+h-1,1,1,C.line); px(g,x+w-1,y+h-1,1,1,C.line); }
    else if(P.eyes==='happy'){ px(g,x,y+h-1,1,1,C.line); px(g,x+w-1,y+h-1,1,1,C.line); px(g,x+1,y+h-2,Math.max(1,w-2),1,C.line); }
    else if(P.eyes==='half'){ px(g,x,y,w,1,C.line); px(g,x,y+1,w,h-1,eyeBg); px(g,x+w-1,y+h-1,1,1,C.pupil); }
    else if(P.eyes==='wide'){ px(g,x-1,y-1,w+2,h+2,C.line); px(g,x,y,w,h,C.eye); px(g,x+(w>>1),y+(h>>1),1,1,C.pupil); } } }
  const mh=Math.round(P.mouth*6*(P.mouthBoost||1)); if(mh>0){ const [mc,mr,mw]=F.mouth; const mx=x0+mc-(mw>>1), my=y0+mr-1; px(g,mx-1,my-1,mw+2,mh+2,C.line); px(g,mx,my,mw,mh,C.mouth); if(mh>2) px(g,mx,my,mw,1,C.teeth); if(mh>3) px(g,mx+1,my+mh-1,mw-2,1,C.tongue); }
}
/* 몸 토막: 색만 바꿔 다섯 괴물이 함께 쓴다 */
function body(g,P,t,key,S){
  const up=P.body, L=C.line, legs=P.leg, arms=P.arm; const F=FACE[key]; const hx=-(F.w>>1)+P.lean, hy=-16-F.h+up+P.head; /* 머리 왼쪽 위 */
  const hand=(x,y)=>{ if(S.glove){ px(g,x-3,y-3,7,6,L); px(g,x-2,y-2,5,4,S.glove); px(g,x-2,y-2,3,1,S.glove2); } else { px(g,x-2,y-2,5,5,L); px(g,x-1,y-1,3,3,S.hand); px(g,x-1,y+1,1,1,L); px(g,x+1,y+1,1,1,L); } };
  const foot=(x,y)=>{ px(g,x-3,y-2,7,2,S.foot); px(g,x-3,y-1,7,1,L); };
  /* 뒤쪽 팔 */ limb(g,-7,-13+up,arms[1][0],arms[1][1]+up,4,S.arm,L); hand(arms[1][0],arms[1][1]+up);
  if(S.tail){ /* 라이언: 다리 대신 꼬리 토막 셋 */ blob(g,-6,-4+up,4,3,S.leg,L); blob(g,-11,-3+up,3,2,S.leg2,L); blob(g,-15,-2,2,2,S.leg,L); }
  else { limb(g,-4,-8+up,legs[1][0],legs[1][1]-3,5,S.leg2,L); foot(legs[1][0],legs[1][1]); limb(g,4,-8+up,legs[0][0],legs[0][1]-3,5,S.leg,L); foot(legs[0][0],legs[0][1]); }
  /* 몸통 */ px(g,-8,-17+up,16,12,L); px(g,-7,-16+up,14,10,S.body); if(S.belly) px(g,-4,-14+up,8,7,S.belly); if(S.stripe) for(let y=-15;y<-7;y+=3) px(g,-7,y+up,14,1,S.stripe);
  if(S.collar){ px(g,-7,-16+up,14,2,S.collar); px(g,0,-14+up,2,2,'#f2b705'); } if(S.tag){ px(g,0,-16+up,2,2,'#f2b705'); } if(S.emblem){ px(g,-2,-13+up,4,4,S.emblem); px(g,-1,-12+up,2,2,'#ffd36a'); } if(S.belt){ px(g,-7,-8+up,14,2,S.belt); }
  /* 머리 */ drawFace(g,P,key,hx,hy);
  /* 앞쪽 팔 */ limb(g,7,-13+up,arms[0][0],arms[0][1]+up,4,S.arm,L); hand(arms[0][0],arms[0][1]+up);
  items(g,P,t);
}
const STYLE={
  podong:{body:C.fur,belly:'#fdf7ea',arm:C.fur,hand:C.fur,leg:C.fur,leg2:C.fur2,foot:C.fur2,tag:1},
  shushu:{body:C.glove,belly:C.glove2,arm:C.skin,glove:C.glove,glove2:C.glove2,leg:C.skin,leg2:C.skin2,foot:C.hair2,belt:C.short},
  lion:{body:C.worm,stripe:C.worm2,arm:C.worm,hand:C.worm2,leg:C.worm,leg2:C.worm2,foot:C.worm2,tail:1},
  copter:{body:C.cop,belly:'#b5dcf2',arm:C.cop,hand:C.cop3,leg:C.cop,leg2:C.cop2,foot:C.cop2},
  doom:{body:C.armor,belly:C.armor2,arm:C.armor,hand:C.helm,leg:C.armor3,leg2:C.armor3,foot:C.boot,emblem:C.ember,belt:C.boot}
};
/* 주먹 팔: 방향키대로 앞·위·아래로 뻗는다 */
function punchArm(A,h,ext,len){ const pd=h.pdy||0; if(pd<0) return A(4+Math.round(ext*8),2-Math.round(ext*22)); if(pd>0) return A(4+Math.round(ext*8),4+Math.round(ext*14)); return A(6+Math.round(ext*len),2-Math.round(ext*4)); }

function poseOf(h,t,f){
  const HG=HGT[f.key]||32, sh=-16, FM=FACE[f.key]||FACE.podong, my=-HG+FM.mouth[1]; /* 어깨는 몸통 윗선(-16)으로 모두 같다. 입 높이는 얼굴 그림의 입 줄 */
  const A=(dx,dy)=>[dx,sh+dy];
  const P={arm:[A(6,12),A(-6,12)],leg:[[3,0],[-3,0]],body:0,head:0,mouth:0,eyes:'open',item:null,back:false,extra:[],lean:0,sh,my,HG};
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
    else { P.arm=[A(6,12),A(-6,12)]; P.body=(t>>4)&1?0:-1; }
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
    else { const a=(k-0.3)/0.7; P.eyes='half'; P.arm[0]=A(11,my-P.sh+2); P.item={kind:'cig',x:5,y:my+1}; P.mouth=0.15; P.lean=-2; const br=Math.sin(a*Math.PI*2); P.sy=1+br*0.04; P.sx=1-br*0.02; P.head=br>0?-1:0; P.extra.push({k:'smoke',a}); if(a>0.3) P.extra.push({k:'ring',a:(a-0.3)/0.7}); if(a>0.5) P.extra.push({k:'ring',a:(a-0.5)/0.5}); }
  }
}

/* 공통 장식: 손 안의 사람·담배, 연기·부스러기·하트. 위치는 입 높이 my 기준 */
function items(g,P,t){
  const my=P.my;
  for(const e of P.extra){
    if(e.k==='smoke'){ for(let i=0;i<4;i++){ const a=(e.a*3+i*0.25)%1; const y=my-4-a*30, x=12+Math.sin(a*6+i)*4+a*5; const r=2+Math.round(a*4); g.fillStyle='rgba(236,236,246,'+(0.9-a*0.7)+')'; g.beginPath(); g.ellipse(x,y,r,r*0.8,0,0,Math.PI*2); g.fill(); if(a<0.5){ g.fillStyle='rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(x-1,y-1,r*0.5,r*0.4,0,0,Math.PI*2); g.fill(); } } }
    else if(e.k==='stars'){ const a=e.a; for(let i=0;i<4;i++){ const ang=t/6+i*Math.PI/2; const r=10+a*6; const x=Math.cos(ang)*r, y=my-6+Math.sin(ang)*r*0.5-a*4; px(g,x-1,y,3,1,C.spark); px(g,x,y-1,1,3,C.spark); } }
    else if(e.k==='ring'){ const a=e.a; const y=my-12-a*26, r=2+Math.round(a*6); g.strokeStyle='rgba(235,235,245,'+(1-a*0.8)+')'; g.lineWidth=1.5; g.beginPath(); g.ellipse(11+a*4,y,r,r*0.6,0,0,Math.PI*2); g.stroke(); }
    else if(e.k==='crumb'){ const a=e.a; for(let i=0;i<7;i++){ const ph=(a*4+i*0.14)%1; const dir=i%2?1:-1; px(g,13+i*2+dir*ph*9,my-ph*12+ph*ph*20,1+(i%3===0?1:0),1+(i%3===0?1:0),i%2?C.person:C.pshirt[i%5]); } }
    else if(e.k==='heart'){ const bob=Math.sin(t/4)*1; const y=my-14+bob; px(g,-9,y,2,2,C.glove); px(g,-6,y,2,2,C.glove); px(g,-9,y+2,5,2,C.glove); px(g,-8,y+4,3,1,C.glove); px(g,-7,y+5,1,1,C.glove); }
    else if(e.k==='snap'&&e.a<0.3){ px(g,10,my-4,6,1,C.spark); px(g,12,my,5,1,C.spark); px(g,11,my-8,4,1,C.spark); }
    else if(e.k==='gulp'){ const a=e.a; if(a<0.7){ const y=my+6+a*14; blob(g,1,y,4,3,'rgba(255,255,255,.35)'); } }
  }
  if(P.item){ const it=P.item; if(it.kind==='person'){ g.save(); g.translate(it.x,it.y); g.scale(2,2); if(it.spin) g.rotate(it.spin*Math.PI/6); person(g,0,0,t*2,1,3); g.restore(); }
    else if(it.kind==='legs'){ const kk=it.kick?((t>>1)&1?1:-1):0; px(g,it.x,it.y-1,2,5,C.ppants); px(g,it.x+3,it.y-1+kk,2,5,C.ppants); px(g,it.x-1,it.y-2,7,2,C.pshirt[3]); px(g,it.x,it.y+4,2,1,C.line); px(g,it.x+3,it.y+4+kk,2,1,C.line); }
    else if(it.kind==='cig'){ px(g,it.x,it.y,6,1,C.cig); px(g,it.x+6,it.y,1,1,((t>>2)&1)?C.ember:C.glove); } }
}

function shrunk(g,h,t){ const k=h.shrinkT; const sc=k>90?1-(120-k)/30*0.6:0.4; if(k>90){ g.save(); g.scale(sc,sc); g.globalAlpha=0.6; g.restore(); }
  const f=(t>>2)&1; px(g,-2,-10,5,5,C.skin); px(g,-2,-11,5,1,C.hair); px(g,-2,-5,5,3,C.pshirt[1]); px(g,-2,-2,2,2+f,C.ppants); px(g,1,-2,2,3-f,C.ppants); px(g,-3,-6,1,2,C.skin); px(g,3,-6,1,2,C.skin); px(g,-2,-8,5,2,C.skin); }


/* 괴물 한 마리 그리기: form 객체, 상태 h, 시간 t, 발 기준 좌표 (x,y) */
function drawMonster(g,form,h,t,x,y){
  g.save(); g.translate(Math.round(x),Math.round(y));
  if(h.shrinkT>0){ if(h.dir<0) g.scale(-1,1); if(h.shrinkT>96&&((t>>1)&1)){ g.globalAlpha=0.5; } shrunk(g,h,t); g.restore(); return; }
  if(h.hurtT>0&&((t>>1)&1)&&h.eatT<=0) g.globalAlpha=0.55;
  const P=poseOf(h,t,form); if(!P.back&&h.dir<0) g.scale(-1,1); if(P.sx&&P.sy&&(P.sx!==1||P.sy!==1)) g.scale(P.sx,P.sy);
  const key=STYLE[form.key]?form.key:'podong'; body(g,P,t,key,STYLE[key]);
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
