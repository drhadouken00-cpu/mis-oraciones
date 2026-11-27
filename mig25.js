'use strict';
// Mis oraciones v3.1 (25): sin oraciones repetidas en la lista.
// · Las copias personales cuyo texto es EXACTAMENTE el de una oración de la app (sin contar espacios) se ocultan de la lista;
//   siguen guardadas en «custom» (nada se borra) y sus listas / favoritas / alarmas pasan a apuntar a la oración de la app,
//   en el mismo orden. El mapa copia → oración de la app se guarda en la clave nueva «dupAlias»; la marca de hecho, en «migDup25».
// · «Ángelus» antiguo (oracion-10) queda oculto y apunta al Ángelus único («angelus»). Solo se oculta en la vista: no se borra nada.
(()=>{try{
const STATIC={'oracion-10':'angelus'};
const J=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
let alias=J('dupAlias');if(!alias||typeof alias!=='object'||Array.isArray(alias))alias={};
const A=()=>Object.assign({},alias,STATIC);
const baseRefresh=refreshLibrary;
window.refreshLibrary=refreshLibrary=function(){baseRefresh();const m=A();prayers=prayers.map(p=>{const t=m[p.id];return t&&t!==p.id&&prayers.some(q=>q.id===t)?Object.assign({},p,{hidden:true}):p})};
window.moCanonId=id=>({'angelus-diario':'angelus','regina-caeli':'angelus'})[id]||id;
if(localStorage.getItem('migDup25')===null){
 const T={"365aeb9b":"oracion-1","e1727ca9":"oracion-2","32b05985":"oracion-3","8ac6eee8":"oracion-4","559e294f":"oracion-5","f6f8f1f9":"oracion-6","d17489ac":"oracion-7","2c5b1465":"oracion-8","beab246e":"oracion-9","256e720e":"oracion-10","1f0ba0f8":"oracion-11","d84bbe1a":"oracion-12","ebcf1b42":"oracion-13","f25fc434":"oracion-14","bf05b5d0":"oracion-15","a7e3d0b9":"oracion-16","fd0df200":"oracion-17","3e55503e":"oracion-18","5277b1b3":"oracion-19","82dc266d":"oracion-20","e27f2d26":"oracion-21","f54025c7":"oracion-22","390cdfb6":"oracion-23","c573eb65":"oracion-24","4fcac2ae":"rosario-gozosos","1a682896":"rosario-dolorosos","5e82b390":"rosario-gloriosos","264f69eb":"rosario-luminosos","fcbf2ec7":"coronilla-misericordia","286e2671":"conversacion-jesus-misericordia","4c2a7ea5":"gloria","1a1df29e":"credo","9b859850":"salve","40e71da2":"letanias","b0604162":"consagracion-santisima-virgen","d890e41f":"rosario-completo","a5cbc7c7":"coronilla-sangre","cc258d19":"angelus","425fd07c":"magnificat","25520a51":"vade-retro-satana","baa900b8":"noche-gracias-senor","353ce62c":"noche-perdon-senor","d00a3acf":"noche-oracion-para-la-noche","2ccc23e0":"noche-con-dios-me-acuesto","b37aa768":"noche-guardanos-senor","56bea86":"noche-antes-de-dormir","24f2f5ab":"noche-cuatro-esquinitas","548bf6ef":"salmo-91"};
 const N=s=>String(s).replace(/\s+/g,' ').trim();
 const H=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16)};
 const overridden=new Set((window.PRAYERS||[]).map(p=>p.id).filter(id=>custom.some(c=>c&&c.id===id)));
 let nAlias=0;
 for(const p of (Array.isArray(custom)?custom:[])){
  if(!p||typeof p.id!=='string'||p.id==='evangelio-del-dia'||!Array.isArray(p.parts)||!p.parts.length||!p.parts.every(x=>x&&typeof x.text==='string'))continue;
  const t=T[H(N(p.parts.map(x=>x.text).join('\n')))];
  if(t&&t!==p.id&&!overridden.has(t)&&!alias[p.id]){alias[p.id]=t;nAlias++}}
 const m=A(),map=id=>m[id]||id;
 const rem=a=>{if(!Array.isArray(a))return a;const out=[],seen=new Set;for(const id of a){const n=typeof id==='string'?map(id):id;if(typeof n==='string'){if(seen.has(n))continue;seen.add(n)}out.push(n)}return out};
 let ch=false;
 for(const k of ['day','night']){const r=rem(lists[k]);if(JSON.stringify(r)!==JSON.stringify(lists[k])){lists[k]=r;ch=true}}
 if(ch)saveLists();
 const f=rem(favorites);if(JSON.stringify(f)!==JSON.stringify(favorites)){favorites=f;localStorage.favorites=JSON.stringify(f)}
 try{let al=null;try{if(window.AndroidAlarms){const g=JSON.parse(AndroidAlarms.get());if(Array.isArray(g)&&g.length)al=g}}catch(e){}
  if(!al)al=J('alarms');
  if(Array.isArray(al)){const na=al.map(a=>a&&typeof a.id==='string'&&m[a.id]?Object.assign({},a,{id:m[a.id]}):a);
   if(JSON.stringify(na)!==JSON.stringify(al)){localStorage.alarms=JSON.stringify(na);if(window.AndroidAlarms)AndroidAlarms.set(JSON.stringify(na))}}}catch(e){}
 try{const s=J('playlistSession');if(s&&Array.isArray(s.ids)){const r=rem(s.ids);if(JSON.stringify(r)!==JSON.stringify(s.ids)){s.ids=r;localStorage.playlistSession=JSON.stringify(s)}}}catch(e){}
 if(nAlias)localStorage.dupAlias=JSON.stringify(alias);
 if(custom.length)localStorage.setItem('migDup25',String(nAlias));
}
refreshLibrary();try{renderList()}catch(e){}
}catch(e){}})();
