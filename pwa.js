'use strict';
// Mis oraciones (web): selector de misterios, instalación y modo sin conexión.
(()=>{
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
// Ajustes: texto para la web
$('voiceSettings').hidden=true;
document.querySelectorAll('#settingsDialog p').forEach(p=>{if(/Android/.test(p.textContent))p.textContent='La lectura usa la voz en español de tu móvil o navegador. En iPhone puedes elegir y descargar voces en Ajustes › Accesibilidad › Contenido leído › Voces › Español.'});
if(!TTS.supported)MO.toast('Tu navegador no permite la lectura en voz alta; puedes leer las oraciones.');

// ---------- Selector de misterios del Rosario ----------
const MY=[['gozosos','Gozosos'],['dolorosos','Dolorosos'],['gloriosos','Gloriosos'],['luminosos','Luminosos']];
const sel=el('<div id="mysterySelect" class="mysterySelect" role="group" aria-label="Elegir misterios" hidden></div>');
for(const [k,label] of MY){const b=document.createElement('button');b.className='secondary';b.dataset.m=k;b.textContent=label;b.onclick=()=>{if(state.playing||state.paused)TTS.stop();openPrayer(prayers.find(p=>p.id==='rosario-'+k))};sel.append(b)}
$('readerMeta').after(sel);
const today=['gloriosos','gozosos','dolorosos','gloriosos','luminosos','dolorosos','gozosos'][new Date().getDay()];
const base=openPrayer;window.openPrayer=openPrayer=function(p){base(p);if(!p)return;const m=/^rosario-(gozosos|dolorosos|gloriosos|luminosos)$/.exec(p.id);sel.hidden=!m;
 if(m)sel.querySelectorAll('button').forEach(b=>{b.classList.toggle('chosen',b.dataset.m===m[1]);b.textContent=MY.find(x=>x[0]===b.dataset.m)[1]+(b.dataset.m===today?' · hoy':'')})};

// ---------- Ayuda para instalar ----------
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
document.body.append(el(`<dialog id="installDialog"><h2>Instálala en tu móvil</h2>
<p><strong>iPhone / iPad (Safari):</strong></p><ol><li>Pulsa el botón <strong>Compartir</strong> <span aria-hidden="true">⬆︎</span> en la barra de Safari.</li><li>Elige <strong>«Añadir a pantalla de inicio»</strong>.</li><li>Pulsa <strong>Añadir</strong>. Se abrirá como una app, también sin conexión.</li></ol>
<p><strong>Android (Chrome):</strong> menú <strong>⋮</strong> › <strong>«Instalar aplicación»</strong> o «Añadir a pantalla de inicio».</p>
<p class="hint">No necesitas cuenta. Tus oraciones, favoritas y ajustes se guardan solo en este dispositivo.</p>
<button type="button" id="installNow" hidden>Instalar ahora</button><button type="button" id="closeInstall" class="secondary">Entendido</button></dialog>`));
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installNow').hidden=false});
$('installNow').onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;$('installDialog').close()};
$('closeInstall').onclick=()=>{$('installDialog').close();localStorage.installHelpSeen='1'};
const ul=document.querySelector('#drawer ul'),li=el('<li><button><span class="dIcon" aria-hidden="true">⬇</span><span>Añadir a pantalla de inicio</span></button></li>');
li.firstChild.onclick=()=>{document.getElementById('drawerShade').click();$('installDialog').showModal()};ul.append(li);
if(!standalone&&!localStorage.installHelpSeen){const tip=el('<button class="installTip secondary">⬇ &nbsp; Instalar Mis oraciones en tu pantalla de inicio</button>');tip.onclick=()=>{tip.remove();$('installDialog').showModal()};document.getElementById('todayCards').after(tip)}
const baseHome=goHome;window.goHome=goHome=function(){if($('installDialog').open){$('installDialog').close();return}baseHome()};

// ---------- Service worker ----------
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
