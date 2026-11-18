/* 출신판 전용. 벽면은 x=0, 지지 손발은 고정하고 치는 팔만 월드 좌표의 창으로 보낸다. */
function drawWallStrike(g,key,h,row){
  const im=document.getElementById('wall-sheet'),face=-(h.side||-1),n=16-h.punchT;
  const u=[0,-.08,-.17,-.11,.35,1,1,.99,.93,.74,.5,.27,.12,.04,0,0][n]||0;
  const inward=(h.pdx||h.dir)===face,c=h.wallContact;
  const sh={shushu:[inward?60:54,39],podong:[inward?63:57,45],lion:[inward?61:57,33],fly:[inward?48:42,36],doom:[inward?52:42,32]}[key];
  const anchor=sh[1]+14,dy=h.pdy||0;
  g.save();g.scale(face,1);g.translate(-68,-anchor);
  const pose=Math.abs(u)<.13?0:u<.4?3:u<.8?1:2;
  const paired=['shushu','lion','doom'].includes(key);
  if(paired){
    const grip={shushu:[[57,39],[62,37],[65,32]],lion:[[58,33],[62,32],[67,28]],doom:[[44,32],[57,32],[66,20]]}[key];
    if(!inward)grip[0]=[key==='doom'?54:key==='shushu'?60:61,grip[0][1]];
    wallArm(g,im,key,...grip);
  }
  if(!inward&&paired){
    const pivot={shushu:58,lion:60,doom:48}[key],cut={shushu:43,lion:36,doom:37}[key];
    g.drawImage(im,96*pose,80*row+cut,96,80-cut,0,cut,96,80-cut);
    g.save();g.translate(2*pivot,0);g.scale(-1,1);g.drawImage(im,96*pose,80*row,96,cut,0,0,96,cut);g.restore();
  }else g.drawImage(im,96*pose,80*row,96,80,0,0,96,80);
  const tx=68+(c?(c.x-h.x)*face:inward?9:-29);
  const ty=c?anchor+c.y-h.y:sh[1]+dy*16;
  const sign=inward?1:-1,rest=[sh[0]+4*sign,sh[1]-3];
  const end=[Math.round(rest[0]+u*(tx-rest[0])),Math.round(rest[1]+u*(ty-rest[1]))];
  const fold=key==='shushu'||key==='lion'?3:7;
  const e=[Math.round((sh[0]+end[0])/2-(1-Math.max(0,u))*fold*sign),Math.round((sh[1]+end[1])/2+fold*(1-Math.max(0,u)))];
  if(paired){wallArm(g,im,key,sh,e,end);g.restore();return;}
  const pal={podong:['#36303b','#e6d7c2','#fff3df',3],fly:['#483529','#735237','#ac8058',1]}[key];
  const line=(points,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x+.5,y+.5));g.stroke();};
  line([sh,e,end],pal[3]+(key==='fly'?0:2),pal[0]);line([sh,e,end],pal[3],pal[1]);
  if(key!=='fly')line([sh,e],1,pal[2]);
  if(key==='fly'){line([end,[end[0]+sign*2,end[1]-2]],1,pal[0]);}
  else{const r=2;g.fillStyle=pal[0];g.fillRect(end[0]-r,end[1]-r,2*r+1,2*r);g.fillStyle=pal[2];g.fillRect(end[0]-r+1,end[1]-r+1,2*r-1,2*r-2);}
  g.restore();
}
// One integer-pixel brush and one palette for BOTH arms. Depth comes from occlusion, not recoloring skin.
function wallArm(g,im,key,a,b,h){
  const [edge,skin,light,width]={shushu:['#63483a','#efc7a6','#f5d7b8',3],lion:['#956778','#e4aabd','#ffd6db',2],doom:['#29342d','#bd906e','#e5b78b',5]}[key];
  const seg=(p,q,w,color)=>{g.fillStyle=color;const n=Math.max(1,Math.ceil(Math.hypot(p[0]-q[0],p[1]-q[1])));for(let i=0;i<=n;i++)g.fillRect(Math.round(p[0]+(q[0]-p[0])*i/n)-(w>>1),Math.round(p[1]+(q[1]-p[1])*i/n)-(w>>1),w,w);};
  for(const [w,col] of [[width+2,edge],[width,skin]]){seg(a,b,w,col);seg(b,h,w,col);}
  seg(a,[(a[0]+b[0])/2,(a[1]+b[1])/2],1,light);
  if(key==='shushu'){g.save();g.translate(...h);g.rotate(Math.atan2(h[1]-b[1],h[0]-b[0]));g.drawImage(im,96,400,13,9,-6,-4,13,9);g.restore();}
  else if(key==='doom'){const wrist=[b[0]*.45+h[0]*.55,b[1]*.45+h[1]*.55];seg(wrist,h,6,'#2c3832');seg(wrist,h,4,'#849069');g.fillStyle='#2c3832';g.fillRect(h[0]-4,h[1]-3,8,7);g.fillStyle='#727551';g.fillRect(h[0]-3,h[1]-2,6,5);}
  else{g.fillStyle=edge;g.fillRect(h[0]-2,h[1]-2,5,4);g.fillStyle=skin;g.fillRect(h[0]-1,h[1]-1,3,2);}
}
function wallImpact(g,h,pal){
  const c=h.wallContact,age=11-h.punchT;if(!c||age<0||age>9)return;
  const dir=h.pdx||h.dir,front=-dir;
  g.save();g.translate(c.x,c.y);g.scale(front,1);
  // Two-frame dark socket and rim cover the striking edge: the fist reads as sunk into masonry.
  if(age<=2){g.fillStyle=pal.wall2;g.fillRect(-5,-3,3,7);g.fillStyle=pal.trim;g.fillRect(-4,-4,5,1);g.fillRect(-3,4,3,1);}
  for(const [j,[vx,vy]] of [[2,-2],[1.5,-1],[2.6,0],[1.6,.7],[.8,-2.4],[-.5,-1.6]].entries()){
    const x=Math.round(vx*(age+1)),y=Math.round(vy*(age+1)+age*age*.11);if(age>6&&j%2)continue;
    g.fillStyle=j%2?pal.wall2:'#9cbfc0';g.fillRect(x,y,j%3+1,2);g.fillStyle=j%2?pal.wall3:'#e5fcf5';g.fillRect(x,y,1,1);
  }
  g.restore();
}
