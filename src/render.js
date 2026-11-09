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
  /* 먼 풍경: 동네마다 다른 랜드마크(Cc.bg)를 안개색으로, 그 앞에 낮은 먼 건물 한 겹 */
  scenery(g,S,Cc,t,night);
  for(let i=0;i<13;i++){ if(i%3===1) continue; const h=hsh(i,5,S.city); const bw=14+(h%10), bh=4+((h>>4)%8), bx=i*26-4+((h>>8)%9); px(g,bx,GROUND-bh-6,bw,bh+6,Cc.fog); px(g,bx,GROUND-bh-6,bw,1,'rgba(255,255,255,.18)');
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

/* ---------- 지붕 양식(동네마다) ---------- 변형은 b.roofV(0..3)로 조금씩 다르게 */
function roofDeco(g,b,c,top,style,night){
  const x0=b.x, w=b.w, cx=x0+Math.floor(w/2), v=b.roofV|0, h=hsh(b.i,b.floors,9);
  const tile='#4a4f5a', tile2='#6a7080', wood='#8a5a3a', stone='#d9cdb8', stone2='#b9ad98';
  const tank=()=>{ px(g,x0+3,top-9,6,5,c.roof2); px(g,x0+3,top-9,6,1,c.trim); px(g,x0+4,top-4,1,2,c.roof); px(g,x0+7,top-4,1,2,c.roof); };
  const ac=()=>{ px(g,x0+w-10,top-5,6,3,c.roof2); px(g,x0+w-9,top-4,4,1,c.roof); };
  const ant=()=>{ px(g,x0+w-5,top-10,1,8,c.roof); px(g,x0+w-7,top-8,5,1,c.roof); };
  switch(style){
    case 'tank': /* 물탱크·실외기·안테나(원래 양식) */ if(v!==1) tank(); if(v!==2||w>40) ac(); if(v>=2) ant(); if(w>=60&&(h&1)){ px(g,cx-5,top-6,10,4,c.roof2); px(g,cx-4,top-5,8,2,c.roof); } break;
    case 'sign': { /* 옥상 간판: 기둥 둘에 판 하나. 글자 대신 색 띠 */ const sw=Math.min(w-4,14+v*4); const sx=cx-Math.floor(sw/2); px(g,sx+2,top-6,1,4,c.roof); px(g,sx+sw-3,top-6,1,4,c.roof); px(g,sx,top-11,sw,6,'#1a1620'); const pal=[['#f2b705','#e5483a'],['#5fb44a','#fff'],['#4aa3ff','#f2b705'],['#e5483a','#fff']][v]; px(g,sx+1,top-10,sw-2,4,pal[0]); for(let i=0;i<Math.floor((sw-4)/3);i++) px(g,sx+2+i*3,top-9+(i&1),2,1,pal[1]); if(night) px(g,sx+1,top-10,sw-2,1,'rgba(255,255,255,.5)'); if(w>=60) ac(); break; }
    case 'spire': { /* 첨탑: 가운데 단 위에 뾰족한 침과 구슬 */ px(g,cx-3,top-5,7,3,c.roof2); px(g,cx-2,top-7,5,2,c.roof); px(g,cx,top-11,1,4,c.trim); px(g,cx-1,top-12,3,1,c.trim); px(g,cx,top-13,1,1,night?'#ffe6a3':'#e5483a'); if(v&1) ac(); if(v>=2&&w>=40) tank(); break; }
    case 'pediment': { /* 박공(법원식): 돌색 삼각 박공과 작은 기둥 */ const pw=Math.min(w,16+v*6); const sx=cx-Math.floor(pw/2); for(let i=0;i<4;i++){ const ww=pw-i*Math.floor(pw/4); px(g,cx-Math.floor(ww/2),top-3-i,ww,1,i===3?stone:stone2); } px(g,sx,top-3,pw,1,stone); px(g,sx+1,top-2,1,2,stone); px(g,sx+pw-2,top-2,1,2,stone); if(w>=60){ px(g,x0+2,top-4,3,2,stone2); px(g,x0+w-5,top-4,3,2,stone2); } break; }
    case 'hanok': case 'hanok2': { /* 한옥 기와: 좌우로 3px 내민 처마, 겹친 기와 줄, 양 끝은 살짝 들린다. hanok2는 용마루 장식 */ const t1=style==='hanok2'?'#3f4a56':tile, t2=style==='hanok2'?'#7a8898':tile2; px(g,x0-3,top-3,w+6,2,t1); px(g,x0-2,top-5,w+4,2,t1); px(g,x0-1,top-7,w+2,2,t1); px(g,x0+1,top-8,w-2,1,t1); for(let x=x0-2;x<x0+w+2;x+=3) px(g,x,top-2,1,1,t2); for(let x=x0-1;x<x0+w+1;x+=3) px(g,x+1,top-4,1,1,t2); px(g,x0-4,top-4,1,2,t1); px(g,x0+w+3,top-4,1,2,t1); px(g,x0-3,top-1,w+6,1,wood); if(style==='hanok2'){ px(g,cx-4,top-9,9,1,t2); px(g,cx-5,top-10,2,1,t2); px(g,cx+4,top-10,2,1,t2); } else if(v&1){ px(g,cx-1,top-9,3,1,t2); } break; }
    case 'cross': { /* 병원: 흰 상자에 빨간 십자, 넓은 건물은 헬기장 H */ px(g,x0+2,top-8,8,6,'#f4f1ea'); px(g,x0+5,top-7,2,4,'#e5483a'); px(g,x0+4,top-6,4,2,'#e5483a'); if(w>=60){ px(g,x0+w-15,top-3,12,1,'#f4f1ea'); px(g,x0+w-14,top-4,1,2,'#f4f1ea'); px(g,x0+w-5,top-4,1,2,'#f4f1ea'); px(g,x0+w-10,top-4,1,2,'#f4f1ea'); } else if(v&1) ac(); if(v>=2) ant(); break; }
    case 'dome': { /* 둥근 지붕: 가운데 반구와 꼭대기 장식 */ const r=Math.min(8,Math.floor(w/2)-1); g.fillStyle=c.roof2; g.beginPath(); g.arc(cx+0.5,top-2,r,Math.PI,0); g.fill(); g.fillStyle=c.trim; g.beginPath(); g.arc(cx+0.5,top-2,r-2,Math.PI*1.15,Math.PI*1.55); g.lineTo(cx+0.5,top-2); g.fill(); px(g,cx,top-2-r-2,1,2,c.trim); if(w>=60&&(v&1)){ px(g,x0+2,top-4,3,2,c.roof2); px(g,x0+w-5,top-4,3,2,c.roof2); } break; }
    case 'wave': { /* 물결 지붕(강변): 2px 높이 물결 띠 */ const cw='#2b7fb0', cw2='#9bd0f0'; for(let x=x0-1;x<x0+w+1;x++){ const y=Math.round(Math.sin((x-x0)/3+v)*1.5); px(g,x,top-5+y,1,3,cw); px(g,x,top-5+y,1,1,cw2); } if(w>=60) ac(); break; }
    case 'glass': { /* 유리탑: 옅은 유리 난간과 옥상 유리 상자 */ px(g,x0,top-5,w,3,'rgba(160,210,240,.55)'); px(g,x0,top-5,w,1,'#e4f4fb'); for(let x=x0+3;x<x0+w;x+=6) px(g,x,top-5,1,3,'#9bb7c8'); if(w>=40){ px(g,cx-5,top-9,10,4,'#7eb6cc'); px(g,cx-5,top-9,10,1,'#e4f4fb'); px(g,cx-4,top-8,2,2,'#e4f4fb'); } if(v&1) ant(); break; }
    case 'gable': { /* 박공 지붕(주택): 벽돌색 삼각 지붕과 굴뚝 */ const rc=['#9a4a3a','#7a5a4a','#4a5a7a','#6a4a3a'][v]; const hh=Math.min(7,Math.floor(w/4)+2); for(let i=0;i<hh;i++){ const inset=Math.floor(i*(w/2)/hh); px(g,x0-2+inset,top-2-i,w+4-inset*2,1,i===hh-1?'#1a1620':rc); } px(g,x0-2,top-2,w+4,1,'#1a1620'); px(g,x0+w-8,top-2-hh-1,3,hh-1,'#6a6a72'); px(g,x0+w-9,top-2-hh-2,5,1,'#8a8a92'); break; }
    default: tank(); ac(); } }

/* ---------- 동네 풍경(배경) ---------- 모두 안개색 fog의 밝기 변형으로 그려 앞 건물과 구별한다 */
function shade(hex,k){ const n=parseInt(hex.slice(1),16); const r=(n>>16)&255,gg=(n>>8)&255,b=n&255; const f=(c)=>Math.max(0,Math.min(255,Math.round(k>0?c+(255-c)*k:c*(1+k)))); return '#'+[f(r),f(gg),f(b)].map(v=>v.toString(16).padStart(2,'0')).join(''); }
function scenery(g,S,Cc,t,night){
  const F=Cc.fog, F1=shade(F,0.3), F2=shade(F,-0.3), F3=shade(F,0.55), F4=shade(F,-0.5), base=GROUND-6; const win=night?'rgba(255,220,140,.85)':'rgba(255,255,255,.3)';
  const slab=(x,w,h,col,grid)=>{ px(g,x,base-h,w,h,col); if(grid) for(let r=0;r<Math.floor(h/6)-1;r++) for(let c=0;c<Math.floor(w/5);c++) if(hsh(x,r,c)%3) px(g,x+2+c*5,base-h+3+r*6,2,2,win); };
  const peak=(x,w,h,col)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(x,base); g.lineTo(x+w*0.45,base-h); g.lineTo(x+w*0.55,base-h+2); g.lineTo(x+w*0.62,base-h); g.lineTo(x+w,base); g.closePath(); g.fill(); };
  /* 초고층: 가는 탑에 창 줄, 꼭대기 장식(crown 0 평지붕 · 1 뾰족 · 2 계단 · 3 둥근) */
  const tower=(x,w,h,col,crown)=>{ slab(x,w,h,col,false); for(let y=base-h+4;y<base-4;y+=4) for(let c=1;c<w-2;c+=4) if(hsh(x,y,c)%4) px(g,x+c,y,2,1,win); px(g,x,base-h,w,1,F3);
    if(crown===1){ g.fillStyle=col; g.beginPath(); g.moveTo(x,base-h); g.lineTo(x+w/2,base-h-10); g.lineTo(x+w,base-h); g.fill(); px(g,x+w/2,base-h-16,1,6,F2); }
    else if(crown===2){ px(g,x+3,base-h-4,w-6,4,col); px(g,x+6,base-h-7,w-12,3,col); px(g,x+w/2,base-h-11,1,4,F2); }
    else if(crown===3){ g.fillStyle=col; g.beginPath(); g.ellipse(x+w/2,base-h,w/2,7,0,Math.PI,0); g.fill(); px(g,x+w/2,base-h-11,1,4,F2); }
    else { px(g,x+2,base-h-2,w-4,2,col); px(g,x+w-3,base-h-6,1,4,F2); }
    px(g,x+w/2,base-h-((crown===1)?17:(crown===2)?12:(crown===3)?12:7),1,1,(t>>4)&1?'#ff5a5a':F3); }; /* 항공 장애등 */
  const tree=(x,h,r,col,trunk)=>{ px(g,x,base-h,1,h,trunk||F2); SP.blob(g,x,base-h-r+1,r,Math.round(r*0.9),col); };
  const hanok=(x,w,h,col,roof)=>{ px(g,x+2,base-h,w-4,h,col); px(g,x+4,base-h+3,2,2,win); px(g,x+w-6,base-h+3,2,2,win); px(g,x-1,base-h-3,w+2,3,roof); px(g,x+1,base-h-5,w-2,2,roof); px(g,x-2,base-h-4,1,2,roof); px(g,x+w+1,base-h-4,1,2,roof); px(g,x+4,base-h-6,w-8,1,roof); };
  switch(Cc.bg){
    case 'apart': { /* 부천 중동신도시: 부천시청(시계탑) · 부천아트센터 · 이안더클래식 · 리첸시아 중동(쌍둥이) · 힐스테이트 중동 */
      slab(28,78,30,F,true); px(g,24,base-32,86,2,F1); px(g,60,base-54,14,24,F2); px(g,62,base-56,10,2,F1); SP.blob(g,67,base-46,4,4,'#f4f1ea'); px(g,67,base-48,1,2,F2); px(g,67,base-46,2,1,F2); px(g,30,base-44,1,14,F2); px(g,31,base-44,5,3,'#e5483a'); /* 시청·시계·깃발 */
      slab(112,38,42,F2,false); g.fillStyle=F; g.beginPath(); g.moveTo(112,base-42); g.lineTo(150,base-54); g.lineTo(150,base-42); g.fill(); for(let y=base-40;y<base-4;y+=5) px(g,114,y,34,1,F1); px(g,120,base-20,10,20,F4); /* 아트센터: 비스듬한 지붕·유리 띠·입구 */
      tower(160,16,110,F2,1); tower(200,14,126,F,2); tower(222,14,126,F,2); px(g,214,base-118,8,3,F1); tower(250,22,98,F2,0); tower(282,18,84,F,0); break; }
    case 'wheel': { /* 부천 상동: 웅진플레이도시(물결 지붕·미끄럼틀) · 비잔티움(둥근 꼭대기) · 코오롱 이데아폴리스 · 상동 호수공원(분수) · 대관람차 · 앞으로 지어질 롯데캐슬 시그니처(크레인) */
      g.fillStyle=F; g.beginPath(); g.moveTo(10,base); for(let x=10;x<=118;x+=2){ g.lineTo(x,base-34-Math.sin((x-10)/108*Math.PI)*16+Math.sin(x*0.25)*2); } g.lineTo(118,base); g.fill(); for(let x=16;x<112;x+=6) px(g,x,base-30+Math.round(Math.sin((x-10)/108*Math.PI)*-8),2,2,win);
      px(g,100,base-60,3,56,F2); g.strokeStyle=F1; g.lineWidth=2; g.beginPath(); g.moveTo(101,base-58); g.bezierCurveTo(130,base-58,122,base-22,96,base-14); g.stroke(); g.strokeStyle=F2; g.beginPath(); g.moveTo(101,base-52); g.bezierCurveTo(70,base-50,70,base-20,86,base-12); g.stroke(); /* 미끄럼틀 둘 */
      tower(132,18,96,F2,3); slab(158,22,70,F,false); for(let y=base-66;y<base-4;y+=4) px(g,158,y,22,1,F1); slab(184,18,58,F2,false); for(let y=base-54;y<base-4;y+=4) px(g,184,y,18,1,F1); px(g,158,base-72,44,2,F1);
      tower(270,16,108,F,2); tower(292,16,100,F,2); px(g,286,base-104,6,2,F1); px(g,299,base-100,1,34,F4); px(g,282,base-134,38,1,F4); px(g,282,base-134,1,4,F4); px(g,318,base-134,1,16+((t>>3)%8),F4); px(g,316,base-118+((t>>3)%8),5,3,F2); /* 크레인 */
      const cx=236, cy=base-44, r=30; g.strokeStyle=F2; g.lineWidth=1.2; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.stroke(); g.beginPath(); g.arc(cx,cy,r-4,0,Math.PI*2); g.stroke(); const rot=t*0.004; for(let i=0;i<10;i++){ const a=rot+i*Math.PI/5; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); g.stroke(); px(g,cx+Math.cos(a)*r-2,cy+Math.sin(a)*r-2,5,4,i%2?'#e5483a':'#f2b705'); } g.beginPath(); g.moveTo(cx-14,base); g.lineTo(cx,cy); g.lineTo(cx+14,base); g.stroke(); px(g,cx-2,cy-2,5,5,F3);
      g.fillStyle=night?'#6f8fb5':'#bfe0f3'; g.beginPath(); g.ellipse(176,base-6,46,6,0,0,Math.PI*2); g.fill(); for(let i=0;i<5;i++){ const h=6+((t>>2)+i*3)%6; px(g,170+i*3,base-10-h,1,h,night?'#cfe3f5':'#ffffff'); } for(const x of [128,142,208,222]) tree(x,8,5,F2,F4); break; } /* 호수·분수·나무 */
    case 'tower': { /* 남산과 N서울타워: 탑은 산등성이 위에 선다. 앞의 낮은 언덕은 한남동 쪽 */ g.fillStyle=F2; g.beginPath(); g.moveTo(100,base); g.quadraticCurveTo(190,base-100,280,base); g.fill(); g.fillStyle=F; g.beginPath(); g.moveTo(0,base); g.quadraticCurveTo(70,base-40,160,base); g.fill(); const tx=190, ty=base-50; px(g,tx-9,ty,19,3,F2); px(g,tx-1,ty-74,3,74,F1); px(g,tx-7,ty-56,15,7,F3); px(g,tx-6,ty-49,13,3,F2); px(g,tx-5,ty-62,11,3,F3); px(g,tx,ty-82,1,8,F2); px(g,tx-1,ty-83,3,1,(t>>4)&1?'#ff5a5a':F3); for(const x of [150,168,214,232]) tree(x,6,4,F2,F4); break; }
    case 'court': { /* 우면산 앞 법원 청사(기둥·박공)와 예술의전당 갓 지붕 */ peak(120,220,52,F2); slab(36,72,34,F,true); px(g,30,base-38,84,4,F1); for(let i=0;i<7;i++) px(g,38+i*11,base-34,3,28,F3); g.fillStyle=F1; g.beginPath(); g.moveTo(30,base-38); g.lineTo(72,base-52); g.lineTo(114,base-38); g.fill(); slab(190,70,24,F2,true); g.fillStyle=F1; g.beginPath(); g.ellipse(225,base-26,46,8,0,Math.PI,0); g.fill(); px(g,217,base-40,16,8,F2); px(g,223,base-44,4,4,F3); break; }
    case 'palace': { /* 북악산 두 봉우리 앞의 궁궐 문(돌 기단 위 이층 기와)과 한옥 지붕 줄 */ peak(70,150,74,F2); peak(170,130,56,F); const hx=118, hw=84;
      px(g,hx,base-16,hw,16,F2); px(g,hx+34,base-13,16,13,F4); g.fillStyle=F4; g.beginPath(); g.ellipse(hx+42,base-13,8,5,0,Math.PI,0); g.fill(); px(g,hx,base-16,hw,1,F1); /* 돌 기단·홍예문 */
      px(g,hx+6,base-30,hw-12,14,F1); for(let i=0;i<6;i++) px(g,hx+9+i*14,base-29,2,13,F2); px(g,hx-2,base-34,hw+4,4,F2); px(g,hx+2,base-37,hw-4,3,F2); px(g,hx-4,base-36,2,2,F2); px(g,hx+hw+2,base-36,2,2,F2); /* 1층 */
      px(g,hx+14,base-48,hw-28,11,F1); for(let i=0;i<4;i++) px(g,hx+19+i*14,base-47,2,10,F2); px(g,hx+6,base-52,hw-12,4,F2); px(g,hx+10,base-55,hw-20,3,F2); px(g,hx+4,base-54,2,2,F2); px(g,hx+hw-6,base-54,2,2,F2); px(g,hx+22,base-57,hw-44,2,F2); /* 2층 */
      for(let i=0;i<5;i++) hanok(12+i*20,16,9,F1,F2); for(let i=0;i<4;i++) hanok(222+i*22,18,9,F1,F2); for(const x of [8,114,210,312]) tree(x,7,4,F2,F4); break; }
    case 'stadium': { /* 목동: 야구장(넓은 그릇·조명탑 넷) 뒤로 신시가지 판상형 아파트 */ for(let i=0;i<5;i++){ const x=10+i*64, h=38+(i%2)*10; slab(x,34,h,i%2?F2:F,true); px(g,x,base-h-2,34,2,F1); } g.fillStyle=F; g.beginPath(); g.ellipse(160,base-10,110,22,0,Math.PI,0); g.fill(); g.fillStyle=F2; g.beginPath(); g.ellipse(160,base-14,90,14,0,Math.PI,0); g.fill(); px(g,50,base-20,220,2,F1); for(const lx of [60,120,200,260]){ px(g,lx,base-62,2,46,F1); px(g,lx-5,base-66,12,5,F2); for(let i=0;i<5;i++) px(g,lx-4+i*2,base-65,1,2,night?'#fff6c9':F3); if(night){ g.save(); g.globalAlpha=0.12; SP.blob(g,lx+1,base-56,14,8,'#fff6c9'); g.restore(); } } break; }
    case 'hospital': { /* 연건동: 대학병원 큰 본관과 낮은 별관, 지붕의 십자 · 대학로 마로니에 나무 */ slab(96,96,52,F,true); px(g,96,base-54,96,2,F1); slab(50,44,28,F2,true); slab(194,52,34,F2,true); px(g,136,base-66,14,12,'#f4f1ea'); px(g,142,base-64,3,8,'#e5483a'); px(g,139,base-61,9,3,'#e5483a'); px(g,100,base-46,88,1,'#e5483a'); for(const x of [14,30,262,280,300]) tree(x,10,7,night?F2:shade('#6f9a5a',0.1),F4); break; }
    case 'mountain': { /* 불광동: 북한산 바위 봉우리 셋(꼭대기는 화강암빛) 기슭의 은평 한옥 마을 */ peak(10,170,88,F2); peak(130,130,70,F); peak(220,120,56,F2); g.fillStyle=F3; g.beginPath(); g.moveTo(74,base-80); g.lineTo(86,base-88); g.lineTo(98,base-78); g.closePath(); g.fill(); g.beginPath(); g.moveTo(180,base-62); g.lineTo(188,base-70); g.lineTo(196,base-60); g.closePath(); g.fill(); for(let i=0;i<7;i++) hanok(20+i*42,20,10,F1,F4); for(let i=0;i<6;i++) tree(48+i*42,7,4,F2,F4); break; }
    case 'bridge': { /* 반포동: 한강 위 반포대교(이층 다리·교각·무지개분수) */ px(g,0,base-16,W,16,night?'#4a6a9a':'#9fc9e8'); for(let i=0;i<24;i++){ const h=hsh(i,17,2); px(g,(h%W),base-14+((h>>7)%12),4+(h%5),1,night?'rgba(255,255,255,.18)':'rgba(255,255,255,.45)'); } px(g,0,base-52,W,4,F2); px(g,0,base-48,W,1,F1); px(g,0,base-36,W,4,F2); px(g,0,base-32,W,1,F1); for(let x=14;x<W;x+=46){ px(g,x,base-32,7,32,F2); px(g,x+1,base-48,5,12,F2); } for(let x=0;x<W;x+=6) px(g,x,base-55,3,1,F1); for(let x=20;x<W;x+=46) for(let i=0;i<6;i++){ const a=(t*0.02+i*0.17+x*0.01)%1; const fx=x+6+i*5+a*4, fy=base-31+a*a*22; px(g,fx,fy,1,2,night?['#ff8fa3','#8fd9ff','#fff6a3'][i%3]:'rgba(255,255,255,.65)'); } for(let i=0;i<7;i++) px(g,6+i*48,base-30,2,2,win); break; }
    case 'glass': { /* 학동: 강남 유리탑 셋, 하나는 지붕이 비스듬하다 */ slab(60,24,70,F2,false); for(let y=0;y<70;y+=4) px(g,60,base-70+y,24,1,F1); slab(130,34,92,F,false); for(let y=0;y<92;y+=4) px(g,130,base-92+y,34,1,F1); g.fillStyle=F; g.beginPath(); g.moveTo(130,base-92); g.lineTo(164,base-104); g.lineTo(164,base-92); g.fill(); slab(214,26,78,F2,false); for(let x=0;x<26;x+=4) px(g,214+x,base-78,1,78,F1); if(night) for(let i=0;i<30;i++){ const h=hsh(i,21,3); px(g,[62,132,216][i%3]+(h%20),base-80+((h>>6)%70),2,1,'rgba(255,220,140,.8)'); } break; }
    case 'hillside': { /* 평창동: 비탈을 따라 집들이 층층이 비탈면 위에 서고, 등성이에는 북악스카이웨이 팔각정 */
      const hillY=x=>{ const u=x/W; return (1-u)*(1-u)*(base-30)+2*(1-u)*u*(base-96)+u*u*(base-40); }; g.fillStyle=F2; g.beginPath(); g.moveTo(0,base); g.lineTo(0,base-30); g.quadraticCurveTo(160,base-96,W,base-40); g.lineTo(W,base); g.fill();
      for(let i=0;i<9;i++){ const x=14+i*34, hy=Math.round(hillY(x+8))-10; px(g,x,hy,16,10,F); px(g,x+1,hy-4,14,4,i%2?'#9a4a3a':F1); px(g,x+3,hy+2,3,3,win); px(g,x+10,hy+2,3,3,win); px(g,x-1,hy+10,18,1,F4); }
      for(let i=0;i<6;i++){ const x=30+i*52; const y=Math.round(hillY(x))-2; px(g,x,y-5,1,5,F4); SP.blob(g,x,y-8,3,4,F); }
      const px0=160, py0=Math.round(hillY(160)); px(g,px0-8,py0-9,16,9,F1); px(g,px0-7,py0-8,2,7,F2); px(g,px0+5,py0-8,2,7,F2); px(g,px0-11,py0-12,22,3,F2); px(g,px0-7,py0-15,14,3,F2); px(g,px0-3,py0-17,6,2,F2); px(g,px0,py0-19,1,2,F2); break; }
    case 'valley': { /* 구기동: 양쪽 비탈 사이로 물줄기, 멀리 향로봉, 비탈 위 작은 절(승가사)과 소나무 */ peak(100,120,68,F2); g.fillStyle=F; g.beginPath(); g.moveTo(0,base); g.lineTo(0,base-70); g.lineTo(60,base-60); g.lineTo(154,base); g.fill(); g.beginPath(); g.moveTo(W,base); g.lineTo(W,base-64); g.lineTo(270,base-56); g.lineTo(166,base); g.fill(); g.fillStyle=night?'#8fb5d9':'#cfe6f5'; g.beginPath(); g.moveTo(159,base-36); g.quadraticCurveTo(154+Math.sin(t*0.03)*1.5,base-16,156,base); g.lineTo(164,base); g.quadraticCurveTo(166,base-16,161,base-36); g.fill(); g.fillStyle=F3; g.beginPath(); g.moveTo(150,base-62); g.lineTo(160,base-68); g.lineTo(170,base-60); g.closePath(); g.fill(); hanok(40,22,9,F1,F4); px(g,51,base-24,1,6,F2); px(g,49,base-26,5,2,F2); for(const x of [24,70,250,280]) tree(x,8,4,F2,F4); hanok(262,18,8,F1,F4); break; }
    default: for(let i=0;i<8;i++){ const h=hsh(i,3,S.city); slab(i*40+((h>>8)%7),20+(h%12),20+((h>>4)%24),i%2?F:F2,true); } } }

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
  const cx=b.x+col*CELL_W, cy=GROUND-(r+1)*FLOOR; const hole=cell.hp<=0; const cut=cell.cut||0; const edgeL=col===0, edgeR=col===b.cols-1;
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
  const cx=b.x+col*CELL_W, cy=GROUND-(r+1)*FLOOR; const cut=cell.cut||0; const edgeL=col===0, edgeR=col===b.cols-1; const openL=(cut&2)&&edgeL, openR=(cut&2)&&edgeR; const ow=openW(b,r,col);
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
  for(let r=0;r<b.floors;r++) for(let col=0;col<b.cols;col++) wallCell(g,b,c,r,col,b.cells[r][col],night);
  if(warn){ cracks(g,b,top,warn); }
  /* 1층 가운데 문 */ const dx=b.x+Math.floor(b.w/2)-3; if(b.cells[0].every(cl=>cl.hp>0)){ px(g,dx,GROUND-12,7,12,c.trim); px(g,dx+1,GROUND-11,5,11,c.door); px(g,dx+2,GROUND-10,3,3,GL.a); px(g,dx+4,GROUND-6,1,1,c.trim); }
  /* 옥상: 난간 위에 동네 양식(Cc.roof)의 지붕 장식. 몬스터가 서는 높이(top) 위 10px 안에 둔다 */
  px(g,b.x-1,top-2,b.w+2,3,c.roof); px(g,b.x-1,top-2,b.w+2,1,c.roof2); px(g,b.x,top+1,b.w,1,c.wall2);
  roofDeco(g,b,c,top,E.cityOf(S).roof,night);
  for(let r=0;r<b.floors;r++) for(let col=0;col<b.cols;col++){ const cell=b.cells[r][col]; if(cell.hp<=0) holeCell(g,b,c,r,col,cell,t); }
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
