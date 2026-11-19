/* RosaryMap: turns the app's rosary "parts" (library.js) into bead positions.
   Pure function, no DOM. Works for ES and EN labels.
   Bead ids: 'cross','p1','h1'..'h3','p2','medal','d{dec}-{n}' (dec 1..5, n 1..10),'b1'..'b4'. */
(function(){
  const SETS=['gozosos','luminosos','dolorosos','gloriosos'];
  // traversal order of the 61 beads (one lap); 'end' = back at the medal, everything done
  const ORDER=['cross','p1','h1','h2','h3','p2','medal'];
  for(let d=1;d<=5;d++){for(let n=1;n<=10;n++)ORDER.push('d'+d+'-'+n);if(d<5)ORDER.push('b'+d)}
  const ORD=Object.fromEntries(ORDER.map((b,i)=>[b,i]));const END=ORDER.length;
  const RX={
    header:/^✧\s*(MISTERIOS|[A-Z ]*MYSTERIES)\b/,
    announce:/^✧/,
    cross:/se[ñn]al de la cruz|sign of the cross|^credo|creed|^i believe/i,
    of:/padre nuestro|our father/i,
    hm:/ave mar[ií]a|hail mary/i,
    gl:/^gloria|glory be|(· )gloria|· glory/i,
    oj:/oh jes[uú]s m[ií]o|o my jesus/i,
    end:/salve|hail,? holy queen|oraci[oó]n final|final prayer|closing prayer|letan[ií]a|litany|bajo tu amparo|we fly/i
  };
  function setOf(text,fallback){const t=text.toLowerCase();
    if(/gozos|joyful/.test(t))return 0;if(/lumin/.test(t))return 1;if(/doloros|sorrowful/.test(t))return 2;if(/glorios/.test(t))return 3;return fallback}
  // Texto completo de la parte → solo su rótulo («Primer misterio · Ave María 3 de 10»); los anuncios ✧ se quedan enteros.
  const label=t=>{t=String(t||'');if(t.startsWith('✧'))return t;const b=t.split(' · ');return b.length>1?b.slice(0,-1).join(' · '):t};
  function build(id,labels){
    const single=/^rosario-(gozosos|luminosos|dolorosos|gloriosos)/.exec(id||'');
    let set=single?SETS.indexOf(single[1]):0,lap=0,dec=-1,intro=true,hm=0,bead='cross',seenHeader=false;
    const out=[];
    labels.forEach((raw,i)=>{
      const L=label(raw);let kind='other';
      if(RX.header.test(L)){ // new set in the full rosary
        if(seenHeader){lap++}seenHeader=true;set=setOf(L,lap);dec=-1;intro=false;bead='medal';kind='header';
      }else if(RX.announce.test(L)&&(dec>=4||RX.end.test(L))){bead='end';kind='final'
      }else if(RX.announce.test(L)){dec++;intro=false;hm=0;bead=dec===0?'medal':'b'+dec;kind='announce';
        if(!single&&!seenHeader)set=setOf(L,set);
      }else if(RX.end.test(L)&&!intro){bead='end';kind='final'}
      else if(RX.cross.test(L)&&intro){bead='cross';kind='cross'}
      else if(RX.hm.test(L)){kind='hail';
        const m=/(\d+)\s*(?:de|of)\s*(\d+)/.exec(L);const n=m?+m[1]:++hm;hm=n;
        bead=intro?'h'+Math.min(3,n):'d'+(dec+1)+'-'+Math.min(10,n);
      }else if(RX.oj.test(L)){kind='fatima';bead=dec>=4?'end':'b'+(dec+1)}
      else if(RX.of.test(L)){kind='father';bead=intro?'p1':(dec<=0?'medal':'b'+dec)}
      else if(RX.gl.test(L)){kind='glory';bead=intro?'p2':(dec>=4?'end':'b'+(dec+1))}
      const m=Math.min(4,Math.max(0,dec));
      out.push({i,bead,ord:bead==='end'?END:ORD[bead],lap,set,decade:m,mystery:set*5+m,kind,label:L});
    });
    return out;
  }
  window.RosaryMap={build,label,ORDER,ORD,END,SETS};
})();
