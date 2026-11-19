'use strict';
// Mis oraciones v11: vista inmersiva de la Coronilla de la Preciosísima Sangre («coronilla-sangre»).
// SINCRONÍA: la cuenta solo cambia con (1) el paso real de la lectura (evento mo-player → state.index, también
// el progreso del reproductor nativo del APK), (2) ‹ › al rezar sin voz o (3) al tocar una cuenta / un párrafo. Sin temporizadores.
// Pausa de 4 s tras el «Rogámoste» de cada misterio: en la web la hace tts.js preguntando a MO.gapAfter();
// en el APK la biblioteca trae una parte de silencio (⏸, silenceMs) que el reproductor nativo respeta.
// Clave nueva opcional: sangreView ('on'|'off', por defecto 'on'). No renombra ni borra ninguna clave existente.
(()=>{
const ID='coronilla-sangre',T=(es,en)=>window.MO_LANG==='en'?en:es,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AN=!!window.Android;
// Pausa entre misterios (también útil aunque la vista no esté abierta)
const mapCache={};
function stepsFor(id){const p=(window.PRAYERS||[]).find(x=>x.id===id)||(typeof current!=='undefined'&&current&&current.id===id?current:null);if(!p)return null;
 const k=id+':'+p.parts.length+':'+(window.MO_LANG||'es');return mapCache[k]||(mapCache[k]=SangreMap.build(p.parts.map(x=>x.text)))}
window.MO=Object.assign(window.MO||{},{gapAfter:(id,i)=>{try{if(id!==ID||!window.SangreMap)return 0;const st=stepsFor(id);return st&&SangreMap.gapAfter(st,i)?SangreMap.GAP_MS:0}catch{return 0}}});
if(!window.SangreAnim||!window.SangreMap||!window.SANGRE_MYSTERIES||!$('reader'))return;
let pref=(()=>{try{return localStorage.getItem('sangreView')==='off'?'off':'on'}catch{return 'on'}})();
const savePref=v=>{pref=v;try{localStorage.setItem('sangreView',v)}catch{}};
const view=document.createElement('section');view.id='saView';view.hidden=true;view.dataset.noi18n='1';view.setAttribute('aria-label',T('Coronilla de la Sangre de Cristo','Chaplet of the Precious Blood'));
const player=$('player');document.body.insertBefore(view,player||null);
const tgl=document.createElement('button');tgl.type='button';tgl.id='saToggle';tgl.className='secondary';tgl.hidden=true;tgl.textContent='📿 '+T('Vista coronilla','Chaplet view');
($('readerMeta')||$('readerTitle')).after(tgl);
let sa=null,loadedKey='',manual=null,lastKey='';
const isS=()=>!!(typeof current!=='undefined'&&current&&current.id===ID);
function ensure(){if(sa)return sa;sa=SangreAnim.mount(view,{lang:window.MO_LANG==='en'?'en':'es'});
 sa.el.tools.innerHTML=`<button type="button" class="saTextBtn" aria-label="${T('Ver el texto completo','Show the full text')}">📖 ${T('Texto','Text')}</button>`;
 const back=document.createElement('button');back.type='button';back.className='saBack';back.textContent='‹';back.setAttribute('aria-label',T('Volver a la biblioteca','Back to library'));
 sa.el.top.prepend(back);back.onclick=()=>$('back')?.click();
 sa.el.tools.querySelector('.saTextBtn').onclick=()=>{const i=sa?sa.idx:0;savePref('off');refresh();const el=$('part-'+i);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30)};
 sa.onJump=i=>{manual=null;if(isS()&&window.MO?.rosaryJump)MO.rosaryJump(ID,i)};
 sa.onNav=move;return sa}
const here=()=>isS()&&state.id===ID&&(state.playing||state.paused)&&Number.isInteger(state.index);
let pauseT=0;
function follow(force){if(!sa||view.hidden||!here())return;const key=state.index+':'+(state.playing?1:0)+':'+(state.waiting?1:0);
 if(force||key!==lastKey){lastKey=key;manual=null;if(sa.idx!==state.index||force)sa.setStep(state.index);
  // pausa de la web (tts.js, state.waiting tras el Rogámoste): la cuenta blanca sigue encendida y se ve «⏸ Pausa»
  clearInterval(pauseT);if(state.playing&&state.waiting&&SangreMap.gapAfter(sa.steps,state.index)){const end=Date.now()+SangreMap.GAP_MS;
   const tick=()=>{const l=Math.ceil((end-Date.now())/1000);if(l<=0||!state.waiting){clearInterval(pauseT);if(sa.idx===state.index)sa.showPause(0);return}sa.showPause(l)};tick();pauseT=setInterval(tick,500)}else if(view.querySelector('.sa-paused')||view.classList.contains('sa-paused'))sa.showPause(0)}}
function refresh(){const s=isS(),want=s&&pref==='on'&&!$('reader').hidden;tgl.hidden=!s||want;
 if(want){ensure();const key=current.parts.length+':'+(window.MO_LANG||'es');
  if(key!==loadedKey){loadedKey=key;manual=null;lastKey='';sa.lang=window.MO_LANG==='en'?'en':'es';sa.load(current.parts.map(p=>p.text),current.title)}
  let changed=false;if(view.hidden){changed=true;view.hidden=false;document.body.classList.add('saOn');requestAnimationFrame(()=>sa.relayout())}
  if(changed)follow(true)}
 else if(!view.hidden){view.hidden=true;document.body.classList.remove('saOn')}}
function saveManual(i){try{const secs=MO.rosarySections?.(ID)||[],s=secs.filter(x=>x.i<=i).pop();
 localStorage.setItem('rosaryProgress',JSON.stringify({id:ID,set:ID,index:i,label:[s?.group&&!s.label.startsWith(s.group)?s.group:'',s?.label].filter(Boolean).join(' · '),ts:Date.now()}))}catch{}}
function move(d){if(!sa||!isS())return;const i=Math.max(0,Math.min(sa.steps.length-1,sa.idx+d));if(i===sa.idx)return;
 if(state.id===ID&&state.playing){manual=null;sa.setStep(i);MO.rosaryJump(ID,i);return}
 manual=i;sa.setStep(i);saveManual(i);const el=$('part-'+i);if(el)el.scrollIntoView({block:'center'})}
tgl.onclick=()=>{savePref('on');refresh();follow(true)};
document.addEventListener('click',e=>{const t=e.target.closest?.('#toggle');if(!t||manual==null||view.hidden||!isS()||state.playing)return;
 e.preventDefault();e.stopImmediatePropagation();const i=manual;manual=null;MO.rosaryJump(ID,i)},true);
document.addEventListener('mo-player',()=>{refresh();follow(false)});
try{new MutationObserver(refresh).observe($('reader'),{attributes:true,attributeFilter:['hidden']})}catch{}
Object.assign(window.MO,{sangreView:()=>({on:pref==='on',shown:!view.hidden,step:sa?sa.idx:null,bead:sa?sa.steps[sa.idx]?.bead:null,reading:sa?sa.steps[sa.idx]?.phase==='read':null,manual}),setSangreView:v=>{savePref(v?'on':'off');refresh();follow(true)}});
// Créditos: cuadros de la Coronilla
const cr=document.querySelector('.v8credits');
if(cr&&window.SANGRE_CREDITS){const d=document.createElement('div');d.className='raCredits saCredits';
 const names=Object.fromEntries(SANGRE_MYSTERIES.map(m=>[m.key,m]));names['sangre-fin']={es:'Oraciones iniciales y finales',en:'Opening and closing prayers'};
 d.innerHTML='<h4>'+T('Frescos y cuadros · Coronilla de la Sangre de Cristo','Frescoes and paintings · Chaplet of the Precious Blood')+'</h4>'+SANGRE_CREDITS.map(c=>{const m=names[c.key]||{},nm=window.MO_LANG==='en'?m.en:m.es;
  const src=AN?esc(c.source.replace(/^https?:\/\//,'')):'<a href="'+esc(c.source)+'" target="_blank" rel="noopener">Wikimedia Commons</a>';
  return '<p><b>'+esc(nm||c.key)+':</b> '+esc(c.title)+' — '+esc(c.artist)+(c.year?', '+esc(c.year):'')+'. '+T('Dominio público','Public domain')+'. '+T('Fuente','Source')+': '+src+'</p>'}).join('');cr.append(d)}
refresh();
})();
