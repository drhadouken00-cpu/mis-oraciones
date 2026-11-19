'use strict';
// Mis oraciones v12: vista inmersiva de la Coronilla de la Divina Misericordia («coronilla-misericordia»).
// Mismo enfoque que sangre-hook.js. SINCRONÍA: la cuenta solo cambia con (1) el paso real de la lectura (evento mo-player →
// state.index, también el progreso del reproductor nativo del APK), (2) ‹ › al rezar sin voz o (3) al tocar una cuenta / un párrafo.
// Sin temporizadores ni pausas extra. Clave nueva opcional: miseView ('on'|'off'). No renombra ni borra ninguna clave existente.
(()=>{
const ID='coronilla-misericordia',T=(es,en)=>window.MO_LANG==='en'?en:es,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AN=!!window.Android;
if(!window.MiseAnim||!window.MiseMap||!window.MISE_IMAGES||!$('reader'))return;
let pref=(()=>{try{return localStorage.getItem('miseView')==='off'?'off':'on'}catch{return 'on'}})();
const savePref=v=>{pref=v;try{localStorage.setItem('miseView',v)}catch{}};
const view=document.createElement('section');view.id='miView';view.hidden=true;view.dataset.noi18n='1';view.setAttribute('aria-label',T('Coronilla de la Divina Misericordia','Chaplet of Divine Mercy'));
const player=$('player');document.body.insertBefore(view,player||null);
const tgl=document.createElement('button');tgl.type='button';tgl.id='miToggle';tgl.className='secondary';tgl.hidden=true;tgl.textContent='📿 '+T('Vista coronilla','Chaplet view');
($('readerMeta')||$('readerTitle')).after(tgl);
let sa=null,loadedKey='',manual=null,lastKey='';
const isS=()=>!!(typeof current!=='undefined'&&current&&current.id===ID);
function ensure(){if(sa)return sa;sa=MiseAnim.mount(view,{lang:window.MO_LANG==='en'?'en':'es'});
 sa.el.tools.innerHTML=`<button type="button" class="saTextBtn" aria-label="${T('Ver el texto completo','Show the full text')}">📖 ${T('Texto','Text')}</button>`;
 const back=document.createElement('button');back.type='button';back.className='saBack';back.textContent='‹';back.setAttribute('aria-label',T('Volver a la biblioteca','Back to library'));
 sa.el.top.prepend(back);back.onclick=()=>$('back')?.click();
 sa.el.tools.querySelector('.saTextBtn').onclick=()=>{const i=sa?sa.idx:0;savePref('off');refresh();const el=$('part-'+i);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30)};
 sa.onJump=i=>{manual=null;if(isS()&&window.MO?.rosaryJump)MO.rosaryJump(ID,i)};
 sa.onNav=move;return sa}
const here=()=>isS()&&state.id===ID&&(state.playing||state.paused)&&Number.isInteger(state.index);
function follow(force){if(!sa||view.hidden||!here())return;const key=state.index+':'+(state.playing?1:0);
 if(force||key!==lastKey){lastKey=key;manual=null;if(sa.idx!==state.index||force)sa.setStep(state.index)}}
function refresh(){const s=isS(),want=s&&pref==='on'&&!$('reader').hidden;tgl.hidden=!s||want;
 if(want){ensure();const key=current.parts.length+':'+(window.MO_LANG||'es');
  if(key!==loadedKey){loadedKey=key;manual=null;lastKey='';sa.lang=window.MO_LANG==='en'?'en':'es';sa.load(current.parts.map(p=>p.text),current.title)}
  let changed=false;if(view.hidden){changed=true;view.hidden=false;document.body.classList.add('miOn');requestAnimationFrame(()=>sa.relayout())}
  if(changed)follow(true)}
 else if(!view.hidden){view.hidden=true;document.body.classList.remove('miOn')}}
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
window.MO=Object.assign(window.MO||{},{miseView:()=>({on:pref==='on',shown:!view.hidden,step:sa?sa.idx:null,bead:sa?sa.steps[sa.idx]?.bead:null,reading:sa?sa.steps[sa.idx]?.phase==='read':null,manual}),setMiseView:v=>{savePref(v?'on':'off');refresh();follow(true)}});
// Créditos: cuadros de la Coronilla
const cr=document.querySelector('.v8credits');
if(cr&&window.MISE_CREDITS){const d=document.createElement('div');d.className='raCredits miCredits';
 const names={'mise-jesus':{es:'Jesús Misericordioso (inicio y final)',en:'Divine Mercy (opening and closing)'}};[1,2,3,4,5].forEach(n=>names['mise-'+n]={es:'Decena '+n,en:'Decade '+n});
 d.innerHTML='<h4>'+T('Cuadros · Coronilla de la Divina Misericordia','Paintings · Chaplet of Divine Mercy')+'</h4>'+MISE_CREDITS.map(c=>{const m=names[c.key]||{},nm=window.MO_LANG==='en'?m.en:m.es;
  const src=AN?esc(c.source.replace(/^https?:\/\//,'')):'<a href="'+esc(c.source)+'" target="_blank" rel="noopener">Wikimedia Commons</a>';
  return '<p><b>'+esc(nm||c.key)+':</b> '+esc(c.title)+' — '+esc(c.artist)+(c.year?', '+esc(c.year):'')+'. '+T('Dominio público','Public domain')+'. '+T('Fuente','Source')+': '+src+'</p>'}).join('');cr.append(d)}
refresh();
})();
