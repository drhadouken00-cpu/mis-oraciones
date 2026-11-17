'use strict';
// Mis oraciones v8: controles claros, modo de lista visible, intenciones, misterio del día, velocidad,
// registro de oración, copia de seguridad visible y música de fondo. Claves nuevas: intentions,
// intentionsSpeak, prayerLog, bgMusic (playMode está en continuous.js). No se toca ninguna clave existente.
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es,AN=!!window.Android;
const J=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}};
const W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const mk=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ymd=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const toast=m=>{try{MO.toast(m)}catch{}};
const find=id=>prayers.find(p=>p.id===id);
const onCur=()=>!!(current&&state.id===current.id);
function speaking(){if(!state.playing||state.waiting||state.petition)return false;const sp=find(state.id)?.parts?.[state.index];return !(sp&&sp.silenceMs>0)}
function inPetition(){const sp=find(state.id)?.parts?.[state.index];return !!(state.playing&&((state.waiting&&state.petWait>0)||(sp&&sp.silenceMs>0)))}

// ---------- 1. Controles del reproductor ----------
const player=$('player'),controls=player.querySelector('.controls'),options=player.querySelector('.options'),label=player.querySelector('.playerLabel');
const tg=$('toggle'),stop=$('stop'),restart=$('restart');
const prev=mk('<button id="prevPrayer" type="button" class="ctl"></button>'),next=mk('<button id="nextPrayer" type="button" class="ctl"></button>');
prev.innerHTML='<span class="sym" aria-hidden="true">⏮\uFE0E</span><small>'+T('Anterior','Previous')+'</small>';prev.setAttribute('aria-label',T('Oración anterior','Previous prayer'));
next.innerHTML='<span class="sym" aria-hidden="true">⏭\uFE0E</span><small>'+T('Siguiente','Next')+'</small>';next.setAttribute('aria-label',T('Oración siguiente','Next prayer'));
stop.classList.add('ctl');stop.innerHTML='<span class="sym" aria-hidden="true">■</span><small>'+T('Detener','Stop')+'</small>';stop.setAttribute('aria-label',T('Detener la lectura','Stop reading'));tg.classList.add('ctl');
controls.replaceChildren(prev,tg,next,stop);
restart.className='secondary restartBtn';restart.textContent='↺ '+T('Desde el principio','From the start');options.append(restart);
prev.onclick=()=>{if(!MO.stepPrayer(-1))toast(T('Esta es la primera oración','This is the first prayer'))};
next.onclick=()=>{if(!MO.stepPrayer(1))toast(T('No hay más oraciones después de esta','There are no more prayers after this one'))};
const stateLine=mk('<div id="v8State" class="v8State" aria-live="polite"><span class="dot" aria-hidden="true"></span><b></b></div>');label.prepend(stateLine);
const chip=mk('<button id="modeChip" type="button" class="modeChip" aria-haspopup="true" aria-expanded="false"></button>');
const menu=mk('<div id="modeMenu" class="modeMenu" role="menu" hidden></div>');
const chipRow=mk('<div class="chipRow"></div>');chipRow.append(chip);label.after(chipRow);chipRow.after(menu);
const MODEINFO={day:['☀',T('Lista del día','Day list')],night:['☾',T('Lista de la noche','Night list')],single:['①',T('Solo esta oración','This prayer only')]};
const listLen=m=>(lists[m]||[]).filter(id=>find(id)).length;
function renderMenu(){menu.replaceChildren();for(const m of ['day','night','single']){const b=mk('<button type="button" role="menuitemradio"></button>');const n=m==='single'?'':' ('+listLen(m)+')';
 b.innerHTML='<span aria-hidden="true">'+MODEINFO[m][0]+'</span> '+esc(MODEINFO[m][1])+n;b.setAttribute('aria-checked',String(MO.playMode()===m));
 b.onclick=()=>{menu.hidden=true;chip.setAttribute('aria-expanded','false');if(m!=='single'&&!listLen(m))toast(m==='day'?T('Tu lista del día está vacía: añade oraciones con «☀ Mi día».','Your day list is empty: add prayers with “☀ My day”.'):T('Tu lista de la noche está vacía: añade oraciones con «☾ Mi noche».','Your night list is empty: add prayers with “☾ My night”.'));MO.setPlayMode(m);render()};menu.append(b)}}
chip.onclick=()=>{const open=menu.hidden;if(open)renderMenu();menu.hidden=!open;chip.setAttribute('aria-expanded',String(open))};
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&e.target!==chip&&!chip.contains(e.target)){menu.hidden=true;chip.setAttribute('aria-expanded','false')}});
function render(){if(!current)return;const on=onCur(),playing=on&&state.playing,paused=on&&state.paused&&!MO.isStopped();
 tg.innerHTML='<span class="sym" aria-hidden="true">'+(playing?'⏸\uFE0E':'▶\uFE0E')+'</span><small>'+(playing?T('Pausar','Pause'):paused?T('Continuar','Resume'):T('Reproducir','Play'))+'</small>';
 tg.setAttribute('aria-label',playing?T('Pausar','Pause'):paused?T('Continuar','Resume'):T('Reproducir','Play'));
 const s=playing?(inPetition()?['pet',T('Tus peticiones','Your petitions')]:['play',T('Reproduciendo','Playing')]):paused?['pause',T('En pausa','Paused')]:['stop',T('Detenido','Stopped')];
 stateLine.dataset.s=s[0];stateLine.querySelector('b').textContent=s[1];
 const m=MO.playMode(),[ic,name]=MODEINFO[m];let sub='';
 if(m!=='single'){const n=MO.upNext();const inList=(lists[m]||[]).includes(current.id);sub=n?T('Después: ','Next: ')+n.title:(inList?T('Última de la lista','Last in the list'):T('La lista está vacía','The list is empty'))}
 else sub=T('Al terminar, se detiene','Stops when it ends');
 chip.innerHTML='<span class="ic" aria-hidden="true">'+ic+'</span><span class="nm">'+esc(name)+'</span><span class="sub">'+esc(sub)+'</span><span class="chev" aria-hidden="true">▾</span>';
 chip.setAttribute('aria-label',T('Qué se va a reproducir: ','What will play: ')+name+'. '+sub+'. '+T('Toca para cambiar','Tap to change'));
 const sp=state.waiting||!!find(state.id)?.parts?.[state.index]?.silenceMs;petIntents.hidden=!(intents().length);music.tick()}
// Quitar el aviso del gesto de deslizar (sigue funcionando, pero ya no es la forma principal)
document.querySelectorAll('.swipeHint').forEach(e=>e.remove());

// ---------- 2. Intenciones ----------
const intents=()=>J('intentions',[]).filter(s=>typeof s==='string'&&s.trim());
const petBox=$('petBox');const petIntents=mk('<div id="petIntents" class="petIntents" hidden></div>');if(petBox)petBox.querySelector('.petTrack').before(petIntents);
function renderPetIntents(){const l=intents();petIntents.innerHTML=l.length?'<span>'+T('Por: ','For: ')+'</span>'+l.map(s=>'<b>'+esc(s)+'</b>').join(' · '):'';petIntents.hidden=!l.length}
MO.intentionsSpeech=()=>{const l=intents();return J('intentionsSpeak',false)&&l.length?T('Por mis intenciones: ','For my intentions: ')+l.join(', ')+'.':''};

// ---------- 3. Misterio del día ----------
const TODAY=['gloriosos','gozosos','dolorosos','gloriosos','luminosos','dolorosos','gozosos'];
const MYN={gozosos:T('gozosos','Joyful'),dolorosos:T('dolorosos','Sorrowful'),gloriosos:T('gloriosos','Glorious'),luminosos:T('luminosos','Luminous')};
const DAYN=T('domingo,lunes,martes,miércoles,jueves,viernes,sábado','Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday').split(',');
const mBox=mk('<div id="mysteryToday" class="mysteryToday" hidden></div>');$('readerMeta').after(mBox);
if(!$('mysterySelect')){const sel=mk('<div id="mysterySelect" class="mysterySelect" role="group" hidden></div>');sel.setAttribute('aria-label',T('Elegir misterios','Choose mysteries'));
 for(const k of ['gozosos','dolorosos','gloriosos','luminosos']){const b=document.createElement('button');b.className='secondary';b.dataset.m=k;b.textContent=MYN[k].charAt(0).toUpperCase()+MYN[k].slice(1);b.onclick=()=>{if(state.playing||state.paused)stop.click();openPrayer(find('rosario-'+k))};sel.append(b)}
 mBox.after(sel);sel.dataset.v8='1'}
function renderMystery(p){const m=/^rosario-(gozosos|dolorosos|gloriosos|luminosos)$/.exec(p?.id||'');const t=TODAY[new Date().getDay()];
 const sel=$('mysterySelect');if(sel&&sel.dataset.v8){sel.hidden=!m;if(m)sel.querySelectorAll('button').forEach(b=>{b.classList.toggle('chosen',b.dataset.m===m[1]);b.textContent=MYN[b.dataset.m].charAt(0).toUpperCase()+MYN[b.dataset.m].slice(1)+(b.dataset.m===t?T(' · hoy',' · today'):'')})}
 if(!m){mBox.hidden=true;return}mBox.hidden=false;
 const head=T('Hoy, '+DAYN[new Date().getDay()]+', se rezan los misterios '+MYN[t]+'.','Today, '+DAYN[new Date().getDay()]+', the '+MYN[t]+' Mysteries are prayed.');
 if(m[1]===t)mBox.innerHTML='<span>✓ '+esc(head)+'</span>';
 else{mBox.innerHTML='<span>'+esc(head)+'</span> <button type="button" class="secondary">'+esc(T('Rezar los de hoy','Pray today’s'))+'</button>';mBox.querySelector('button').onclick=()=>{if(state.playing||state.paused)stop.click();openPrayer(find('rosario-'+t))}}}

// ---------- 4. Velocidad de la voz ----------
const rateSel=$('rate');const fmt=v=>(Math.round(v*100)/100).toFixed(2).replace('.',window.MO_LANG==='en'?'.':',')+'×';
function rateUI(where){const w=mk('<label class="v8Rate"><span>'+T('Velocidad','Speed')+' <b></b></span><input type="range" min="0.6" max="1.4" step="0.05"></label>');const r=w.querySelector('input');r.setAttribute('aria-label',T('Velocidad de la voz','Voice speed'));
 const sync=()=>{const v=Number(localStorage.rate)||0.85;r.value=v;w.querySelector('b').textContent=fmt(v)};sync();
 r.oninput=()=>{w.querySelector('b').textContent=fmt(Number(r.value))};r.onchange=()=>setRate(Number(r.value));w.sync=sync;where(w);return w}
const rateWidgets=[];
function setRate(v){v=Math.max(0.6,Math.min(1.4,v));const s=String(Math.round(v*100)/100);if(![...rateSel.options].some(o=>o.value===s))rateSel.append(new Option(fmt(Number(s)),s));rateSel.value=s;rateSel.dispatchEvent(new Event('change'));rateWidgets.forEach(w=>w.sync())}
{const v=String(Number(localStorage.rate)||0.85);if(![...rateSel.options].some(o=>o.value===v))rateSel.append(new Option(fmt(Number(v)),v));rateSel.value=v}
const oldRate=rateSel.closest('label');if(oldRate)oldRate.hidden=true;
rateWidgets.push(rateUI(w=>options.prepend(w)));

// ---------- 5. Registro de oración ----------
const LOG='prayerLog';const getLog=()=>{const l=J(LOG,{d:{}});if(!l.d||typeof l.d!=='object')l.d={};return l};
function record(id){const p=find(id);if(!p)return;const l=getLog(),k=ymd(),e=l.d[k]||{p:0,r:0};e.p++;if(/^rosario-/.test(id))e.r++;l.d[k]=e;W(LOG,l)}
let last={id:null,index:-1,total:0,playing:false,completed:false};
function track(){const s=state||{};
 if(last.id&&last.playing&&last.total&&last.index>=last.total-1&&(s.id!==last.id||(s.completed&&!last.completed)))record(last.id);
 last={id:s.id,index:s.index??-1,total:s.total||(find(s.id)?.parts?.length||0),playing:!!(s.playing||s.paused),completed:!!s.completed}}
const logDlg=mk('<dialog id="logDialog" class="logDialog"><h2></h2><div class="logNav"><button type="button" class="secondary" data-d="-1" aria-label="">‹</button><strong></strong><button type="button" class="secondary" data-d="1" aria-label="">›</button></div><div class="logGrid"></div><p class="logSum"></p><p class="hint"></p><button type="button" class="secondary logClose"></button></dialog>');
document.body.append(logDlg);logDlg.querySelector('h2').textContent=T('Mi registro de oración','My prayer log');logDlg.querySelector('.logClose').textContent=T('Volver','Back');
logDlg.querySelector('.hint').textContent=T('Se marca solo al terminar una oración: ● días de oración, ✿ rosarios completados.','Marked automatically when you finish a prayer: ● days of prayer, ✿ rosaries completed.');
logDlg.querySelector('[data-d="-1"]').setAttribute('aria-label',T('Mes anterior','Previous month'));logDlg.querySelector('[data-d="1"]').setAttribute('aria-label',T('Mes siguiente','Next month'));
let shown=new Date();shown.setDate(1);
function renderLog(){const l=getLog(),y=shown.getFullYear(),mo=shown.getMonth(),loc=window.MO_LANG==='en'?'en-GB':'es-ES';
 logDlg.querySelector('.logNav strong').textContent=shown.toLocaleDateString(loc,{month:'long',year:'numeric'});
 const g=logDlg.querySelector('.logGrid');g.replaceChildren();for(const w of T('L,M,X,J,V,S,D','M,T,W,T,F,S,S').split(','))g.append(mk('<span class="wd">'+w+'</span>'));
 const first=(new Date(y,mo,1).getDay()+6)%7,days=new Date(y,mo+1,0).getDate();for(let i=0;i<first;i++)g.append(mk('<span></span>'));
 let dp=0,rr=0;const today=ymd();
 for(let d=1;d<=days;d++){const k=ymd(new Date(y,mo,d)),e=l.d[k];const c=mk('<span class="day"><i>'+d+'</i></span>');if(k===today)c.classList.add('today');
  if(e&&e.p){dp++;rr+=e.r||0;c.classList.add('prayed');c.append(mk('<small>'+(e.r?'✿'+(e.r>1?e.r:''):'●')+'</small>'));c.title=e.p+' '+T('oraciones','prayers')+(e.r?' · '+e.r+' '+T('rosarios','rosaries'):'')}g.append(c)}
 logDlg.querySelector('.logSum').textContent=T('Este mes: '+dp+(dp===1?' día':' días')+' de oración · '+rr+(rr===1?' rosario':' rosarios'),'This month: '+dp+(dp===1?' day':' days')+' of prayer · '+rr+(rr===1?' rosary':' rosaries'))}
logDlg.querySelectorAll('.logNav button').forEach(b=>b.onclick=()=>{shown.setMonth(shown.getMonth()+Number(b.dataset.d));renderLog()});
logDlg.querySelector('.logClose').onclick=()=>logDlg.close();
function openLog(){shown=new Date();shown.setDate(1);renderLog();if($('settingsDialog').open)$('settingsDialog').close();logDlg.showModal()}
MO.openPrayerLog=openLog;

// ---------- 7. Música de fondo ----------
const TRACKS={cello:'music/john-michel-ave-maria.mp3',violin:'music/katy-adelson-ave-maria.mp3'};
const music=(()=>{let cfg=Object.assign({on:false,track:'cello',vol:0.15},J('bgMusic',{}));const save=()=>W('bgMusic',cfg);
 const nat=AN&&typeof Android.musicPlay==='function';let audio=null,cur=0,vol=0,target=0,ramp=0,active=false,need=false;
 const list=()=>cfg.track==='violin'?[TRACKS.violin]:cfg.track==='alt'?[TRACKS.cello,TRACKS.violin]:[TRACKS.cello];
 function apply(v){vol=v;if(nat){try{Android.musicVolume(v)}catch{}}else if(audio)audio.volume=Math.max(0,Math.min(1,v))}
 function rampTo(t){target=t;if(ramp)return;ramp=setInterval(()=>{const d=target-vol;if(Math.abs(d)<0.006){apply(target);clearInterval(ramp);ramp=0;return}apply(vol+d*0.25)},60)}
 function wanted(){return (speaking()?cfg.vol/3:cfg.vol)}
 function start(){if(active)return;const l=list();if(nat){try{Android.musicPlay(l.join('|'),0);active=true;vol=0;rampTo(wanted())}catch{}return}
  if(!audio){audio=new Audio();audio.preload='auto';audio.addEventListener('ended',()=>{const l=list();if(l.length>1){cur=(cur+1)%l.length;audio.src=l[cur];audio.play().catch(()=>{})}})}
  cur=0;audio.loop=l.length===1;if(!audio.src||!audio.src.endsWith(l[0]))audio.src=l[0];audio.volume=0;vol=0;
  audio.play().then(()=>{active=true;need=false;rampTo(wanted())}).catch(()=>{need=true})}
 function halt(){active=false;need=false;if(ramp){clearInterval(ramp);ramp=0}if(nat){try{Android.musicStop()}catch{}}else if(audio)audio.pause()}
 function tick(){if(!cfg.on){if(active)halt();return}if(document.hidden&&!state.playing){if(active)halt();return}if(!active)start();else rampTo(wanted())}
 document.addEventListener('visibilitychange',tick);addEventListener('pagehide',()=>{if(!state.playing)halt()});
 addEventListener('pointerdown',()=>{if(cfg.on&&!active&&!(document.hidden))start()},{capture:true});
 return {tick,cfg:()=>cfg,status:()=>({active,vol:Math.round(vol*1000)/1000,paused:audio?audio.paused:null,src:audio?audio.src.split('/').pop():null,native:nat}),set(p){const tr=p.track&&p.track!==cfg.track;Object.assign(cfg,p);save();if(tr&&active){halt()}tick();renderMusic()},toggle(){this.set({on:!cfg.on});toast(cfg.on?T('♫ Música de fondo activada','♫ Background music on'):T('Música de fondo apagada','Background music off'))}}})();
const musicBtn=mk('<button id="musicBtn" type="button" class="musicBtn"></button>');options.append(musicBtn);musicBtn.onclick=()=>music.toggle();
function renderMusic(){const c=music.cfg();musicBtn.setAttribute('aria-pressed',String(c.on));musicBtn.textContent='♫ '+(c.on?T('Música: sí','Music: on'):T('Música: no','Music: off'));
 const s=$('v8MusicOn');if(s){s.checked=c.on;$('v8MusicTrack').value=c.track;$('v8MusicVol').value=Math.round(c.vol*100);$('v8MusicVolLbl').textContent=Math.round(c.vol*100)+'%'}}

// ---------- Ajustes: secciones nuevas ----------
const sd=$('settingsDialog');
const credits=AN?
 T('<p><b>Ave María (Bach/Gounod), violonchelo:</b> John Michel. Licencia CC BY-SA 3.0 (creativecommons.org/licenses/by-sa/3.0). Fuente: commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-BACH_AVE_MARIA.ogg (transcodificado a MP3)</p><p><b>Ave María (Schubert), violín:</b> Katy Adelson. Licencia CC BY 3.0 (creativecommons.org/licenses/by/3.0). Fuente: commons.wikimedia.org/wiki/File:Ave_Maria_-_Schubert_~_Violin.webm (audio extraído)</p>',
   '<p><b>Ave Maria (Bach/Gounod), cello:</b> John Michel. License CC BY-SA 3.0 (creativecommons.org/licenses/by-sa/3.0). Source: commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-BACH_AVE_MARIA.ogg (transcoded to MP3)</p><p><b>Ave Maria (Schubert), violin:</b> Katy Adelson. License CC BY 3.0 (creativecommons.org/licenses/by/3.0). Source: commons.wikimedia.org/wiki/File:Ave_Maria_-_Schubert_~_Violin.webm (audio extracted)</p>')
 :T('<p><b>Ave María (Bach/Gounod), violonchelo:</b> John Michel. Licencia <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>. Fuente: <a href="https://commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-BACH_AVE_MARIA.ogg" target="_blank" rel="noopener">Wikimedia Commons</a> (transcodificado a MP3)</p><p><b>Ave María (Schubert), violín:</b> Katy Adelson. Licencia <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. Fuente: <a href="https://commons.wikimedia.org/wiki/File:Ave_Maria_-_Schubert_~_Violin.webm" target="_blank" rel="noopener">Wikimedia Commons</a> (audio extraído)</p>',
   '<p><b>Ave Maria (Bach/Gounod), cello:</b> John Michel. License <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>. Source: <a href="https://commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-BACH_AVE_MARIA.ogg" target="_blank" rel="noopener">Wikimedia Commons</a> (transcoded to MP3)</p><p><b>Ave Maria (Schubert), violin:</b> Katy Adelson. License <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. Source: <a href="https://commons.wikimedia.org/wiki/File:Ave_Maria_-_Schubert_~_Violin.webm" target="_blank" rel="noopener">Wikimedia Commons</a> (audio extracted)</p>');
const box=mk(`<div id="v8Settings" data-noi18n="1">
<section class="v8sec" id="v8SpeedSec"><h3>🗣 ${T('Velocidad de la voz','Voice speed')}</h3></section>
<section class="v8sec"><h3>♫ ${T('Música de fondo','Background music')}</h3>
 <label class="switch"><input type="checkbox" id="v8MusicOn"> ${T('Música tranquila de fondo','Calm background music')}</label>
 <label class="setting">${T('Pieza','Piece')}<select id="v8MusicTrack"><option value="cello">${T('Ave María · violonchelo','Ave Maria · cello')}</option><option value="violin">${T('Ave María · violín','Ave Maria · violin')}</option><option value="alt">${T('Alternar las dos','Alternate both')}</option></select></label>
 <label class="v8Rate"><span>${T('Volumen','Volume')} <b id="v8MusicVolLbl"></b></span><input type="range" id="v8MusicVol" min="5" max="40" step="1"></label>
 <p class="hint">${T('Suena bajita y se baja más mientras habla la voz. Se para al salir de la app si no estás escuchando una oración.','It plays softly and lowers further while the voice speaks. It stops when you leave the app unless a prayer is playing.')}</p></section>
<section class="v8sec"><h3>🙏 ${T('Mis intenciones','My intentions')}</h3>
 <p class="hint">${T('Aparecen en la pausa de 8 segundos del Rosario, tras el «Oh Jesús mío».','They appear in the 8-second pause of the Rosary, after the “O my Jesus”.')}</p>
 <ul id="v8IntentList" class="v8IntentList"></ul>
 <div class="v8Row"><input id="v8IntentInput" maxlength="80" placeholder="${T('Ej.: Por mi madre','E.g. For my mother')}" aria-label="${T('Nueva intención','New intention')}"><button type="button" id="v8IntentAdd">＋ ${T('Añadir','Add')}</button></div>
 <label class="switch" id="v8SpeakWrap"><input type="checkbox" id="v8IntentSpeak"> ${T('Leerlas en voz alta al empezar la pausa','Read them aloud when the pause begins')}</label>
 ${AN?'<p class="hint">'+T('En la app de Android se muestran en pantalla (la lectura en voz alta está disponible en la web).','In the Android app they are shown on screen (reading aloud is available on the web).')+'</p>':''}</section>
<section class="v8sec"><h3>📅 ${T('Registro de oración','Prayer log')}</h3><button type="button" id="v8OpenLog" class="secondary">📅 ${T('Ver mi calendario de oración','See my prayer calendar')}</button></section>
<section class="v8sec"><h3>⇅ ${T('Copia de seguridad','Backup')}</h3>
 <p class="hint">${T('Guarda en un archivo todo lo tuyo: oraciones escritas, favoritas, listas, intenciones, registro, alarmas y ajustes.','Save everything of yours to a file: written prayers, favourites, lists, intentions, log, alarms and settings.')}</p>
 <div class="v8Row"><button type="button" id="v8Export">⇩ ${T('Exportar copia','Export backup')}</button><button type="button" id="v8Import" class="secondary">⇧ ${T('Importar copia','Import backup')}</button></div></section>
<section class="v8sec v8credits"><h3>${T('Créditos','Credits')}</h3>${credits}</section></div>`);
sd.insertBefore(box,$('closeSettings'));
rateWidgets.push(rateUI(w=>$('v8SpeedSec').append(w)));
const ob=$('openBackupSettings');if(ob)ob.hidden=true;
if(AN)$('v8SpeakWrap').hidden=true;
$('v8MusicOn').onchange=e=>music.set({on:e.target.checked});$('v8MusicTrack').onchange=e=>music.set({track:e.target.value});
$('v8MusicVol').oninput=e=>{$('v8MusicVolLbl').textContent=e.target.value+'%'};$('v8MusicVol').onchange=e=>music.set({vol:Number(e.target.value)/100});
function renderIntents(){const ul=$('v8IntentList'),l=intents();ul.replaceChildren();if(!l.length)ul.append(mk('<li class="empty">'+T('Aún no hay intenciones.','No intentions yet.')+'</li>'));
 l.forEach((s,i)=>{const li=mk('<li><span></span><button type="button" class="icon" aria-label="">✕</button></li>');li.querySelector('span').textContent=s;li.querySelector('button').setAttribute('aria-label',T('Quitar ','Remove ')+s);li.querySelector('button').onclick=()=>{const a=intents();a.splice(i,1);W('intentions',a);renderIntents()};ul.append(li)});
 $('v8IntentSpeak').checked=J('intentionsSpeak',false);renderPetIntents()}
$('v8IntentAdd').onclick=()=>{const v=$('v8IntentInput').value.trim();if(!v)return;const a=intents();if(a.length>=30){toast(T('Máximo 30 intenciones','Maximum 30 intentions'));return}a.push(v);W('intentions',a);$('v8IntentInput').value='';renderIntents()};
$('v8IntentInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('v8IntentAdd').click()}};
$('v8IntentSpeak').onchange=e=>W('intentionsSpeak',e.target.checked);
$('v8OpenLog').onclick=openLog;
$('v8Export').onclick=()=>{sd.close();MO.openBackup();setTimeout(()=>$('exportBackup').click(),50)};
$('v8Import').onclick=()=>{sd.close();MO.openBackup();setTimeout(()=>$('importBackup').click(),50)};
renderIntents();renderMusic();
// Menú lateral: registro de oración
{const ul=document.querySelector('#drawer ul');if(ul){const li=mk('<li><button type="button"><span class="dIcon" aria-hidden="true">📅</span><span></span></button></li>');li.querySelector('span:last-child').textContent=T('Mi registro de oración','My prayer log');
 li.firstChild.onclick=()=>{const s=document.getElementById('drawerShade');if(s)s.click();openLog()};ul.append(li)}}

// ---------- Enganches ----------
const baseOpen=openPrayer;window.openPrayer=openPrayer=function(p){baseOpen.apply(this,arguments);if(!p)return;renderMystery(p);menu.hidden=true;render()};
document.addEventListener('mo-player',()=>{track();render()});
if(current){renderMystery(current);render()}
setInterval(()=>{if(state.playing)render()},1000);
music.tick();
window.MO=Object.assign(window.MO||{},{music,setRate});
})();
