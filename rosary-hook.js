'use strict';
// Mis oraciones v10: «Vista rosario» (fresco + cuentas) en el Rosario del día y en el Rosario completo.
// SINCRONÍA: la cuenta solo cambia con (1) el paso real de la lectura (evento mo-player → state.index, también
// cuando el reproductor nativo del APK informa del progreso), (2) ‹ › manual al rezar sin voz o (3) al tocar una cuenta.
// Sin temporizadores. Clave nueva: rosaryView ('on'|'off', por defecto 'on'). No renombra ni borra ninguna clave existente.
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es,$=id=>document.getElementById(id);
if(!window.RosaryAnim||!window.RosaryMap||!window.MYSTERIES||!$('reader'))return;
const AN=!!window.Android,isR=id=>/^rosario-/.test(id||'');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let pref=(()=>{try{return localStorage.getItem('rosaryView')==='off'?'off':'on'}catch{return 'on'}})();
const savePref=v=>{pref=v;try{localStorage.setItem('rosaryView',v)}catch{}};
// Capa de la vista rosario
const view=document.createElement('section');view.id='raView';view.hidden=true;view.dataset.noi18n='1';view.setAttribute('aria-label',T('Vista rosario','Rosary view'));
view.innerHTML=`<div class="raTop"><button type="button" class="raBack" aria-label="${T('Volver a la biblioteca','Back to library')}">‹</button><span class="raTitle"></span><button type="button" class="raTextBtn" aria-label="${T('Ver el texto completo','Show the full text')}">📖 ${T('Texto','Text')}</button></div>
<div class="raArt"></div><div class="raText" aria-live="polite"></div>
<div class="raNav"><button type="button" class="raPrev" aria-label="${T('Oración anterior del rosario','Previous prayer of the rosary')}">‹ ${T('Anterior','Previous')}</button><span class="raPos"></span><button type="button" class="raNext" aria-label="${T('Oración siguiente del rosario','Next prayer of the rosary')}">${T('Siguiente','Next')} ›</button></div>`;
const player=$('player');document.body.insertBefore(view,player||null);
const q=c=>view.querySelector(c),art=q('.raArt'),txt=q('.raText'),pos=q('.raPos');
// Botón en el lector para volver a la vista rosario
const tgl=document.createElement('button');tgl.type='button';tgl.id='raToggle';tgl.className='secondary';tgl.hidden=true;tgl.textContent='📿 '+T('Vista rosario','Rosary view');
($('readerMeta')||$('readerTitle')).after(tgl);
let ra=null,loadedId=null,loadedLen=-1,manual=null,lastKey='';
function ensure(){if(ra)return ra;ra=RosaryAnim.mount(art,{lang:window.MO_LANG==='en'?'en':'es'});
 view.prepend(ra.el.shade);view.prepend(ra.el.bg);art.before(ra.el.cap);
 ra.onJump=i=>{manual=null;if(current&&isR(current.id)&&window.MO?.rosaryJump)MO.rosaryJump(current.id,i)};
 ra.onRender=renderText;return ra}
function renderText(s){const part=current?.parts?.[s.i];if(!part){txt.textContent='';return}
 const bits=String(part.text||'').replace(/^✧\s*/,'').split(' · '),body=bits.pop(),head=bits.join(' · ');
 txt.innerHTML=(head?'<small>'+esc(head)+'</small>':'')+esc(body);txt.scrollTop=0;
 pos.textContent=(s.i+1)+' / '+ra.steps.length}
const here=()=>current&&isR(current.id)&&state.id===current.id&&(state.playing||state.paused)&&Number.isInteger(state.index);
// Sigue el paso real de la lectura. Solo se mueve si cambia el paso (o el estado de reproducción): sin evento, quieta.
function follow(force){if(!ra||view.hidden||!here())return;const key=state.id+':'+state.index+':'+(state.playing?1:0);
 if(force||key!==lastKey){lastKey=key;manual=null;ra.setStep(state.index)}}
function refresh(){const r=!!(current&&isR(current.id)),want=r&&pref==='on'&&!$('reader').hidden;tgl.hidden=!r||want;
 if(want){ensure();q('.raTitle').textContent=current.title;
  const fresh=loadedId!==current.id||loadedLen!==current.parts.length;
  if(fresh){loadedId=current.id;loadedLen=current.parts.length;manual=null;lastKey='';ra.load(current.id,current.parts.map(p=>p.text))}
  let changed=fresh;if(view.hidden){changed=true;view.hidden=false;document.body.classList.add('raOn');requestAnimationFrame(()=>ra.relayout())}
  if(changed)follow(true)}
 else if(!view.hidden){view.hidden=true;document.body.classList.remove('raOn')}}
// Guardar por dónde vas también al rezar sin voz (mismo formato que rosary.js)
function saveManual(i){try{const secs=MO.rosarySections?.(current.id)||[],s=secs.filter(x=>x.i<=i).pop();
 localStorage.setItem('rosaryProgress',JSON.stringify({id:current.id,set:(/^rosario-(\w+)/.exec(current.id)||[])[1]||current.id,index:i,label:[s?.group&&!s.label.startsWith(s.group)?s.group:'',s?.label].filter(Boolean).join(' · '),ts:Date.now()}))}catch{}}
function move(d){if(!ra||!current)return;const i=Math.max(0,Math.min(ra.steps.length-1,ra.idx+d));if(i===ra.idx)return;
 if(state.id===current.id&&state.playing){manual=null;ra.setStep(i);MO.rosaryJump(current.id,i);return} // con voz: la voz salta ahí
 manual=i;ra.setStep(i);saveManual(i);const el=$('part-'+i);if(el)el.scrollIntoView({block:'center'})} // sin voz o en pausa
q('.raPrev').onclick=()=>move(-1);q('.raNext').onclick=()=>move(1);
q('.raBack').onclick=()=>$('back')?.click();
q('.raTextBtn').onclick=()=>{const i=ra?ra.idx:0;savePref('off');refresh();const el=$('part-'+i);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30)};
tgl.onclick=()=>{savePref('on');refresh();follow(true)};
// ▶ tras mover a mano: empieza a leer desde la cuenta elegida
document.addEventListener('click',e=>{const t=e.target.closest?.('#toggle');if(!t||manual==null||view.hidden||!current||!isR(current.id)||state.playing)return;
 e.preventDefault();e.stopImmediatePropagation();const i=manual;manual=null;MO.rosaryJump(current.id,i)},true);
document.addEventListener('mo-player',()=>{refresh();follow(false)});
try{new MutationObserver(refresh).observe($('reader'),{attributes:true,attributeFilter:['hidden']})}catch{}
window.MO=Object.assign(window.MO||{},{rosaryView:()=>({on:pref==='on',shown:!view.hidden,step:ra?ra.idx:null,bead:ra?ra.steps[ra.idx]?.bead:null,manual}),setRosaryView:v=>{savePref(v?'on':'off');refresh();follow(true)}});
// Créditos: bloque «Frescos»
const cr=document.querySelector('.v8credits');
if(cr&&window.ROSARY_CREDITS){const d=document.createElement('div');d.className='raCredits';
 d.innerHTML='<h4>'+T('Frescos','Frescoes')+'</h4>'+ROSARY_CREDITS.map(c=>{const m=MYSTERIES.find(m=>m.key===c.key),nm=m?(window.MO_LANG==='en'?m.en:m.es):c.key;
  const src=AN?esc(c.source.replace(/^https?:\/\//,'')):'<a href="'+esc(c.source)+'" target="_blank" rel="noopener">Wikimedia Commons</a>';
  return '<p><b>'+esc(nm)+':</b> '+esc(c.title)+' — '+esc(c.artist)+(c.year?', '+esc(c.year):'')+'. '+T('Dominio público','Public domain')+'. '+T('Fuente','Source')+': '+src+'</p>'}).join('');cr.append(d)}
refresh();
})();
