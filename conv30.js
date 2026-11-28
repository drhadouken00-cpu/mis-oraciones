'use strict';
// Mis oraciones v3.1 (27): Conversación con Jesús de la Misericordia durante 30 días.
// · Tarjeta en el panel de arriba (con el Rosario, las coronillas y el Ángelus): contador de días rezados (1–30; si un día no se reza,
//   se sigue donde se dejó, sin volver a empezar), estado de las 15:00 y aviso diario opcional a las 15:00 (apagado por defecto).
// · Pantalla de oración como la del Ángelus. SINCRONÍA: la frase solo cambia con el paso real de la lectura (evento mo-player → state.index)
//   o con ‹ › / tocar una frase. Sin temporizadores. Las «(pedir la gracia)» son pausas: la voz se detiene hasta pulsar ▶.
// · «Mensaje de Jesús» opcional (abre la variante «conversacion-30-mensaje»). Final: «Divina Misericordia, en vos confío.».
// · Clave nueva: conv30 ({days:[fechas rezadas], msg, mode, view, rem:{on}, past}). Alarma nueva: id «__conv30».
//   No renombra ni borra ninguna clave ni toca la oración «conversacion-jesus-misericordia» de la lista.
(()=>{
if(!window.CONV30)return;
const C=window.CONV30,EN=window.MO_LANG==='en',T=(es,en)=>EN?en:es,$=id=>document.getElementById(id),AN=!!window.Android,ANAL=!!window.AndroidAlarms,AID='__conv30';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0'),ymd=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const byIdP=id=>(typeof prayers!=='undefined'&&prayers.find(p=>p.id===id))||(window.PRAYERS||[]).find(p=>p.id===id);
function cfg(){let r={};try{r=JSON.parse(localStorage.getItem('conv30')||'{}')||{}}catch(e){}
 return {days:Array.isArray(r.days)?r.days.filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)):[],msg:!!r.msg,mode:r.mode==='manual'?'manual':'voice',view:r.view==='off'?'off':'on',rem:{on:!!(r.rem&&r.rem.on)},past:Array.isArray(r.past)?r.past:[]}}
function save(c){try{localStorage.setItem('conv30',JSON.stringify(c))}catch(e){}}
function info(){const c=cfg(),n=c.days.length,today=c.days.includes(ymd());return {c,n,today,day:Math.min(30,today?n:n+1),complete:n>=30}}
const L=EN?{name:'Conversation with Merciful Jesus',sub:'30 days · at 3 pm, the Hour of Mercy',day:n=>`Day ${n} of 30`,
 now:'Now: the Hour of Mercy (3 pm)',later:'Today at 3 pm',past:'You can still pray it today',done:'Prayed today ✓',fin:'30 days completed ✓',
 pray:'Pray',restart:'Start again',restartQ:'Start the 30 days again? The days prayed so far will be kept as a finished round.',rem:'3 pm reminder',remOn:'3 pm reminder ✓',
 remH:'Conversation · daily reminder',remLead:'A reminder every day at 3 pm, the Hour of Mercy. It is optional and off unless you turn it on.',remRow:'Every day at 3 pm',remRowSub:'Hour of Mercy',
 remNoteA:'The app’s own alarms are used (the same as in “Prayer alarms”). Tapping the reminder opens this prayer.',remNoteW:'On the web the reminder only appears while the app is open. For a reliable reminder, add it to your calendar (30 daily events).',
 save:'Save',close:'Back',ics:'📅 Add to calendar',saved:on=>on?'Reminder saved ✓ · every day at 3 pm':'Reminder turned off',fail:'The reminder could not be saved.',icsNone:'Turn on the reminder first.',
 icsOk:'Open the downloaded file and tap “Add” to save the daily events in your calendar.',sum:'Conversation with Merciful Jesus · 3 pm',desc:'It is 3 pm, the Hour of Mercy. Open Mis oraciones: ',
 title:'CONVERSATION · 30 DAYS',mys:'Jesus, I trust in You',msgOff:'+ Message of Jesus (optional)',msgOn:'✓ Message of Jesus included',
 modeVoice:'🔊 Voice',modeManual:'👆 Manual',play:'Listen',pause:'Pause',prev:'Previous',nextB:'Next',back:'Back to library',text:'Text',textL:'Show the full text',viewBtn:'✦ Conversation view',
 mark:n=>`Mark day ${n} as prayed`,marked:n=>n>=30?'You have completed the 30 days. May the Lord grant you the grace you ask for.':`Day ${n} prayed. Next time, day ${n+1}.`,
 credit:'Merciful Jesus · E. Kazimirowski, 1934 · public domain',hint:C.hint.en}
:{name:'Conversación con Jesús de la Misericordia',sub:'30 días · a las 15:00, la hora de la Misericordia',day:n=>`Día ${n} de 30`,
 now:'Ahora: hora de la Misericordia (15:00)',later:'Hoy a las 15:00',past:'Hoy aún puedes rezarla',done:'Hoy ya rezada ✓',fin:'30 días completados ✓',
 pray:'Rezar',restart:'Empezar de nuevo',restartQ:'¿Empezar otra vez los 30 días? Los días rezados se guardan como una tanda terminada.',rem:'Aviso 15:00',remOn:'Aviso 15:00 ✓',
 remH:'Conversación · aviso diario',remLead:'Un aviso cada día a las 15:00, la hora de la Misericordia. Es opcional y está apagado salvo que lo actives.',remRow:'Cada día a las 15:00',remRowSub:'Hora de la Misericordia',
 remNoteA:'Se usan las alarmas de la propia app (las mismas de «Alarmas de oración»). Al tocar el aviso se abre esta oración.',remNoteW:'En la web el aviso solo aparece con la app abierta. Para un aviso fiable, añádelo a tu calendario (30 eventos diarios).',
 save:'Guardar',close:'Volver',ics:'📅 Añadir al calendario',saved:on=>on?'Aviso guardado ✓ · cada día a las 15:00':'Aviso desactivado',fail:'No se ha podido guardar el aviso.',icsNone:'Activa primero el aviso.',
 icsOk:'Abre el archivo descargado y pulsa «Añadir» para guardar los eventos diarios en tu calendario.',sum:'Conversación con Jesús de la Misericordia · 15:00',desc:'Son las 15:00, la hora de la Misericordia. Abre Mis oraciones: ',
 title:'CONVERSACIÓN · 30 DÍAS',mys:'Jesús, en ti confío',msgOff:'＋ Mensaje de Jesús (opcional)',msgOn:'✓ Mensaje de Jesús incluido',
 modeVoice:'🔊 Con voz',modeManual:'👆 Manual',play:'Escuchar',pause:'Pausa',prev:'Anterior',nextB:'Siguiente',back:'Volver a la biblioteca',text:'Texto',textL:'Ver el texto completo',viewBtn:'✦ Vista Conversación',
 mark:n=>`Marcar el día ${n} como rezado`,marked:n=>n>=30?'Has terminado los 30 días. Que el Señor te conceda la gracia que pides.':`Día ${n} rezado. La próxima vez, día ${n+1}.`,
 credit:'Jesús Misericordioso · E. Kazimirowski, 1934 · dominio público',hint:C.hint.es};
const ICO={back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
 play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
 more:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 star:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18"/><path d="M12 7l2.2 2.8L12 12l-2.2-2.2z"/></svg>'};
const toast=m=>{try{window.MO&&MO.toast&&MO.toast(m)}catch(e){}};

/* ---------- Días rezados ---------- */
function markToday(){const c=cfg(),d=ymd();if(c.days.includes(d)||c.days.length>=30)return false;c.days.push(d);save(c);paintCard();if(!view.hidden)paintEnd();return true}

/* ---------- Aviso (alarmas de la app) ---------- */
const remTitle=()=>T('Conversación con Jesús · 15:00','Conversation with Jesus · 3 pm');
function conv30Alarms(){return cfg().rem.on?[{time:'15:00',id:AID,title:remTitle(),on:true}]:[]}
function currentAlarms(){try{if(ANAL){const a=JSON.parse(AndroidAlarms.get());if(Array.isArray(a))return a}}catch(e){}try{const a=JSON.parse(localStorage.getItem('alarms'));return Array.isArray(a)?a:[]}catch(e){return []}}
function syncAlarms(){const list=currentAlarms().filter(a=>a.id!==AID).concat(conv30Alarms()).slice(0,20);
 try{localStorage.setItem('alarms',JSON.stringify(list))}catch(e){}if(ANAL){try{return AndroidAlarms.set(JSON.stringify(list))!==false}catch(e){return false}}return true}
try{const want=conv30Alarms();if(want.length){const have=currentAlarms().filter(a=>a.id===AID);if(have.length!==1||have[0].title!==want[0].title)syncAlarms()}}catch(e){}

/* ---------- Tarjeta del inicio ---------- */
const tiles=document.querySelector('#todayCards .tiles');let tile=null;
if(tiles){tile=document.createElement('article');tile.className='tile angTile c30Tile';tile.id='tileConv30';tile.dataset.noi18n='1';tile.setAttribute('aria-labelledby','c30Name');
 tile.innerHTML=`<span class="tileIcon" aria-hidden="true">${ICO.star}</span><strong id="c30Name"></strong><small id="c30Sub"></small><span class="c30Day" id="c30Day"></span><span class="c30Bar" id="c30Bar" aria-hidden="true"></span><span class="angStatus" id="c30Status" role="status"></span><span class="angActions"><button type="button" class="angPray" id="c30Pray"></button><button type="button" class="secondary angRem" id="c30Rem"></button></span>`;
 const after=$('tileAngelus')||$('tileTimer');if(after&&after.parentNode===tiles)after.after(tile);else tiles.append(tile)}
function paintCard(){if(!tile)return;const I=info(),h=new Date().getHours();
 $('c30Name').textContent=L.name;$('c30Sub').textContent=L.sub;$('c30Day').textContent=L.day(I.day);
 $('c30Bar').innerHTML=Array.from({length:30},(_,i)=>`<i class="${i<I.n?'done':i===I.n&&!I.today?'cur':''}"></i>`).join('');
 const s=$('c30Status');s.classList.remove('nowS');
 if(I.complete)s.textContent=L.fin;else if(I.today)s.textContent=L.done;else if(h===15){s.innerHTML='<span class="dot"></span>'+esc(L.now);s.classList.add('nowS')}else s.textContent=h<15?L.later:L.past;
 $('c30Pray').textContent=I.complete?L.restart:L.pray;$('c30Rem').textContent=I.c.rem.on?L.remOn:L.rem;$('c30Rem').setAttribute('aria-pressed',String(I.c.rem.on))}
function openToday(){const p=byIdP(C.todayId());if(p&&typeof openPrayer==='function')openPrayer(p)}
function pray(){const I=info();if(I.complete){if(!confirm(L.restartQ))return;const c=cfg();c.past.push({end:ymd(),n:c.days.length});c.days=[];save(c);paintCard()}openToday()}
if(tile){$('c30Pray').onclick=pray;$('c30Rem').onclick=openRem;tile.addEventListener('click',e=>{if(e.target.closest('button'))return;openToday()});
 paintCard();setInterval(()=>{if(!document.hidden)paintCard()},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintCard()})}

/* ---------- Diálogo del aviso ---------- */
const dlg=document.createElement('dialog');dlg.id='c30RemDlg';dlg.dataset.noi18n='1';
dlg.innerHTML=`<h2></h2><p class="remLead"></p><label class="remRow"><span><b>15:00</b><small></small></span><input type="checkbox" aria-label="15:00"></label><p class="remNote"></p><p class="remMsg" role="status"></p><div class="remBtns"><button type="button" class="secondary remIcs"></button><button type="button" class="secondary remClose"></button><button type="button" class="remSave"></button></div>`;
document.body.append(dlg);const dq=s=>dlg.querySelector(s);
function openRem(){dq('h2').textContent=L.remH;dq('.remLead').textContent=L.remLead;dq('.remRow small').textContent=L.remRow+' · '+L.remRowSub;dq('input').checked=cfg().rem.on;
 dq('.remNote').textContent=ANAL?L.remNoteA:L.remNoteW;dq('.remMsg').textContent='';const ics=dq('.remIcs');ics.hidden=ANAL;ics.textContent=L.ics;dq('.remClose').textContent=L.close;dq('.remSave').textContent=L.save;dlg.showModal()}
dq('.remClose').onclick=()=>dlg.close();
dq('.remSave').onclick=()=>{const c=cfg(),on=dq('input').checked;c.rem={on};save(c);const ok=syncAlarms();
 if(!ok){dq('.remMsg').textContent=L.fail;return}
 if(!ANAL&&on&&window.Notification&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}
 dlg.close();paintCard();toast(L.saved(on))};
dq('.remIcs').onclick=()=>{if(!dq('input').checked){dq('.remMsg').textContent=L.icsNone;return}
 const url=location.origin+location.pathname+'#open='+AID,d=new Date(),day=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate()),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),e=x=>x.replace(/[\\;,]/g,c=>'\\'+c);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis oraciones//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:misoraciones-conv30-'+day+'@misoraciones','DTSTAMP:'+stamp,'DTSTART:'+day+'T150000','DURATION:PT10M','RRULE:FREQ=DAILY;COUNT=30','SUMMARY:'+e(L.sum),'DESCRIPTION:'+e(L.desc+url),'URL:'+url,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+e(L.sum),'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'];
 const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mis-oraciones-conversacion-30.ics';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 dq('.remMsg').textContent=L.icsOk};

/* ---------- Pantalla de oración ---------- */
const reader=$('reader');let pref=cfg().view,mode=cfg().mode;
const view=document.createElement('section');view.id='c30View';view.hidden=true;view.dataset.noi18n='1';
view.innerHTML=`<div class="av-bg"><div class="bgi on" style="background-image:url(frescos/mise-jesus.webp)"></div></div><div class="av-shade"></div>
<div class="avTop"><button type="button" class="avBack" aria-label="${esc(L.back)}">${ICO.back}</button><span class="avTitle"></span><button type="button" class="avTextBtn" aria-label="${esc(L.textL)}">📖 ${esc(L.text)}</button><button type="button" class="avMode"></button></div>
<div class="avCap"><div class="avSet"></div><div class="avMys"></div></div>
<div class="avArt"><div class="avStage"><img class="on" src="frescos/mise-jesus.webp" alt="" decoding="async" style="--s:1"></div><span class="avCredit"></span></div>
<div class="c30Opt"><button type="button" class="c30Msg"></button></div>
<div class="avText"></div>
<div class="avNav"><button type="button" class="avPrev" aria-label="${esc(L.prev)}">${ICO.prev}</button><button type="button" class="avPlay main"></button><button type="button" class="avNext" aria-label="${esc(L.nextB)}"></button></div>
<div class="avFoot"></div>`;
if(reader)document.body.insertBefore(view,$('player')||null);
const q=s=>view.querySelector(s);
const tgl=document.createElement('button');tgl.type='button';tgl.id='c30Toggle';tgl.className='secondary';tgl.hidden=true;tgl.textContent=L.viewBtn;
if(reader)(($('readerMeta')||$('readerTitle'))||reader).after(tgl);
let idx=0,loaded='',moved=false,lastKey='',keepIdx=null;
const curId=()=>(typeof current!=='undefined'&&current)?current.id:null;
const isC=()=>C.ids.includes(curId());
const meta=()=>C.meta[curId()]||[];
const sessionHere=()=>typeof state!=='undefined'&&state.id===curId()&&(state.playing||state.paused)&&Number.isInteger(state.index);
function build(){const M=meta();q('.avTitle').textContent=L.title;q('.avMys').textContent=L.mys;q('.avCredit').textContent=L.credit;q('.avStage img').alt=L.credit;
 const box=q('.avText');box.innerHTML='';
 current.parts.forEach((p,i)=>{const k=M[i]||'t',el=document.createElement('p');el.className='ph '+k;
  el.innerHTML=`<span>${esc(p.text)}</span>`+(k==='p'?`<span class="hint">${esc(L.hint)}</span>`:'');if(k!=='h')el.onclick=()=>go(i);box.append(el)});
 const end=document.createElement('div');end.className='c30End';box.append(end);paintEnd()}
function paintEnd(){const end=q('.c30End');if(!end)return;const I=info();
 end.hidden=idx<current.parts.length-1&&!I.today;
 end.innerHTML=I.today?`<p>${esc(L.marked(I.n))}</p>`:I.complete?'':`<button type="button" class="c30Mark">${esc(L.mark(I.day))}</button>`;
 const b=end.querySelector('.c30Mark');if(b)b.onclick=()=>{markToday()}}
function paint(scroll=true){const I=info();q('.avSet').textContent=L.day(I.day);
 view.querySelectorAll('.avText .ph').forEach((p,i)=>{p.classList.toggle('cur',i===idx);p.classList.toggle('done',i<idx)});
 const cur=q('.avText .ph.cur'),bx=q('.avText');if(cur&&scroll)bx.scrollTo({top:cur.offsetTop-bx.clientHeight/2+cur.offsetHeight/2,behavior:'smooth'});
 const msg=curId()==='conversacion-30-mensaje';q('.c30Msg').textContent=msg?L.msgOn:L.msgOff;q('.c30Msg').setAttribute('aria-pressed',String(msg));
 const playing=sessionHere()&&state.playing;
 q('.avPlay').innerHTML=playing?ICO.pause:ICO.play;q('.avPlay').setAttribute('aria-label',playing?L.pause:L.play);q('.avPlay').hidden=mode!=='voice';
 q('.avNext').innerHTML=mode==='voice'?ICO.next:ICO.more;view.classList.toggle('manual',mode!=='voice');
 q('.avMode').textContent=mode==='voice'?L.modeVoice:L.modeManual;q('.avMode').setAttribute('aria-pressed',String(mode==='voice'));paintEnd()}
function go(i){const n=current.parts.length;i=Math.max(0,Math.min(n-1,i));
 if(meta()[i]==='h')i+=(i>idx?1:-1);i=Math.max(0,Math.min(n-1,i));
 if(sessionHere()&&state.playing){idx=i;moved=false;paint();startQueue([curId()],i);return}
 if(i===idx)return;idx=i;moved=true;paint();const el=$('part-'+i);if(el)el.scrollIntoView({block:'center'})}
let following=false;
function follow(force){if(view.hidden)return;
 if(!sessionHere()){if(following&&typeof state!=='undefined'&&state.id===curId()&&state.completed&&!moved&&Number.isInteger(state.index)&&state.index>idx){idx=Math.min(state.index,current.parts.length-1);paint()}
  following=false;return}
 following=true;const key=state.index+':'+(state.playing?1:0);
 if(force||key!==lastKey){lastKey=key;if(state.playing||!moved){moved=false;if(idx!==state.index||force){idx=Math.min(state.index,current.parts.length-1);paint()}else paint(false)}}}
function refresh(){const a=isC(),want=a&&pref==='on'&&reader&&!reader.hidden;tgl.hidden=!(a&&!want);
 if(want){const key=curId()+':'+current.parts.length;if(key!==loaded){loaded=key;idx=keepIdx!=null?Math.min(keepIdx,current.parts.length-1):0;keepIdx=null;moved=false;lastKey='';build();if(!view.hidden){if(sessionHere())idx=Math.min(state.index,current.parts.length-1);paint(false)}}
  if(view.hidden){view.hidden=false;document.body.classList.add('avOn');if(sessionHere())idx=Math.min(state.index,current.parts.length-1);paint();q('.avBack').focus({preventScroll:true})}}
 else if(!view.hidden){view.hidden=true;if(!($('angView')&&!$('angView').hidden))document.body.classList.remove('avOn')}}
function setPref(v){pref=v;const c=cfg();c.view=v;save(c)}
q('.avBack').onclick=()=>$('back')?.click();
q('.avTextBtn').onclick=()=>{const i=idx;setPref('off');refresh();const el=$('part-'+i);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30)};
tgl.onclick=()=>{setPref('on');refresh();follow(true)};
q('.avPlay').onclick=()=>{if(sessionHere()&&state.playing){$('toggle')?.click();return}
 if(sessionHere()&&state.paused&&!moved){$('toggle')?.click();return}
 moved=false;startQueue([curId()],idx)};
q('.avNext').onclick=()=>go(idx+1);q('.avPrev').onclick=()=>go(idx-1);
q('.avMode').onclick=()=>{if(sessionHere()&&state.playing)$('toggle')?.click();mode=mode==='voice'?'manual':'voice';const c=cfg();c.mode=mode;save(c);paint(false)};
q('.c30Msg').onclick=()=>{const c=cfg();c.msg=!c.msg;save(c);if(sessionHere()&&state.playing)$('toggle')?.click();
 // conserva la frase en la que estabas (las frases de la parte principal son las mismas en las dos variantes)
 keepIdx=idx;openToday();refresh();paint()};
document.addEventListener('click',e=>{const t=e.target.closest?.('#toggle');if(!t||!moved||view.hidden||!isC()||(typeof state!=='undefined'&&state.playing))return;
 e.preventDefault();e.stopImmediatePropagation();moved=false;startQueue([curId()],idx)},true);
addEventListener('keydown',e=>{if(view.hidden)return;if(e.key==='ArrowRight')go(idx+1);if(e.key==='ArrowLeft')go(idx-1)});
document.addEventListener('mo-player',()=>{
 // al terminar la lectura con voz se marca el día como rezado (una vez al día)
 try{if(typeof state!=='undefined'&&C.ids.includes(state.id)&&state.completed&&!state.playing)markToday()}catch(e){}
 refresh();follow(false);if(!view.hidden){const playing=sessionHere()&&state.playing;q('.avPlay').innerHTML=playing?ICO.pause:ICO.play;q('.avPlay').setAttribute('aria-label',playing?L.pause:L.play)}});
if(reader){try{new MutationObserver(()=>{if(reader.hidden)loaded='';refresh();follow(true)}).observe(reader,{attributes:true,attributeFilter:['hidden']})}catch(e){}}
try{new MutationObserver(()=>refresh()).observe($('readerTitle'),{childList:true})}catch(e){}

/* ---------- Créditos (Ajustes › Créditos) ---------- */
const cr=document.querySelector('.v8credits');
if(cr&&!$('c30Credits')){const d=document.createElement('div');d.className='raCredits c30Credits';d.id='c30Credits';d.dataset.noi18n='1';
 const src='https://commons.wikimedia.org/wiki/File:Divina_Misericordia_(Eugeniusz_Kazimirowski,_1934).jpg',lk=AN?esc(src.replace(/^https?:\/\//,'')):'<a href="'+esc(src)+'" target="_blank" rel="noopener">Wikimedia Commons</a>';
 d.innerHTML=EN?'<h4>Conversation with Merciful Jesus for 30 days</h4><p>Popular devotion / oral tradition, with the optional “Message of Jesus”. Spanish text as on the prayer cards, with spelling corrections only; the ending “Divine Mercy, I trust in You.” has been added. The English is a faithful translation made for this app. It is not a text written by the app or its author.</p><p><b>Eugeniusz Kazimirowski</b>, <i>Divine Mercy (original image, Vilnius)</i>, 1934. Oil on canvas. Public domain (the painter died in 1939). Source: '+lk+'</p>'
 :'<h4>Conversación con Jesús de la Misericordia durante 30 días</h4><p>Devoción popular / tradición oral, con el «Mensaje de Jesús» opcional. Texto de las tarjetas tal cual, con solo correcciones de ortografía; se ha añadido al final «Divina Misericordia, en vos confío.». No es un texto de la app ni de su autor.</p><p><b>Eugeniusz Kazimirowski</b>, <i>Jesús Misericordioso (imagen original, Vilna)</i>, 1934. Óleo sobre lienzo. Dominio público (el pintor murió en 1939). Fuente: '+lk+'</p>';
 cr.append(d)}

window.MO=Object.assign(window.MO||{},{conv30Alarms,openConv30:openToday,conv30View:()=>({shown:!view.hidden,id:curId(),step:idx,mode,info:info()})});
if(window.MO.startId===AID)setTimeout(()=>{refresh();follow(true)},60);
refresh();
})();
