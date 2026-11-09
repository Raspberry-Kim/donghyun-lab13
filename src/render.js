/* 동현램 그림: 320×200 화면. 하늘(해·달·별·구름)·두 겹의 먼 도시·가로등·보도·길, 건물(벽돌 질감·창틀·선반·문·옥상 물탱크), 깎인 구멍, 적·몬스터·탄·효과·HUD.
   모두 코드로 그린다. 건물은 칸(20×16)마다 벽 조각을 따로 그려서, 뚫린 자리·모서리까지 터진 자리는 아예 벽을 그리지 않는다(그 뒤의 하늘이 보인다). */
(function(root){
'use strict';
const E=root.Engine, SP=root.Sprites, C=SP.C, px=SP.px;
const {W,H,GROUND,FLOOR,COLS,CELL_W}=E;
/* 건물 색: wall 바탕 · wall2 그늘 · wall3 밝은 면 · trim 창틀·선반 · roof 옥상 · door 문 */
const WALLS=[
  {wall:'#b86f58',wall2:'#8a4e40',wall3:'#d49078',trim:'#efd6c2',roof:'#5a3a30',roof2:'#7a5248',door:'#4a2e26'},
  {wall:'#98a2b3',wall2:'#6a7382',wall3:'#b9c2d0',trim:'#e6ebf1',roof:'#434a56',roof2:'#5d6573',door:'#2f3540'},
  {wall:'#d7c39d',wall2:'#a99270',wall3:'#ebdcbd',trim:'#fbf3e2',roof:'#6b5a3e',roof2:'#8a7656',door:'#5a4630'},
  {wall:'#7d8d9d',wall2:'#566574',wall3:'#9aabbb',trim:'#d3dde6',roof:'#353f4a',roof2:'#4c5967',door:'#26303a'},
  {wall:'#c8927a',wall2:'#9a6753',wall3:'#e0b09a',trim:'#f6e2d2',roof:'#5c3b2d',roof2:'#7b5243',door:'#4a2d22'},
  {wall:'#a7b59e',wall2:'#788770',wall3:'#c3cfba',trim:'#e6eedf',roof:'#4b5545',roof2:'#64705c',door:'#394232'}
];
const GL={hi:'#e4f4fb',a:'#a6d6ea',b:'#6fa9c4',dark:'#1e1922',inner:'#2b242e',inner2:'#3a3240',lit:'#ffd98a',lit2:'#e8a94e',rebar:'#6d5a48'};
const hsh=(a,b,c)=>{ let h=(a*73856093)^(b*19349663)^((c|0)*83492791); h=Math.imul(h^(h>>>13),1274126177); return (h^(h>>>16))>>>0; };
function lum(hex){ const n=parseInt(hex.slice(1),16); return (0.299*(n>>16)+0.587*((n>>8)&255)+0.114*(n&255))/255; }
function isNight(Cc){ return lum(Cc.sky[0])<0.42; }

/* ---------- 배경 ---------- */
function backdrop(g,S,t){
  const Cc=E.cityOf(S), night=isNight(Cc);
  const gr=g.createLinearGradient(0,0,0,GROUND); gr.addColorStop(0,Cc.sky[0]); gr.addColorStop(1,Cc.sky[1]); g.fillStyle=gr; g.fillRect(0,0,W,H);
  if(night){ /* 별·달 */
    for(let i=0;i<34;i++){ const h=hsh(i,7,S.city); const x=h%W, y=12+(h>>9)%90; const tw=((t>>3)+i)%7===0; px(g,x,y,1,1,tw?'rgba(255,255,255,.95)':'rgba(255,255,255,.55)'); }
    SP.blob(g,262,34,9,9,'#f3eecf'); SP.blob(g,266,32,7,7,Cc.sky[0]); px(g,258,36,1,1,'#e3dcb5'); px(g,261,40,1,1,'#e3dcb5');
  } else { /* 해와 번짐 */
    g.save(); g.globalAlpha=0.35; SP.blob(g,262,34,15,15,'#fff7d6'); g.globalAlpha=0.6; SP.blob(g,262,34,11,11,'#fff3c4'); g.restore(); SP.blob(g,262,34,8,8,'#fffbe8');
  }
  /* 구름: 둥근 덩어리 셋을 겹친다 */
  for(let i=0;i<5;i++){ const cx=((i*83+t*0.06)%(W+70))-35, cy=18+(i*29)%44, s=0.8+(i%3)*0.3; const c1=night?'rgba(200,205,225,.55)':'rgba(255,255,255,.85)', c2=night?'rgba(170,178,205,.5)':'rgba(236,243,250,.85)';
    SP.blob(g,cx,cy+2,Math.round(13*s),Math.round(3*s),c2); SP.blob(g,cx-4*s,cy,Math.round(6*s),Math.round(4*s),c1); SP.blob(g,cx+4*s,cy-1,Math.round(7*s),Math.round(5*s),c1); SP.blob(g,cx+11*s,cy+1,Math.round(5*s),Math.round(3*s),c1); }
  /* 먼 도시 두 겹: 뒤는 옅고 낮게, 앞은 짙고 창이 보인다 */
  g.save(); g.globalAlpha=0.5; for(let i=0;i<15;i++){ const h=hsh(i,3,S.city); const bw=14+(h%14), bh=14+((h>>4)%26), bx=i*23-6+((h>>8)%7); px(g,bx,GROUND-bh-6,bw,bh+6,Cc.fog); if((h>>12)&1) px(g,bx+bw/2-1,GROUND-bh-12,2,6,Cc.fog); } g.restore();
  for(let i=0;i<13;i++){ const h=hsh(i,5,S.city); const bw=16+(h%12), bh=8+((h>>4)%16), bx=i*26-4+((h>>8)%9); px(g,bx,GROUND-bh-6,bw,bh+6,Cc.fog); px(g,bx,GROUND-bh-6,bw,1,'rgba(255,255,255,.18)');
    for(let r=0;r<Math.floor(bh/6);r++) for(let c=0;c<Math.floor(bw/5);c++){ const on=hsh(i,r,c+S.city)%5===0; if(night?on:((r+c)%2===0)) px(g,bx+2+c*5,GROUND-bh-2+r*6,2,2,night?(on?'rgba(255,220,140,.9)':'rgba(255,255,255,.1)'):'rgba(255,255,255,.22)'); } }
  /* 보도·연석·길 */
  px(g,0,GROUND-6,W,6,'#8a8d92'); px(g,0,GROUND-6,W,1,'#b9bcc1'); for(let x=0;x<W;x+=8) px(g,x,GROUND-5,1,5,'#7a7d82'); px(g,0,GROUND-1,W,1,'#5e6166');
  px(g,0,GROUND,W,H-GROUND,'#41444b'); px(g,0,GROUND,W,1,'#55585f'); for(let i=0;i<40;i++){ const h=hsh(i,11,1); px(g,(h%W),GROUND+2+((h>>9)%20),1,1,'rgba(255,255,255,.05)'); }
  for(let x=0;x<W;x+=24) px(g,x,GROUND+10,12,2,'#d9d3b2'); px(g,0,GROUND+22,W,2,'#2b2d33');
  /* 트램 선로: 길 위에 가는 쇠줄 두 가닥 */ px(g,0,GROUND+1,W,1,'#6a6d74'); px(g,0,GROUND+4,W,1,'#6a6d74'); for(let x=2;x<W;x+=6) px(g,x,GROUND+2,1,2,'rgba(0,0,0,.18)');
  /* 맨홀 */ px(g,150,GROUND+15,10,2,'#30333a'); px(g,151,GROUND+15,8,1,'#5a5e66');
  /* 가로등: 골목 가운데와 양 끝 */
  const lamps=[]; const bs=S.builds; if(bs.length){ lamps.push(bs[0].x-E.GAP/2); for(let i=1;i<bs.length;i++) lamps.push(Math.round((bs[i-1].x+bs[i-1].w+bs[i].x)/2)); lamps.push(bs[bs.length-1].x+bs[bs.length-1].w+E.GAP/2); }
  for(const lx of lamps){ px(g,lx,GROUND-28,1,22,'#3a3d44'); px(g,lx-1,GROUND-7,3,1,'#2b2d33'); px(g,lx,GROUND-29,3,1,'#3a3d44'); px(g,lx+2,GROUND-31,3,3,night?'#ffe6a3':'#d8dde3'); if(night){ g.save(); g.globalAlpha=0.18; SP.blob(g,lx+3,GROUND-28,7,5,'#ffe6a3'); g.restore(); } }
}

/* ---------- 건물 ---------- */
function rubble(g,b,c){
  px(g,b.x-3,GROUND-6,b.w+6,6,c.wall2); px(g,b.x-1,GROUND-9,b.w+2,3,c.wall); px(g,b.x+3,GROUND-12,b.w-6,3,c.wall); px(g,b.x+8,GROUND-14,b.w-18,2,c.wall3);
  px(g,b.x+4,GROUND-11,5,3,c.trim); px(g,b.x+5,GROUND-10,3,1,GL.dark); /* 창틀 조각 */
  px(g,b.x+b.w-14,GROUND-13,9,2,c.roof); px(g,b.x+b.w-6,GROUND-10,4,4,c.wall2); px(g,b.x+1,GROUND-7,1,3,GL.rebar); px(g,b.x+b.w-9,GROUND-16,1,5,GL.rebar);
  for(let i=0;i<8;i++){ const h=hsh(b.i,i,5); px(g,b.x-2+(h%(b.w+4)),GROUND-5-((h>>6)%5),1+((h>>9)&1),1,(h>>3)&1?c.wall2:c.wall3); }
}
/* 벽 조각 한 칸: 뚫린 자리·모서리 터진 자리는 비운다 */
/* 모서리가 터진 폭: 층마다 3~6px로 들쭉날쭉 */
function openW(b,r,col){ return 3+(hsh(b.i,r*5+col,13)%4); }
function wallCell(g,b,c,r,col,cell,night){
  const cx=b.x+col*CELL_W, cy=GROUND-(r+1)*FLOOR; const hole=cell.hp<=0; const cut=cell.cut||0; const edgeL=col===0, edgeR=col===COLS-1;
  const openL=hole&&(cut&2)&&edgeL, openR=hole&&(cut&2)&&edgeR; const ow=openW(b,r,col);
  const holeL=!edgeL&&b.cells[r][col-1].hp<=0, holeR=!edgeR&&b.cells[r][col+1].hp<=0; /* 옆 칸도 뚫렸으면 사이 벽을 두지 않아 구멍이 하나로 이어진다 */
  if(!hole){ px(g,cx,cy,CELL_W,FLOOR,c.wall); }
  else { /* 구멍 둘레의 벽만: 위 선반 1줄, 아래 바닥판 2줄, 양옆 2px(터진 쪽은 비움) */
    if(!(cut&8)) px(g,cx,cy,CELL_W,1,c.wall); else { px(g,cx,cy,3,1,c.wall); px(g,cx+CELL_W-3,cy,3,1,c.wall); }
    if(!(cut&4)) px(g,cx,cy+FLOOR-2,CELL_W,2,c.wall); else { px(g,cx,cy+FLOOR-2,3,2,c.wall); px(g,cx+CELL_W-3,cy+FLOOR-2,3,2,c.wall); }
    if(openL){ px(g,cx+ow-2,cy+FLOOR-2,2,2,c.wall2); px(g,cx+ow-3,cy+FLOOR-1,1,1,c.wall2); if(!(cut&8)) px(g,cx,cy,1,1,c.wall2); px(g,cx,cy+FLOOR-2,ow-2,2,c.wall2); }
    else if(!holeL){ px(g,cx,cy+1,2,FLOOR-3,c.wall); }
    if(openR){ px(g,cx+CELL_W-ow,cy+FLOOR-2,2,2,c.wall2); px(g,cx+CELL_W-ow+2,cy+FLOOR-1,1,1,c.wall2); if(!(cut&8)) px(g,cx+CELL_W-1,cy,1,1,c.wall2); px(g,cx+CELL_W-ow+2,cy+FLOOR-2,ow-2,2,c.wall2); }
    else if(!holeR){ px(g,cx+CELL_W-2,cy+1,2,FLOOR-3,c.wall); }
  }
  /* 벽돌 질감: 드문드문 어두운 점 */
  for(let i=0;i<4;i++){ const h=hsh(b.i*7+r,col*3+i,2); const bx=cx+(h%(CELL_W-2))+1, by=cy+2+((h>>5)%(FLOOR-5)); if(hole&&bx>cx+1&&bx<cx+CELL_W-2) continue; g.save(); g.globalAlpha=0.28; px(g,bx,by,2,1,c.wall2); g.restore(); }
  /* 층 선반(밝은 윗선)·바닥판(어두운 아랫선) */
  const lx=openL?cx+ow:cx, rx=openR?cx+CELL_W-ow:cx+CELL_W;
  if(!hole||!(cut&8)) px(g,lx,cy,rx-lx,1,c.wall3);
  if(!hole||!(cut&4)) px(g,lx,cy+FLOOR-1,rx-lx,1,c.wall2);
  /* 건물 모서리: 왼쪽은 밝게, 오른쪽은 그늘 */
  if(edgeL&&!openL) px(g,cx,cy,1,FLOOR,c.wall3); if(edgeR&&!openR) px(g,cx+CELL_W-1,cy,1,FLOOR,c.wall2);
  if(hole) return;
  /* 창: 틀·유리·중간살·창턱 */
  const wx=cx+4, wy=cy+3, ww=12, wh=9;
  px(g,wx-1,wy-1,ww+2,wh+2,c.trim); px(g,wx+ww,wy-1,1,wh+2,c.wall2);
  const lit=night&&(hsh(b.i,r,col+11)%3===0);
  if(cell.hp>=3){ if(lit){ px(g,wx,wy,ww,wh,GL.lit); px(g,wx,wy+5,ww,wh-5,GL.lit2); } else { px(g,wx,wy,ww,wh,GL.a); px(g,wx,wy,ww,2,GL.hi); px(g,wx,wy+5,ww,wh-5,GL.b); px(g,wx+1,wy+1,1,1,'#fff'); }
    px(g,wx+5,wy,2,wh,c.trim); px(g,wx,wy+4,ww,1,c.trim); }
  else if(cell.hp>=1.5){ /* 금 간 유리: 한 귀퉁이가 빠지고 흰 금이 번진다 */
    px(g,wx,wy,ww,wh,GL.a); px(g,wx,wy+5,ww,wh-5,GL.b); px(g,wx+5,wy,2,wh,c.trim); px(g,wx,wy+4,ww,1,c.trim);
    px(g,wx+7,wy,5,3,GL.dark); px(g,wx+6,wy+3,1,1,'#fff'); px(g,wx+5,wy+4,1,1,'#fff'); px(g,wx+4,wy+5,1,1,'#fff'); px(g,wx+2,wy+6,2,1,'#fff'); px(g,wx+8,wy+3,1,1,'#fff'); px(g,wx+9,wy+4,1,2,'#fff'); px(g,wx+3,wy+2,1,1,'#fff'); px(g,wx+2,wy+1,1,1,'#fff'); }
  else { /* 유리 없음·틀 부서짐: 안이 어둡고 틀 한쪽이 떨어져 나가고 벽돌이 이가 빠졌다 */
    px(g,wx,wy,ww,wh,GL.inner); px(g,wx,wy+6,ww,1,GL.inner2); px(g,wx+2,wy+1,3,1,GL.inner2);
    px(g,wx+5,wy+3,2,wh-3,c.trim); px(g,wx-1,wy+5,1,wh-4,c.wall2); px(g,wx+ww,wy-1,2,4,c.wall);
    px(g,wx-2,wy+1,1,2,c.wall2); px(g,wx+ww+1,wy+6,1,2,c.wall2); px(g,wx+3,wy-2,2,1,c.wall2); px(g,wx+ww-3,wy+wh+1,2,1,c.wall2); px(g,wx+8,wy-1,3,1,GL.inner); }
  /* 창턱과 그 그림자 */ px(g,wx-2,wy+wh+1,ww+4,1,c.trim); px(g,wx-2,wy+wh+2,ww+4,1,c.wall2);
}
/* 구멍 안쪽: 어두운 실내, 바닥선, 삐죽한 가장자리, 철근, 그리고 안에 숨은 사람 */
function holeCell(g,b,c,r,col,cell,t){
  const cx=b.x+col*CELL_W, cy=GROUND-(r+1)*FLOOR; const cut=cell.cut||0; const edgeL=col===0, edgeR=col===COLS-1; const openL=(cut&2)&&edgeL, openR=(cut&2)&&edgeR; const ow=openW(b,r,col);
  const holeL=!edgeL&&b.cells[r][col-1].hp<=0, holeR=!edgeR&&b.cells[r][col+1].hp<=0;
  const x0=openL?cx+ow:holeL?cx:cx+2, x1=openR?cx+CELL_W-ow:holeR?cx+CELL_W:cx+CELL_W-2; /* 터진 쪽은 하늘이 보이게 비우고, 옆 칸과 이어진 쪽은 경계 없이 잇는다 */
  px(g,x0,cy+1,x1-x0,FLOOR-3,GL.dark); px(g,x0+1,cy+2,x1-x0-2,4,GL.inner); px(g,x0,cy+FLOOR-4,x1-x0,1,GL.inner2); /* 뒷벽·바닥선 */
  /* 삐죽한 가장자리: 바깥으로 1px씩 물어뜯긴 자리와 안으로 남은 벽돌 */
  for(let y=cy+1;y<cy+FLOOR-2;y++){ const h=hsh(b.i,r*16+y,col);
    if(openL){ /* 터진 모서리: 벽이 들쭉날쭉 남고 안쪽은 어둡다 */ const bite=(h%3); px(g,x0-bite,y,bite,1,(h>>4)&1?c.wall2:c.wall); if((h>>2)&1) px(g,x0,y,1,1,GL.inner); }
    else if(!holeL){ if(h&1) px(g,x0-1,y,1,1,GL.dark); else if((h>>1)&1) px(g,x0,y,1,1,c.wall2); }
    if(openR){ const bite=((h>>6)%3); px(g,x1,y,bite,1,(h>>5)&1?c.wall2:c.wall); if((h>>3)&1) px(g,x1-1,y,1,1,GL.inner); }
    else if(!holeR){ if((h>>2)&1) px(g,x1,y,1,1,GL.dark); else if((h>>3)&1) px(g,x1-1,y,1,1,c.wall2); } }
  /* 떨어져 나간 창틀 조각·철근·안쪽에 흩어진 벽돌 부스러기 */ px(g,x0+2,cy+2,3,1,c.trim); px(g,x1-4,cy+FLOOR-5,1,3,GL.rebar);
  for(let i=0;i<3;i++){ const h=hsh(b.i*3+r,col*5+i,17); const dx=x0+1+(h%Math.max(1,x1-x0-3)), dy=cy+FLOOR-4-((h>>5)%3); px(g,dx,dy,1+((h>>8)&1),1,(h>>3)&1?c.wall2:GL.inner2); }
  if(cut&4){ /* 아래 주먹: 바닥판이 깨져 아래층 천장까지 뚫렸다. 매달린 판 조각·철근 */ px(g,cx+4,cy+FLOOR-2,CELL_W-8,3,GL.dark); px(g,cx+5,cy+FLOOR-2,2,2,c.wall2); px(g,cx+13,cy+FLOOR-2,1,4,GL.rebar); px(g,cx+9,cy+FLOOR,3,1,c.wall); }
  if(cut&8){ /* 위 주먹: 상인방이 깨져 위층 바닥까지 뚫렸다 */ px(g,cx+4,cy-2,CELL_W-8,3,GL.dark); px(g,cx+6,cy-2,1,3,GL.rebar); px(g,cx+12,cy-1,3,1,c.wall2); px(g,cx+8,cy-2,2,1,c.wall); }
  if(cell.person) SP.person(g,cx+CELL_W/2,cy+FLOOR-3,t,1,r*2+col+b.i);
}
/* 붕괴 예고의 금: 건물 전면에 지그재그 금이 위에서 아래로 번지고, 진행될수록 가지가 늘어난다. 자리는 건물 번호로 고정해 떨리지 않는다 */
function cracks(g,b,top,p){ const hgt=GROUND-top; const n=2+Math.floor(p*3); g.save(); g.strokeStyle='rgba(20,14,10,.9)'; g.lineWidth=1; g.lineCap='square';
  for(let i=0;i<n;i++){ const h0=hsh(b.i,i,77); let x=b.x+4+(h0%(b.w-8)), y=top+((h0>>5)%8); const len=hgt*Math.min(1,p*1.6+i*0.1); g.beginPath(); g.moveTo(x+0.5,y+0.5); let dy=0; let k=0;
    while(dy<len&&y+dy<GROUND-2){ const hh=hsh(b.i,i,k+9); const dx=((hh%5)-2)*2; dy+=3+(hh>>4)%4; x=Math.max(b.x+1,Math.min(b.x+b.w-1,x+dx)); g.lineTo(x+0.5,y+dy+0.5); if(p>0.5&&(hh>>7)%3===0){ const bx=x+(((hh>>9)&1)?5:-5); g.lineTo(bx+0.5,y+dy+2.5); g.moveTo(x+0.5,y+dy+0.5); } k++; }
    g.stroke(); }
  if(p>0.3){ g.strokeStyle='rgba(255,255,255,.25)'; for(let i=0;i<n;i++){ const h0=hsh(b.i,i,77); const x=b.x+4+(h0%(b.w-8)); g.beginPath(); g.moveTo(x+1.5,top+2.5); g.lineTo(x+1.5,top+2.5+hgt*Math.min(1,p*1.6)*0.5); g.stroke(); } }
  g.restore(); }
function building(g,S,b,t,night){
  const c=WALLS[b.i%WALLS.length];
  if(b.state==='gone'){ rubble(g,b,c); return; }
  const top=E.topY(b); const drop=b.state==='falling'?b.drop:0; const warn=b.state==='warn'?Math.min(1,b.warn/E.WARN_T):0;
  /* 흔들림: 붕괴 예고 중에는 진행될수록 세게(±1→±2, 위아래도 조금), 무너질 때는 ±1 */
  let shake=b.state==='falling'?((b.fall&1)?1:-1):0, sy=0; if(warn){ const amp=warn<0.5?1:2; shake=((b.warn&1)?1:-1)*amp*((b.warn>>1)&1?1:0.5); sy=warn>0.6&&(b.warn%3===0)?1:0; }
  g.save(); g.translate(Math.round(shake),drop+sy); g.beginPath(); g.rect(0,-drop-sy,W,GROUND+drop+sy); g.clip();
  for(let r=0;r<b.floors;r++) for(let col=0;col<COLS;col++) wallCell(g,b,c,r,col,b.cells[r][col],night);
  if(warn){ cracks(g,b,top,warn); }
  /* 1층 가운데 문 */ const dx=b.x+Math.floor(b.w/2)-3; if(b.cells[0].every(cl=>cl.hp>0)){ px(g,dx,GROUND-12,7,12,c.trim); px(g,dx+1,GROUND-11,5,11,c.door); px(g,dx+2,GROUND-10,3,3,GL.a); px(g,dx+4,GROUND-6,1,1,c.trim); }
  /* 옥상: 난간·물탱크·실외기·안테나(건물마다 다르게) */
  px(g,b.x-1,top-2,b.w+2,3,c.roof); px(g,b.x-1,top-2,b.w+2,1,c.roof2); px(g,b.x,top+1,b.w,1,c.wall2);
  const h=hsh(b.i,b.floors,9); if(h&1){ px(g,b.x+5,top-9,6,5,c.roof2); px(g,b.x+5,top-9,6,1,c.trim); px(g,b.x+6,top-4,1,2,c.roof); px(g,b.x+9,top-4,1,2,c.roof); } if((h>>1)&1){ px(g,b.x+b.w-13,top-5,6,3,c.roof2); px(g,b.x+b.w-12,top-4,4,1,c.roof); } if((h>>2)&1){ px(g,b.x+b.w-5,top-10,1,8,c.roof); px(g,b.x+b.w-7,top-8,5,1,c.roof); } if(!(h&7)){ px(g,b.x+14,top-6,10,4,c.roof2); px(g,b.x+15,top-5,8,2,c.roof); }
  for(let r=0;r<b.floors;r++) for(let col=0;col<COLS;col++){ const cell=b.cells[r][col]; if(cell.hp<=0) holeCell(g,b,c,r,col,cell,t); }
  g.restore();
}

/* ---------- HUD ---------- */
function hud(g,S,t){
  const f=E.form(S), h=S.hero, Cc=E.cityOf(S);
  px(g,0,0,W,14,'rgba(16,14,24,.82)'); px(g,0,14,W,1,'rgba(255,255,255,.12)');
  g.font='bold 8px Pretendard, sans-serif'; g.textBaseline='top';
  px(g,2,2,38,10,f.color); px(g,2,11,38,1,'rgba(0,0,0,.25)'); g.fillStyle='#1a1620'; g.fillText(f.name,5,3); /* 이름표: 글자 위아래 여백 1px */
  const bx=44, bw=80; px(g,bx-1,3,bw+2,8,'#0e0c14'); px(g,bx,4,bw,6,'#2a2a3a'); const r=Math.max(0,h.stam/E.MAX_STAM); const col=r>0.5?'#5fb44a':r>0.25?'#f2b705':'#e5483a'; px(g,bx,4,Math.round(bw*r),6,col); px(g,bx,4,Math.round(bw*r),1,'rgba(255,255,255,.45)'); for(let i=1;i<10;i++) px(g,bx+i*8,4,1,6,'rgba(0,0,0,.25)');
  g.fillStyle='#fff'; g.fillText(String(S.score).padStart(7,'0'),130,3);
  for(let i=0;i<Math.min(S.lives===Infinity?3:S.lives,5);i++){ px(g,192+i*7,4,5,6,f.color); px(g,193+i*7,5,1,1,'#fff'); } if(S.lives===Infinity) g.fillText('∞',228,3);
  g.textAlign='right'; g.fillText(`${S.city}/${E.CITIES.length} ${Cc.name}`,W-3,3); g.textAlign='left';
  if(S.msgT>0&&S.msg){ g.fillStyle='rgba(16,14,24,.75)'; const w=g.measureText(S.msg).width+10; g.fillRect(W/2-w/2,18,w,12); g.fillStyle='#fff'; g.textAlign='center'; g.fillText(S.msg,W/2,20); g.textAlign='left'; }
}
function render(g,S,t){
  const night=isNight(E.cityOf(S));
  g.save(); if(S.shake>0){ /* 타격감: 기물이 부서지면 화면이 잠깐 들썩인다(결정적: 시간으로 정한다) */ const a=Math.min(3,Math.ceil(S.shake/2)); g.translate(((S.time*7)%3-1)*a,((S.time*5)%3-1)*a); }
  backdrop(g,S,t);
  for(const b of S.builds) building(g,S,b,t,night);
  for(const e of S.ens){ if(!e.alive) continue; if(e.type==='soldier') SP.soldier(g,e,t); else if(e.type==='tank') SP.tank(g,e,t); else if(e.type==='heli') SP.heli(g,e,t); else if(e.type==='tram') SP.tram(g,e,t); else SP.car(g,e,t); }
  const h=S.hero; if(h.state!=='climb'&&h.state!=='ride'){ g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(h.x,(h.state==='roof'?h.y:GROUND)-1,11,2,0,0,Math.PI*2); g.fill(); }
  SP.drawMonster(g,E.form(S),h,t,h.x,h.y);
  for(const s of S.shots) SP.shot(g,s);
  for(const x of S.fx){ if(x.k==='quake') continue; if(x.k==='chunk'){ const c=WALLS[(x.n||0)%WALLS.length]; x.wall=(x.sz===3)?c.wall:c.wall2; } SP.fx(g,x); }
  g.restore();
  if(S.flashT>0){ g.fillStyle=`rgba(255,250,230,${S.flashT>=3?0.45:0.2})`; g.fillRect(0,0,W,H); }
  hud(g,S,t);
}
root.Render={render,WALLS,isNight};
})(typeof window!=='undefined'?window:module.exports);
