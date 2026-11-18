/* 출전 코드의 세 정수: 모습 번호, 시작 도시, 목숨. */
const orderedForms=window.Engine.FORMS.filter(f=>f.look==='origin').flatMap(f=>window.Engine.FORMS.filter(g=>g.key===f.key));
const recommendedIds=[1,5,9,11,3];
const otherForms=orderedForms.filter(f=>!recommendedIds.includes(f.id));
const menuForms=[...recommendedIds.map(id=>orderedForms.find(f=>f.id===id)),...otherForms.filter(f=>f.key!=='doom'),...otherForms.filter(f=>f.key==='doom')];
const examples=menuForms.map(f=>{
  const podong=f.key==='podong';
  const block=(label,n)=>`ㅋㅋ ${label}\n뿡뿡 도${'오'.repeat(n-1)}옹~뿡뿡뿡`;
  return {group:recommendedIds.includes(f.id)?'-추천-':'-나머지-',id:f.key+(f.look==='origin'?'':'-'+f.look),title:`${String(f.id).padStart(2,'0')} · ${f.name}${podong?' · 목숨 5':''}`,
    note:`첫 정수 ${f.id}: ${f.name}. ${f.desc}`+(podong?' 둘째 정수 1은 신중동, 셋째 정수 5는 목숨이다.':''),
    code:['나는 동현이냐?',block(`모습 ${f.id} · ${f.name}`,f.id),...(podong?[block('시작 도시 1 · 신중동',1),block('목숨 5',5)]:[]),'동현이구나'].join('\n')};
});
