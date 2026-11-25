'use strict';
// Mis oraciones v14: recordatorio amable de copia de seguridad para que nadie pierda sus oraciones propias.
// Claves NUEVAS (no toca ni renombra ninguna existente): lastBackupAt, backupSig, personalSig, personalChangedAt,
// backupSnoozeUntil, backupNudgeDay. Usa la exportación de siempre (backup.js); en Android, la del sistema.
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es;
const $=id=>document.getElementById(id);
const LS={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,String(v))}catch{}}};
const num=k=>Number(LS.get(k))||0;
const DAY=864e5,GID='evangelio-del-dia';
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36)+':'+s.length}
function mine(){let c=[],l={day:[],night:[]},it=[];
 try{c=(typeof custom!=='undefined'&&Array.isArray(custom)?custom:[]).filter(p=>p&&p.id!==GID)}catch{}
 try{l=typeof lists!=='undefined'&&lists?lists:l}catch{}
 try{it=JSON.parse(LS.get('intentions')||'[]').filter(s=>typeof s==='string'&&s.trim())}catch{}
 return {c,l,it}}
function sigs(){const {c,l,it}=mine();const pc=hash(JSON.stringify(c));
 return {all:hash(JSON.stringify([c,l.day||[],l.night||[],it])),prayers:pc,has:c.length>0||it.length>0||(l.day||[]).length>0||(l.night||[]).length>0,n:c.length}}
let last=sigs();
// Primera vez con v14: si ya hay datos tuyos, cuentan como «cambiados» para proponer la primera copia.
if(!LS.get('personalSig')){LS.set('personalSig',last.all);if(last.has&&!LS.get('personalChangedAt'))LS.set('personalChangedAt',Date.now())}
else if(LS.get('personalSig')!==last.all){LS.set('personalSig',last.all);LS.set('personalChangedAt',Date.now())}

// ---------- Marca de copia hecha ----------
function markBackup(){const s=sigs();LS.set('lastBackupAt',Date.now());LS.set('backupSig',s.all);hide();renderInfo()}
const bs=$('backupStatus');
if(bs)new MutationObserver(()=>{const t=bs.textContent||'';if(/^Copia (descargada|guardada)|^Backup (downloaded|saved)/.test(t))markBackup()}).observe(bs,{childList:true,characterData:true,subtree:true});
const sh=$('shareBackup');if(sh)sh.addEventListener('click',()=>setTimeout(markBackup,300));

// ---------- «Última copia» en Ajustes y en Copia de seguridad ----------
function fmt(ts){try{return new Date(ts).toLocaleDateString(window.MO_LANG==='en'?'en-GB':'es-ES',{day:'numeric',month:'long',year:'numeric'})}catch{return new Date(ts).toISOString().slice(0,10)}}
function infoText(){const t=num('lastBackupAt');return t?T('Última copia: ','Last backup: ')+fmt(t):T('Última copia: todavía ninguna','Last backup: none yet')}
function renderInfo(){for(const e of document.querySelectorAll('.bkLast'))e.textContent=infoText()}
const mkInfo=()=>{const p=document.createElement('p');p.className='hint bkLast';p.setAttribute('role','status');p.textContent=infoText();return p};
const ve=$('v8Export');if(ve&&ve.parentNode)ve.parentNode.after(mkInfo());
const eb=$('exportBackup');if(eb)eb.after(mkInfo());
if(eb)eb.addEventListener('click',()=>{if(!(window.AndroidAlarms&&AndroidAlarms.exportBackup))setTimeout(markBackup,150)});

// ---------- Aviso ----------
let box=null;
function busy(){return document.querySelector('dialog[open]')||document.body.classList.contains('raOn')||document.body.classList.contains('saOn')||document.body.classList.contains('miOn')}
function hide(){if(box){box.remove();box=null}}
function show(reason){
 if(box)return;
 if(busy()){setTimeout(()=>check(reason),4000);return}
 LS.set('backupNudgeDay',today());
 const n=sigs().n;
 box=document.createElement('div');box.className='bkNudge';box.setAttribute('role','status');box.dataset.reason=reason;
 box.innerHTML=`<p><strong>${T('Guarda una copia de lo tuyo','Save a copy of your things')}</strong><span></span></p><div class="bkRow"><button type="button" class="bkSave">⇩ ${T('Guardar copia','Save backup')}</button><button type="button" class="bkLater secondary">${T('Ahora no','Not now')}</button></div>`;
 box.querySelector('span').textContent=n?T(`Así no pierdes ${n===1?'tu oración propia':'tus '+n+' oraciones propias'} si cambias de móvil o borras el navegador.`,`So you never lose your ${n===1?'own prayer':n+' own prayers'} if you change phone or clear the browser.`):T('Tus listas e intenciones quedan a salvo en un archivo.','Your lists and intentions stay safe in a file.');
 box.querySelector('.bkSave').onclick=()=>{hide();if(window.MO&&MO.openBackup){MO.openBackup();setTimeout(()=>$('exportBackup')?.click(),60)}};
 box.querySelector('.bkLater').onclick=()=>{LS.set('backupSnoozeUntil',Date.now()+7*DAY);hide()};
 document.body.append(box);
}
// reason: 'start' (al abrir) o 'edit' (justo después de crear/editar una oración propia)
function check(reason){
 const s=sigs();if(!s.has){hide();return false}
 const now=Date.now(),lb=num('lastBackupAt'),changed=num('personalChangedAt');
 if(LS.get('backupNudgeDay')===today())return false;
 if(reason==='edit'){if(lb&&now-lb<DAY)return false;show('edit');return true}
 if(now<num('backupSnoozeUntil'))return false;
 if(!lb||(now-lb>=14*DAY&&changed>lb)){show('start');return true}
 return false}
function poll(){const s=sigs();
 if(s.all!==last.all){LS.set('personalSig',s.all);LS.set('personalChangedAt',Date.now());const prayerEdit=s.prayers!==last.prayers;last=s;if(prayerEdit)setTimeout(()=>check('edit'),1200)}
 else last=s}
setInterval(poll,2500);
setTimeout(()=>check('start'),2500);
window.MO=Object.assign(window.MO||{},{backupReminder:{check,state:()=>({sig:sigs(),lastBackupAt:num('lastBackupAt'),snooze:num('backupSnoozeUntil'),day:LS.get('backupNudgeDay'),shown:!!box,reason:box?.dataset.reason||null}),hide}});
})();
