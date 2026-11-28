'use strict';
// Mis oraciones v3.1 (27): botón Compartir.
// · Junto al corazón de favoritas en la pantalla de lectura, y en las pantallas del Rosario, las coronillas, el Ángelus y la Conversación de 30 días.
// · Envía como texto: título, la oración completa (sin las pausas de petición) y «— Rezada con Mis oraciones» + el enlace de la web.
// · Orden: APK → AndroidAlarms.shareText (menú de compartir de Android) · navegador → navigator.share · si no hay → copiar y avisar.
// · No guarda nada ni toca ninguna clave.
(()=>{
const EN=window.MO_LANG==='en',T=(es,en)=>EN?en:es,$=id=>document.getElementById(id);
const WEB='https://drhadouken00-cpu.github.io/mis-oraciones/';
const ICON='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/></svg>';
const cur=()=>(typeof current!=='undefined'&&current)?current:null;
function text(p){const body=p.parts.filter(x=>!x.pause).map(x=>String(x.text||'').replace(/\n[ \t]+/g,'\n').trim()).filter(Boolean).join('\n');
 return `${p.title}\n\n${body}\n\n— ${T('Rezada con Mis oraciones','Prayed with Mis oraciones')}\n${WEB}`}
const toast=m=>{try{if(window.MO&&MO.toast){MO.toast(m);return}}catch(e){}alert(m)};
async function copy(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();return ok}}
async function share(p){p=p||cur();if(!p)return;const t=text(p);
 if(window.AndroidAlarms&&typeof AndroidAlarms.shareText==='function'){try{AndroidAlarms.shareText(p.title,t);return}catch(e){}}
 if(navigator.share){try{await navigator.share({title:p.title,text:t});return}catch(e){if(e&&e.name==='AbortError')return}}
 toast(await copy(t)?T('Oración copiada. Pégala donde quieras.','Prayer copied. Paste it wherever you like.'):T('No se ha podido compartir.','Could not share.'))}
function btn(cls){const b=document.createElement('button');b.type='button';b.className=cls+' moShare';b.innerHTML=ICON;const l=T('Compartir oración','Share prayer');b.setAttribute('aria-label',l);b.title=l;b.dataset.noi18n='1';b.onclick=e=>{e.stopPropagation();share()};return b}
// Pantalla de lectura: al lado del corazón
const fav=$('favorite');
if(fav&&!$('shareBtn')){const b=btn('icon');b.id='shareBtn';const w=document.createElement('span');w.className='readerActions';fav.before(w);w.append(b,fav)}
// Pantallas animadas: antes del botón «Texto» de su barra superior
const SPOTS=['#raView .raTextBtn','#saView .saTextBtn','#miView .saTextBtn','#angView .avTextBtn','#c30View .avTextBtn'];
function place(){for(const s of SPOTS){const t=document.querySelector(s);if(t&&!(t.previousElementSibling&&t.previousElementSibling.classList.contains('moShare')))t.before(btn(t.className.split(' ')[0]+'Share'))}}
place();try{new MutationObserver(place).observe(document.body,{childList:true,subtree:true})}catch(e){}
window.MO=Object.assign(window.MO||{},{sharePrayer:share,shareText:text});
})();
