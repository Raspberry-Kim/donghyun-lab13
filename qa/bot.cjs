// 규칙 봇: 건물의 옆벽에 붙어 바깥 열의 창을 위층부터 차례로 치며 도시를 부순다(세 칸 건물은 양쪽 벽). 멈춤·값 깨짐이 없는지 본다.
const E=require('../src/engine.js').Engine; const assert=require('assert');
function play(formId,seed,maxFrames){
  const S=E.newGame({form:formId,seed}); const k={left:false,right:false,up:false,down:false,jump:false,jumpPressed:false,punch:false,punchPressed:false};
  let frames=0, target=null, punches=0, eats=0, rides=0, sits=0;
  while((S.status==='play'||S.status==='clear')&&frames<maxFrames){
    if(S.status==='clear'){ E.nextCity(S); continue; }
    const h=S.hero; k.left=k.right=k.up=k.down=k.jumpPressed=k.punchPressed=false;
    const b=S.builds.find(b=>b.state==='up');
    if(h.state==='ride'){ /* 무너지기 시작하면 바로 뛰어내린다(원작 규칙: 안 뛰면 주저앉는다) */ k.jumpPressed=true; rides++; }
    else if((h.state==='climb'||h.state==='roof')&&S.builds[h.bld]&&S.builds[h.bld].state==='warn'&&S.builds[h.bld].warn>30){ /* 붕괴 예고(금·흔들림)를 보면 뛰어내린다 */ k.jumpPressed=true; rides++; }
    else if(h.state==='sit'){ sits++; }
    else if(b){
      /* 옆벽에 붙어 바깥 열을 위층부터 친다. 두 칸 이하 건물은 0열만 다 뚫으면(절반) 무너지고, 세 칸 건물은 0열 다음 오른쪽 벽에서 마지막 열까지 뚫어야 한다(v0.20 가변 폭). 1층은 맨 아래에서 아래 주먹 */
      let found=null, side=-1; const colOf=(sd)=>sd<0?0:b.cols-1;
      for(const sd of (b.cols>=3?[-1,1]:[-1])){ for(let r=b.floors-1;r>=0&&!found;r--){ const cell=b.cells[r][colOf(sd)]; if(cell.hp>0||cell.person) found={r}; } if(found){ side=sd; break; } }
      if(!found){ if(h.state==='climb'){ k.down=true; } }
      else if(h.state==='ground'){ const ex=side<0?b.x:b.x+b.w; if(Math.abs(h.x-ex)>2){ if(h.x<ex) k.right=true; else k.left=true; } else k.up=true; }
      else if(h.state==='roof'){ k.down=true; }
      else if(h.state==='climb'){
        if(h.bld!==b.i||h.side!==side){ k.down=true; }
        else {
          const ty=found.r===0?E.GROUND-4:E.GROUND-found.r*E.FLOOR+6; /* 가운데 주먹이 r층에 닿는 높이 */
          if(Math.abs(h.y-ty)>1.5){ if(h.y>ty) k.up=true; else k.down=true; }
          else if(h.punchT<=0&&h.eatT<=0){ if(h.dir!==-h.side){ if(h.side<0) k.right=true; else k.left=true; } /* 제 건물 쪽을 본다 */ if(found.r===0) k.down=true; k.punchPressed=true; punches++; }
        }
      }
    }
    const e0=S.hero.eats||0; E.step(S,k); if((S.hero.eats||0)>e0) eats++;
    frames++;
    // 불변식
    assert.ok(S.hero.stam>=0&&S.hero.stam<=E.MAX_STAM,'체력 범위'); assert.ok(S.hero.x>=0&&S.hero.x<=E.W,'x 범위'); assert.ok(S.hero.y<=E.GROUND+0.01,'y 범위 '+S.hero.y);
    assert.ok(Number.isFinite(S.score)&&S.score>=0); for(const bb of S.builds) for(const row of bb.cells) for(const c of row) assert.ok(c.hp>=0);
  }
  return {S,frames,punches,eats,rides,sits};
}
const forms=[1,2,3,4,5,6]; let line=[];
for(const f of forms){ const r=play(f,100+f,60*60*40); const S=r.S; line.push(`${E.FORMS[f-1].name}: ${S.status} 도시 ${S.city} 점수 ${S.score} 체력 ${Math.round(S.hero.stam)} 목숨 ${S.lives} 주먹 ${r.punches} 먹음 ${r.eats} 탑승 ${r.rides} 주저앉음 ${r.sits} 프레임 ${r.frames} (${(r.frames/3600).toFixed(1)}분)`); }
console.log(line.join('\n'));
