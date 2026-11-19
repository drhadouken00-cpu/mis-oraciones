/* Mis oraciones · MiseMap: paso (índice de parte de «coronilla-misericordia») → cuenta del rosario.
   Puro, sin DOM; texto ES/EN de la biblioteca sin modificar.
   Cuentas: cross (Señal de la cruz) · p1 (Oración inicial + «Oh Sangre y Agua») · h1 Padre nuestro · h2 Ave María · h3 Credo ·
   decena 1: p2 (cuenta grande «Padre Eterno») + d1-1..d1-10 · decenas 2-5: b1..b4 (cuenta grande) + dN-1..dN-10 ·
   después de la última cuenta: fase «read» (Santo Dios ×3, oración final, «Jesús, en ti confío») sin cuentas. */
(function(){
  const LARGE=/^(?:Decena|Decade)\s+(\d)\s+(?:de|of)\s+5\s*·\s*(?:Cuenta grande|Large bead)\s*·/i;
  const SMALL=/^(?:Decena|Decade)\s+(\d)\s*·\s*(\d+)\s+(?:de|of)\s+10\s*·/i;
  const INTRO=[[/^(Señal de la cruz|Sign of the Cross)\s*·/i,'cross'],[/^(Oración inicial|Opening prayer|Tres veces|Three times)\s*·/i,'p1'],
    [/^(Padre nuestro|Our Father)\s*·/i,'h1'],[/^(Ave María|Hail Mary)\s*·/i,'h2'],[/^(Credo|Apostles' Creed|Creed)\s*·/i,'h3']];
  const largeId=d=>d===1?'p2':'b'+(d-1);
  function build(labels){let last=-1;labels.forEach((t,i)=>{if(SMALL.test(t)||LARGE.test(t))last=i});
    const steps=[];let bead='cross',dec=0;
    labels.forEach((raw,i)=>{const t=String(raw||'').trim();const s={i,phase:'intro',bead:null,decade:0,n:0,kind:'prayer',section:''};
      let m;
      if(last>=0&&i>last){Object.assign(s,{phase:'read',decade:6,section:t.split(' · ').length>1?t.split(' · ')[0]:''});steps.push(s);return}
      if((m=LARGE.exec(t))){dec=+m[1];bead=largeId(dec);Object.assign(s,{phase:'beads',bead,decade:dec,kind:'large'})}
      else if((m=SMALL.exec(t))){dec=+m[1];bead='d'+dec+'-'+(+m[2]);Object.assign(s,{phase:'beads',bead,decade:dec,n:+m[2],kind:'small'})}
      else if(dec===0){const hit=INTRO.find(([re])=>re.test(t));if(hit)bead=hit[1];Object.assign(s,{bead,kind:'intro'})}
      else Object.assign(s,{phase:'beads',bead,decade:dec});
      steps.push(s)});
    return steps}
  const ORD={cross:0,p1:1,h1:2,h2:3,h3:4,p2:5,medal:6};let k=7;
  for(let d=1;d<=5;d++){if(d>1)ORD['b'+(d-1)]=k++;for(let n=1;n<=10;n++)ORD['d'+d+'-'+n]=k++}
  function check(steps){const sm=steps.filter(s=>s.kind==='small'),per={};sm.forEach(s=>per[s.decade]=(per[s.decade]||0)+1);
    return {small:sm.length,large:steps.filter(s=>s.kind==='large').length,perDecade:per,unmapped:steps.filter(s=>s.phase!=='read'&&!s.bead).length,readFrom:(steps.find(s=>s.phase==='read')||{}).i}}
  window.MiseMap={build,check,ORD};
})();
