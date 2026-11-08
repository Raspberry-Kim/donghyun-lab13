/* 동현램 그림: 320×200 화면. 도시 하늘·먼 지붕선·건물(창 격자)·길·적·괴물·탄·효과·HUD. 모두 코드로 그린다. */
(function(root){
'use strict';
const E=root.Engine, SP=root.Sprites, C=SP.C, px=SP.px;
const {W,H,GROUND,FLOOR,COLS,CELL_W}=E;
const WALLS=[
  {wall:'#b7705a',wall2:'#8f5243',trim:'#e0b89a',roof:'#5a3a30'},
  {wall:'#9aa3b4',wall2:'#6f7786',trim:'#cfd5de',roof:'#444b58'},
  {wall:'#d9c7a3',wall2:'#ad9a76',trim:'#f2e6cc',roof:'#6b5a3e'},
  {wall:'#7f8f9f',wall2:'#5a6876',trim:'#b8c6d2',roof:'#36414c'},
  {wall:'#c9937a',wall2:'#9e6a56',trim:'#eed2bd',roof:'#5c3b2d'},
  {wall:'#a9b7a0',wall2:'#7c8a74',trim:'#d8e2d0',roof:'#4d5747'}
];
function sky(g,S,t){
  const Cc=E.cityOf(S); const gr=g.createLinearGradient(0,0,0,GROUND); gr.addColorStop(0,Cc.sky[0]); gr.addColorStop(1,Cc.sky[1]); g.fillStyle=gr; g.fillRect(0,0,W,H);
  /* 구름 */
  for(let i=0;i<5;i++){ const cx=((i*83+t*0.08)%(W+60))-30, cy=16+(i*29)%40; px(g,cx,cy,20,5,'rgba(255,255,255,.7)'); px(g,cx+5,cy-3,10,3,'rgba(255,255,255,.7)'); }
  /* 먼 지붕선 */
  g.fillStyle=Cc.fog; for(let i=0;i<12;i++){ const bx=i*28+((i*13)%9), bh=20+((i*37)%34); px(g,bx,GROUND-bh-6,24,bh+6,Cc.fog); for(let k=0;k<3;k++) px(g,bx+4+k*7,GROUND-bh+2,3,3,'rgba(255,255,200,.35)'); }
  /* 길·보도 */
  px(g,0,GROUND-6,W,6,'#6f7378'); px(g,0,GROUND-6,W,1,'#9a9ea3'); px(g,0,GROUND,W,H-GROUND,'#3c3f46'); for(let x=0;x<W;x+=24) px(g,x+((t>>4)&1),GROUND+10,12,2,'#d8d2b0'); px(g,0,GROUND+22,W,2,'#2b2d33');
}
function building(g,S,b,t){
  if(b.state==='gone'){ /* 잔해 더미 */ const c=WALLS[b.i%WALLS.length]; px(g,b.x-2,GROUND-8,b.w+4,8,c.wall2); px(g,b.x+4,GROUND-12,b.w-8,4,c.wall); px(g,b.x+10,GROUND-15,8,3,c.trim); px(g,b.x+b.w-14,GROUND-13,6,2,c.wall2); return; }
  const c=WALLS[b.i%WALLS.length]; const top=E.topY(b); const drop=b.state==='falling'?b.drop:0; const shake=b.state==='falling'?((b.fall&1)?1:-1):0;
  g.save(); g.translate(shake,drop); g.beginPath(); g.rect(0,-drop,W,GROUND+drop); g.clip();
  px(g,b.x,top,b.w,GROUND-top,c.wall); px(g,b.x,top,2,GROUND-top,c.trim); px(g,b.x+b.w-2,top,2,GROUND-top,c.wall2);
  px(g,b.x-1,top-3,b.w+2,4,c.roof); px(g,b.x+4,top-7,6,4,c.roof); px(g,b.x+b.w-12,top-6,4,3,c.roof);
  for(let r=0;r<b.floors;r++){ const y=GROUND-(r+1)*FLOOR; px(g,b.x,y+FLOOR-1,b.w,1,c.wall2);
    for(let col=0;col<COLS;col++){ const cell=b.cells[r][col]; const wx=b.x+col*CELL_W+4, wy=y+3, ww=CELL_W-8, wh=FLOOR-7;
      if(cell.hp>=3){ px(g,wx,wy,ww,wh,'#9fd3ea'); px(g,wx+1,wy+1,ww-2,2,'#d8f1fa'); px(g,wx+ww/2-1,wy,1,wh,c.trim); px(g,wx,wy+wh/2,ww,1,c.trim); }
      else if(cell.hp>0){ px(g,wx,wy,ww,wh,'#7eb6cc'); px(g,wx+2,wy+1,1,wh-2,'#fff'); px(g,wx+3,wy+3,3,1,'#fff'); px(g,wx+ww-4,wy+wh-3,1,2,'#fff'); px(g,wx+ww-6,wy+wh-4,3,1,'#fff'); }
      else { px(g,wx-1,wy-1,ww+2,wh+2,'#241c1c'); px(g,wx-2,wy+1,1,3,c.wall2); px(g,wx+ww,wy+wh-3,2,2,c.wall2); px(g,wx+1,wy+wh+1,3,1,c.wall2);
        if(cell.person) SP.person(g,wx+ww/2,wy+wh+1,t,1,r*2+col+b.i); }
    }
  }
  g.restore();
}
function hud(g,S,t){
  const f=E.form(S), h=S.hero, Cc=E.cityOf(S);
  px(g,0,0,W,12,'rgba(20,18,30,.78)');
  /* 체력 막대 */
  g.font='bold 8px Pretendard, sans-serif'; g.textBaseline='top'; g.fillStyle='#fff'; g.fillText(f.name,3,2);
  const bx=40, bw=80; px(g,bx,3,bw,6,'#2a2a3a'); const r=Math.max(0,h.stam/E.MAX_STAM); px(g,bx,3,Math.round(bw*r),6,r>0.5?'#5fb44a':r>0.25?'#f2b705':'#e5483a'); px(g,bx,3,Math.round(bw*r),1,'rgba(255,255,255,.4)');
  g.fillStyle='#fff'; g.fillText(String(S.score).padStart(7,'0'),128,2);
  /* 목숨 */
  for(let i=0;i<Math.min(S.lives===Infinity?3:S.lives,5);i++) px(g,190+i*7,4,5,5,f.color); if(S.lives===Infinity) g.fillText('∞',226,2);
  g.textAlign='right'; g.fillText(`${S.city}/${E.CITIES.length} ${Cc.name}`,W-3,2); g.textAlign='left';
  if(S.msgT>0&&S.msg){ g.fillStyle='rgba(20,18,30,.7)'; const w=g.measureText(S.msg).width+8; g.fillRect(W/2-w/2,16,w,12); g.fillStyle='#fff'; g.textAlign='center'; g.fillText(S.msg,W/2,18); g.textAlign='left'; }
}
function render(g,S,t){
  sky(g,S,t);
  for(const b of S.builds) building(g,S,b,t);
  for(const e of S.ens){ if(!e.alive) continue; if(e.type==='soldier') SP.soldier(g,e,t); else if(e.type==='tank') SP.tank(g,e,t); else if(e.type==='heli') SP.heli(g,e,t); else SP.car(g,e,t); }
  /* 괴물 그림자 */
  const h=S.hero; if(h.state!=='climb'){ g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(h.x,(h.state==='roof'?h.y:GROUND)-1,10,2,0,0,Math.PI*2); g.fill(); }
  SP.drawMonster(g,E.form(S),h,t,h.x,h.y);
  for(const s of S.shots) SP.shot(g,s);
  for(const x of S.fx){ if(x.k==='quake') continue; SP.fx(g,x); }
  hud(g,S,t);
}
root.Render={render,WALLS};
})(typeof window!=='undefined'?window:module.exports);
