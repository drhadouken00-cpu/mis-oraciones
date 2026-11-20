'use strict';
// Mis oraciones v13: (1) apartado «Descarga para Android» (web en ordenador y Android; nunca en iPhone/iPad ni dentro del APK)
// y (2) aspecto de página web en ordenador (pantalla ancha + ratón, no iOS, no APK). En móviles todo queda igual.
// Solo añade elementos y clases; no lee ni escribe ninguna clave de localStorage.
window.MO_SITE=window.MO_SITE||{};
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es;
const $=id=>document.getElementById(id);
const ua=navigator.userAgent||'';
const iOS=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
const inApk=!!(window.Android||window.AndroidAlarms)||location.hostname==='app.local';
const android=/Android/i.test(ua);
const APK='https://github.com/drhadouken00-cpu/mis-oraciones/releases/latest/download/MisOraciones.apk';
const showDl=!iOS&&!inApk;
const root=document.documentElement;
root.classList.toggle('moIOS',iOS);root.classList.toggle('moApk',inApk);root.classList.toggle('moDl',showDl);root.classList.toggle('moAndroid',android&&!inApk);
const mk=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const home=$('home');if(!home)return;
const goHome=()=>{for(const b of [$('back'),...document.querySelectorAll('#timerView .back,#searchView .back')])if(b&&b.offsetParent){b.click();break}};
const toHomeSel=(sel,top)=>{goHome();setTimeout(()=>{const t=sel&&document.querySelector(sel);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});else if(top)scrollTo({top:0,behavior:'smooth'})},60)};

// ---------- Descarga para Android ----------
let dl=null;
if(showDl){
 const extras=[
  ['🔒',T('Sigue rezando con la pantalla apagada o con otra app abierta.','Keeps praying with the screen off or another app open.')],
  ['⏯',T('Controles en la pantalla de bloqueo y en las notificaciones; se pausa sola si entra una llamada.','Lock-screen and notification controls; pauses by itself when a call comes in.')],
  ['⏰',T('Alarmas de oración de verdad: avisan a tu hora aunque la app esté cerrada, también tras reiniciar el móvil.','Real prayer alarms: they ring at your time even with the app closed, also after restarting the phone.')],
  ['✈',T('Todo sin internet desde el primer día: los cuadros y la música ya vienen dentro.','Everything offline from day one: the paintings and music come built in.')],
  ['⇅',T('Copia de seguridad: compártela, o ábrela desde el archivo para recuperarla.','Backup: share it, or open the file to restore it.')]];
 dl=mk(`<section id="getApk" class="getApk" aria-labelledby="getApkTitle">
 <span class="eyebrow">ANDROID</span>
 <h2 id="getApkTitle">${T('¿Usas Android? Descarga Mis oraciones en tu teléfono','Using Android? Get Mis oraciones on your phone')}</h2>
 <p class="gaLead">${T('La app tiene todo lo de la web y además:','The app has everything on the web, plus:')}</p>
 <ul class="gaList">${extras.map(([i,t])=>`<li><span aria-hidden="true">${i}</span><span>${t}</span></li>`).join('')}</ul>
 <div class="gaFoot"><div class="gaRow"><a class="gaBtn" href="${APK}" download="MisOraciones.apk" rel="noopener">⬇ &nbsp;${T('Descargar para Android','Download for Android')}</a>
 <span class="gaMeta">${T('Gratis · versión 3.1 (19) · 19 MB','Free · version 3.1 (19) · 19 MB')}</span></div>
 <div class="gaQr"><img src="icons/apk-qr.svg" width="112" height="112" alt="${T('Código QR para descargar la app','QR code to download the app')}"><span>${T('O escanéalo con tu Android','Or scan it with your Android phone')}</span></div></div>
 <details class="gaHow"><summary>${T('Cómo instalarla','How to install it')}</summary><ol>
  <li>${T('Pulsa «Descargar» en tu Android y abre el archivo <b>MisOraciones.apk</b>.','Tap “Download” on your Android phone and open the file <b>MisOraciones.apk</b>.')}</li>
  <li>${T('Si Android lo pide, permite «Instalar apps desconocidas» para tu navegador o la app Archivos.','If Android asks, allow “Install unknown apps” for your browser or Files app.')}</li>
  <li>${T('Pulsa «Instalar». Para actualizar, instala la nueva versión encima, sin desinstalar: no pierdes nada.','Tap “Install”. To update, install the new version on top without uninstalling: nothing is lost.')}</li>
  <li>${T('Lo que guardaste en la web no pasa solo a la app: usa Ajustes › Copia de seguridad (Exportar aquí, Importar en la app).','What you saved on the web does not move to the app by itself: use Settings › Backup (Export here, Import in the app).')}</li>
 </ol></details></section>`);
 const col=home.querySelector('.collection');home.insertBefore(dl,col||null);
 const goDl=()=>toHomeSel('#getApk');
 // Enlace discreto en el menú y en Ajustes
 const ul=document.querySelector('#drawer ul');
 if(ul){const li=mk('<li><button type="button"><span class="dIcon" aria-hidden="true">📱</span><span></span></button></li>');li.querySelector('span:last-child').textContent=T('App para Android','Android app');
  li.firstChild.onclick=()=>{const s=$('drawerShade');if(s)s.click();goDl()};ul.append(li)}
 const sd=$('settingsDialog'),cs=$('closeSettings');
 if(sd&&cs){const s=mk(`<section class="v8sec gaSettings"><h3>📱 ${T('App para Android','Android app')}</h3><p class="hint">${T('Descárgala gratis: suena con la pantalla apagada y tiene alarmas de verdad.','Free download: plays with the screen off and has real alarms.')}</p><a class="gaLink" href="${APK}" download="MisOraciones.apk" rel="noopener">⬇ ${T('Descargar para Android','Download for Android')}</a></section>`);
  const cr=sd.querySelector('.v8credits');(cr?cr.parentNode:cs.parentNode).insertBefore(s,cr||cs)}
 MO_SITE.goDl=goDl;
}

// ---------- Ordenador: barra de navegación y pie ----------
const mq=matchMedia('(min-width:1024px) and (pointer:fine)');
let nav=null,foot=null,icons=null,iconsHome=null;
function build(){
 if(nav)return;
 const L=[['home',T('Inicio','Home'),()=>{goHome();setTimeout(()=>scrollTo({top:0,behavior:'smooth'}),60)}],
  ['gospel',T('Evangelio','Gospel'),()=>MO.openGospel()],
  ['rosary',T('Rosario','Rosary'),()=>MO.openPrayer('__rosary')],
  ['mercy',T('Misericordia','Divine Mercy'),()=>MO.openPrayer('coronilla-misericordia')],
  ['blood',T('Preciosa Sangre','Precious Blood'),()=>MO.openPrayer('coronilla-sangre')],
  ['lib',T('Biblioteca','Library'),()=>toHomeSel('.collection')]];
 if(showDl)L.push(['apk','Android',()=>MO_SITE.goDl()]);
 nav=mk(`<header id="siteNav" class="siteNav" aria-label="${T('Navegación','Navigation')}"><div class="snIn">
  <button type="button" class="snBrand">✝ &nbsp;MIS ORACIONES</button><nav class="snLinks"></nav><div class="snTools"></div>
  <button type="button" class="snMore" aria-label="${T('Más opciones','More options')}">☰ <span>${T('Más','More')}</span></button></div></header>`);
 const links=nav.querySelector('.snLinks');
 for(const [k,t,f] of L){const b=document.createElement('button');b.type='button';b.dataset.k=k;b.textContent=t;b.onclick=f;if(k==='apk')b.className='snApk';links.append(b)}
 nav.querySelector('.snBrand').onclick=L[0][2];
 nav.querySelector('.snMore').onclick=()=>{if(MO.openDrawer)MO.openDrawer();else $('menuButton')?.click()};
 document.body.prepend(nav);
 const F=[[T('Créditos de textos, cuadros y música','Credits for texts, paintings and music'),()=>{$('settingsDialog')?.showModal();setTimeout(()=>document.querySelector('#settingsDialog .v8credits')?.scrollIntoView({block:'start'}),60)}],
  [T('Ajustes','Settings'),()=>$('settingsDialog')?.showModal()],[T('Alarmas','Alarms'),()=>MO.openAlarms&&MO.openAlarms()],[T('Copia de seguridad','Backup'),()=>MO.openBackup&&MO.openBackup()]];
 if(showDl)F.unshift([T('App para Android','Android app'),()=>MO_SITE.goDl()]);
 foot=mk(`<footer id="siteFoot" class="siteFoot"><div class="sfBrand"><strong>✝ &nbsp;MIS ORACIONES</strong><span>${T('Un momento para ti y para Dios. Lee, escucha y reza a tu ritmo.','A moment for you and for God. Read, listen and pray at your own pace.')}</span></div><div class="sfLinks"></div><p class="sfNote">${T('Cuadros de dominio público (Wikimedia Commons). Gratis y sin anuncios.','Public-domain paintings (Wikimedia Commons). Free and ad-free.')}</p></footer>`);
 const fl=foot.querySelector('.sfLinks');for(const [t,f] of F){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=f;fl.append(b)}
 home.append(foot);
 const intro=home.querySelector('.intro');
 if(intro){const c=mk(`<div class="heroCta"><button type="button" class="hcMain">▶ &nbsp;${T('Oración del día','Prayer of the day')}</button><button type="button" class="hcSec">✿ &nbsp;${T('Rosario del día','Today’s rosary')}</button><button type="button" class="hcSec">✠ &nbsp;${T('Evangelio del día','Today’s Gospel')}</button></div>`);
  const [a,r,g]=c.querySelectorAll('button');a.onclick=()=>{const d=document.querySelector('#todayCards .featured.daily button');d?d.click():MO.openPrayer('__daily')};r.onclick=()=>MO.openPrayer('__rosary');g.onclick=()=>MO.openGospel();intro.append(c)}
}
function apply(){
 const on=mq.matches&&!iOS&&!inApk;
 root.classList.toggle('desk',on);
 if(on){build();if(!icons&&window.moMountLangToggle)try{moMountLangToggle()}catch{}icons=icons||home.querySelector('header .topIcons');if(icons&&icons.parentNode!==nav.querySelector('.snTools')){iconsHome=icons.parentNode;nav.querySelector('.snTools').append(icons);
  // marcador para que i18n no vuelva a crear el selector de idioma en la cabecera escondida
  if(!iconsHome.querySelector('.langToggle'))iconsHome.append(mk('<span class="langToggle moPh" hidden></span>'))}}
 else if(icons&&iconsHome&&icons.parentNode!==iconsHome)iconsHome.append(icons);
}
// Marca la sección activa en la barra
document.addEventListener('mo-player',()=>{if(!nav)return;const id=typeof state!=='undefined'&&state&&state.id;nav.querySelectorAll('.snLinks button').forEach(b=>b.classList.toggle('on',(b.dataset.k==='rosary'&&/^rosario-/.test(id||''))||(b.dataset.k==='mercy'&&id==='coronilla-misericordia')||(b.dataset.k==='blood'&&id==='coronilla-sangre')))});
(mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply));
apply();
})();
