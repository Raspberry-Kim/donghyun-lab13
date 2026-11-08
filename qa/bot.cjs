// 무작위·규칙 혼합 봇: 건물을 찾아 올라가 창을 차례로 치며 도시를 부순다. 멈춤·값 깨짐이 없는지 본다.
const E=require('../src/engine.js').Engine; const assert=require('assert');
function play(formId,seed,maxFrames){
  const S=E.newGame({form:formId,seed}); const k={left:false,right:false,up:false,down:false,jump:false,jumpPressed:false,punch:false,punchPressed:false};
  let frames=0, target=null, punches=0, eats=0;
  while((S.status==='play'||S.status==='clear')&&frames<maxFrames){
    if(S.status==='clear'){ E.nextCity(S); continue; }
    const h=S.hero; k.left=k.right=k.up=k.down=k.jumpPressed=k.punchPressed=false;
    const b=S.builds.find(b=>b.state==='up');
    if(b){
      const H=E.HAND;
      // 남은 칸 중 하나를 고른다(위층부터). 1층(r=0)은 길에서 친다
      let found=null; for(let r=b.floors-1;r>=0&&!found;r--) for(let c=0;c<E.COLS;c++){ const cell=b.cells[r][c]; if(cell.hp>0||cell.person){ found={r,c}; break; } }
      if(!found){ if(h.state==='climb') k.jumpPressed=true; }
      else {
        const tx=b.x+found.c*E.CELL_W+E.CELL_W/2;
        if(found.r===0){ if(h.state==='climb'){ k.down=true; } else if(h.state==='ground'){ const sx=tx-10*(h.dir||1); const want=tx<h.x?tx+12:tx-12; if(Math.abs(h.x-want)>2){ if(h.x<want) k.right=true; else k.left=true; } else { if(tx>h.x) h.dir=1; else h.dir=-1; if(h.punchT<=0&&h.eatT<=0){ k.punchPressed=true; punches++; } } } }
        else if(h.state==='ground'){ const cx=b.x+b.w/2; if(Math.abs(h.x-cx)>6){ if(h.x<cx) k.right=true; else k.left=true; } else k.up=true; }
        else if(h.state==='climb'){ const bb=S.builds[h.bld]; if(bb!==b){ k.down=true; }
          else { const ty=E.GROUND-found.r*E.FLOOR-E.FLOOR/2+H; if(Math.abs(h.y-ty)>3){ if(h.y>ty) k.up=true; else k.down=true; }
            else { const want=tx<h.x?tx+10:tx-10; if(Math.abs(h.x-want)>4){ if(h.x<want) k.right=true; else k.left=true; } else { h.dir=tx>h.x?1:-1; if(h.punchT<=0&&h.eatT<=0){ k.punchPressed=true; punches++; } } } } }
      }
    }
    const e0=S.hero.eats||0; E.step(S,k); if((S.hero.eats||0)>e0) eats++;
    frames++;
    // 불변식
    assert.ok(S.hero.stam>=0&&S.hero.stam<=E.MAX_STAM,'체력 범위'); assert.ok(S.hero.x>=0&&S.hero.x<=E.W,'x 범위'); assert.ok(S.hero.y<=E.GROUND+0.01,'y 범위 '+S.hero.y);
    assert.ok(Number.isFinite(S.score)&&S.score>=0); for(const bb of S.builds) for(const row of bb.cells) for(const c of row) assert.ok(c.hp>=0);
  }
  return {S,frames,punches,eats};
}
const forms=[1,2,3,4,5]; let line=[];
for(const f of forms){ const r=play(f,100+f,60*60*40); const S=r.S; line.push(`${E.FORMS[f-1].name}: ${S.status} 도시 ${S.city} 점수 ${S.score} 체력 ${Math.round(S.hero.stam)} 목숨 ${S.lives} 주먹 ${r.punches} 먹음 ${r.eats} 프레임 ${r.frames} (${(r.frames/3600).toFixed(1)}분)`); }
console.log(line.join('\n'));
