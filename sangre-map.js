/* Mis oraciones · SangreMap: paso (índice de parte de la oración «coronilla-sangre») → cuenta.
   Puro, sin DOM. Funciona con el texto español e inglés de la biblioteca sin modificarlo.
   SangreMap.build(labels) → [{i, phase:'intro'|'beads'|'read', bead, mystery(0-7), n, of, kind, section}]
   bead: 'cross' (títulos) · 'medal' (oraciones iniciales) · 'd1'..'d7' (anuncio y meditación del misterio)
         'm{M}-{n}' (Padrenuestro n del misterio M) · 'g{M}' cuenta blanca tras los Padrenuestros: Gloria + «Rogámoste» (+ pausa) del misterio M · null (lectura) */
(function(){
  const ORDS={primer:1,primero:1,segundo:2,tercer:3,tercero:3,cuarto:4,quinto:5,sexto:6,'séptimo':7,septimo:7,
    first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7};
  const MYS=/^✧\s*([\wÁÉÍÓÚáéíóúñÑ]+)\s+(misterio|mystery)\s*$/i;
  const BEAD=/^[^·]*?(misterio|mystery)\s*·\s*(Padrenuestro|Padre nuestro|Our Father)\s+(\d+)\s+(de|of)\s+(\d+)\s*·/i;
  function build(labels){
    const steps=[];let m=0,phase='intro',section='',lastBead=-1;
    // la fase de lectura empieza en la primera parte con título ✧ tras la última cuenta del 7.º misterio
    labels.forEach((t,i)=>{if(BEAD.test(t))lastBead=i});
    labels.forEach((raw,i)=>{const t=String(raw||'').trim();let s={i,phase,mystery:m,bead:null,kind:'prayer',n:0,of:0,section};
      const mh=MYS.exec(t),bd=BEAD.exec(t),sil=/^⏸/.test(t);
      if(phase!=='read'&&i>lastBead&&lastBead>=0&&/^✧/.test(t)&&!mh)phase='read';
      if(phase==='read'){if(/^✧/.test(t))section=t.replace(/^✧\s*/,'');Object.assign(s,{phase,section,kind:/^✧/.test(t)?'header':'prayer',mystery:8});steps.push(s);return}
      if(mh&&ORDS[mh[1].toLowerCase()]){m=ORDS[mh[1].toLowerCase()];phase='beads';Object.assign(s,{phase,mystery:m,bead:'d'+m,kind:'announce'})}
      else if(sil&&phase==='beads'){Object.assign(s,{bead:'g'+m,kind:'pause'})}
      else if(bd){Object.assign(s,{phase:'beads',bead:'m'+m+'-'+(+bd[3]),n:+bd[3],of:+bd[5],kind:'bead'})}
      else if(phase==='intro'){Object.assign(s,{bead:/^✧/.test(t)?'cross':'medal',kind:/^✧/.test(t)?'header':'intro',mystery:0})}
      else{const prev=steps[steps.length-1];
        // texto tras el anuncio y antes del 1.er Padrenuestro = meditación; tras las cuentas = Gloria / Rogámoste
        if(prev&&(prev.kind==='announce'||prev.kind==='meditation'))Object.assign(s,{bead:'d'+m,kind:'meditation'});
        else Object.assign(s,{bead:'g'+m,kind:'gloria'})}
      s.mystery=s.mystery||m;steps.push(s)});
    return steps;
  }
  // orden de las cuentas en el anillo (para «hechas»): medalla, y por misterio: d, cuentas, g
  function order(groups){const o={cross:0,medal:1};let k=2;groups.forEach((n,gi)=>{const M=gi+1;o['d'+M]=k++;for(let j=1;j<=n;j++)o['m'+M+'-'+j]=k++;o['g'+M]=k++});o.end=k;return o}
  function check(steps){const beads=steps.filter(s=>s.kind==='bead'),per={};beads.forEach(s=>per[s.mystery]=(per[s.mystery]||0)+1);
    return {beads:beads.length,perMystery:per,unmapped:steps.filter(s=>s.phase!=='read'&&!s.bead).length,readFrom:(steps.find(s=>s.phase==='read')||{}).i}}
  // ¿Pausa de ~4 s después de este paso? Sí tras el «Rogámoste» (última oración de la cuenta blanca),
  // salvo que la biblioteca ya traiga una parte de silencio (⏸, APK) justo después.
  function gapAfter(steps,i){const s=steps[i],n=steps[i+1];return !!(s&&s.kind==='gloria'&&!(n&&(n.kind==='gloria'||n.kind==='pause')))}
  window.SangreMap={build,order,check,gapAfter,GAP_MS:4000,GROUPS:[5,5,5,5,5,5,3]};
})();
