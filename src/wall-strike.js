/* 출신판 전용. 벽면은 x=0, 지지 손발은 고정하고 치는 팔만 월드 좌표의 창으로 보낸다. */
function drawWallStrike(g,key,h,row){
  const im=document.getElementById('wall-sheet'),face=-(h.side||-1),n=16-h.punchT;
  const u=[0,-.08,-.17,-.11,.35,1,1,.99,.93,.74,.5,.27,.12,.04,0,0][n]||0;
  const inward=(h.pdx||h.dir)===face,c=h.wallContact;
  const sh={shushu:[52,39],podong:[63,45],lion:[52,33],fly:[48,36],doom:[52,32]}[key];
  const anchor=sh[1]+14,dy=h.pdy||0;
  g.save();g.scale(face,1);g.translate(-68,-anchor);
  const pose=Math.abs(u)<.13?0:u<.4?3:u<.8?1:2;
  g.drawImage(im,96*pose,80*row,96,80,0,0,96,80);
  const tx=68+(c?(c.x-h.x)*face:inward?9:-29);
  const ty=c?anchor+c.y-h.y:sh[1]+dy*16;
  const sign=inward?1:-1,rest=[sh[0]+4,sh[1]-3];
  const end=[Math.round(rest[0]+u*(tx-rest[0])),Math.round(rest[1]+u*(ty-rest[1]))];
  const e=[Math.round((sh[0]+end[0])/2-(1-Math.max(0,u))*7*sign),Math.round((sh[1]+end[1])/2+6*(1-Math.max(0,u)))];
  const pal={shushu:['#674937','#eac2a2','#ffe0c1',3],doom:['#29332c','#b88c6c','#e5bc93',5],lion:['#996c80','#e9b3c4','#ffdae0',2],podong:['#36303b','#e6d7c2','#fff3df',3],fly:['#483529','#735237','#ac8058',1]}[key];
  const line=(points,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x+.5,y+.5));g.stroke();};
  line([sh,e,end],pal[3]+(key==='fly'?0:2),pal[0]);line([sh,e,end],pal[3],pal[1]);
  if(key!=='fly')line([sh,e],1,pal[2]);
  if(key==='shushu'){
    g.save();g.translate(...end);g.rotate(Math.atan2(end[1]-e[1],end[0]-e[0]));g.drawImage(im,96,400,13,9,-7,-4,13,9);g.restore();
  }else if(key==='fly'){line([end,[end[0]+sign*2,end[1]-2]],1,pal[0]);}
  else{const r=key==='doom'?4:2;g.fillStyle=pal[0];g.fillRect(end[0]-r,end[1]-r,2*r+1,2*r);g.fillStyle=key==='doom'?'#87916a':pal[2];g.fillRect(end[0]-r+1,end[1]-r+1,2*r-1,2*r-2);}
  g.restore();
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
