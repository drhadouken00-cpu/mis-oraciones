'use strict';
// Copia de seguridad: exportar/importar (mismo formato en Android y en la web).
(()=>{
const AN=!!window.AndroidAlarms&&!!window.AndroidAlarms.exportBackup;
const GID='evangelio-del-dia';
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function alarmsNow(){try{if(window.AndroidAlarms){const a=JSON.parse(AndroidAlarms.get());if(Array.isArray(a)&&a.length)return a}}catch{}return stored('alarms',[])}
function build(){return {app:'mis-oraciones',format:1,exported:new Date().toISOString(),
 prayers:custom.filter(p=>p.id!==GID),favorites,lists,alarms:alarmsNow(),streak:stored('streak',null)}}
document.body.append(el(`<dialog id="backupDialog"><h2>Copia de seguridad</h2>
<p class="hint">Guarda en un archivo tus oraciones añadidas, favoritas, listas «Mi día» y «Mi noche», alarmas y racha. Sirve para pasarlas entre la app de Android y la versión web.</p>
<button type="button" id="exportBackup">⇩ &nbsp; Exportar mis oraciones</button>
<button type="button" id="shareBackup" class="secondary">Compartir copia…</button>
<button type="button" id="importBackup" class="secondary">⇧ &nbsp; Importar desde archivo</button>
<input type="file" id="importFile" accept=".json,.xml,.txt,.log,.ldb,application/json,text/*,*/*" hidden>
<details><summary class="hint">…o pega aquí el contenido</summary><label class="setting">Texto de la copia<textarea id="importText" rows="5" placeholder='{"app":"mis-oraciones", …}'></textarea></label><button type="button" id="importPaste" class="secondary">Importar texto pegado</button></details>
<p id="backupStatus" class="hint" role="status"></p>
<button type="button" id="closeBackup" class="secondary">Volver</button></dialog>`));
const status=t=>$('backupStatus').textContent=t;
let needsReload=false;
function open(){status('');$('backupDialog').showModal()}
$('closeBackup').onclick=()=>{$('backupDialog').close();if(needsReload)location.reload()};
$('shareBackup').hidden=!(AN||navigator.share);
$('exportBackup').onclick=()=>{
 const json=JSON.stringify(build(),null,1),name='mis-oraciones-'+today()+'.json';
 if(AN){AndroidAlarms.exportBackup(json,name);watch('Elige dónde guardar el archivo…');return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 status('Copia descargada: '+name+' ('+build().prayers.length+' oraciones propias).');
};
$('shareBackup').onclick=async()=>{const json=JSON.stringify(build(),null,1),name='mis-oraciones-'+today()+'.json';
 if(AN){AndroidAlarms.shareBackup(json);return}
 try{const f=new File([json],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Mis oraciones'});else await navigator.share({title:'Mis oraciones',text:json})}catch{}};
$('importBackup').onclick=()=>{if(AN){AndroidAlarms.pickImport();watch('Elige el archivo de copia…');return}$('importFile').value='';$('importFile').click()};
$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const buf=new Uint8Array(await f.arrayBuffer());doImport(new TextDecoder('utf-8').decode(buf))};
$('importPaste').onclick=()=>doImport($('importText').value);
let timer=null;
function watch(msg){status(msg);clearInterval(timer);let n=0;timer=setInterval(()=>{const s=AndroidAlarms.backupStatus();
 if(s==='saved'){clearInterval(timer);status('Copia guardada ✓')}
 else if(s==='ok'){clearInterval(timer);takeNative()}
 else if(s==='cancel'){clearInterval(timer);status('Cancelado.')}
 else if(s==='error'){clearInterval(timer);status('No se ha podido completar. Inténtalo de nuevo.')}
 else if(++n>1200)clearInterval(timer)},500)}
function latin1ToUtf8(s){const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return new TextDecoder('utf-8').decode(b)}
function takeNative(){const raw=AndroidAlarms.takeImport();if(raw)doImport(latin1ToUtf8(raw))}
function unxml(s){return s.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi,(m,n)=>String.fromCharCode(parseInt(n,16))).replace(/&amp;/g,'&')}
// Acepta: copia de Mis oraciones, lista JSON de oraciones, {library:…}, prayers.xml (shared_prefs) o un archivo de Local Storage (leveldb).
function parse(text){
 const out={prayers:[],favorites:[],lists:{day:[],night:[]},alarms:[],streak:null,kind:''};
 const t=text.replace(/^\uFEFF/,'').trim();
 let j=null;try{j=JSON.parse(t)}catch{}
 if(j&&j.app==='mis-oraciones'){Object.assign(out,{prayers:j.prayers||[],favorites:j.favorites||[],lists:j.lists||out.lists,alarms:j.alarms||[],streak:j.streak||null,kind:'copia de seguridad'});return out}
 if(Array.isArray(j)){out.prayers=j;out.kind='lista de oraciones';return out}
 if(j&&j.library){out.prayers=typeof j.library==='string'?JSON.parse(j.library):j.library;out.kind='biblioteca';return out}
 const x=/<string name="library">([\s\S]*?)<\/string>/.exec(t);
 if(x){out.prayers=JSON.parse(unxml(x[1]));out.kind='prayers.xml de la app original';return out}
 const z=text.replace(/\u0000/g,'');let found=false;
 const lm=[...z.matchAll(/\{"day":\[[^\]]*\],"night":\[[^\]]*\]\}/g)];if(lm.length){out.lists=JSON.parse(lm[lm.length-1][0]);found=true}
 const fm=[...z.matchAll(/favorites[\s\S]{0,6}?(\[(?:"[^"]*",?)*\])/g)];if(fm.length){try{out.favorites=JSON.parse(fm[fm.length-1][1]);found=true}catch{}}
 const cm=/custom[\s\S]{0,6}?(\[\{"id":[\s\S]*?\}\]\}?\])/.exec(z);if(cm){try{out.prayers=JSON.parse(cm[1]);found=true}catch{}}
 if(found){out.kind='datos de Local Storage';return out}
 throw new Error('formato');
}
function valid(p){return p&&typeof p.id==='string'&&p.id&&typeof p.title==='string'&&p.title.trim()&&Array.isArray(p.parts)&&p.parts.length&&p.parts.every(x=>x&&typeof x.text==='string')}
const sig=p=>p.title.trim()+'\n'+p.parts.map(x=>x.text).join('\n');
function doImport(text){
 let d;try{d=parse(text)}catch{status('No reconozco este archivo. Usa una copia exportada desde Mis oraciones o el archivo prayers.xml.');return}
 const before=custom.length,sigs=new Set(custom.map(sig)),ids=new Set(prayers.map(p=>p.id)),idMap={};let added=0,same=0;
 const merged=custom.slice();
 for(const p of (d.prayers||[]).filter(valid)){if(p.id===GID)continue;
  if(sigs.has(sig(p))){same++;const ex=merged.find(e=>sig(e)===sig(p));if(ex)idMap[p.id]=ex.id;continue}
  const q={id:p.id,title:p.title.trim(),parts:p.parts.map(x=>{const o={text:x.text};if(x.speech)o.speech=x.speech;if(x.pause)o.pause=true;return o}),minutes:Number(p.minutes)||Math.max(1,Math.round(p.parts.map(x=>x.text).join(' ').split(/\s+/).length/115))};
  if(ids.has(q.id)){q.id='personal-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  idMap[p.id]=q.id;ids.add(q.id);sigs.add(sig(q));merged.push(q);added++}
 if(merged.length>500){status('Demasiadas oraciones (máximo 500).');return}
 let ok=true;try{if(native)ok=Android.saveLibrary(JSON.stringify(merged));else localStorage.custom=JSON.stringify(merged)}catch{ok=false}
 if(!ok){status('No se han podido guardar las oraciones importadas.');return}
 custom=merged;refreshLibrary();
 const known=new Set(prayers.map(p=>p.id)),map=id=>idMap[id]||id;
 let favAdded=0;for(const id of (d.favorites||[]).map(map))if(known.has(id)&&!favorites.includes(id)){favorites.push(id);favAdded++}
 localStorage.favorites=JSON.stringify(favorites);
 let listAdded=0;for(const k of ['day','night'])for(const id of ((d.lists||{})[k]||[]).map(map))if(known.has(id)&&!lists[k].includes(id)){lists[k].push(id);listAdded++}
 saveLists();
 const cur=alarmsNow();let alAdded=0;for(const a of d.alarms||[])if(a&&/^\d\d:\d\d$/.test(a.time)&&!cur.some(c=>c.time===a.time&&c.id===map(a.id))&&cur.length<20){cur.push({time:a.time,id:map(a.id),title:a.title,on:a.on!==false});alAdded++}
 if(alAdded){localStorage.alarms=JSON.stringify(cur);if(window.AndroidAlarms)AndroidAlarms.set(JSON.stringify(cur))}
 if(d.streak&&d.streak.count){const s=stored('streak',{last:'',count:0});if((d.streak.last||'')>(s.last||''))localStorage.streak=JSON.stringify({...d.streak,best:Math.max(d.streak.best||0,s.best||0,s.count||0)});else{s.best=Math.max(s.best||0,d.streak.best||0,d.streak.count||0);localStorage.streak=JSON.stringify(s)}}
 renderList();needsReload=alAdded>0;
 status('Importado ('+d.kind+'): '+added+' oraciones nuevas'+(same?', '+same+' ya estaban':'')+', '+favAdded+' favoritas, '+listAdded+' en tus listas'+(alAdded?', '+alAdded+' alarmas':'')+'.');
}
window.MO.openBackup=open;window.MO.importText=doImport;
// Botón también en Ajustes
const sb=el('<button id="openBackupSettings" class="secondary">⇅ &nbsp; Copia de seguridad</button>');sb.onclick=()=>{$('settingsDialog').close();open()};$('closeSettings').before(sb);
const baseHome=goHome;window.goHome=goHome=function(){if($('backupDialog').open){$('closeBackup').click();return}baseHome()};
if(MO.startId==='__import'&&AN){open();takeNative()}
})();
