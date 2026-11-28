'use strict';
/* Prueba · Conversación con Jesús de la Misericordia durante 30 días.
   Página sin enlazar. No toca la app, ni el SW, ni localStorage (solo LEE theme/moLang).
   Avance manual paso a paso, sin temporizadores. El contador de días vive solo en esta página. */
(function(){
const $=id=>document.getElementById(id),Q=new URLSearchParams(location.search),D=window.M30;
let LS={};try{LS={theme:localStorage.getItem('theme'),lang:localStorage.getItem('moLang')}}catch(e){}
const st={lang:Q.get('lang')||(LS.lang==='en'?'en':'es'),theme:Q.get('theme')||LS.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),
 day:+(Q.get('day')||7),hour:Q.has('hour')?+Q.get('hour'):new Date().getHours(),doneToday:Q.get('done')==='1',fri:Q.get('fri')==='1',
 rem:false,msg:Q.get('msg')==='1',mode:Q.get('mode')||'voice',playing:false,idx:0,open:false};
const T={
es:{pvTitle:'Prueba · Conversación de 30 días',pvSub:'Página sin enlazar: no cambia la app ni tus datos.',
 draft:'Borrador: el texto principal y el «Mensaje de Jesús» están pendientes de cotejar con las fotos de las tarjetas.',
 dbgSum:'Opciones de prueba',dbgDay:'Día de la conversación',dbgClock:'Hora',dbgDone:'Hoy',dbgDoneOpt:['sin rezar','ya rezada'],dbgFri:'Viernes',dbgFriOpt:['no','sí'],
 ctx:'Así se vería el panel de inicio con la nueva tarjeta junto al Rosario, las coronillas y el Ángelus.',
 tGospel:'Evangelio del día',tGospelSub:'Lectura del día',tRosary:'Rosario del día',tRosarySub:'Misterios del día',tChaplet:'Coronilla',tChapletSub:'Divina Misericordia',
 tTimer:'Tiempo con el Altísimo',tTimerSub:'De 1 a 60 minutos',tFri:'Hoy es viernes',tFriSub:'Coronilla de la Divina Sangre de Cristo',tAng:'Ángelus',tAngSub:'Tres veces al día',
 name:'Conversación con Jesús de la Misericordia',sub:'30 días · a las 15:00, la hora de la Misericordia',
 day:(n)=>`Día ${n} de 30`,now:'Ahora: hora de la Misericordia (15:00)',later:'Hoy a las 15:00',past:'Hoy aún puedes rezarla',done:'Hoy ya rezada ✓',fin:'¡30 días completados! ✓',
 pray:'Rezar',rem:'Aviso 15:00',remOn:'Aviso 15:00 ✓',restart:'Empezar de nuevo',
 remH:'Aviso diario',remLead:'Un aviso cada día a las 15:00 mientras dure la conversación. Es opcional y está apagado.',remRowSub:'Hora de la Misericordia',
 remNote:'Solo es una maqueta: aquí no se programa nada. En la app Android usaría las alarmas nativas que ya tiene «Avisos»; en la web, un evento de calendario (.ics).',close:'Cerrar',
 title:'CONVERSACIÓN · 30 DÍAS',set:(n)=>`Día ${n} de 30`,mys:'Jesús, en ti confío',
 modeVoice:'Voz',modeManual:'Manual',playL:'Escuchar',pauseL:'Pausa',msgOff:'＋ Mensaje de Jesús (opcional)',msgOn:'✓ Mensaje de Jesús incluido',next:'Continuar',
 markDay:(n)=>`Marcar el día ${n} como rezado`,marked:(n)=>n>=30?'Has terminado los 30 días. Que el Señor te conceda la gracia que pides.':`Día ${n} rezado. Mañana, día ${n+1}.`,
 credit:'Jesús Misericordioso · E. Kazimirowski, 1934 · dominio público',trNote:'',
 credSum:'Créditos y notas de esta prueba',
 cred:`<h3>Texto</h3><ul><li>«Conversación con Jesús de la Misericordia durante 30 días» y «Mensaje de Jesús»: <b>devoción popular / tradición oral</b>. Texto de las tarjetas tal cual, con solo correcciones de ortografía.</li><li>Añadido al final de la oración principal: «Divina Misericordia, en vos confío».</li><li>Las líneas «(pedir la gracia)» son pausas en silencio: la oración no avanza sola, y la voz se detiene hasta que pulses continuar.</li><li>Voz: la del propio dispositivo; cada frase avanza al terminar de leerse, sin temporizadores. También hay modo manual.</li></ul>
<h3>Imagen</h3><ul><li><a href="https://commons.wikimedia.org/wiki/File:Divina_Misericordia_(Eugeniusz_Kazimirowski,_1934).jpg" target="_blank" rel="noopener">Jesús Misericordioso (imagen original, Vilna)</a> — Eugeniusz Kazimirowski, 1934, óleo sobre lienzo. Dominio público (el pintor murió en 1939; PD-Art). Es la misma imagen que ya usa la coronilla de la Divina Misericordia en la app. No existen frescos antiguos de esta advocación, que es de 1931.</li></ul>
<h3>Datos</h3><ul><li>El contador cuenta los días rezados: si un día no rezas, sigues donde lo dejaste, sin volver a empezar.</li><li>Esta prueba no guarda nada (el «Mensaje de Jesús» se recuerda solo mientras la página está abierta). En la app se propone una clave nueva y aparte, <code>conv30</code> ({inicio, días rezados, aviso}), sin tocar ninguna clave existente.</li></ul>`},
en:{pvTitle:'Preview · 30-day Conversation',pvSub:'Unlinked page: it does not change the app or your data.',
 draft:'Draft: the main text and the “Message of Jesus” still have to be checked against the photos of the cards.',
 dbgSum:'Test options',dbgDay:'Day of the conversation',dbgClock:'Time',dbgDone:'Today',dbgDoneOpt:['not prayed','already prayed'],dbgFri:'Friday',dbgFriOpt:['no','yes'],
 ctx:'This is how the home panel would look with the new card next to the Rosary, the chaplets and the Angelus.',
 tGospel:'Gospel of the day',tGospelSub:'Today’s reading',tRosary:'Rosary of the day',tRosarySub:'Today’s mysteries',tChaplet:'Chaplet',tChapletSub:'Divine Mercy',
 tTimer:'Time with the Most High',tTimerSub:'From 1 to 60 minutes',tFri:'Today is Friday',tFriSub:'Chaplet of the Most Precious Blood of Christ',tAng:'Angelus',tAngSub:'Three times a day',
 name:'Conversation with Merciful Jesus',sub:'30 days · at 3 pm, the Hour of Mercy',
 day:(n)=>`Day ${n} of 30`,now:'Now: the Hour of Mercy (3 pm)',later:'Today at 3 pm',past:'You can still pray it today',done:'Prayed today ✓',fin:'30 days completed! ✓',
 pray:'Pray',rem:'3 pm reminder',remOn:'3 pm reminder ✓',restart:'Start again',
 remH:'Daily reminder',remLead:'A reminder every day at 3 pm while the conversation lasts. Optional and off by default.',remRowSub:'Hour of Mercy',
 remNote:'This is only a mock-up: nothing is scheduled here. In the Android app it would use the native alarms that “Reminders” already has; on the web, a calendar event (.ics).',close:'Close',
 title:'CONVERSATION · 30 DAYS',set:(n)=>`Day ${n} of 30`,mys:'Jesus, I trust in You',
 modeVoice:'Voice',modeManual:'Manual',playL:'Listen',pauseL:'Pause',msgOff:'+ Message of Jesus (optional)',msgOn:'✓ Message of Jesus included',next:'Continue',
 markDay:(n)=>`Mark day ${n} as prayed`,marked:(n)=>n>=30?'You have completed the 30 days. May the Lord grant you the grace you ask for.':`Day ${n} prayed. Tomorrow, day ${n+1}.`,
 credit:'Merciful Jesus · E. Kazimirowski, 1934 · public domain',trNote:'English translation of a Spanish popular prayer.',
 credSum:'Credits and notes for this preview',
 cred:`<h3>Text</h3><ul><li>“Conversation with Merciful Jesus for 30 days” and “Message of Jesus”: <b>popular devotion / oral tradition</b>. The English is a faithful translation of the Spanish cards, which are kept as written apart from spelling fixes.</li><li>Added at the end of the main prayer: “Divine Mercy, I trust in You.”</li><li>The “(ask for the grace)” lines are silent pauses: the prayer does not move on by itself, and the voice stops until you press continue.</li><li>Voice: the device’s own; each sentence moves on when it finishes, with no timers. Manual mode is also available.</li></ul>
<h3>Image</h3><ul><li><a href="https://commons.wikimedia.org/wiki/File:Divina_Misericordia_(Eugeniusz_Kazimirowski,_1934).jpg" target="_blank" rel="noopener">Divine Mercy (original image, Vilnius)</a> — Eugeniusz Kazimirowski, 1934, oil on canvas. Public domain (painter died 1939; PD-Art). The same image the Divine Mercy chaplet already uses in the app. There are no old frescoes of this devotion, which dates from 1931.</li></ul>
<h3>Data</h3><ul><li>The counter counts days actually prayed: if you miss a day, you carry on where you left off, without starting over.</li><li>This preview saves nothing (the “Message of Jesus” choice is remembered only while the page is open). In the app a new, separate key is proposed, <code>conv30</code> ({start, days prayed, reminder}), without touching any existing key.</li></ul>`}};
const L=()=>T[st.lang];
function steps(){const t=D[st.lang],s=t.main.map(x=>({k:x[0],t:x[1]}));
 if(st.msg){s.push({k:'h',t:t.msgTitle});t.msg.forEach(x=>s.push({k:x[0],t:x[1]}))}return s}
function paintHome(){const l=L(),h=document.documentElement;h.lang=st.lang;h.dataset.theme=st.theme;
 document.querySelector('meta[name=theme-color]').content=st.theme==='dark'?'#16130f':'#f8f5ed';
 $('themeToggle').textContent=st.theme==='dark'?'☀':'☾';
 document.querySelectorAll('.langToggle button').forEach(b=>b.setAttribute('aria-pressed',b.lang===st.lang));
 document.querySelectorAll('[data-k]').forEach(e=>e.textContent=l[e.dataset.k]);
 ['pvTitle','pvSub','dbgSum','dbgDay','dbgClock','dbgDone','dbgFri','credSum'].forEach(i=>$(i).textContent=l[i]);
 $('draftNote').hidden=!D.draft;$('draftNote').textContent=l.draft;
 $('ctxNote').textContent=l.ctx;$('credBody').innerHTML=l.cred;
 const ds=$('dbgDaySel');if(!ds.options.length)for(let i=1;i<=30;i++)ds.add(new Option(i,i));ds.value=st.day;
 const cs=$('dbgClockSel');if(!cs.options.length)for(let i=0;i<24;i++)cs.add(new Option(String(i).padStart(2,'0')+':00',i));cs.value=st.hour;
 [...$('dbgDoneSel').options].forEach((o,i)=>o.textContent=l.dbgDoneOpt[i]);$('dbgDoneSel').value=st.doneToday?1:0;
 [...$('dbgFriSel').options].forEach((o,i)=>o.textContent=l.dbgFriOpt[i]);$('dbgFriSel').value=st.fri?1:0;
 $('tileSangre').hidden=!st.fri;
 $('m30Name').textContent=l.name;$('m30Sub').textContent=l.sub;
 const fin=st.day>=30&&st.doneToday;
 $('m30Day').textContent=l.day(st.day);
 $('m30Bar').innerHTML=Array.from({length:30},(_,i)=>`<i class="${i+1<st.day||(i+1===st.day&&st.doneToday)?'done':i+1===st.day?'cur':''}"></i>`).join('');
 const s=$('m30Status');s.className='angStatus';
 if(fin){s.textContent=l.fin}else if(st.doneToday){s.textContent=l.done}
 else if(st.hour===15){s.innerHTML='<span class="dot"></span>'+l.now;s.classList.add('nowS')}
 else s.textContent=st.hour<15?l.later:l.past;
 $('m30Pray').textContent=fin?l.restart:l.pray;$('m30Rem').textContent=st.rem?l.remOn:l.rem;
 $('remH').textContent=l.remH;$('remLead').textContent=l.remLead;$('remRowSub').textContent=l.remRowSub;$('remNote').textContent=l.remNote;$('remClose').textContent=l.close;$('remChk').checked=st.rem;
 if(st.open)paintView()}
function paintView(){const l=L(),S=steps();
 $('avTitle').textContent=l.title;$('avSet').textContent=l.set(st.day);$('avMys').textContent=l.mys;
 $('avCredit').textContent=l.credit;$('trNote').textContent=l.trNote;
 $('optMsg').textContent=st.msg?l.msgOn:l.msgOff;$('optMsg').setAttribute('aria-pressed',st.msg);
 if(st.idx>=S.length)st.idx=S.length-1;
 const box=$('avText');box.innerHTML='';
 S.forEach((x,i)=>{const p=document.createElement('p');p.className='ph '+({p:'pause',h:'msgH',f:'fin',t:'',c:'c'}[x.k])+(i<st.idx?' done':i===st.idx?' cur':'');p.textContent=x.t;
  if(x.k==='p'){const s=document.createElement('span');s.className='hint';s.textContent=D[st.lang].pauseHint;p.append(s)}
  if(x.k!=='h')p.onclick=()=>{st.idx=i;paintView();if(st.playing)speak()};box.append(p)});
 const last=st.idx===S.length-1;
 if(last){const e=document.createElement('div');e.className='endBox';
  e.innerHTML=st.doneToday?`<p>${l.marked(st.day)}</p>`:`<button type="button" id="markBtn">${l.markDay(st.day)}</button>`;box.append(e);
  const b=e.querySelector('#markBtn');if(b)b.onclick=()=>{st.doneToday=true;paintHome()}}
 const voice=st.mode==='voice';$('angView').classList.toggle('manual',!voice);$('avPlay').hidden=!voice;
 $('avMode').textContent=voice?l.modeVoice:l.modeManual;$('avMode').setAttribute('aria-pressed',voice);
 $('avPlay').innerHTML=st.playing?ICO.pause:ICO.play;$('avPlay').setAttribute('aria-label',st.playing?l.pauseL:l.playL);
 $('avNext').innerHTML=voice?ICO.next:(last?'✓':l.next);$('avNext').disabled=last;$('avPrev').innerHTML=ICO.prev;$('avPrev').disabled=st.idx===0;
 const cur=box.querySelector('.cur');if(cur)box.scrollTop=cur.offsetTop-box.clientHeight/2+cur.offsetHeight/2}
const ICO={prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'};
/* Voz: cada frase avanza en su onend (sin temporizadores). En las pausas de petición la voz se detiene
   y espera a que pulses ▶ o continuar. */
const synth=window.speechSynthesis||null;let gen=0;
function pickVoice(){const v=synth?synth.getVoices():[];if(st.lang==='en')return v.find(x=>/^en[-_](US|GB)/i.test(x.lang)&&/samantha|daniel|google|karen|serena|aria|jenny|libby|sonia/i.test(x.name))||v.find(x=>/^en[-_](US|GB)/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang));
 return v.find(x=>/^es[-_]ES/i.test(x.lang)&&/m[oó]nica|paulina|google|helena|laura/i.test(x.name))||v.find(x=>/^es[-_]ES/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))}
function speak(){const S=steps(),s=S[st.idx];
 if(!synth||!window.SpeechSynthesisUtterance){stopVoice();return}
 const my=++gen;synth.cancel();
 if(s.k==='p'){st.playing=false;paintView();return}
 const u=new SpeechSynthesisUtterance(s.t);const v=pickVoice();if(v)u.voice=v;u.lang=st.lang==='en'?'en-GB':'es-ES';u.rate=.92;
 u.onend=()=>{if(my!==gen||!st.playing)return;if(st.idx>=steps().length-1){stopVoice();return}st.idx++;paintView();speak()};
 u.onerror=e=>{if(my!==gen)return;if(e&&(e.error==='interrupted'||e.error==='canceled'))return;stopVoice()};
 synth.speak(u)}
function stopVoice(){gen++;st.playing=false;try{synth&&synth.cancel()}catch(e){}if(st.open)paintView()}
function step(n){const S=steps();let i=st.idx+n;if(S[i]&&S[i].k==='h'&&st.mode!=='voice')i+=n;st.idx=Math.max(0,Math.min(S.length-1,i));paintView();if(st.playing)speak()}
document.querySelectorAll('.langToggle button').forEach(b=>b.onclick=()=>{if(st.playing)stopVoice();st.lang=b.lang;paintHome()});
$('themeToggle').onclick=()=>{st.theme=st.theme==='dark'?'light':'dark';paintHome()};
$('dbgDaySel').onchange=e=>{st.day=+e.target.value;paintHome()};$('dbgClockSel').onchange=e=>{st.hour=+e.target.value;paintHome()};
$('dbgDoneSel').onchange=e=>{st.doneToday=e.target.value==='1';paintHome()};$('dbgFriSel').onchange=e=>{st.fri=e.target.value==='1';paintHome()};
$('m30Pray').onclick=()=>{if(st.day>=30&&st.doneToday){st.day=1;st.doneToday=false;paintHome();return}st.open=true;st.idx=0;$('angView').hidden=false;document.body.classList.add('avOn');paintView()};
$('avBack').onclick=()=>{stopVoice();st.open=false;$('angView').hidden=true;document.body.classList.remove('avOn');paintHome()};
$('avNext').onclick=()=>step(1);
$('avPlay').onclick=()=>{if(st.playing){stopVoice();return}const S=steps();if(S[st.idx].k==='p'&&st.idx<S.length-1)st.idx++;st.playing=true;paintView();speak()};
$('avMode').onclick=()=>{if(st.playing)stopVoice();st.mode=st.mode==='voice'?'manual':'voice';paintView()};
addEventListener('keydown',e=>{if(!st.open)return;if(e.key==='Escape')$('avBack').click();if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});$('avPrev').onclick=()=>step(-1);
$('optMsg').onclick=()=>{if(st.playing)stopVoice();st.msg=!st.msg;paintView()};
$('m30Rem').onclick=()=>$('remDlg').showModal();$('remClose').onclick=()=>$('remDlg').close();
$('remChk').onchange=e=>{st.rem=e.target.checked;paintHome()};
paintHome();
if(Q.get('view')==='1'){$('m30Pray').click();if(Q.has('step')){st.idx=+Q.get('step');paintView()}}
})();
