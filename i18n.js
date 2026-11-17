'use strict';
// Mis oraciones v7: idioma de la interfaz (ES/EN). Clave nueva: moLang. No toca ninguna otra clave.
(()=>{
const LANG=(()=>{try{return localStorage.getItem('moLang')==='en'?'en':'es'}catch{return 'es'}})();
window.MO_LANG=LANG;document.documentElement.lang=LANG;
window.moT=(es,en)=>LANG==='en'?en:es;
window.moSetLang=l=>{try{localStorage.setItem('moLang',l==='en'?'en':'es')}catch{}try{speechSynthesis.cancel()}catch{}location.reload()};
// Selector ES | EN (cabecera de inicio y menú)
function toggle(){const d=document.createElement('div');d.className='langToggle';d.setAttribute('role','group');d.setAttribute('aria-label',LANG==='en'?'Language':'Idioma');d.dataset.noi18n='1';
 for(const l of ['es','en']){const b=document.createElement('button');b.type='button';b.textContent=l.toUpperCase();b.lang=l;b.setAttribute('aria-pressed',String(l===LANG));b.title=l==='en'?'English':'Español';b.onclick=()=>{if(l!==LANG)moSetLang(l)};d.append(b)}return d}
function mountToggle(){const h=document.querySelector('#home header');if(h&&!h.querySelector('.langToggle')){const t=toggle();const s=document.getElementById('settings');s?s.before(t):h.append(t)}
 const dh=document.querySelector('#drawer .drawerHead');if(dh&&!dh.querySelector('.langToggle'))dh.append(toggle())}
window.moMountLangToggle=mountToggle;
document.addEventListener('DOMContentLoaded',()=>{mountToggle();setTimeout(mountToggle,500)});
if(LANG!=='en')return;
const D=window.MO_I18N||{},P=window.MO_I18N_RX||[];
const SKIP='#passages,#readerTitle,[data-noi18n],script,style,textarea,#gospelText';
function tr(s){const t=s.trim();if(!t)return null;const k=t.replace(/[\s\u00a0]+/g,' ');let r=D[k];if(r===undefined){for(const [rx,f] of P){if(rx.test(k)){r=k.replace(rx,f);break}}}if(r!==undefined&&t.includes('\u00a0'))r=r.replace(' ',' \u00a0 ');if(r===undefined||r===t)return null;return s.replace(t,r)}
function doText(n){const p=n.parentElement;if(!p||p.closest(SKIP))return;const r=tr(n.data);if(r!==null)n.data=r}
const ATTR=['placeholder','aria-label','title','label'];
function doEl(el){if(el.closest(SKIP))return;for(const a of ATTR){const v=el.getAttribute(a);if(v){const r=tr(v);if(r!==null)el.setAttribute(a,r)}}}
function walk(root){if(root.nodeType===3)return doText(root);if(root.nodeType!==1)return;if(root.closest&&root.closest(SKIP))return;doEl(root);
 const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeType===1&&n.matches(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 let n;while(n=w.nextNode()){n.nodeType===3?doText(n):doEl(n)}}
window.moTranslate=walk;
const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doEl(m.target);else m.addedNodes.forEach(walk)}});
mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});
walk(document.documentElement);
const tt=()=>{const r=tr(document.title);if(r)document.title=r};tt();document.addEventListener('DOMContentLoaded',()=>{walk(document.body);tt()});
})();
