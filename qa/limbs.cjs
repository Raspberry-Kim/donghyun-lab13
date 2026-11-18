const {chromium,firefox,webkit}=require('playwright'),path=require('node:path');
(async()=>{const name=process.argv[2]||'chromium',b=await ({chromium,firefox,webkit})[name].launch(name==='chromium'?{channel:'chromium'}:{});try{
 const page=await b.newPage();await page.goto(process.argv[3]||'file://'+path.resolve(__dirname,'../index.html'));
 const r=await page.evaluate(()=>{
  const assert=(p,m)=>{if(!p)throw Error(m);},c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d',{willReadFrequently:true});
  const backup=wallArm,rows={shushu:0,lion:2,doom:4},base={state:'climb',dir:1,side:-1,pdx:1,pdy:0,x:0,y:0},stats={armPairs:0,faceFrames:0};
  try{
   for(const [key,row] of Object.entries(rows))for(const side of [-1,1])for(const dir of [-1,1])for(const dy of [-1,0,1]){
    const snapshots=[];let calls=[];wallArm=(ctx,im,k,a,b,h)=>{calls.push([a,b,h]);backup(ctx,im,k,a,b,h);};
    for(let n=0;n<16;n++){
     calls=[];g.save();g.translate(64,72);drawWallStrike(g,key,{...base,side,pdx:dir,pdy:dy,punchT:16-n},row);g.restore();
     assert(calls.length===2,key+' 두 팔');snapshots.push(calls);stats.armPairs++;
    }
    for(const [grip] of snapshots)assert(JSON.stringify(grip)===JSON.stringify(snapshots[0][0]),key+' 지지 팔 변동');
    const len=([a,b,h])=>Math.hypot(b[0]-a[0],b[1]-a[1])+Math.hypot(h[0]-b[0],h[1]-b[1]);
    if(key!=='doom'){assert(len(snapshots[0][0])<14&&len(snapshots[0][1])<12,key+' 접힌 팔');assert(len(snapshots[5][1])>len(snapshots[0][1])+4,key+' 타격');}
    assert(JSON.stringify(snapshots[0])===JSON.stringify(snapshots[15]),key+' 회수');
   }
  }finally{wallArm=backup;}
  const im=document.getElementById('wall-sheet'),f=Engine.FORMS[4],ref=document.createElement('canvas');ref.width=ref.height=128;
  const rg=ref.getContext('2d',{willReadFrequently:true});
  for(const dir of [-1,1])for(const state of ['ground','air','climb'])for(let n=0;n<16;n++){
   const h={...Engine.newGame({form:5,seed:1}).hero,state,side:-1,dir,pdx:dir,punchT:state==='climb'?16-n:0,inv:0};
   g.clearRect(0,0,128,128);Sprites.drawMonster(g,f,h,n,64,70);rg.clearRect(0,0,128,128);rg.save();rg.imageSmoothingEnabled=false;
   rg.translate(64+(state==='climb'?-11:0),70+(state==='climb'?0:-((n>>2)&1)));rg.scale(dir,1);if(state==='climb')rg.rotate(-.12*dir);
   rg.drawImage(im,0,400,31,26,-15,-24,31,26);rg.restore();const a=g.getImageData(0,0,128,128).data,q=rg.getImageData(0,0,128,128).data;
   for(let i=0;i<q.length;i+=4)if(q[i+3]===255)assert(q[i]===a[i]&&q[i+1]===a[i+1]&&q[i+2]===a[i+2],'꼬리가 얼굴을 가림');
   stats.faceFrames++;
  }return stats;
 });console.log(name,r);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
