/* 동현램 그림: 여섯 몬스터·사람·군인·차·전차·헬기를 모두 코드로 새로 그린다. 원작 게임의 그림은 한 점도 쓰지 않는다.
   머리의 시리즈 원본 격자는 유지하고, 등반형 몸체를 여섯 색으로 그린다.
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

/* ---------- 작은 사람(창문 안·길·몬스터 손 안) ---------- */
function person(g,x,y,f,wave,c){ /* 발 기준 x,y · 높이 8 */
  const sh=C.pshirt[(c||0)%C.pshirt.length];
  px(g,x-1,y-8,3,3,C.person); px(g,x-1,y-9,3,1,C.hair); px(g,x-1,y-5,3,3,sh); px(g,x-1,y-2,1,2,C.ppants); px(g,x+1,y-2,1,2,C.ppants);
  if(wave){ const u=(f>>3)&1; px(g,x-2,y-7-u,1,2,C.person); px(g,x+3,y-6+u,1,2,C.person); } else { px(g,x-2,y-5,1,2,C.person); px(g,x+3,y-5,1,2,C.person); }
}

/* ---------- 몬스터 ---------- */
/* 얼굴은 시리즈의 기존 그림을 그대로 쓴다(글자 격자 · 동현몬·동현주와 같은 팔레트). 정면을 본다.
   여섯 얼굴은 몸체 격자와 별도로 그린다. */
const PAL={'.':null,'K':'#2e2a38','E':'#ffffff','W':'#f6ecd6','G':'#c9aa78','R':'#d6403a','M':'#e5483a','d':'#9a2620','I':'#8d919c','i':'#c7c9d1','h':'#6b4a2e','c':'#8c7a63','a':'#9a978c','A':'#5d5b53','s':'#efc7a6','S':'#d9a785','p':'#f0a3a3','P':'#d97b86','w':'#f6f2e8','Y':'#f2b705','g':'#6fb04a','5':'#3f8a3a','C':'#2bb0c8','8':'#b5dcf2','7':'#5fa8e0','e':'#49392f','L':'#ff9f86','O':'#d98a3c','k':'#231d18','t':'#7a4a22'};
const FACE={
podong:{rows:`
....KKKKKK....
..KKWWWWWWKK..
.KKWWWWWWWWK..
KWWKWWWWWWWKK.
KWWKEKKWEKKWWK
KWWKKKKWKKKWWK
.KKWKKKWKKKKK.
.KWWWWWWWWWWK.
.KWWWWWKKWWWK.
.KWWWWWKKWWWK.
..KKWWWWWWKK..`,hb:11,eyes:[[4,4,3,3],[8,4,3,3]],mouth:[8,10,4],skin:'W'},
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
..........oossssoo..........`,pal:{o:'#63483a',H:'#4b382e',h:'#775242',s:'#efc7a6',e:'#49392f',w:'#fbf4db',b:'#dc9c83',m:'#a87362',c:'#f5ead1',D:'#d48a78',d:'#ad6e62',y:'#edc776',S:'#f4e8cd',R:'#cf6157',r:'#a64b44',L:'#f4e8cd',W:'#f4e8cd',B:'#cf6157',k:'#a64b44',q:'#ef9a8b'},eyes:[[8,12,2,3],[14,12,2,3]],mouth:[12,17,6],skin:'s',mirror:1},
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
................`,eyes:[[2,7,3,3],[11,7,3,3]],mouth:[8,12,6],skin:'s'},
fly:{rows:`
....K......K....
...KKK....KKK...
....KKKKKKKK....
KKK.KhhhhhhK.KKK
888KhhhhhhhhK888
88RRRhhhhhhRRR88
88RMRRhhhhRMRR88
KKRRRRhhhhRRRRKK
.KRRRhhhhhhRRRK.
..KhhhhhhhhhhK..
..KhhhhhhhhhhK..
..KhhhhKKhhhhK..
...KhhhhhhhhK...
....KhhhhhhK....
.....KKKKKK.....
................`,eyes:[[2,5,4,4],[10,5,4,4]],mouth:[8,12,4],skin:'h',eye:'R'}
};
/* 슈슈의 동현파 원본 얼굴은 왼쪽(-x)을 본다. 몸틀은 +x가 앞이므로 좌우만 뒤집어(mirror) 붙인다. 점 하나도 바꾸지 않는다 */
function mirrorFace(f){ const W=f.w; f.grid=f.grid.map(r=>r.split('').reverse().join('')); f.eyes=f.eyes.map(([c,r,w,h])=>[W-c-w,r,w,h]); const [mc,mr,mw]=f.mouth; f.mouth=[W-mc-(mw&1),mr,mw]; }
for(const k in FACE){ const f=FACE[k]; f.grid=f.rows.trim().split('\n'); f.h=f.grid.length; f.w=f.grid[0].length; if(f.mirror) mirrorFace(f); }
/* 먹기 연출의 기존 입 기준점. 등반형의 일반 자세 높이와 별개다. */
const HGT={podong:27,shushu:38,lion:32,copter:32,doom:32,fly:32};
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
function wings(g,P,t){const up=P.body,front=P.view==='front'; /* 초파리: 반투명 날개 한 쌍. 옆모습은 등 뒤로 눕고(걸을 때 살짝 들썩), 공중·날갯짓(flap)에서는 위로 세워 빠르게 파닥인다. 앞모습은 양어깨 위로 펼친다 */
    const fast=P.air||P.flap; const ph=fast?(t&1):((t>>3)&1); const big=P.flap?1.25:1; g.save(); g.lineWidth=1;
    const wing=(cx,cy,rx,ry,rot)=>{ g.fillStyle='rgba(222,240,255,.72)'; g.strokeStyle='rgba(100,140,185,.95)'; g.beginPath(); g.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2); g.fill(); g.stroke(); g.strokeStyle='rgba(130,170,215,.7)'; g.beginPath(); g.moveTo(cx-Math.cos(rot)*rx*0.85,cy-Math.sin(rot)*rx*0.85); g.lineTo(cx+Math.cos(rot)*rx*0.85,cy+Math.sin(rot)*rx*0.85); g.stroke(); };
    if(front){ for(const sd of [-1,1]){ const rot=sd*(fast?(ph?0.95:0.45):0.3); wing(sd*8*big,-20+up-(fast?3:0),7*big,3,-rot); } }
    else if(fast){ const r1=ph?0.95:0.35, r2=ph?0.75:0.2; wing(-11,-23+up,8*big,2.6,r1); wing(-10,-20+up,7*big,2.2,r2); }
    else { wing(-9,-18+up-(ph?1:0),7,2.5,0.18); wing(-8,-16+up,6,2,0.1); }
    g.restore(); }
/* 8개 기본 자세는 승인한 그림 그대로, 특수 자세는 같은 몸통 격자를 두고 관절만 움직인다. */
const headOffset={idle:[0,0],walk:[1,0],pass:[0,-1],punch:[3,1],climb:[1,-2],step:[2,-2],brace:[0,1],coil:[-2,1]};
const stampCache=new Map();
function stamp(g,key,name){
  const id=key+':'+name, [x,y,rows]=RamClimberPixels.frames[name];
  if(!stampCache.has(id)){
    const c=document.createElement('canvas');c.width=Math.max(...rows.map(r=>r.length));c.height=rows.length;
    grid(c.getContext('2d'),rows,0,0,RamClimberPixels.colors[key]);stampCache.set(id,c);
  }
  g.drawImage(stampCache.get(id),x,y);
}
function mainFrame(h,t){
  if(h.eatT>0||h.hurtT>0||['ride','sit','air'].includes(h.state))return null;
  if(h.punchT>0){
    if(h.pdy||h.state==='climb')return null;
    return h.punchT>=13?'coil':h.punchT>=5?'punch':'brace';
  }
  if(h.state==='climb')return (h.climbT>>3)&1?'step':'climb';
  if(h.walkT>0)return ['walk','pass','brace','pass'][(h.walkT>>2)&3];
  return 'idle';
}
function articulated(g,P,key){
  const c=RamClimberPixels.colors[key],dy=P.body, sitting=P.sit?1:0;
  // A square brush only supplies the outline. Inner strokes taper toward wrist/ankle.
  function part(a,b,e,far,arm){
    const shade=c[far?1:2],base=c[far?2:3],hi=c[far?2:4];
    const seg=(a,b,r,s,col)=>{const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));
      for(let i=0;i<=n;i++){const u=i/n,R=Math.round(r+(s-r)*u);
        blobRaw(g,Math.round(a[0]+(b[0]-a[0])*u),Math.round(a[1]+(b[1]-a[1])*u),R,R,col);}
    };
    for(const [extra,col] of [[1,c[0]],[0,shade]]){
      seg(a,b,(arm?2:3)+extra,1+extra,col);seg(b,e,2+extra,1+extra,col);
    }
    seg([a[0]-1,a[1]-1],b,arm?1:2,1,base);
    const mid=[Math.round((b[0]+e[0])/2),Math.round((b[1]+e[1])/2)-1];
    seg(mid,e,1,1,base);
    if(arm){blob(g,e[0],e[1],2,2,base,c[0]);px(g,e[0]-1,e[1]-1,2,1,hi);}
    else {rrect(g,e[0]-2,e[1]-2,6,2,base,c[0]);px(g,e[0]+1,e[1]-2,2,1,hi);}
  }
  const hand=i=>[P.arm[i][0],P.arm[i][1]+dy];
  function arm(i){
    const a=[i?-3:2,-18+dy],e=hand(i),ax=e[0]-a[0],ay=e[1]-a[1],n=Math.hypot(ax,ay)||1;
    const bend=Math.min(4,n/3)*(i?-1:1),b=[Math.round((a[0]+e[0])/2-ay*bend/n),Math.round((a[1]+e[1])/2+ax*bend/n)];
    part(a,b,e,!!i,true);
  }
  arm(1);
  for(const i of [1,0]){const a=[i?-2:2,-9+dy],e=P.leg[i],b=[Math.round((a[0]+e[0])/2)+(i?-2:2)+sitting*2,Math.round((a[1]+e[1])/2)-1];part(a,b,e,!!i,false);}
  g.save();g.translate(0,dy);stamp(g,key,'torso');g.restore();
  arm(0);
}
function body(g,P,t,key,h){
  const f=FACE[key],frame=mainFrame(h,t),eating=h.eatT>0;
  if(key==='fly') wings(g,P,t);
  if(frame){
    const turn=h.state==='climb'&&h.side*h.dir>0?-1:1;
    g.save();g.scale(turn,1);stamp(g,key,frame);g.restore();
    const [dx,dy]=headOffset[frame];
    drawFace(g,P,key,(1+dx)*turn-(f.w>>1),-19+dy-(f.hb||f.h));
  }else{
    articulated(g,P,key);
    // Eating retains the old mouth/hand coordinate system, including the head's bob and lean.
    drawFace(g,P,key,-(f.w>>1)+(P.view==='front'?0:2)+P.lean,(eating?-16:-19)-(f.hb||f.h)+P.body+P.head);
  }
  items(g,P,t);
}

/* 주먹 팔: 방향키대로 앞·위·아래로 뻗는다 */
function punchArm(A,h,ext,len){ const pd=h.pdy||0; if(pd<0) return A(4+Math.round(ext*8),2-Math.round(ext*22)); if(pd>0) return A(4+Math.round(ext*8),4+Math.round(ext*14)); return A(6+Math.round(ext*len),2-Math.round(ext*4)); }

function poseOf(h,t,f){
  const HG=HGT[f.key]||32, sh=-16, FM=FACE[f.key]||FACE.podong, my=-HG+FM.mouth[1]; /* 어깨는 몸통 윗선(-16)으로 모두 같다. 입 높이는 얼굴 그림의 입 줄 */
  const A=(dx,dy)=>[dx,sh+dy];
  const P={arm:[A(5,12),A(-2,12)],leg:[[2,0],[-2,0]],body:0,head:0,mouth:0,eyes:'open',item:null,back:false,view:'side',extra:[],lean:0,sh,my,HG};
  const walk=Math.sin(t/4), w2=Math.sin(t/4+Math.PI);
  if(h.shrinkT>0) return P;
  if(h.state==='sit'){ /* 무너진 건물과 함께 떨어져 주저앉음: 몸이 내려앉고 다리는 앞으로, 손은 바닥, 눈은 빙글 */
    P.sit=true; P.body=5; P.leg=[[8,0],[-5,0]]; P.arm=[A(9,15),A(-6,15)]; P.eyes='x'; P.mouth=0.5; P.head=1; P.extra.push({k:'stars',a:0.5}); return P; }
  if(h.state==='ride'){ /* 무너지는 건물에 매달려 내려가는 중: 두 손으로 꽉 잡고 눈이 커진다 */
    const inw=-(h.side||1)*(h.dir||1); P.view='front'; P.arm=[A(inw*8,-13),A(inw*6,-9)]; P.leg=[[inw*4,-3],[inw*1,-1]]; P.lean=inw*2; P.eyes='wide'; P.mouth=0.7; P.head=-1; return P; }
  if(h.state==='climb'){ /* 옆벽에 붙어 오른다: 앞 얼굴이 보이는 앞모습, 두 손은 벽 모서리를 번갈아 잡는다 */
    const c=Math.floor(h.climbT/8)%2; const inw=-(h.side||1)*(h.dir||1); /* 바라보는 기준으로 벽이 있는 쪽(+1 앞, -1 뒤) */
    P.view='front'; P.arm=[A(inw*8,c?-14:-6),A(inw*5,c?-6:-14)]; P.leg=[[inw*4,c?-4:0],[inw*1,c?0:-4]]; P.lean=inw*2;
    if(h.punchT>0){ const k=1-h.punchT/16; const ext=k<0.6?k/0.6:1-(k-0.6)/0.4*0.4; P.arm=[punchArm(A,h,ext,(h.pdx||h.dir)===h.side?34:20),A(inw>0?-6:6,-8)]; /* 옆 건물 쪽은 골목 너머까지 팔을 뻗는다 */ P.mouth=0.4; P.leg=[[inw*4,-2],[inw*1,0]]; P.lean=0; }
  } else if(h.state==='air'){ const fly=h.hang>1.5; P.air=true; P.flap=(h.flapT||0)>0; P.arm=fly?[A(9,-6),A(-9,-6)]:[A(8,-8),A(-6,0)]; P.leg=fly?[[3,2],[-3,2]]:[[5,-3],[-4,1]]; P.mouth=0.3; P.eyes=fly?'open':'wide'; if(P.flap){ P.head=-1; P.mouth=0.6; } }
  else { /* 땅 */
    if(h.punchT>0){ const k=1-h.punchT/16; const ext=k<0.5?k/0.5:1-(k-0.5)/0.5*0.5; P.arm=[punchArm(A,h,ext,22),A(-6,10)]; P.lean=h.pdy?0:Math.round(ext*3); P.mouth=0.6; P.leg=[[5,0],[-4,0]]; }
    else if(h.walkT>0){ P.leg=[[Math.round(2+walk*4),0],[Math.round(-2+w2*4),0]]; P.arm=[A(Math.round(3+w2*5),13),A(Math.round(-1+walk*5),13)]; P.body=Math.abs(walk)>0.7?-1:0; }
    else { P.arm=[A(5,12),A(-2,12)]; P.body=(t>>4)&1?0:-1; }
  }
  if(h.hurtT>0&&h.eatT<=0){ P.eyes='x'; P.mouth=0.8; P.arm=[A(9,-6),A(-7,-6)]; P.view='side'; }
  if(h.eatT>0) eatPose(P,h,t,A);
  return P;
}
/* 먹는 동작 네 가지. eatT는 남은 시간이라 진행도 k=1-eatT/총길이. 손 안의 사람은 발이 손 위치에 온다 */
function eatPose(P,h,t,A){
  P.view='side'; const kind=h.eatKind||'gulp'; const tot=kind==='smoke'?70:kind==='toss'?54:kind==='chew'?48:36; const k=1-h.eatT/tot; const my=P.my;
  P.leg=[[3,0],[-3,0]]; P.arm=[A(5,12),A(-2,12)]; P.mouthBoost=1.7; P.sx=1; P.sy=1; /* 먹을 때는 입이 크고 몸이 늘었다 줄었다 한다(과장) */
  const what=h.eatWhat||'person'; const veh=what==='taxi'||what==='cop'||what==='tram'; const ik=veh?'veh':'person'; /* 먹은 것이 차·트램이면 그 기물을 통째로 들고 먹는다 */
  const hold=(dx,dy)=>{ P.arm[0]=A(dx,dy); P.item={kind:ik,vt:what,city:h.eatCity||0,x:P.arm[0][0],y:P.arm[0][1]-2,fl:1,wave:1}; };
  const squash=(a)=>{ const q=Math.sin(a*Math.PI); P.sy=1-q*0.18; P.sx=1+q*0.16; }; const stretch=(a)=>{ const q=Math.sin(a*Math.PI); P.sy=1+q*0.14; P.sx=1-q*0.08; };
  if(kind==='gulp'){ /* 사람을 머리 위로 번쩍 들었다가 벌린 입에 떨어뜨리고 목이 불룩하게 삼킨다 */
    if(k<0.35){ const a=k/0.35; hold(Math.round(10-a*4),Math.round(10-a*38)); P.mouth=0.3+a*0.7; P.head=-1; P.eyes='wide'; stretch(a); P.lean=-Math.round(a*3); }
    else if(k<0.6){ const a=(k-0.35)/0.25; P.arm=[A(12,-20),A(-12,-20)]; P.mouth=1; P.item={kind:ik,vt:what,city:h.eatCity||0,x:9,y:Math.round(my-14+a*18),fl:1,spin:Math.floor(a*4)}; P.eyes='wide'; P.head=-2; P.sy=1.14; P.sx=0.94; }
    else { const a=(k-0.6)/0.4; P.mouth=0; P.eyes=a<0.6?'closed':'happy'; P.extra.push({k:'gulp',a}); squash(Math.min(1,a*1.4)); P.arm=[A(7,10),A(-7,10)]; if(a>0.6){ P.extra.push({k:'heart'}); P.extra.push({k:'stars',a:(a-0.6)/0.4}); } }
  } else if(kind==='chew'){ /* 입에 물고 우적우적 세 번 씹는다. 부스러기가 튄다 */
    if(k<0.2){ const a=k/0.2; hold(Math.round(10-a*2),Math.round(10-a*24)); P.mouth=0.6+a*0.4; P.eyes='wide'; stretch(a*0.8); }
    else if(k<0.85){ const a=(k-0.2)/0.65; const ch=Math.sin(a*Math.PI*4); const q=Math.max(0,ch); P.mouth=q; P.head=ch>0?2:-1; P.lean=ch>0?2:-2; P.eyes=ch>0.5?'closed':'wide'; P.extra.push({k:'crumb',a}); P.arm=[A(9,6-Math.round(q*4)),A(-9,8-Math.round(q*4))]; P.sy=1-q*0.14; P.sx=1+q*0.14; if(a<0.5) P.item=veh?{kind:'vehHalf',vt:what,city:h.eatCity||0,x:11,y:my+2}:{kind:'legs',x:11,y:my-1,fl:1,kick:1}; }
    else { const a=(k-0.85)/0.15; P.eyes='happy'; P.extra.push({k:'heart'}); P.extra.push({k:'stars',a}); P.body=-1; }
  } else if(kind==='toss'){ /* 하늘로 휙 던져 올리고 입을 쩍 벌려 받아먹는다 */
    if(k<0.25){ const a=k/0.25; hold(Math.round(8+a*2),Math.round(12-a*40)); P.mouth=0.2+a*0.3; if(a<0.5) squash(a*2); else stretch((a-0.5)*2); P.lean=Math.round((0.5-a)*4); }
    else if(k<0.7){ const a=(k-0.25)/0.45; const top=my-44; const fy=a<0.5?(my-28)-(Math.sin(a*Math.PI))*18:(top+10)+(a-0.5)*2*((my-6)-(top+10)); P.item={kind:ik,vt:what,city:h.eatCity||0,x:Math.round(11-a*3),y:Math.round(fy),fl:1,spin:Math.floor(a*12),wave:1}; P.mouth=0.3+a*0.7; P.head=-3; P.eyes='wide'; P.arm=[A(12,-14),A(-12,-14)]; P.sy=1.1; P.sx=0.95; P.lean=-2; }
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
    else if(it.kind==='cig'){ px(g,it.x,it.y,6,1,C.cig); px(g,it.x+6,it.y,1,1,((t>>2)&1)?C.ember:C.glove); }
    else if(it.kind==='veh'||it.kind==='vehHalf'){ /* 손 안의 택시·경찰차·트램: 실제 기물 그림을 작게(차 0.5배 · 트램 0.35배). 씹는 중에는 뒷반쪽만 입 밖에 남는다 */
      const tramish=it.vt==='tram'; const sc=tramish?0.35:0.5; g.save(); g.translate(it.x,it.y); if(it.spin) g.rotate(it.spin*Math.PI/6);
      if(it.kind==='vehHalf'){ g.beginPath(); g.rect(0,-20,20,24); g.clip(); } g.scale(sc,sc); const fe={x:0,y:tramish?4:6,dir:1,type:it.vt,ad:0,ad2:0,city:it.city||0}; if(tramish) tram(g,fe,t); else car(g,fe,t); g.restore(); } }
}

function shrunk(g,h,t){ const k=h.shrinkT; const sc=k>90?1-(120-k)/30*0.6:0.4; if(k>90){ g.save(); g.scale(sc,sc); g.globalAlpha=0.6; g.restore(); }
  const f=(t>>2)&1; px(g,-2,-10,5,5,C.skin); px(g,-2,-11,5,1,C.hair); px(g,-2,-5,5,3,C.pshirt[1]); px(g,-2,-2,2,2+f,C.ppants); px(g,1,-2,2,3-f,C.ppants); px(g,-3,-6,1,2,C.skin); px(g,3,-6,1,2,C.skin); px(g,-2,-8,5,2,C.skin); }


/* 몬스터 한 마리 그리기: form 객체, 상태 h, 시간 t, 발 기준 좌표 (x,y) */
const originRow={shushu:0,podong:1,lion:2,fly:3,doom:4,copter:5};
const originMouth={shushu:[2,-27],podong:[7,-10],lion:[0,-41],fly:[0,-36],doom:[0,-38],copter:[0,-12]};
function originBody(g,key,P,h,t){
  const eat=h.eatT>0&&!(h.wallContact&&h.punchT>=9&&h.punchT<=11)&&!(key==='copter'&&h.punchT===11&&h.rotorContact),wall=h.state==='climb'||h.state==='ride',hit=!eat&&h.punchT>0;
  const dx=(hit?h.pdx:0)||h.dir||1,dy=h.pdy||0,side=h.side||-1,walk=h.walkT||0;
  const dogWall=key==='podong'&&wall&&!eat,climbing=wall&&!eat&&(!hit||dogWall);
  const mode=eat?0:climbing?1:hit?(dy<0?4:dy>0?5:dx<0?2:3):walk?6:0;
  const phase=hit&&!dogWall?Math.min(15,16-h.punchT):climbing?((h.climbT||0)>>1)&7:mode===6?(walk>>1)&7:0;
  const im=document.getElementById('origin-sheet'),[mx,my]=originMouth[key];
  if(!im.complete||!im.naturalWidth)return;
  const draw=(x,y,w,h,...dest)=>g.drawImage(im,96*phase+x,80*(originRow[key]*7+mode)+y,w,h,...dest);
  g.save();g.imageSmoothingEnabled=false;
  if(eat){
    if(dx<0)g.scale(-1,1);
    const split=my+2+68;
    const faceBody=()=>{draw(0,split,96,80-split,-48,split-68,96,80-split);
      draw(0,0,96,split,-48+P.lean,-68+P.head,96,split);};
    if(key==='copter')tailRotor(g,h,t,false,1,P.lean,P.head,()=>{
      const dog=document.getElementById('wall-sheet');
      g.drawImage(dog,0,415,31,11,-15,-9,31,11);
      g.drawImage(dog,0,400,31,15,-15+P.lean,-24+P.head,31,15);
    });else faceBody();
    const x=mx+P.lean,y=my+P.head,w=key==='lion'?3:6,m=Math.round(P.mouth*6*(P.mouthBoost||1));
    if(P.eyes==='wide'){for(const s of [-1,1]){px(g,x+s*2-1,y-4,2,2,C.eye);px(g,x+s*2,y-4,1,1,C.pupil);}}
    else if(P.eyes==='closed'||P.eyes==='happy'||P.eyes==='half'){for(const s of [-1,1])px(g,x+s*2-1,y-3,2,1,C.line);}
    if(m){rrect(g,x-(w>>1),y,w,m,C.mouth,C.line);if(m>3){px(g,x-(w>>1),y,w,1,C.teeth);px(g,x-1,y+m-2,2,2,C.tongue);}}
    // 물건·하트·연기는 출신형의 입을 기준으로 옮긴다. 포물선과 박자는 v0.50 그대로.
    g.translate(mx-8,my-P.my);items(g,P,t);
  }else{
    if(h.state==='sit')g.scale(1.08,.74);
    if(h.hurtT>0)g.rotate(-.12);
    if(key==='copter'){
      const ox=wall?side*11:0,oy=hit?0:-((t>>2)&1);
      const face=h.dir||1,im=document.getElementById('wall-sheet');
      tailRotor(g,h,t,hit,dx,ox,oy,()=>{g.save();g.translate(ox,oy);g.scale(face,1);if(wall)g.rotate(.12*side*face);g.drawImage(im,0,400,31,26,-15,-24,31,26);g.restore();},face);
    }else if(hit&&wall){
      drawWallStrike(g,key,h,originRow[key]);
    }else{
      if(hit&&wall&&!dogWall)g.translate(side*12,0);
      const mirror=climbing?side>0:dx<0&&(!hit||dy!==0);
      if(mirror)g.scale(-1,1);
      if(key==='fly'&&!hit&&!wall)g.translate(0,-((t>>(P.flap?1:2))&1));
      if(!hit&&!wall&&!walk&&key!=='fly'&&(t>>5&1))g.scale(1,1.018);
      const stride=mode===6?Math.round(2*Math.sin(walk*.42)):0;
      if(stride&&key==='shushu'){
        draw(0,0,96,59,-48,-68,96,59);
        for(const j of [0,1]){const step=(j?1:-1)*Math.sign(stride);draw(48*j,59,48,21,-48+j*48+step,-9-(step>0?1:0),48,21);}
      }else if(stride&&(key==='fly'||key==='lion')){g.translate(0,-Math.abs(stride));draw(0,0,96,80,-48,-68,96,80);}
      else if(stride&&key!=='podong'){
        const cut=56,rise=Math.abs(stride);draw(0,0,96,cut,-48,-68-rise,96,cut+rise);
        draw(0,cut,48,24,-48-stride,cut-68,48,24);draw(48,cut,48,24,stride,cut-68-Math.max(0,stride),48,24);
      }else draw(0,0,96,80,-48,-68,96,80);
      if(dogWall&&hit){const q=Math.sin((16-h.punchT)*Math.PI/16),ux=dx*(mirror?-1:1);
        limb(g,-3,-13,-3+ux*Math.round(3+3*q),-13+dy*Math.round(2+4*q),3,C.fur,C.line);}
    }
    if(P.extra.length)items(g,P,t);
  }
  g.restore();
}
function drawMonster(g,form,h,t,x,y){
  if(form.look==='legacy')return RamLegacy.drawMonster(g,form,h,t,x,y);
  g.save(); g.translate(Math.round(x),Math.round(y));
  if(h.shrinkT>0){ if(h.dir<0) g.scale(-1,1); if(h.shrinkT>96&&((t>>1)&1)){ g.globalAlpha=0.5; } shrunk(g,h,t); g.restore(); return; }
  if(h.hurtT>0&&((t>>1)&1)&&h.eatT<=0) g.globalAlpha=0.55;
  const P=poseOf(h,t,form); if(form.look!=='origin'&&!P.back&&h.dir<0) g.scale(-1,1); if(P.sx&&P.sy&&(P.sx!==1||P.sy!==1)) g.scale(P.sx,P.sy);
  const key=FACE[form.key]?form.key:'podong'; if(form.look==='origin')originBody(g,key,P,h,t);else body(g,P,t,key,h);
  g.restore();
}
/* 표지·머리글용 서 있는 몬스터(가짜 상태) */
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
  px(g,2,-8,2,2,'#6694a3');px(g,3,-8,1,1,'#cbdcd6'); /* 앞 유리의 빗면 */
  px(g,8,-5,3,1,hi);px(g,8,-4,3,1,b2);px(g,-5,-5,1,3,b2);px(g,3,-5,1,3,b2);
  px(g,-3,-5,2,1,hi);px(g,6,-5,1,1,hi); /* 문 이음새·손잡이·보닛 */
  px(g,11,-5,1,2,'#fff2b0'); px(g,-12,-5,1,2,'#df7463');px(g,11,-2,2,1,'#c5d1c9'); /* 전조등·후미등·범퍼 */ g.restore(); }
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
/* 트램: 두 량짜리 노면전차. 앞 량은 진행 방향(dir) 쪽, 뒤 량은 연결기 뒤. 각 량 26px, 사이 2px */
const TRAM_DEFAULT=['#2e8b57','#216b43','#8fd9a8'];
function tramLivery(e){ const EG=root.Engine; const c=(EG&&e.city)?EG.CITIES[(e.city-1)%EG.CITIES.length]:null; return (c&&c.tram)||TRAM_DEFAULT; } /* 도시마다 도색이 다르다(엔진 CITIES.tram). 엔진이 없으면 기본 초록 */
/* 광고판 10×5: 0 빨간 콜라(흰 물결) · 1 파랑·빨강 둥근 콜라 · 2 포동이 얼굴. 실제 상표 로고는 그리지 않고 느낌만 낸다 */
function adPanel(g,x,y,kind){ px(g,x-1,y-1,12,7,'#1a1620');
  if(kind===0){ px(g,x,y,10,5,'#d8322a'); px(g,x+1,y+1,2,1,'#fff'); px(g,x+3,y+2,2,1,'#fff'); px(g,x+5,y+1,2,1,'#fff'); px(g,x+7,y+2,2,1,'#fff'); px(g,x+1,y+4,8,1,'#f6b9b3'); }
  else if(kind===1){ px(g,x,y,10,5,'#f4f1ea'); px(g,x+3,y,4,2,'#1d4fa0'); px(g,x+2,y+1,6,1,'#1d4fa0'); px(g,x+3,y+3,4,2,'#d8322a'); px(g,x+2,y+3,6,1,'#d8322a'); px(g,x+2,y+2,6,1,'#fff'); px(g,x,y,1,5,'#1d4fa0'); px(g,x+9,y,1,5,'#d8322a'); }
  else { px(g,x,y,10,5,'#f7d7e0'); px(g,x+3,y,5,5,'#fff'); px(g,x+2,y+1,1,3,'#fff'); px(g,x+8,y+1,1,3,'#fff'); px(g,x+4,y+1,1,1,'#1a1620'); px(g,x+6,y+1,1,1,'#1a1620'); px(g,x+5,y+3,1,1,'#1a1620'); px(g,x+4,y+4,3,1,'#e2576a'); } }
function tram(g,e,t){ g.save(); g.translate(Math.round(e.x),Math.round(e.y)); if(e.dir<0) g.scale(-1,1); const L=C.line; const [body,body2,hi]=tramLivery(e); const cream='#f1e9c9';
  for(const car of [0,1]){ const ox=car===0?2:-26; /* 앞 량 x: 2..28 · 뒤 량 x: -26..0 */
    px(g,ox-1,-14,28,1,L); px(g,ox-1,-1,28,1,L); px(g,ox-1,-13,1,12,L); px(g,ox+26,-13,1,12,L); /* 윤곽 */
    px(g,ox,-13,26,12,body); px(g,ox,-13,26,1,hi); px(g,ox,-6,26,1,cream); px(g,ox,-5,26,4,body2);
    px(g,ox+1,-14,24,1,body2);px(g,ox+3,-14,20,1,hi); /* 얕게 솟은 지붕 */
    for(let i=0;i<4;i++){ px(g,ox+2+i*6,-11,4,4,'#7199a3'); px(g,ox+2+i*6,-11,2,1,'#d1e0d5');px(g,ox+3+i*6,-8,3,1,'#4c707f'); px(g,ox+1+i*6,-11,1,4,body2); } /* 창 넷 */
    if(car===0){ px(g,ox+24,-11,1,4,'#fff2b0'); px(g,ox+21,-8,2,3,body2); } else { px(g,ox,-11,1,4,'#ff5a5a'); } /* 전조등·후미등 */
    { const ad=car===0?(e.ad|0):(e.ad2==null?(e.ad|0):e.ad2|0); g.save(); if(e.dir<0){ g.translate(ox*2+26,0); g.scale(-1,1); } adPanel(g,ox+8,-6,ad%3); g.restore(); } /* 옆구리 광고판(뒤집혀도 바로 보이게) */
    px(g,ox+4,-2,5,3,C.wheel); px(g,ox+17,-2,5,3,C.wheel); px(g,ox+5,-1,3,1,'#8a8d92'); px(g,ox+18,-1,3,1,'#8a8d92'); }
  px(g,0,-8,2,3,L); /* 연결기 */
  /* 팬터그래프: 앞 량 지붕 위의 집전 장치. 흔들림을 t로 */ const pw=(t>>3)&1; px(g,9,-17,8,1,L); px(g,11,-16,1,2,L); px(g,14,-16+pw,1,2,L); px(g,8,-18,10,1,'#5a5a5a');
  g.restore(); }
function shot(g,s){ if(s.kind==='bullet') px(g,s.x-1,s.y-1,2,2,C.bullet); else if(s.kind==='shell'){ px(g,s.x-2,s.y-1,4,3,C.shell); px(g,s.x-3,s.y,1,1,C.fire); } else { px(g,s.x-3,s.y-1,6,3,C.rocket); px(g,s.x-5-(s.t&1),s.y-1,2,3,C.fire); px(g,s.x+3,s.y,1,1,C.teeth); } }
const BURSTS={ soldier:{pts:4,r:7,inner:0.4,spin:1.2,c1:'#ffd36a',c2:'#fff'}, taxi:{pts:6,r:12,inner:0.5,spin:1.0,c1:'#ffb13a',c2:'#ffe27a'}, cop:{pts:5,r:13,inner:0.45,spin:-1.4,c1:'#4aa3ff',c2:'#ff5a5a'},
  tram:{pts:8,r:17,inner:0.55,spin:0.8,c1:'#8fd9a8',c2:'#fff6c9'}, tank:{pts:9,r:16,inner:0.5,spin:0.6,c1:'#ff7a3a',c2:'#ffd36a'}, heli:{pts:7,r:15,inner:0.42,spin:-1.0,c1:'#ff5a3a',c2:'#ffe27a'} };
function star(g,cx,cy,n,r1,r2,rot,col){ g.fillStyle=col; g.beginPath(); for(let i=0;i<n*2;i++){ const r=(i&1)?r2:r1, ang=rot+i*Math.PI/n; const X=cx+Math.cos(ang)*r, Y=cy+Math.sin(ang)*r; if(i===0) g.moveTo(X,Y); else g.lineTo(X,Y); } g.closePath(); g.fill(); }
function fx(g,x){ const a=x.t;
  if(x.k==='dust'){ for(let i=0;i<5;i++){ const ang=i*1.26+x.x*0.1; const r=a*0.8+2; px(g,x.x+Math.cos(ang)*r-1,x.y+Math.sin(ang)*r*0.6-a*0.3,3-(a>10?1:0),2,i%2?C.dust:C.dust2); } }
  else if(x.k==='spark'){ for(let i=0;i<4;i++){ const ang=i*1.57+0.5; px(g,x.x+Math.cos(ang)*a*0.9,x.y+Math.sin(ang)*a*0.9,2,1,C.spark); } }
  else if(x.k==='boom'){ const r=Math.min(14,a*1.2); blob(g,x.x,x.y,r,r*0.8,a<10?C.boom2:C.boom); if(a>6) blob(g,x.x,x.y-2,r*0.5,r*0.4,a<16?C.boom:C.dust2); }
  else if(x.k==='burst'){ /* 별 모양 폭발: 기물 종류(n)마다 꼭짓점 수·색이 다르다. 커지며 돌다가 옅어진다 */
    const B=BURSTS[x.n]||BURSTS.taxi; const life=34, p=Math.min(1,a/life); const r=B.r*(0.3+0.9*Math.sin(p*Math.PI*0.5)); const rot=x.x*0.01+p*B.spin;
    g.save(); g.globalAlpha=Math.max(0,1-Math.pow(p,2.2)); star(g,x.x,x.y,B.pts,r,r*B.inner,rot,p<0.35?B.c2:B.c1); if(a>3) star(g,x.x,x.y,B.pts,r*0.55,r*0.55*B.inner,-rot*1.3,p<0.6?'#fff7d6':B.c2); g.restore(); }
  else if(x.k==='shard'){ /* 파편 줄기: 별 폭발에서 사방으로 튀는 선 */ const ang=(x.n||0)*0.9, r0=a*1.6, r1=a*1.6+4; g.save(); g.globalAlpha=Math.max(0,1-a/26); g.strokeStyle=(a&2)?C.boom2:'#fff'; g.lineWidth=1; g.beginPath(); g.moveTo(x.x+Math.cos(ang)*r0,x.y+Math.sin(ang)*r0*0.8); g.lineTo(x.x+Math.cos(ang)*r1,x.y+Math.sin(ang)*r1*0.8); g.stroke(); g.restore(); }
  else if(x.k==='cloud'){ /* 분진: 커지며 옅어지는 뭉게구름 */ const r=4+a*0.45, al=Math.max(0,1-a/44); g.save(); g.globalAlpha=al*0.85; blob(g,x.x,x.y-a*0.35,r,r*0.7,C.dust); g.globalAlpha=al*0.6; blob(g,x.x-r*0.5,x.y-a*0.25+2,r*0.6,r*0.45,C.dust2); blob(g,x.x+r*0.55,x.y-a*0.4,r*0.55,r*0.4,'#e8dfcc'); g.restore(); }
  else if(x.k==='chunk'){ /* 벽돌 조각 */ const col=(x.wall||C.dust2); const sz=x.sz||2; px(g,x.x,x.y-sz,sz,sz,col); if(sz>2) px(g,x.x,x.y-sz,1,1,'#fff6'); }
  else if(x.k==='glass'){ /* 유리 조각 */ px(g,x.x,x.y-1,1,1,(a>>1)&1?'#d8f1fa':'#7eb6cc'); } }

root.Sprites={C,px,blob,limb,person,drawMonster,drawIdle,poseOf,soldier,car,tank,heli,tram,adPanel,tramLivery,shot,fx,star,BURSTS};
})(typeof window!=='undefined'?window:module.exports);
