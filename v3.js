'use strict';
// Mis oraciones v3: menú lateral y «Tiempo con el Altísimo».
(()=>{
const AN=!!window.AndroidAlarms;
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const header=document.querySelector('#home header');
header.prepend(el('<button class="icon menuButton" id="menuButton" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>'));
const brand=header.querySelector('.brand');brand.classList.add('centerBrand');
document.body.append(el(`<div id="drawerShade" hidden></div>`));
const ITEMS=[
 ['✠','Evangelio del día',()=>MO.openGospel()],
 ['✿','Rosario del día',()=>MO.openPrayer('__rosary')],
 ['❀','Rosario completo',()=>MO.openPrayer('rosario-completo')],
 ['♱','Coronilla de la Divina Misericordia',()=>MO.openPrayer('coronilla-misericordia')],
 ['✚','Coronilla de la Divina Sangre de Cristo',()=>MO.openPrayer('coronilla-sangre')],
 ['♡','Consagración a la Santísima Virgen María',()=>MO.openPrayer('consagracion-santisima-virgen')],
 ['✧','Gloria',()=>MO.openPrayer('gloria')],
 ['✝','Credo',()=>MO.openPrayer('credo')],
 ['☆','Salve',()=>MO.openPrayer('salve')],
 ['❧','Letanías de la Virgen',()=>MO.openPrayer('letanias')],
 ['＋','Añadir oración',()=>{goHome();edit()}],
 ['◷','Tiempo con el Altísimo',()=>openTimer()],
 '-',
 ['⏰','Alarmas',()=>{goHome();MO.openAlarms()}],
 ['⌂','Inicio · Mi biblioteca',()=>{goHome();setTimeout(()=>document.querySelector('.collection').scrollIntoView({behavior:'smooth'}),50)}],
 ['⚙','Ajustes de lectura',()=>$('settingsDialog').showModal()],
 ['⇅','Copia de seguridad',()=>MO.openBackup()]];
const nav=el('<nav id="drawer" aria-label="Menú" aria-hidden="true"><div class="drawerHead"><span class="brand">✝ &nbsp; MIS ORACIONES</span><small>Un momento para ti y para Dios</small></div><ul></ul></nav>');
for(const it of ITEMS){const li=document.createElement('li');if(it==='-'){li.className='sep';nav.querySelector('ul').append(li);continue}
 const b=document.createElement('button');b.innerHTML='<span class="dIcon" aria-hidden="true"></span><span></span>';b.firstChild.textContent=it[0];b.lastChild.textContent=it[1];b.onclick=()=>{closeDrawer();it[2]()};li.append(b);nav.querySelector('ul').append(li)}
document.body.append(nav);
function openDrawer(){nav.classList.add('open');nav.setAttribute('aria-hidden','false');$('drawerShade').hidden=false;$('menuButton').setAttribute('aria-expanded','true')}
function closeDrawer(){nav.classList.remove('open');nav.setAttribute('aria-hidden','true');$('drawerShade').hidden=true;$('menuButton').setAttribute('aria-expanded','false')}
$('menuButton').onclick=openDrawer;$('drawerShade').onclick=closeDrawer;
let sx=null;nav.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});nav.addEventListener('touchend',e=>{if(sx!==null&&e.changedTouches[0].clientX-sx<-60)closeDrawer();sx=null},{passive:true});
// Ajustar textos de inicio (menos recargado)
document.querySelector('.intro h1').innerHTML='Encuentra tu paz.<br><em>Una oración a la vez.</em>';
document.querySelector('.intro p').hidden=true;
document.querySelector('.intro .eyebrow').hidden=true;

// ---------- Tiempo con el Altísimo ----------
document.body.insertBefore(el(`<main id="timerView" hidden>
 <header><button class="back" id="timerBack">‹ &nbsp; Inicio</button></header>
 <span class="eyebrow">TIEMPO CON EL ALTÍSIMO</span>
 <h1>Habla con Dios.<br><em>Él te escucha.</em></h1>
 <p class="timerQuote">«Cuando ores, entra en tu cuarto, cierra la puerta y ora a tu Padre, que está en lo secreto.» (Mt 6,6)</p>
 <div class="dial"><div id="timerDisplay" aria-live="off">10:00</div><div class="ring"><div id="timerRing"></div></div><p id="timerState">Elige cuánto tiempo quieres dedicarle</p></div>
 <div id="timerSetup"><div class="presets">${[1,5,10,15,20,30,45,60].map(m=>`<button class="secondary" data-min="${m}">${m} min</button>`).join('')}</div>
  <label class="setting slider">Duración: <strong id="timerMinLabel">10 minutos</strong><input type="range" id="timerMinutes" min="1" max="60" step="1" value="10"></label></div>
 <div class="timerControls"><button id="timerStart">▶ &nbsp; Comenzar</button><button id="timerPause" class="secondary" hidden>Ⅱ &nbsp; Pausar</button><button id="timerCancel" class="secondary" hidden>✕ &nbsp; Cancelar</button></div>
 <p class="hint">Al terminar verás «Tiempo terminado» en pantalla y, si la app sigue abierta, sonará una campana suave. Mantén la pantalla encendida o vuelve a la app para verlo.</p>
</main>`),$('player'));
let T=stored('altisimo',{state:'idle',minutes:10,end:0,remaining:0});
const save=()=>localStorage.altisimo=JSON.stringify(T);
const fmt=s=>{s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function left(){return T.state==='running'?(T.end-Date.now())/1000:T.state==='paused'?T.remaining:T.minutes*60}
function renderTimer(){
 const l=left(),total=T.minutes*60;$('timerDisplay').textContent=fmt(l);$('timerRing').style.width=(T.state==='idle'?0:100-l/total*100)+'%';
 $('timerSetup').hidden=T.state!=='idle'&&T.state!=='done';$('timerStart').hidden=T.state==='running';
 $('timerStart').innerHTML=T.state==='paused'?'▶ &nbsp; Continuar':T.state==='done'?'↺ &nbsp; Otra vez':'▶ &nbsp; Comenzar';
 $('timerPause').hidden=T.state!=='running';$('timerCancel').hidden=T.state==='idle'||T.state==='done';
 $('timerState').textContent={idle:'Elige cuánto tiempo quieres dedicarle',running:'En oración… quédate en silencio con Él',paused:'En pausa',done:'Tiempo terminado. Que la paz de Dios te acompañe ✝'}[T.state];
 $('timerMinutes').value=T.minutes;$('timerMinLabel').textContent=T.minutes+(T.minutes===1?' minuto':' minutos');
 document.querySelectorAll('[data-min]').forEach(b=>b.classList.toggle('chosen',Number(b.dataset.min)===T.minutes));
 const sub=$('timerSub');if(sub)sub.textContent=T.state==='running'?'En curso · '+fmt(l):T.state==='paused'?'En pausa · '+fmt(l):'De 1 a 60 minutos';
}
function setMinutes(m){if(T.state==='running'||T.state==='paused')return;T={state:'idle',minutes:Math.min(60,Math.max(1,m)),end:0,remaining:0};save();renderTimer()}
document.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>setMinutes(Number(b.dataset.min)));
$('timerMinutes').oninput=e=>setMinutes(Number(e.target.value));
$('timerStart').onclick=()=>{const secs=T.state==='paused'?T.remaining:T.minutes*60;T.state='running';T.end=Date.now()+secs*1000;save();
 if(AN)AndroidAlarms.timerStart(Math.round(secs));
 unlockAudio();renderTimer()};
$('timerPause').onclick=()=>{T.remaining=Math.max(1,left());T.state='paused';save();if(AN)AndroidAlarms.timerCancel();renderTimer()};
$('timerCancel').onclick=()=>{T.state='idle';save();if(AN)AndroidAlarms.timerCancel();renderTimer()};
let ctx;function unlockAudio(){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume()}catch{}}
function chime(){try{unlockAudio();[0,1.2,2.4].forEach(t=>{for(const f of [528,792]){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.connect(g);g.connect(ctx.destination);const s=ctx.currentTime+t;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.18,s+.05);g.gain.exponentialRampToValueAtTime(.001,s+1.6);o.start(s);o.stop(s+1.7)}})}catch{}}
setInterval(()=>{if(T.state==='running'&&left()<=0){T.state='done';save();if(!document.hidden)chime();MO.toast('Tu tiempo con el Altísimo ha terminado ✝')}
 if(!$('timerView').hidden||T.state!=='idle')renderTimer()},250);
function openTimer(){$('home').hidden=true;$('reader').hidden=true;$('timerView').hidden=false;$('player').hidden=true;document.body.classList.remove('hasPlayer');window.scrollTo(0,0);renderTimer()}
const baseHome=goHome;window.goHome=goHome=function(){if(nav.classList.contains('open')){closeDrawer();return}if($('alarmsDialog')?.open){$('alarmsDialog').close();return}
 if(!$('timerView').hidden){$('timerView').hidden=true;$('home').hidden=false;if(state.playing||state.paused){$('player').hidden=false;document.body.classList.add('hasPlayer')}renderList();window.scrollTo(0,0);return}baseHome()};
$('timerBack').onclick=()=>goHome();
const baseOpen=openPrayer;window.openPrayer=openPrayer=function(p){if(!p)return;$('timerView').hidden=true;baseOpen(p)};
renderTimer();
if(MO.startId==='__timer'){if(AN)AndroidAlarms.timerCancel&&0;openTimer()}
$('tileTimer').onclick=openTimer;if(!$('tileTimer').onclick)$('tileTimer').onclick=openTimer;window.MO.openTimer=openTimer;window.MO.openDrawer=openDrawer;
})();
