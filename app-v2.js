'use strict';
const $=id=>document.getElementById(id),native=!!window.Android;
function stored(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function nativeJSON(method,fallback){try{return JSON.parse(Android[method]())}catch{return fallback}}
let custom=native?nativeJSON('library',[]):stored('custom',[]);
if(!Array.isArray(custom))custom=[];
let prayers=[],current=null,filter='all',state={},editing=null;
let favorites=stored('favorites',[]),lists=stored('lists',{day:[],night:[]});
let rate=Number(localStorage.rate)||.85,repeat=localStorage.repeat==='true',gap=Number(localStorage.gap??3),timer=0;
let checkpoint=native?nativeJSON('savedProgress',{}):stored('progress',{});
function refreshLibrary(){const map=new Map(window.PRAYERS.map(p=>[p.id,p]));custom.forEach(p=>map.set(p.id,p));prayers=[...map.values()]}
function saveLists(){localStorage.lists=JSON.stringify(lists)}
function clean(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function listPrayers(kind){return (lists[kind]||[]).map(id=>prayers.find(p=>p.id===id)).filter(Boolean)}
function renderList(){
 const isList=filter==='day'||filter==='night',query=clean($('search').value);
 const items=(isList?listPrayers(filter):prayers).filter(p=>!p.hidden&&(filter!=='favorites'||favorites.includes(p.id))&&clean(p.title).includes(query));window.visibleItems=items;
 $('count').textContent=prayers.filter(p=>!p.hidden).length+' oraciones';$('prayerList').replaceChildren();
 $('playList').hidden=!isList||!listPrayers(filter).length;$('listHint').hidden=!isList;
 for(const p of items){
   const row=document.createElement('div');row.className='libraryItem';
   const b=document.createElement('button');b.className='prayerRow';b.innerHTML='<span class="mark" aria-hidden="true">✧</span><span class="name"><strong></strong><small></small></span><span class="arrow" aria-hidden="true">›</span>';
   b.querySelector('strong').textContent=p.title;b.querySelector('small').textContent='≈ '+p.minutes+' min · Lectura y audio'+(favorites.includes(p.id)?' · ♥':'');b.onclick=()=>openPrayer(p);row.append(b);const quick=document.createElement('button');quick.className='rowPlay';quick.textContent='▶';quick.setAttribute('aria-label','Escuchar ahora '+p.title);quick.onclick=()=>{openPrayer(p);play()};row.append(quick);
   if(isList){const order=document.createElement('div');order.className='reorder';for(const [symbol,delta,label] of [['↑',-1,'Subir'],['↓',1,'Bajar']]){const button=document.createElement('button');button.textContent=symbol;button.setAttribute('aria-label',label+' '+p.title);const index=lists[filter].indexOf(p.id);button.disabled=index+delta<0||index+delta>=lists[filter].length;button.onclick=()=>{const i=lists[filter].indexOf(p.id);[lists[filter][i],lists[filter][i+delta]]=[lists[filter][i+delta],lists[filter][i]];saveLists();renderList()};order.append(button)}row.append(order)}
   $('prayerList').append(row);
 }
 if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent=isList?'Tu lista está vacía. Abre una oración y marca «Mi '+(filter==='night'?'noche':'día')+'», o añade una nueva.':filter==='favorites'?'Marca el corazón de una oración para guardarla aquí.':'No hay oraciones con ese nombre.';$('prayerList').append(p)}
 updateResume();
}
function openPrayer(p){
 current=p;$('home').hidden=true;$('reader').hidden=false;$('readerTitle').textContent=p.title;$('readerMeta').textContent='≈ '+p.minutes+' minutos · Voz de tu teléfono';$('passages').replaceChildren();
 p.parts.forEach((part,i)=>{const el=document.createElement('p');el.textContent=part.text;el.id='part-'+i;if(part.pause)el.className='petition';$('passages').append(el)});
 $('inDay').checked=lists.day.includes(p.id);$('inNight').checked=lists.night.includes(p.id);favoriteUI();showPlayer();updatePlayer();window.scrollTo(0,0);
}
function showPlayer(){$('player').hidden=false;document.body.classList.add('hasPlayer')}
function goHome(){if($('editorDialog').open){$('editorDialog').close();return}if($('settingsDialog').open){$('settingsDialog').close();return}$('home').hidden=false;$('reader').hidden=true;renderList();window.scrollTo(0,0)}
function favoriteUI(){$('favorite').textContent=favorites.includes(current.id)?'♥':'♡';$('favorite').setAttribute('aria-label',favorites.includes(current.id)?'Quitar de favoritas':'Guardar en favoritas')}
function startQueue(ids,index=0){
 if(!ids.length)return;
 TTS.play(ids,index);
}
function play(){if(current)startQueue([current.id])}
function updateResume(){
 if(native)checkpoint=nativeJSON('savedProgress',{});
 const p=prayers.find(p=>p.id===checkpoint.id);$('resumeSaved').hidden=!p||!!state.playing;
 if(p)$('resumeSaved').textContent='▶ Retomar: '+p.title;
}
function updatePlayer(){
 const active=prayers.find(p=>p.id===state.id),hasSession=!!active&&(state.playing||state.paused),p=hasSession?active:current;
 if(!p)return;
 $('playerTitle').textContent=p.title;const playing=hasSession&&state.playing,paused=hasSession&&state.paused;
 $('toggle').textContent=playing?'Ⅱ':'▶';$('toggle').setAttribute('aria-label',playing?'Pausar':paused?'Continuar':'Escuchar oración');
 const queue=state.queueTotal>1?' · Oración '+(state.queuePosition+1)+' de '+state.queueTotal:'';
 $('status').textContent=hasSession&&state.petition?'Haz tu petición. Pulsa ▶ para continuar.':playing?(state.waiting?'Un momento de silencio…':state.ready?'Escuchando · Pasaje '+(state.index+1)+' de '+state.total+queue:'Preparando la voz…'):paused?'En pausa':'Preparada para escuchar';
 $('progressFill').style.width=(hasSession&&state.total?Math.min(100,state.index/state.total*100):0)+'%';$('repeat').setAttribute('aria-pressed',String(repeat));
 $('error').hidden=!state.error;$('error').textContent=state.error||'';
 document.querySelectorAll('#passages p').forEach((p,i)=>p.classList.toggle('active',current?.id===state.id&&hasSession&&i===state.index));updateResume();
}
function edit(p=null){editing=p;$('editorHeading').textContent=p?'Editar oración':'Añadir oración';$('editorTitle').value=p?.title||'';$('editorText').value=p?p.parts.map(part=>part.pause?'[PETICIÓN]':part.text).join('\n\n'):'';$('editorList').value=filter==='night'||filter==='day'?filter:'';$('editorStatus').textContent='';$('editorDialog').showModal()}
function savePrayer(event){
 event.preventDefault();const title=$('editorTitle').value.trim(),text=$('editorText').value.trim();
 if(!title||!text){$('editorStatus').textContent='Escribe el título y el texto de la oración.';return}
 if(/\b(?:rezar|se\s+rezan?)\s+(?:un[ao]?|el|la|los|las|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+|ave|padre|gloria|credo|salve|oraci[oó]n)\b|\brepetir\s+(?:\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|la|el)\b/i.test(text)){$('editorStatus').textContent='Quedan indicaciones de rezo o repetición. Completa el texto o sustitúyelas por [PETICIÓN] si necesitas una pausa.';return}
 const parts=prayerTools.parts(text);
 if(!parts.length||parts.every(p=>p.pause)){$('editorStatus').textContent='Añade al menos un pasaje para leer.';return}
 const p={id:editing?.id||'personal-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),title,parts,minutes:Math.max(1,Math.round(text.split(/\s+/).length/115))};
 const updated=[...custom.filter(entry=>entry.id!==p.id),p];
 let ok=true;
 try{if(native)ok=Android.saveLibrary(JSON.stringify(updated));else localStorage.custom=JSON.stringify(updated)}catch{ok=false}
 if(!ok){$('editorStatus').textContent='No se ha podido guardar. Conserva el texto y vuelve a intentarlo.';return}
 if(state.id===p.id&&(state.playing||state.paused)){TTS.stop();state={}}
 custom=updated;refreshLibrary();const destination=$('editorList').value;if(destination&&!lists[destination].includes(p.id)){lists[destination].push(p.id);saveLists()}
 $('editorDialog').close();openPrayer(p);
}
$('search').addEventListener('input',renderList);
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$('search').value='';document.querySelectorAll('[data-filter]').forEach(t=>t.classList.toggle('selected',t===b));renderList()});
$('favorite').onclick=()=>{if(!current)return;favorites=favorites.includes(current.id)?favorites.filter(id=>id!==current.id):[...favorites,current.id];localStorage.favorites=JSON.stringify(favorites);favoriteUI()};
for(const [id,key] of [['inDay','day'],['inNight','night']])$(id).onchange=()=>{lists[key]=lists[key].filter(p=>p!==current.id);if($(id).checked)lists[key].push(current.id);saveLists()};
$('back').onclick=goHome;$('featuredPlay').onclick=()=>{openPrayer(prayers[0]);play()};
$('toggle').onclick=()=>{if(state.playing)TTS.pause();else if(state.paused)TTS.resume();else play()};
$('restart').onclick=play;$('stop').onclick=()=>{TTS.stop()};
$('playList').onclick=()=>{const items=listPrayers(filter);if(items.length){openPrayer(items[0]);startQueue(items.map(p=>p.id))}};
$('resumeSaved').onclick=()=>{const p=prayers.find(p=>p.id===checkpoint.id);if(!p)return;openPrayer(p);if(state.paused&&state.id===p.id)TTS.resume();else startQueue(checkpoint.queue?.length?checkpoint.queue:[p.id],Math.max(0,checkpoint.index||0))};
$('rate').value=String(rate);$('rate').onchange=()=>{rate=Number($('rate').value);localStorage.rate=String(rate);TTS.configure(rate,repeat)};
$('repeat').onclick=()=>{repeat=!repeat;localStorage.repeat=String(repeat);TTS.configure(rate,repeat);updatePlayer()};
$('settings').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();$('voiceSettings').onclick=()=>{if(native)Android.voiceSettings()};
$('theme').value=localStorage.theme||'light';$('fontSize').value=localStorage.fontSize||'21';$('gap').value=String(gap);
function appearance(){document.documentElement.dataset.theme=$('theme').value;document.documentElement.style.setProperty('--reading-size',$('fontSize').value+'px');localStorage.theme=$('theme').value;localStorage.fontSize=$('fontSize').value}
$('theme').onchange=appearance;$('fontSize').onchange=appearance;appearance();$('gap').onchange=()=>{gap=Number($('gap').value);localStorage.gap=String(gap)};$('timer').onchange=()=>timer=Number($('timer').value);
$('addPrayer').onclick=()=>edit();$('editPrayer').onclick=()=>{if(state.id===current.id&&(state.playing||state.paused)){TTS.pause()}edit(current)};$('cancelEditor').onclick=()=>$('editorDialog').close();$('editorForm').onsubmit=savePrayer;
$('expandPrayer').onclick=()=>{const original=$('editorText').value;$('editorText').value=prayerTools.expand(original);$('editorStatus').textContent=original===$('editorText').value?'No he encontrado abreviaturas compatibles. Puedes pegar el texto completo.':'Texto completado. Revísalo antes de guardar.'};
setInterval(()=>{if(!native)return;try{const next=JSON.parse(Android.state());if(JSON.stringify(next)!==JSON.stringify(state)){const previous=state;state=next;if(state.playing&&state.id!==previous.id){const p=prayers.find(p=>p.id===state.id);if(p&&(!$('reader').hidden&&(!current||current.id===previous.id)))openPrayer(p)}if(state.playing||state.paused)showPlayer();updatePlayer()}}catch{}},500);
refreshLibrary();renderList();
