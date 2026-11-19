/* Mis oraciones · SangreAnim: vista inmersiva de la Coronilla de la Preciosísima Sangre.
   Fresco en óvalo dorado + 33 cuentas (5-5-5-5-5-5-3) y, al terminar las cuentas, «modo lectura» claro
   para las oraciones finales, sin salir de la vista. Sin temporizadores: solo cambia con setStep(i).
   const sa=SangreAnim.mount(el,{lang}); sa.load(labels,title); sa.setStep(i); sa.onJump=i=>{}; sa.onNav=d=>{} */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P={cx:200,cy:236,rx:170,ry:214},FW=400,FH=590,IN=32;
  function ring(){const N=2400,pts=[],len=[0];
    for(let k=0;k<=N;k++){const t=Math.PI/2-2*Math.PI*k/N;pts.push([P.cx+P.rx*Math.cos(t),P.cy+P.ry*Math.sin(t)]);
      if(k)len.push(len[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]))}
    const idx=s=>{let lo=0,hi=N;while(lo<hi){const m=(lo+hi)>>1;len[m]<s?lo=m+1:hi=m}return lo};
    return {at:s=>pts[idx(s)],seg:(a,b)=>pts.slice(idx(a),idx(b)+1),total:len[N]}}
  function layout(){const E=ring(),G=window.SangreMap.GROUPS,B={},seq=[];
    G.forEach((n,gi)=>{const M=gi+1;seq.push(['d'+M,gi?1.75:2.3]);for(let j=1;j<=n;j++)seq.push(['m'+M+'-'+j,j===1?1.45:1]);seq.push(['g'+M,1.4])});
    const units=seq.reduce((a,b)=>a+b[1],0)+2.3,u=E.total/units;let s=0;const S={};
    seq.forEach(([id,w])=>{s+=w*u;S[id]=s;const [x,y]=E.at(s);B[id]={x,y,r:id[0]==='d'?8.6:id[0]==='g'?9.6:7.8,drop:id[0]==='d',white:id[0]==='g'}});
    const by=P.cy+P.ry;B.medal={x:P.cx,y:by+22,r:16,medal:true};B.cross={x:P.cx,y:by+92,r:26,cross:true};
    return {B}}

  function mount(host,opt={}){
    const api={lang:opt.lang||'es',labels:[],steps:[],idx:0,onJump:null,onNav:null,title:''};
    const T=()=>window.SANGRE_STR[api.lang];
    host.classList.add('sa');
    host.innerHTML=`<div class="sa-bg"><div class="sa-bgimg"></div><div class="sa-bgimg"></div></div><div class="sa-shade"></div>
      <div class="sa-light" aria-hidden="true"><div class="sa-lightimg"></div><div class="sa-veil"></div></div>
      <div class="sa-top"><span class="sa-title"></span><span class="sa-tools"></span></div>
      <header class="sa-cap"><div class="sa-set"></div><div class="sa-mys"></div><div class="sa-pray"></div></header>
      <div class="sa-art"><div class="sa-stage"></div><a class="sa-credit" target="_blank" rel="noopener"></a></div>
      <div class="sa-text" aria-live="polite"></div>
      <div class="sa-read"><figure class="sa-readart"><img alt=""><figcaption></figcaption></figure><div class="sa-list" role="list"></div></div>
      <div class="sa-nav"><button type="button" class="sa-prev"></button><span class="sa-pos"></span><button type="button" class="sa-next"></button></div>`;
    const q=c=>host.querySelector(c),bg=[...host.querySelectorAll('.sa-bgimg')],stage=q('.sa-stage');
    const R={top:q('.sa-top'),tools:q('.sa-tools'),title:q('.sa-title'),set:q('.sa-set'),mys:q('.sa-mys'),pray:q('.sa-pray'),credit:q('.sa-credit'),
      text:q('.sa-text'),list:q('.sa-list'),readImg:q('.sa-readart img'),readCap:q('.sa-readart figcaption'),light:q('.sa-lightimg'),pos:q('.sa-pos'),prev:q('.sa-prev'),next:q('.sa-next')};
    api.el=R;
    let svg,frImgs,frBox,beadEls={},ORD={},cur=-1,bgFront=0,frFront=0,land=null,paras=[];
    const credit=key=>(window.SANGRE_CREDITS||[]).find(c=>c.key===key)||{};

    function build(){const w=stage.clientWidth||innerWidth,h=stage.clientHeight||innerHeight;land=w>h*1.1;
      stage.innerHTML='';
      svg=mk('svg',{viewBox:land?`0 0 ${FH} ${FW}`:`0 0 ${FW} ${FH}`,preserveAspectRatio:'xMidYMid meet',class:'sa-svg',role:'img','aria-label':T().view},stage);
      mk('defs',{},svg).innerHTML=`<radialGradient id="saGold" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF4CF"/><stop offset=".45" stop-color="#E9C978"/><stop offset="1" stop-color="#9C7A2E"/></radialGradient>
        <radialGradient id="saDone" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#F3E2B0"/><stop offset=".6" stop-color="#B8964C"/><stop offset="1" stop-color="#6E5524"/></radialGradient>
        <radialGradient id="saDim" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#8E8578"/><stop offset=".6" stop-color="#4A443C"/><stop offset="1" stop-color="#26221D"/></radialGradient>
        <radialGradient id="saRuby" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#F08A8A"/><stop offset=".45" stop-color="#B0222A"/><stop offset="1" stop-color="#4E0A0F"/></radialGradient>
        <radialGradient id="saRubyDim" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#9a6a6a"/><stop offset=".6" stop-color="#5a2328"/><stop offset="1" stop-color="#2a0e10"/></radialGradient>
        <radialGradient id="saPearl" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E9E3D8"/><stop offset="1" stop-color="#A89E8E"/></radialGradient>
        <radialGradient id="saPearlDim" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#D9D4CB"/><stop offset=".6" stop-color="#9B958A"/><stop offset="1" stop-color="#5A564F"/></radialGradient>
        <radialGradient id="saPearlLit" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FFF6DC"/><stop offset="1" stop-color="#D4AF5A"/></radialGradient>
        <radialGradient id="saHalo"><stop offset="0" stop-color="#D4AF5A" stop-opacity=".95"/><stop offset=".45" stop-color="#D4AF5A" stop-opacity=".45"/><stop offset="1" stop-color="#D4AF5A" stop-opacity="0"/></radialGradient>
        <radialGradient id="saHaloR"><stop offset="0" stop-color="#E0505A" stop-opacity=".9"/><stop offset=".5" stop-color="#B0222A" stop-opacity=".4"/><stop offset="1" stop-color="#B0222A" stop-opacity="0"/></radialGradient>
        <filter id="saGlow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="saShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity=".6"/></filter>
        <filter id="saBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
        <clipPath id="saOval"><ellipse cx="${P.cx}" cy="${P.cy}" rx="${P.rx-IN}" ry="${P.ry-IN}"/></clipPath>`;
      const g=mk('g',{transform:land?`translate(0 ${FW}) rotate(-90)`:''},svg);
      const fr=mk('g',{'clip-path':'url(#saOval)'},g),fw=2*(P.rx-IN),fh=2*(P.ry-IN);
      const BW=land?fh:fw,BH=land?fw:fh,rot=land?`rotate(90 ${P.cx} ${P.cy})`:'';
      mk('rect',{x:P.cx-BW/2,y:P.cy-BH/2,width:BW,height:BH,fill:'#2a1a16',transform:rot},fr);
      frImgs=[0,1].map(()=>{const sl=mk('g',{class:'sa-fresco',transform:rot},fr);
        const under=mk('image',{x:P.cx-BW/2,y:P.cy-BH/2,width:BW,height:BH,preserveAspectRatio:'xMidYMid slice',filter:'url(#saBlur)',opacity:'.55'},sl);
        return {sl,under,img:mk('image',{preserveAspectRatio:'none'},sl)}});
      frBox={BW,BH};
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx-IN,ry:P.ry-IN,fill:'none',stroke:'#D4AF5A','stroke-opacity':'.6','stroke-width':'1.8'},g);
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx-IN-5,ry:P.ry-IN-5,fill:'none',stroke:'#000','stroke-opacity':'.35','stroke-width':'6'},g);
      const {B}=layout();ORD=window.SangreMap.order(window.SangreMap.GROUPS);
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx,ry:P.ry,class:'sa-chain'},g);
      mk('line',{x1:P.cx,y1:B.medal.y,x2:P.cx,y2:B.cross.y-30,class:'sa-chain'},g);
      beadEls={};
      for(const id in B){const b=B[id],el=mk('g',{class:'sa-bead'+(b.drop?' sa-drop':'')+(b.white?' sa-white':''),tabindex:'0',role:'button','data-b':id,transform:`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`},g);
        mk('circle',{r:b.r*(b.cross?1.5:3.2),class:'sa-halo',fill:b.drop?'url(#saHaloR)':'url(#saHalo)'},el);
        if(b.cross){const c=mk('g',{class:'sa-body',filter:'url(#saShadow)'},el);
          mk('path',{d:'M-4.5 -26 h9 v14 h13 v9 h-13 v33 h-9 v-33 h-13 v-9 h13 z',class:'sa-fill'},c);
          mk('circle',{r:2.6,cy:'-7.5',fill:'#9b1b22'},c)}
        else if(b.medal){const c=mk('g',{class:'sa-body',filter:'url(#saShadow)'},el);
          mk('circle',{r:16,class:'sa-fill'},c);
          // cáliz con una gota
          mk('path',{d:'M-7 -8 h14 c0 6 -3 9 -6 10 v5 h4 v2 h-10 v-2 h4 v-5 c-3 -1 -6 -4 -6 -10 z',fill:'#3b2c0c',transform:land?'rotate(90)':''},c);
          mk('path',{d:'M0 -15 c2 3 3 4.5 3 6 a3 3 0 0 1 -6 0 c0 -1.5 1 -3 3 -6 z',fill:'#9b1b22',transform:land?'rotate(90)':''},c)}
        else if(b.drop){const c=mk('g',{class:'sa-body',filter:'url(#saShadow)'},el);
          // gota (en horizontal se gira para que siga apuntando hacia arriba en pantalla)
          mk('path',{d:'M0 -11 C4 -5 8 -1 8 3.5 A8 8 0 0 1 -8 3.5 C-8 -1 -4 -5 0 -11 Z',class:'sa-fill',transform:land?'rotate(90)':''},c)}
        else{mk('circle',{r:b.r,class:'sa-body sa-fill',filter:'url(#saShadow)'},el);mk('circle',{r:b.r*.32,cx:-b.r*.32,cy:-b.r*.36,class:'sa-spec'},el)}
        el.addEventListener('click',()=>jumpBead(id));
        el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();jumpBead(id)}});
        beadEls[id]=el}
      cur=-1;render()}
    function jumpBead(id){const pick=id==='cross'?api.steps.find(s=>s.bead==='medal'):api.steps.find(s=>s.bead===id&&s.kind!=='header');
      if(pick){api.setStep(pick.i);api.onJump&&api.onJump(pick.i)}}
    function place(slot,M){const c=credit(M.key),iw=c.width||1000,ih=c.height||1000;
      const [fx,fy,z]=(land&&M.focus.l)||M.focus.p||[.5,.5,1],{BW,BH}=frBox,x0=P.cx-BW/2,y0=P.cy-BH/2;
      const s=Math.max(BW/iw,BH/ih)*(z||1),W=iw*s,H=ih*s,cl=(v,lo,hi)=>lo>hi?(lo+hi)/2:Math.min(hi,Math.max(lo,v));
      const x=cl(P.cx-fx*W,x0+BW-W,x0),y=cl(P.cy-fy*H,y0+BH-H,y0);
      for(const im of [slot.under,slot.img])im.setAttribute('href',M.src);
      slot.under.setAttribute('visibility',z<1?'visible':'hidden');
      Object.entries({x,y,width:W,height:H}).forEach(([k,v])=>slot.img.setAttribute(k,v.toFixed(1)))}
    function fresco(m){if(m===cur)return;const prevSrc=(window.SANGRE_MYSTERIES[cur]||{}).src;cur=m;const M=window.SANGRE_MYSTERIES[m];if(!M)return;
      host.classList.toggle('sa-instant',reduce());
      if(M.src!==prevSrc){const nb=bg[1-bgFront];nb.style.backgroundImage=`url("${M.src}")`;nb.classList.add('on');bg[bgFront].classList.remove('on');bgFront=1-bgFront;
        if(frImgs){const ni=frImgs[1-frFront];place(ni,M);ni.sl.classList.add('on');frImgs[frFront].sl.classList.remove('on');frFront=1-frFront}}
      const c=credit(M.key);if(c.source){R.credit.textContent=`${c.artist} · ${c.title.replace(/\s*\(.*\)/,'')}`;R.credit.href=c.source}}
    function split(t){const bits=String(t||'').replace(/^✧\s*/,'').split(' · '),body=bits.pop();return {head:bits.join(' · '),body}}
    function buildList(){const end=window.SANGRE_MYSTERIES[8],c=credit(end.key);
      R.light.style.backgroundImage=`url("${end.src}")`;R.readImg.src=end.src;R.readCap.textContent=c.artist?`${c.artist} · ${c.title}`:'';
      paras=[];R.list.innerHTML='';
      api.steps.filter(s=>s.phase==='read').forEach(s=>{const p=document.createElement(s.kind==='header'?'h3':'p');p.setAttribute('role','listitem');p.tabIndex=0;
        const {head,body}=split(api.labels[s.i]);p.innerHTML=(head?'<small>'+esc(head)+'</small>':'')+esc(body);p.dataset.i=s.i;
        p.onclick=()=>{api.setStep(s.i);api.onJump&&api.onJump(s.i)};p.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();p.onclick()}};
        R.list.appendChild(p);paras[s.i]=p})}
    let lastRead=-1;
    function render(){const s=api.steps[api.idx];if(!s)return;const t=T(),reading=s.phase==='read';
      host.classList.toggle('sa-reading',reading);
      fresco(s.mystery);
      if(svg)for(const id in beadEls){const o=ORD[id],el=beadEls[id],isCur=id===s.bead,done=reading||(o<ORD[s.bead]&&!isCur);
        el.classList.toggle('cur',isCur);el.classList.toggle('done',done);if(el.hasAttribute('tabindex'))el.setAttribute('aria-current',isCur?'step':'false')}
      const M=window.SANGRE_MYSTERIES[s.mystery],{head,body}=split(api.labels[s.i]);
      const first=b=>{b=String(b||'').trim();return b.length<=52?b:b.slice(0,b.lastIndexOf(' ',48)).replace(/[,.;:]+$/,'')+'…'};
      if(reading){R.set.textContent=t.reading;R.mys.textContent=s.section||t.reading;R.pray.textContent=''}
      else if(s.phase==='intro'){R.set.textContent=t.intro;R.mys.textContent=s.kind==='header'?body:first(body);R.pray.textContent=''}
      else{R.set.textContent=`${t.mysteryCap} ${s.mystery} ${t.of} 7`;R.mys.textContent=`${t.ord[s.mystery]} ${t.mystery}: ${M[api.lang]}`;
        R.pray.textContent=s.kind==='bead'?head.split(' · ').pop():s.kind==='gloria'?first(body):s.kind==='pause'?'⏸ '+t.pause+' · '+Math.round(SangreMap.GAP_MS/1000)+' s':t.meditation}
      host.classList.remove('sa-paused');
      R.text.innerHTML=(head?'<small>'+esc(head)+'</small>':'')+esc(body);R.text.scrollTop=0;
      R.pos.textContent=(s.i+1)+' / '+api.steps.length;
      if(reading&&paras[s.i]&&lastRead!==s.i){paras.forEach(p=>p&&p.classList.remove('cur'));paras[s.i].classList.add('cur');paras[s.i].setAttribute('aria-current','true');
        const first=lastRead<0||!host.classList.contains('sa-was-reading');lastRead=s.i;host.classList.add('sa-was-reading');
        requestAnimationFrame(()=>{const L=R.list,el=paras[s.i];if(!el)return;const top=el.offsetHeight>L.clientHeight*.7?el.offsetTop-16:el.offsetTop-(L.clientHeight-el.offsetHeight)/2;
          L.scrollTo({top:Math.max(0,top),behavior:(reduce()||first)?'auto':'smooth'})})}
      if(!reading){lastRead=-1;host.classList.remove('sa-was-reading')}
      api.onRender&&api.onRender(s)}
    function navTxt(){R.prev.textContent='‹ '+T().prev;R.next.textContent=T().next+' ›';R.prev.setAttribute('aria-label',T().prev);R.next.setAttribute('aria-label',T().next)}
    R.prev.onclick=()=>api.onNav?api.onNav(-1):api.prev();R.next.onclick=()=>api.onNav?api.onNav(1):api.next();
    api.load=(labels,title)=>{api.labels=labels.slice();api.title=title||'';R.title.textContent=api.title;api.steps=window.SangreMap.build(api.labels);api.idx=0;cur=-1;lastRead=-1;buildList();navTxt();
      if(svg)for(const s of frImgs)s.sl.classList.remove('on');render()};
    api.setStep=i=>{api.idx=Math.max(0,Math.min(api.steps.length-1,i));render()};
    api.setLang=(l,labels,title)=>{const i=api.idx;api.lang=l;svg&&svg.setAttribute('aria-label',T().view);if(labels){api.load(labels,title);api.setStep(i)}else{navTxt();render()}};
    // Pausa entre misterios (la cuenta blanca sigue encendida): muestra «⏸ Pausa · 4 s» sin mover la cuenta.
    api.showPause=sec=>{const s=api.steps[api.idx];if(!s||s.phase==='read')return;host.classList.toggle('sa-paused',sec>0);if(sec>0)R.pray.textContent=`⏸ ${T().pause} · ${sec} s`;else render()};
    api.next=()=>api.setStep(api.idx+1);api.prev=()=>api.setStep(api.idx-1);
    api.relayout=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(w&&h&&(w>h*1.1)!==land){build()}};
    let rt;const relayout=()=>{clearTimeout(rt);rt=setTimeout(api.relayout,120)};
    try{new ResizeObserver(relayout).observe(stage)}catch{addEventListener('resize',relayout)}
    navTxt();build();
    return api}
  window.SangreAnim={mount};
})();
