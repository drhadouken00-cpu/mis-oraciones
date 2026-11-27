'use strict';
// Mis oraciones v3.1 (23): Ángelus / Regina Caeli.
// · Tarjeta en el inicio (debajo de Evangelio, Rosario, Coronilla y Tiempo) con las horas 6:00, 12:00 y 18:00 (ahora / próximo).
// · Cambio automático al Regina Caeli del Domingo de Pascua a Pentecostés.
// · Pantalla de oración con frescos. SINCRONÍA: la frase solo cambia con (1) el paso real de la lectura (evento mo-player →
//   state.index; también el progreso de la voz nativa del APK), (2) ‹ › o tocar una frase. Sin temporizadores. Modo manual sin voz.
// · Avisos opcionales (desactivados por defecto) con las alarmas de la app (nativas en Android; en la web, aviso con la app abierta
//   y evento de calendario .ics). Claves nuevas opcionales: angelusReminder, angelusView, angelusMode. No renombra ni borra ninguna clave.
(()=>{
if(!window.ANGELUS)return;
const A=window.ANGELUS,EN=window.MO_LANG==='en',T=(es,en)=>EN?en:es,$=id=>document.getElementById(id),AN=!!window.Android,ANAL=!!window.AndroidAlarms;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ls={get(k,f){try{const v=localStorage.getItem(k);return v==null?f:v}catch(e){return f}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const byIdP=id=>(typeof prayers!=='undefined'&&prayers.find(p=>p.id===id))||(window.PRAYERS||[]).find(p=>p.id===id);
const todayPrayer=()=>byIdP(A.todayId());
const SLOTS=[6,12,18],WINDOW=45;

/* ---------- Frescos (dominio público, Wikimedia Commons) ---------- */
const IMG={
 gab:{f:'frescos/angelus-gabriel.webp',artist:'Giotto',es:'Anunciación: el ángel Gabriel (Capilla Scrovegni, Padua)',en:'Annunciation: the Angel Gabriel (Scrovegni Chapel, Padua)',yr:'1306',src:'https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._14_Annunciation_-_The_Angel_Gabriel_Sent_by_God_-_WGA09190.jpg',note:{es:'detalle recortado',en:'cropped detail'}},
 vir:{f:'frescos/angelus-virgen.webp',artist:'Giotto',es:'Anunciación: la Virgen recibe el mensaje (Capilla Scrovegni, Padua)',en:'Annunciation: the Virgin receives the message (Scrovegni Chapel, Padua)',yr:'1306',src:'https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._15_Annunciation_-_The_Virgin_Receiving_the_Message_-_WGA09191.jpg',note:{es:'detalle recortado',en:'cropped detail'}},
 c3:{f:'frescos/angelus-cell3.webp',artist:'Fra Angelico',es:'La Anunciación (celda 3, San Marcos, Florencia)',en:'The Annunciation (cell 3, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Annunciation_(Cell_3)_-_WGA00538.jpg'},
 c8:{f:'frescos/regina-cell8.webp',artist:'Fra Angelico',es:'La Resurrección y las santas mujeres en el sepulcro (celda 8, San Marcos, Florencia)',en:'The Resurrection and the Women at the Tomb (cell 8, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Resurrection_of_Christ_and_Women_at_the_Tomb_(Cell_8)_-_WGA00542.jpg'},
 noli:{f:'frescos/regina-noli.webp',artist:'Fra Angelico',es:'Noli me tangere (celda 1, San Marcos, Florencia)',en:'Noli me tangere (cell 1, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Noli_Me_Tangere_(Cell_1)_-_WGA00535.jpg'}};
const L=EN?{
 angName:'Angelus',angSub:'The Annunciation · three times a day',regName:'Regina Caeli',regSub:'Queen of Heaven · Eastertide',
 now:'It is time for the Angelus',nowReg:'It is time for the Regina Caeli',next:(h,d)=>`Next: ${h} · ${d}`,inH:(h,m)=>h?`in ${h} h ${m} min`:`in ${m} min`,tomorrow:'tomorrow',
 pray:'Pray',remOn:n=>n?`Reminders · ${n}`:'Reminders',remH:'reminders',
 remLead:'A reminder at each Angelus hour, if you like. It is optional and off unless you turn it on.',
 remNoteA:'The app’s own alarms are used (the same as in “Prayer alarms”). Tapping the reminder opens the Angelus, or the Regina Caeli in Eastertide.',
 remNoteW:'On the web the reminder only appears while the app is open. For a reliable reminder, add it to your calendar.',
 remRowSub:{6:'Dawn',12:'Noon',18:'Evening'},save:'Save',close:'Back',ics:'📅 Add to calendar',saved:n=>n?'Angelus reminders saved ✓':'Angelus reminders turned off',icsNone:'Turn on at least one hour first.',
 title:'THE ANGELUS',titleR:'REGINA CAELI',set:'The Annunciation of the Lord',setR:'Eastertide',
 mysA:['The angel’s message','“Be it done unto me”','The Word made flesh','Let us pray','Glory Be 1','Glory Be 2','Glory Be 3','For the faithful departed'],mysR:['Queen of heaven, rejoice','Rejoice, O Virgin Mary','The Lord is risen','Let us pray','Glory Be 1','Glory Be 2','Glory Be 3','For the faithful departed'],
 modeVoice:'🔊 Voice',modeManual:'👆 Manual',play:'Listen',pause:'Pause',prev:'Previous',nextB:'Next',back:'Back to library',text:'Text',textL:'Show the full text',viewBtn:'🔔 Angelus view',
 vatican:'Listen to the Pope’s Angelus on Vatican News ↗',vaticanR:'Listen to the Pope’s Regina Caeli on Vatican News ↗',vaticanA:'The Pope’s Angelus: Vatican News (vaticannews.va)',vaturl:'https://www.vaticannews.va/en/pope.pagelist.angelus.html',V:'V.',R:'R.'
}:{
 angName:'Ángelus',angSub:'La Anunciación · tres veces al día',regName:'Regina Caeli',regSub:'Reina del cielo · tiempo de Pascua',
 now:'Ahora toca el Ángelus',nowReg:'Ahora toca el Regina Caeli',next:(h,d)=>`Próximo: ${h} · ${d}`,inH:(h,m)=>h?`dentro de ${h} h ${m} min`:`dentro de ${m} min`,tomorrow:'mañana',
 pray:'Rezar',remOn:n=>n?`Avisos · ${n}`:'Avisos',remH:'avisos',
 remLead:'Un aviso a cada hora del Ángelus, si quieres. Es opcional y está desactivado mientras no lo actives.',
 remNoteA:'Se usan las alarmas de la propia app (las mismas de «Alarmas de oración»). Al tocar el aviso se abre el Ángelus, o el Regina Caeli en Pascua.',
 remNoteW:'En la web el aviso solo aparece con la app abierta. Para un aviso fiable, añádelo a tu calendario.',
 remRowSub:{6:'Al amanecer',12:'Mediodía',18:'Atardecer'},save:'Guardar',close:'Volver',ics:'📅 Añadir al calendario',saved:n=>n?'Avisos del Ángelus guardados ✓':'Avisos del Ángelus desactivados',icsNone:'Activa primero al menos una hora.',
 title:'ÁNGELUS',titleR:'REGINA CAELI',set:'La Anunciación del Señor',setR:'Tiempo de Pascua',
 mysA:['El anuncio del ángel','«Hágase en mí»','El Verbo se hizo carne','Oremos','Gloria 1.ª','Gloria 2.ª','Gloria 3.ª','Por los fieles difuntos'],mysR:['Reina del cielo, alégrate','Alégrate, Virgen María','Ha resucitado el Señor','Oremos','Gloria 1.ª','Gloria 2.ª','Gloria 3.ª','Por los fieles difuntos'],
 modeVoice:'🔊 Con voz',modeManual:'👆 Manual',play:'Escuchar',pause:'Pausa',prev:'Anterior',nextB:'Siguiente',back:'Volver a la biblioteca',text:'Texto',textL:'Ver el texto completo',viewBtn:'🔔 Vista Ángelus',
 vatican:'Escuchar el Ángelus del Papa en Vatican News ↗',vaticanR:'Escuchar el Regina Caeli del Papa en Vatican News ↗',vaticanA:'El Ángelus del Papa: Vatican News (vaticannews.va)',vaturl:'https://www.vaticannews.va/es/papa.pagelist.angelus.html',V:'V.',R:'R.'};
const ICO={back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
 play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
 more:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 bell:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h12l-1.5-2.2V10a4.5 4.5 0 0 0-9 0v4.8z"/><path d="M10 20a2 2 0 0 0 4 0"/><path d="M12 3.5V5"/></svg>'};

/* ---------- Avisos (alarmas de la app) ---------- */
function rem(){let r={};try{r=JSON.parse(ls.get('angelusReminder','{}'))||{}}catch(e){}return {6:!!r[6],12:!!r[12],18:!!r[18]}}
const remTitle=()=>A.isEaster()?'Regina Caeli':T('Ángelus','Angelus');
function angelusAlarms(){const r=rem(),t=remTitle();return SLOTS.filter(h=>r[h]).map(h=>({time:pad(h)+':00',id:'__angelus',title:t,on:true}))}
function currentAlarms(){try{if(ANAL){const a=JSON.parse(AndroidAlarms.get());if(Array.isArray(a))return a}}catch(e){}try{const a=JSON.parse(localStorage.getItem('alarms'));return Array.isArray(a)?a:[]}catch(e){return []}}
function syncAlarms(){const list=currentAlarms().filter(a=>a.id!=='__angelus').concat(angelusAlarms()).slice(0,20);
 try{localStorage.setItem('alarms',JSON.stringify(list))}catch(e){}if(ANAL){try{return AndroidAlarms.set(JSON.stringify(list))!==false}catch(e){return false}}return true}
// al abrir la app: si hay avisos y ha cambiado el tiempo (Ángelus ↔ Regina Caeli), actualiza el título del aviso
try{const want=angelusAlarms();if(want.length){const have=currentAlarms().filter(a=>a.id==='__angelus');if(have.length!==want.length||have.some(a=>a.title!==want[0].title))syncAlarms()}}catch(e){}

/* ---------- Tarjeta del inicio ---------- */
function slotInfo(){const d=new Date(),n=d.getHours()*60+d.getMinutes();let cur=null;for(const h of SLOTS){if(n>=h*60&&n<h*60+WINDOW)cur=h}
 let nx=SLOTS.find(h=>h*60>n),tom=false;if(nx==null){nx=SLOTS[0];tom=true}const diff=(tom?1440:0)+nx*60-n;return {cur,nx,tom,h:Math.floor(diff/60),m:diff%60}}
const tiles=document.querySelector('#todayCards .tiles');
let tile=null;
if(tiles){
 tile=document.createElement('article');tile.className='tile angTile';tile.id='tileAngelus';tile.dataset.noi18n='1';tile.setAttribute('aria-labelledby','angName');
 tile.innerHTML=`<span class="tileIcon" aria-hidden="true">${ICO.bell}</span><strong id="angName"></strong><small id="angSub"></small><span class="angChips" id="angChips" role="list"></span><span class="angStatus" id="angStatus" role="status"></span><span class="angActions"><button type="button" class="angPray" id="angPray"></button><button type="button" class="secondary angRem" id="angRem"></button></span>`;
 const after=$('tileTimer');if(after&&after.parentNode===tiles)after.after(tile);else tiles.append(tile);
}
function paintCard(){if(!tile)return;const R=A.isEaster(),si=slotInfo();tile.classList.toggle('regina',R);
 $('angName').textContent=R?L.regName:L.angName;$('angSub').textContent=R?L.regSub:L.angSub;
 $('angChips').innerHTML=SLOTS.map(h=>`<span class="angChip${h===si.cur?' cur':h===si.nx&&si.cur==null?' nx':''}" role="listitem"><b>${h}:00</b></span>`).join('');
 $('angStatus').innerHTML=si.cur!=null?`<span class="dot"></span>${esc(R?L.nowReg:L.now)}`:esc(L.next(si.nx+':00',(si.tom?L.tomorrow+' · ':'')+L.inH(si.h,si.m)));
 $('angStatus').classList.toggle('nowS',si.cur!=null);$('angPray').textContent=L.pray;
 const n=SLOTS.filter(h=>rem()[h]).length;$('angRem').textContent=L.remOn(n||'');$('angRem').setAttribute('aria-pressed',String(!!n))}
function openToday(){const p=todayPrayer();if(p&&typeof openPrayer==='function')openPrayer(p)}
if(tile){$('angPray').onclick=openToday;$('angRem').onclick=openRem;tile.addEventListener('click',e=>{if(e.target.closest('button'))return;openToday()});
 paintCard();setInterval(()=>{if(!document.hidden)paintCard()},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintCard()})}

/* ---------- Diálogo de avisos ---------- */
const dlg=document.createElement('dialog');dlg.id='angRemDlg';dlg.dataset.noi18n='1';
dlg.innerHTML=`<h2 id="angRemH"></h2><p class="remLead"></p><div class="remRows"></div><p class="remNote"></p><p class="remMsg" role="status"></p><div class="remBtns"><button type="button" class="secondary remIcs"></button><button type="button" class="secondary remClose"></button><button type="button" class="remSave"></button></div>`;
document.body.append(dlg);
let draft={};
function paintRem(){const R=A.isEaster();dlg.querySelector('h2').textContent=(R?L.regName:L.angName)+' · '+L.remH;dlg.querySelector('.remLead').textContent=L.remLead;
 dlg.querySelector('.remNote').textContent=ANAL?L.remNoteA:L.remNoteW;dlg.querySelector('.remMsg').textContent='';
 dlg.querySelector('.remRows').innerHTML=SLOTS.map(h=>`<label class="remRow"><span><b>${h}:00</b><small>${esc(L.remRowSub[h])}</small></span><input type="checkbox" data-h="${h}" ${draft[h]?'checked':''} aria-label="${h}:00"></label>`).join('');
 dlg.querySelectorAll('.remRows input').forEach(i=>i.onchange=()=>{draft[i.dataset.h]=i.checked});
 const ics=dlg.querySelector('.remIcs');ics.hidden=ANAL;ics.textContent=L.ics;dlg.querySelector('.remClose').textContent=L.close;dlg.querySelector('.remSave').textContent=L.save}
function openRem(){draft=rem();paintRem();dlg.showModal()}
dlg.querySelector('.remClose').onclick=()=>dlg.close();
dlg.querySelector('.remSave').onclick=()=>{ls.set('angelusReminder',JSON.stringify(draft));const n=SLOTS.filter(h=>draft[h]).length,ok=syncAlarms();
 if(!ok){dlg.querySelector('.remMsg').textContent=T('No se han podido guardar los avisos.','The reminders could not be saved.');return}
 if(!ANAL&&n&&window.Notification&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}
 dlg.close();paintCard();try{window.MO&&MO.toast&&MO.toast(L.saved(n))}catch(e){}};
dlg.querySelector('.remIcs').onclick=()=>{const hs=SLOTS.filter(h=>draft[h]);if(!hs.length){dlg.querySelector('.remMsg').textContent=L.icsNone;return}
 const url=location.origin+location.pathname+'#open=__angelus',d=new Date(),day=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate()),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
 const sum=T('🔔 Ángelus (Regina Caeli en Pascua)','🔔 Angelus (Regina Caeli in Eastertide)'),e=x=>x.replace(/[\\;,]/g,c=>'\\'+c);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis oraciones//ES','CALSCALE:GREGORIAN'];
 hs.forEach(h=>lines.push('BEGIN:VEVENT','UID:misoraciones-angelus-'+pad(h)+'00@misoraciones','DTSTAMP:'+stamp,'DTSTART:'+day+'T'+pad(h)+'0000','DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:'+e(sum),'DESCRIPTION:'+e(T('Es la hora del Ángelus. Abre Mis oraciones: ','It is time for the Angelus. Open Mis oraciones: ')+url),'URL:'+url,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+e(sum),'TRIGGER:PT0M','END:VALARM','END:VEVENT'));
 lines.push('END:VCALENDAR');const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mis-oraciones-angelus.ics';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 dlg.querySelector('.remMsg').textContent=T('Abre el archivo descargado y pulsa «Añadir» para guardar los eventos diarios en tu calendario.','Open the downloaded file and tap “Add” to save the daily events to your calendar.')};

/* ---------- Pantalla de oración ---------- */
const reader=$('reader');
let pref=ls.get('angelusView','on')==='off'?'off':'on',mode=ls.get('angelusMode','voice')==='manual'?'manual':'voice';
const view=document.createElement('section');view.id='angView';view.hidden=true;view.dataset.noi18n='1';
view.innerHTML=`<div class="av-bg"></div><div class="av-shade"></div>
<div class="avTop"><button type="button" class="avBack" aria-label="${esc(L.back)}">${ICO.back}</button><span class="avTitle"></span><button type="button" class="avTextBtn" aria-label="${esc(L.textL)}">📖 ${esc(L.text)}</button><button type="button" class="avMode"></button></div>
<div class="avCap"><div class="avSet"></div><div class="avMys"></div></div>
<div class="avArt"><div class="avStage"></div><span class="avCredit"></span></div>
<div class="avBeads" aria-hidden="true"><i></i><i></i><i></i><i class="cross"></i><span class="beadGap"></span><i class="gl"></i><i class="gl"></i><i class="gl"></i><i class="rest"></i></div>
<div class="avText"></div>
<div class="avNav"><button type="button" class="avPrev" aria-label="${esc(L.prev)}">${ICO.prev}</button><button type="button" class="avPlay main"></button><button type="button" class="avNext" aria-label="${esc(L.nextB)}"></button></div>
<div class="avFoot"></div>`;
if(reader)document.body.insertBefore(view,$('player')||null);
const q=s=>view.querySelector(s);
const tgl=document.createElement('button');tgl.type='button';tgl.id='angToggle';tgl.className='secondary';tgl.hidden=true;tgl.textContent=L.viewBtn;
if(reader)(($('readerMeta')||$('readerTitle'))||reader).after(tgl);
let idx=0,loaded='',moved=false,lastKey='';
const curId=()=>(typeof current!=='undefined'&&current)?current.id:null;
const isA=()=>A.ids.includes(curId())||curId()==='angelus';
const meta=()=>A.meta[curId()==='angelus'?'angelus-diario':curId()]||[];
const sessionHere=()=>typeof state!=='undefined'&&state.id===curId()&&(state.playing||state.paused)&&Number.isInteger(state.index);
const KB=[[1.04,-1.2,.6],[1.07,1,-.8],[1.05,-.6,1],[1.08,.8,.4],[1.045,-1,-.5],[1.075,.5,-1]];
function build(){const id=curId(),R=id==='regina-caeli',M=meta();view.classList.toggle('regina',R);
 q('.avTitle').textContent=R?L.titleR:L.title;q('.avSet').textContent=R?L.setR:L.set;
 const keys=R?['c8','noli']:['gab','vir','c3'],bg=q('.av-bg'),stg=q('.avStage');bg.innerHTML='';stg.innerHTML='';
 keys.forEach(k=>{const m=IMG[k],b=document.createElement('div');b.className='bgi';b.dataset.k=k;b.style.backgroundImage=`url(${m.f})`;bg.append(b);
  const im=document.createElement('img');im.src=m.f;im.alt=EN?m.en:m.es;im.dataset.k=k;im.decoding='async';stg.append(im)});
 const box=q('.avText');box.innerHTML='';
 current.parts.forEach((p,i)=>{const k=(M[i]||[])[0]||'',el=document.createElement('p');el.className='ph '+k;const lab=k==='V'?L.V:k==='R'?L.R:'';
  el.innerHTML=(lab?`<b class="lab">${lab}</b>`:'')+`<span>${esc(p.text)}</span>`;el.onclick=()=>go(i);box.append(el)});
 q('.avFoot').innerHTML=AN?`<span class="avVat">${esc(L.vaticanA)}</span>`:`<a class="avVat" href="${L.vaturl}" target="_blank" rel="noopener">${esc(R?L.vaticanR:L.vatican)}</a>`}
function paint(scroll=true){const M=meta(),m=M[idx]||M[M.length-1]||['', 'c3',0],R=curId()==='regina-caeli';
 view.querySelectorAll('.avText .ph').forEach((p,i)=>{p.classList.toggle('cur',i===idx);p.classList.toggle('done',i<idx)});
 const cur=q('.avText .ph.cur'),bx=q('.avText');if(cur&&scroll)bx.scrollTo({top:cur.offsetTop-bx.clientHeight/2+cur.offsetHeight/2,behavior:'smooth'});
 view.querySelectorAll('.av-bg .bgi').forEach(b=>b.classList.toggle('on',b.dataset.k===m[1]));
 const kb=KB[idx%KB.length];view.querySelectorAll('.avStage img').forEach(im=>{const on=im.dataset.k===m[1];im.classList.toggle('on',on);if(on){im.style.setProperty('--s',kb[0]);im.style.setProperty('--x',kb[1]+'%');im.style.setProperty('--y',kb[2]+'%')}});
 const im=IMG[m[1]];if(im)q('.avCredit').textContent=im.artist+' · '+(EN?im.en:im.es).split(' (')[0];
 q('.avMys').textContent=(R?L.mysR:L.mysA)[m[2]]||'';
 view.querySelectorAll('.avBeads i').forEach((b,i)=>{b.classList.toggle('done',i<m[2]);b.classList.toggle('cur',i===m[2])});
 const playing=sessionHere()&&state.playing;
 q('.avPlay').innerHTML=playing?ICO.pause:ICO.play;q('.avPlay').setAttribute('aria-label',playing?L.pause:L.play);q('.avPlay').hidden=mode!=='voice';
 q('.avNext').innerHTML=mode==='voice'?ICO.next:ICO.more;view.classList.toggle('manual',mode!=='voice');
 q('.avMode').textContent=mode==='voice'?L.modeVoice:L.modeManual;q('.avMode').setAttribute('aria-pressed',String(mode==='voice'))}
function go(i){const n=current.parts.length;i=Math.max(0,Math.min(n-1,i));
 if(sessionHere()&&state.playing){idx=i;moved=false;paint();startQueue([curId()],i);return}   // con voz: la voz salta ahí
 if(i===idx)return;idx=i;moved=true;paint();const el=$('part-'+i);if(el)el.scrollIntoView({block:'center'})}
let following=false;
function follow(force){if(view.hidden)return;
 if(!sessionHere()){ // fin de la lectura: muestra la última frase leída (la voz nativa deja state.index en la última)
  if(following&&typeof state!=='undefined'&&state.id===curId()&&state.completed&&!moved&&Number.isInteger(state.index)&&state.index>idx){idx=Math.min(state.index,current.parts.length-1);paint()}
  following=false;return}
 following=true;const key=state.index+':'+(state.playing?1:0);
 if(force||key!==lastKey){lastKey=key;if(state.playing||!moved){moved=false;if(idx!==state.index||force){idx=Math.min(state.index,current.parts.length-1);paint()}else paint(false)}}}
function refresh(){const a=isA(),want=a&&pref==='on'&&reader&&!reader.hidden;tgl.hidden=!(a&&!want);
 if(want){const key=curId()+':'+current.parts.length;if(key!==loaded){loaded=key;idx=0;moved=false;lastKey='';build();if(!view.hidden){if(sessionHere())idx=Math.min(state.index,current.parts.length-1);paint(false)}}
  if(view.hidden){view.hidden=false;document.body.classList.add('avOn');if(sessionHere())idx=Math.min(state.index,current.parts.length-1);paint();
   q('.avBack').focus({preventScroll:true})}}
 else if(!view.hidden){view.hidden=true;document.body.classList.remove('avOn')}}
q('.avBack').onclick=()=>$('back')?.click();
q('.avTextBtn').onclick=()=>{const i=idx;pref='off';ls.set('angelusView','off');refresh();const el=$('part-'+i);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30)};
tgl.onclick=()=>{pref='on';ls.set('angelusView','on');refresh();follow(true)};
q('.avPlay').onclick=()=>{if(sessionHere()&&state.playing){$('toggle')?.click();return}
 if(sessionHere()&&state.paused&&!moved){$('toggle')?.click();return}
 moved=false;startQueue([curId()],idx)};
q('.avNext').onclick=()=>go(idx+1);q('.avPrev').onclick=()=>go(idx-1);
q('.avMode').onclick=()=>{if(sessionHere()&&state.playing)$('toggle')?.click();mode=mode==='voice'?'manual':'voice';ls.set('angelusMode',mode);paint(false)};
// ▶ del reproductor inferior tras moverse a mano: empieza en la frase elegida
document.addEventListener('click',e=>{const t=e.target.closest?.('#toggle');if(!t||!moved||view.hidden||!isA()||(typeof state!=='undefined'&&state.playing))return;
 e.preventDefault();e.stopImmediatePropagation();moved=false;startQueue([curId()],idx)},true);
addEventListener('keydown',e=>{if(view.hidden)return;if(e.key==='ArrowRight')go(idx+1);if(e.key==='ArrowLeft')go(idx-1)});
function playIcon(){if(view.hidden)return;const playing=sessionHere()&&state.playing;q('.avPlay').innerHTML=playing?ICO.pause:ICO.play;q('.avPlay').setAttribute('aria-label',playing?L.pause:L.play)}
document.addEventListener('mo-player',()=>{refresh();follow(false);playIcon()});
{const o=window.openPrayer;if(typeof o==='function')window.openPrayer=openPrayer=function(p){if(p&&p.id==='angelus'&&A.isEaster()){const r=byIdP('regina-caeli');if(r)p=r}return o.call(this,p)}}
if(reader){try{new MutationObserver(()=>{refresh();follow(true)}).observe(reader,{attributes:true,attributeFilter:['hidden']})}catch(e){}}
try{new MutationObserver(()=>{if(!view.hidden){loaded='';refresh()}}).observe($('readerTitle'),{childList:true})}catch(e){}

/* ---------- Créditos (Ajustes › Créditos) ---------- */
const cr=document.querySelector('.v8credits');
if(cr&&!$('angCredits')){const d=document.createElement('div');d.className='raCredits angCredits';d.id='angCredits';d.dataset.noi18n='1';
 const link=(u,t)=>AN?esc(t)+' ('+esc(u.replace(/^https?:\/\//,''))+')':'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t)+'</a>';
 const img=k=>{const m=IMG[k];return '<p><b>'+esc(m.artist)+'</b>, <i>'+esc(EN?m.en:m.es)+'</i>, '+esc(m.yr)+(m.note?' ('+esc(EN?m.note.en:m.note.es)+')':'')+'. '+T('Fresco. Dominio público','Fresco. Public domain')+'. '+T('Fuente','Source')+': '+(AN?esc(m.src.replace(/^https?:\/\//,'')):'<a href="'+esc(m.src)+'" target="_blank" rel="noopener">Wikimedia Commons</a>')+'</p>'};
 d.innerHTML=EN?
  '<h4>Angelus and Regina Caeli</h4>'+
  '<p>Traditional devotions of the Church (the Angelus developed between the 11th and 16th centuries; the Regina Caeli is a Marian antiphon, probably of the 10th–11th century, said in Eastertide in place of the Angelus by decree of Benedict XIV, 1742). They are not texts written by the app or its author.</p>'+
  '<p><b>Structure and versicles:</b> '+link('https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html','Compendium of the Catechism of the Catholic Church, Appendix “Common Prayers” (vatican.va)')+', and the <i>Enchiridion of Indulgences</i>.</p>'+
  '<p><b>English wording of the Angelus:</b> the traditional text, as in the '+link('https://usccb.org/sites/default/files/flipbooks/uscca/files/assets/basic-html/page-563.html','United States Catholic Catechism for Adults, Appendix B (USCCB)')+'.</p>'+
  '<p><b>Hail Mary and Glory Be:</b> the same texts the app already has. After the closing prayer come three Glory Bes and then the responsory for the faithful departed (“Eternal rest grant unto them, O Lord…”), following the custom of the Pope’s Angelus (also with the Regina Caeli in Eastertide). The responsory is a traditional devotion.</p>'+
  '<p><b>Hours (6:00, 12:00 and 18:00) and the Easter change:</b> '+link('https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html','Directory on Popular Piety and the Liturgy, nn. 195–196 (vatican.va)')+'.</p>'+
  '<p><b>Audio:</b> the voice is the device’s own. No audio of the Pope is used: those recordings belong to Vatican Media. There is only an optional link to Vatican News.</p>'+
  '<h4>Frescoes · Angelus and Regina Caeli</h4>'+['gab','vir','c3','c8','noli'].map(img).join('')
 :
  '<h4>Ángelus y Regina Caeli</h4>'+
  '<p>Devoción tradicional de la Iglesia (el Ángelus es una devoción de los siglos XI–XVI; el Regina Caeli es una antífona mariana, probablemente de los siglos X–XI, que se reza en Pascua en lugar del Ángelus por disposición de Benedicto XIV, 1742). No son textos de la app ni de su autor.</p>'+
  '<p><b>Estructura y versículos:</b> '+link('https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_sp.html','Compendio del Catecismo de la Iglesia Católica, Apéndice «Oraciones comunes» (vatican.va)')+' y <i>Enchiridion Indulgentiarum</i>.</p>'+
  '<p><b>Texto español de la oración final y del Regina Caeli:</b> versión litúrgica en uso en las diócesis de España (p. ej. Diócesis de Asidonia-Jerez, '+link('https://familiayvidajerez.org/rezo-del-angelus/','«Rezo del Ángelus»')+').</p>'+
  '<p><b>Ave María y Gloria:</b> los mismos textos que ya tiene la app. Tras la oración final se recitan tres Glorias y, a continuación, el responso por los fieles difuntos («Dale, Señor, el descanso eterno…»), según la costumbre del Ángelus del Papa (también en el Regina Caeli de Pascua). El responso es devoción tradicional.</p>'+
  '<p><b>Horas (6:00, 12:00 y 18:00) y cambio de Pascua:</b> '+link('https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_sp.html','Directorio sobre la piedad popular y la liturgia, nn. 195–196 (vatican.va)')+'.</p>'+
  '<p><b>Audio:</b> la voz es la del propio dispositivo. No se usa ningún audio del Papa: las grabaciones son de Vatican Media. Solo hay un enlace opcional a Vatican News.</p>'+
  '<h4>Frescos · Ángelus y Regina Caeli</h4>'+['gab','vir','c3','c8','noli'].map(img).join('');
 cr.append(d)}

window.MO=Object.assign(window.MO||{},{angelusAlarms,angelusPrayer:todayPrayer,openAngelus:openToday,
 angelusView:()=>({shown:!view.hidden,id:curId(),step:idx,bead:(meta()[idx]||[])[2],mode,moved,pref})});
if(window.MO.startId==='__angelus')setTimeout(()=>{refresh();follow(true)},60);
refresh();
})();
