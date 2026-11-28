'use strict';
/* Prueba · botón Compartir junto al corazón de favoritas.
   Página sin enlazar: no toca la app, ni el SW, ni localStorage (solo LEE theme/moLang).
   Orden al pulsar: puente nativo de la APK (si existe) → menú de compartir del sistema (navigator.share) → copiar al portapapeles. */
(function(){
const $=id=>document.getElementById(id),Q=new URLSearchParams(location.search),D=window.DEMO;
const WEB='https://drhadouken00-cpu.github.io/mis-oraciones/',APK='https://github.com/drhadouken00-cpu/mis-oraciones/releases/latest/download/MisOraciones.apk';
let LS={};try{LS={theme:localStorage.getItem('theme'),lang:localStorage.getItem('moLang')}}catch(e){}
const st={lang:Q.get('lang')||(LS.lang==='en'?'en':'es'),theme:Q.get('theme')||LS.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),
 id:D[Q.get('id')]?Q.get('id'):'oracion-16',apk:Q.get('apk')!=='0',fav:false};
const T={
es:{pvTitle:'Prueba · Compartir una oración',pvSub:'Página sin enlazar: no cambia la app ni tus datos.',dbgSum:'Opciones de prueba',dbgPrayer:'Oración',dbgApk:'Enlace de la APK en el mensaje',apkOpt:['sí','no'],
 dbgLangL:'Idioma',dbgThemeL:'Tema',showMsg:'Ver el texto que se envía',back:'Biblioteca',eyebrow:'TU MOMENTO DE ORACIÓN',meta:m=>`≈ ${m} min · Lectura y audio`,
 share:'Compartir oración',favOn:'Quitar de favoritas',favOff:'Guardar en favoritas',
 footer:'Rezada con Mis oraciones',apkLine:'App para Android:',
 copied:'Oración copiada. Pégala donde quieras.',fail:'No se ha podido compartir. Prueba otra vez.',
 msgH:'Texto que se envía',msgLead:'El título, la oración completa y, al final, el enlace a la app. Las pausas para pedir en silencio no se envían.',close:'Cerrar'},
en:{pvTitle:'Preview · Share a prayer',pvSub:'Unlinked page: it does not change the app or your data.',dbgSum:'Test options',dbgPrayer:'Prayer',dbgApk:'APK link in the message',apkOpt:['yes','no'],
 dbgLangL:'Language',dbgThemeL:'Theme',showMsg:'See the text that is sent',back:'Library',eyebrow:'YOUR MOMENT OF PRAYER',meta:m=>`≈ ${m} min · Reading and audio`,
 share:'Share prayer',favOn:'Remove from favourites',favOff:'Save to favourites',
 footer:'Prayed with Mis oraciones',apkLine:'Android app:',
 copied:'Prayer copied. Paste it wherever you like.',fail:'Could not share. Please try again.',
 msgH:'Text that is sent',msgLead:'The title, the full prayer and, at the end, the link to the app. Silent petition pauses are not sent.',close:'Close'}};
const L=()=>T[st.lang],P=()=>D[st.id][st.lang];
/* Texto que se comparte: título, partes (sin pausas), pie con enlaces. */
function shareText(){const p=P(),l=L();
 const body=p.parts.filter(x=>!x.pause).map(x=>x.t.replace(/\n\s+/g,'\n').trim()).join('\n');
 return `${p.title}\n\n${body}\n\n— ${l.footer}\n${WEB}`+(st.apk?`\n${l.apkLine} ${APK}`:'')}
let tt=null;
function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,2600)} // solo para ocultar el aviso; no afecta a ninguna oración
async function copy(txt){try{await navigator.clipboard.writeText(txt);return true}catch(e){
 const a=document.createElement('textarea');a.value=txt;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();return ok}}
async function share(){const txt=shareText(),title=P().title;
 // 1) APK: puente nativo (se añadirá al integrar: Android.share(título, texto) → ACTION_SEND con selector)
 if(window.Android&&typeof Android.share==='function'){try{Android.share(title,txt);return}catch(e){}}
 // 2) Navegador con menú de compartir del sistema
 if(navigator.share){try{await navigator.share({title,text:txt});return}catch(e){if(e&&e.name==='AbortError')return}}
 // 3) Ordenador / sin menú: copiar
 toast(await copy(txt)?L().copied:L().fail)}
function paint(){const l=L(),p=P(),h=document.documentElement;h.lang=st.lang;h.dataset.theme=st.theme;
 document.querySelector('meta[name=theme-color]').content=st.theme==='dark'?'#18251f':'#f8f5ed';
 $('themeToggle').textContent=st.theme==='dark'?'☀':'☾';
 document.querySelectorAll('.langToggle button').forEach(b=>b.setAttribute('aria-pressed',b.lang===st.lang));
 ['pvTitle','pvSub','dbgSum','dbgPrayer','dbgApk','dbgLangL','dbgThemeL','showMsg','eyebrow','msgH','msgLead'].forEach(k=>$(k).textContent=l[k]);
 $('msgClose').textContent=l.close;$('backTxt').textContent=l.back;
 [...$('dbgApkSel').options].forEach((o,i)=>o.textContent=l.apkOpt[i]);$('dbgApkSel').value=st.apk?'1':'0';
 const s=$('dbgPrayerSel');s.innerHTML='';Object.keys(D).forEach(id=>s.add(new Option(D[id][st.lang].title,id)));s.value=st.id;
 $('readerTitle').textContent=p.title;$('readerMeta').textContent=l.meta(p.minutes);
 $('share').setAttribute('aria-label',l.share);$('share').title=l.share;
 $('favorite').textContent=st.fav?'♥':'♡';$('favorite').setAttribute('aria-label',st.fav?l.favOn:l.favOff);
 const a=$('passages');a.innerHTML='';p.parts.forEach(x=>{const e=document.createElement('p');if(x.pause)e.className='petition';e.textContent=x.t;a.append(e)});
 $('msgPre').textContent=shareText()}
$('share').onclick=share;
$('favorite').onclick=()=>{st.fav=!st.fav;paint()};
document.querySelectorAll('.langToggle button').forEach(b=>b.onclick=()=>{st.lang=b.lang;paint()});
$('themeToggle').onclick=()=>{st.theme=st.theme==='dark'?'light':'dark';paint()};
$('dbgPrayerSel').onchange=e=>{st.id=e.target.value;paint()};
$('dbgApkSel').onchange=e=>{st.apk=e.target.value==='1';paint()};
$('showMsg').onclick=()=>$('msgDlg').showModal();$('msgClose').onclick=()=>$('msgDlg').close();
paint();
if(Q.get('msg')==='1')$('msgDlg').showModal();
})();
