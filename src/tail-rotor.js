/* 몸 중심에서 꼬리 쪽으로 3px 옮긴 회전축. 명중 순간엔 실제로 부서진 창의 좌표를 쓴다. */
function tailRotor(g,h,t,hit,dx,ox,oy,drawBody){
  const root=[ox-3,oy-22],n=16-h.punchT,a=hit?(n-5)*Math.PI/6:t*.60,dy=h.pdy||0;
  const contact=hit&&n>=5&&n<12&&h.rotorContact;
  let vx=hit?(dy?(dy>0?-12:4)*dx:30*dx):14,vy=hit?(dy?24*dy:-2):0;
  if(contact){vx=contact.x-h.x-root[0];vy=contact.y-h.y-root[1];}
  const norm=Math.hypot(vx,vy)||1,ex=vx/norm,ey=vy/norm;
  function tip(b){
    const c=Math.cos(b),s=Math.sin(b),r=hit?(12+(norm-12)*Math.max(0,c)**1.4):14;
    return [root[0]+ex*c*r-ey*s*(hit?9:3),root[1]+ey*c*r+ex*s*(hit?9:3)];
  }
  function line(pts){g.beginPath();pts.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](Math.round(x)+.5,Math.round(y)+.5));}
  function stroke(pts,color,w){line(pts);g.strokeStyle=color;g.lineWidth=w;g.stroke();}
  function feather(b,scale){
    const [x,y]=tip(b),X=(x-root[0])*scale,Y=(y-root[1])*scale,L=Math.hypot(X,Y)||1,nx=-Y/L,ny=X/L;
    const l=[],r=[],shine=[];for(let i=0;i<=10;i++){
      const q=i/10,bow=Math.sin(q*Math.PI),cx=root[0]+q*X+nx*bow*2,cy=root[1]+q*Y+ny*bow*2,w=(.55+bow*1.9)*Math.min(1,scale+.2);
      l.push([cx+nx*w,cy+ny*w]);r.push([cx-nx*w,cy-ny*w]);shine.push([cx-nx*w*.5,cy-ny*w*.5]);
    }
    line(l.concat(r.reverse()));g.closePath();g.fillStyle='#ead4aa';g.fill();g.lineWidth=1;g.strokeStyle='#8c7357';g.stroke();stroke(shine.slice(1,-1),'#fff4d1',1);
  }
  if(hit){g.save();g.globalAlpha*=.55;stroke([1.3,1,.75,.55].map(z=>tip(a-z)),'#8c937f',1);stroke([.43,.3,.15].map(z=>tip(a-z)),'#d8c59d',2);g.restore();}
  feather(a+Math.PI,.65);
  if(Math.sin(a)<-.2||hit&&dy>0){feather(a,1);drawBody();}else{drawBody();feather(a,1);}
  g.fillStyle='#927859';g.fillRect(root[0]-1,root[1]-1,3,2);g.fillStyle='#f9e6bd';g.fillRect(root[0],root[1]-1,1,1);
}
