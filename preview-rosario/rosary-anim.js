/* RosaryAnim: fresco + animated SVG rosary. No dependencies.
   const ra=RosaryAnim.mount(el,{lang:'es'}); ra.load(id,labels); ra.setStep(i); ra.onJump=i=>{...}; ra.setLang('en') */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- geometry (portrait frame 400x760; landscape = rotated, viewBox 760x400) ----
  const P={cx:200,cy:250,rx:168,ry:222};
  function ellipsePts(){ // evenly spaced by arc length, starting at bottom, going up the right side
    const N=2000,pts=[],len=[0];
    for(let k=0;k<=N;k++){const t=Math.PI/2-2*Math.PI*k/N;pts.push([P.cx+P.rx*Math.cos(t),P.cy+P.ry*Math.sin(t)]);
      if(k)len.push(len[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]))}
    return {at:s=>{let lo=0,hi=N;while(lo<hi){const m=(lo+hi)>>1;len[m]<s?lo=m+1:hi=m}return pts[lo]},total:len[N]};
  }
  function layout(){
    const E=ellipsePts(),beads={};
    // spacing units before each loop bead
    const loop=[];for(let d=1;d<=5;d++){for(let n=1;n<=10;n++)loop.push(['d'+d+'-'+n,n===1?(d===1?2.1:1.65):1]);if(d<5)loop.push(['b'+d,1.65])}
    const units=loop.reduce((a,b)=>a+b[1],0)+2.1,u=E.total/units;let s=0;
    loop.forEach(([id,w])=>{s+=w*u;const [x,y]=E.at(s);beads[id]={x,y,r:id[0]==='b'?10.5:7.2,big:id[0]==='b'}});
    const bx=P.cx,by=P.cy+P.ry;
    beads.medal={x:bx,y:by+20,r:15,medal:true};
    beads.p2={x:bx,y:by+62,r:10.5,big:true};
    beads.h1={x:bx,y:by+92,r:7.2};beads.h2={x:bx,y:by+114,r:7.2};beads.h3={x:bx,y:by+136,r:7.2};
    beads.p1={x:bx,y:by+168,r:10.5,big:true};
    beads.cross={x:bx,y:by+222,r:26,cross:true};
    return beads;
  }

  function mount(root,opt={}){
    const api={lang:opt.lang||'es',steps:[],idx:0,onJump:null};
    root.classList.add('ra');
    root.innerHTML=`<div class="ra-bg"><div class="ra-bgimg"></div><div class="ra-bgimg"></div></div><div class="ra-shade"></div>
      <div class="ra-stage"></div>
      <header class="ra-cap"><div class="ra-set"></div><div class="ra-mys"></div><div class="ra-pray"></div></header>
      <a class="ra-credit" target="_blank" rel="noopener"></a>`;
    const bg=[...root.querySelectorAll('.ra-bgimg')],stage=root.querySelector('.ra-stage');
    let svg,frImgs,beadEls={},curFresco=-1,bgFront=0,frFront=0,land=null;

    function build(){
      land=innerWidth>innerHeight*1.15;
      stage.innerHTML='';
      svg=mk('svg',{viewBox:land?'0 0 760 400':'0 0 400 760',preserveAspectRatio:'xMidYMid meet',class:'ra-svg',role:'img','aria-label':'Rosario'},stage);
      const defs=mk('defs',{},svg);
      defs.innerHTML=`<radialGradient id="raGold" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF4CF"/><stop offset=".45" stop-color="#E9C978"/><stop offset="1" stop-color="#9C7A2E"/></radialGradient>
        <radialGradient id="raDone" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#F3E2B0"/><stop offset=".6" stop-color="#B8964C"/><stop offset="1" stop-color="#6E5524"/></radialGradient>
        <radialGradient id="raDim" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#8E8578"/><stop offset=".6" stop-color="#4A443C"/><stop offset="1" stop-color="#26221D"/></radialGradient>
        <radialGradient id="raHalo"><stop offset="0" stop-color="#D4AF5A" stop-opacity=".95"/><stop offset=".45" stop-color="#D4AF5A" stop-opacity=".45"/><stop offset="1" stop-color="#D4AF5A" stop-opacity="0"/></radialGradient>
        <filter id="raGlow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="raShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity=".6"/></filter>
        <clipPath id="raOval"><ellipse cx="${P.cx}" cy="${P.cy}" rx="${P.rx-30}" ry="${P.ry-30}"/></clipPath>`;
      // in landscape rotate the whole portrait drawing so the pendant hangs to the right
      const g=mk('g',{transform:land?'translate(0 400) rotate(-90)':''},svg);
      // fresco oval (counter-rotated in landscape so the painting stays upright)
      const fr=mk('g',{'clip-path':'url(#raOval)'},g);
      const fw=2*(P.rx-30),fh=2*(P.ry-30);
      frImgs=[0,1].map(()=>mk('image',{x:land?P.cx-fh/2:P.cx-fw/2,y:land?P.cy-fw/2:P.cy-fh/2,width:land?fh:fw,height:land?fw:fh,preserveAspectRatio:'xMidYMid slice',class:'ra-fresco',transform:land?`rotate(90 ${P.cx} ${P.cy})`:''},fr));
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx-30,ry:P.ry-30,fill:'none',stroke:'#D4AF5A','stroke-opacity':'.55','stroke-width':'1.6'},g);
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx-35,ry:P.ry-35,fill:'none',stroke:'#000','stroke-opacity':'.35','stroke-width':'6'},g);
      const B=layout();
      // chain
      mk('ellipse',{cx:P.cx,cy:P.cy,rx:P.rx,ry:P.ry,fill:'none',class:'ra-chain'},g);
      mk('line',{x1:P.cx,y1:B.medal.y,x2:P.cx,y2:B.cross.y-30,class:'ra-chain'},g);
      beadEls={};
      for(const id in B){const b=B[id];const bg_=mk('g',{class:'ra-bead',tabindex:'0','data-b':id,transform:`translate(${b.x} ${b.y})`},g);
        mk('circle',{r:b.r*(b.cross?1.5:3.4),class:'ra-halo',fill:'url(#raHalo)'},bg_);
        if(b.cross){
          const c=mk('g',{class:'ra-body',filter:'url(#raShadow)',transform:land?'rotate(0)':''},bg_);
          mk('path',{d:'M-4.5 -26 h9 v14 h13 v9 h-13 v33 h-9 v-33 h-13 v-9 h13 z',class:'ra-fill'},c);
          mk('path',{d:'M0 -22 v44 M-13 -7.5 h26',stroke:'#000','stroke-opacity':'.25','stroke-width':'1'},c);
        }else if(b.medal){
          const c=mk('g',{class:'ra-body',filter:'url(#raShadow)'},bg_);
          mk('path',{d:'M0 -15 C10 -15 14 -6 14 0 C14 8 7 15 0 17 C-7 15 -14 8 -14 0 C-14 -6 -10 -15 0 -15 Z',class:'ra-fill'},c);
          mk('text',{y:'5',class:'ra-mono','text-anchor':'middle',transform:land?'rotate(90)':''},c).textContent='M';
        }else{
          const c=mk('circle',{r:b.r,class:'ra-body ra-fill',filter:'url(#raShadow)'},bg_);
          mk('circle',{r:b.r*.32,cx:-b.r*.32,cy:-b.r*.36,class:'ra-spec'},bg_);
        }
        bg_.addEventListener('click',()=>jumpBead(id));
        bg_.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();jumpBead(id)}});
        beadEls[id]=bg_;
      }
      curFresco=-1;render(true);
    }
    function jumpBead(id){const cur=api.steps[api.idx];if(!cur)return;
      const lapSteps=api.steps.filter(s=>s.lap===cur.lap);
      let t=lapSteps.find(s=>s.bead===id&&s.kind!=='announce'&&s.kind!=='header')||lapSteps.find(s=>s.bead===id);
      if(!t&&cur.lap>0)t=api.steps.find(s=>s.bead===id); // pendant beads only exist in lap 0
      if(t){api.setStep(t.i);api.onJump&&api.onJump(t.i)}}
    function fresco(m){if(m===curFresco)return;curFresco=m;const M=MYSTERIES[m];const instant=reduce();
      // background crossfade
      const nb=bg[1-bgFront];nb.style.backgroundImage=`url("${M.src}")`;nb.classList.add('on');bg[bgFront].classList.remove('on');bgFront=1-bgFront;
      const ni=frImgs[1-frFront];ni.setAttribute('href',M.src);ni.setAttribute('preserveAspectRatio',M.fit||'xMidYMid slice');ni.classList.add('on');frImgs[frFront].classList.remove('on');frFront=1-frFront;
      root.classList.toggle('ra-instant',instant);
      const c=(window.ROSARY_CREDITS||[]).find(c=>c.key===M.key);const cr=root.querySelector('.ra-credit');
      if(c){cr.textContent=`${c.artist} · ${c.title.replace(/\s*\(.*\)/,'')}`;cr.href=c.source}
    }
    function render(){
      const s=api.steps[api.idx];if(!s||!svg)return;const T=ROSARY_STR[api.lang];
      const curOrd=s.ord;
      for(const id in beadEls){const o=RosaryMap.ORD[id];const el=beadEls[id];
        const done=(s.lap>0&&o<=RosaryMap.ORD.medal&&id!=='medal')||o<curOrd;
        el.classList.toggle('cur',id===s.bead);el.classList.toggle('done',done&&id!==s.bead);
        el.setAttribute('aria-current',id===s.bead?'step':'false')}
      root.classList.toggle('ra-end',s.bead==='end');
      fresco(s.mystery);
      const M=MYSTERIES[s.mystery];
      root.querySelector('.ra-set').textContent=ROSARY_SETS[api.lang][s.set]+(api.laps>1?` · ${T.lap} ${s.lap+1}/${api.laps}`:'');
      const intro=s.ord<RosaryMap.ORD.medal&&s.kind!=='announce'&&s.lap===0&&!api.steps.slice(0,s.i).some(x=>x.kind==='announce');
      root.querySelector('.ra-mys').textContent=s.bead==='end'&&s.kind==='final'?T.end:intro?T.intro:`${T.ord[s.decade]} ${T.mystery}: ${M[api.lang]}`;
      let pr=s.label.replace(/^✧\s*/,'').split(' · ').filter(x=>!/^(Misterios |\w+ mysteries$)|(Primer|Segundo|Tercer|Cuarto|Quinto) misterio$|^(First|Second|Third|Fourth|Fifth) mystery$/i.test(x)).join(' · ');
      if(s.kind==='announce')pr=pr.replace(/:.*/,'');
      root.querySelector('.ra-pray').textContent=pr+`  ·  ${s.i+1}/${api.steps.length}`;
    }
    api.load=(id,labels)=>{api.id=id;api.steps=RosaryMap.build(id,labels);api.laps=api.steps.length?api.steps[api.steps.length-1].lap+1:1;api.idx=0;curFresco=-1;render()};
    api.setStep=i=>{api.idx=Math.max(0,Math.min(api.steps.length-1,i));render()};
    api.setLang=l=>{api.lang=l;render()};
    api.next=()=>api.setStep(api.idx+1);api.prev=()=>api.setStep(api.idx-1);
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if((innerWidth>innerHeight*1.15)!==land)build()},120)});
    build();
    return api;
  }
  window.RosaryAnim={mount};
})();
