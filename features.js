'use strict';
// Mis oraciones v2: Oración del día, Evangelio del día, Rosario, Coronilla, alarmas, racha y deslizamiento.
(()=>{
const alarmsNative=!!window.AndroidAlarms;
const GENERATED=/^(rosario-|coronilla-|evangelio-del-dia)/;
const pad=n=>String(n).padStart(2,'0');
const ymd=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const dayNumber=(d=new Date())=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const byId=id=>prayers.find(p=>p.id===id);
const MYST=['gloriosos','gozosos','dolorosos','gloriosos','luminosos','dolorosos','gozosos']; // domingo..sábado
function dailyPrayer(d=new Date()){const pool=window.PRAYERS.filter(p=>/^oracion-/.test(p.id));return pool[(dayNumber(d)*7919)%pool.length]}
function rosaryToday(){return byId('rosario-'+MYST[new Date().getDay()])}
function resolve(id){if(id==='__daily')return dailyPrayer();if(id==='__rosary')return rosaryToday();if(id==='__timer')return null;return byId(id)}
function excerpt(p,n=110){const t=(p.parts.find(x=>!x.pause)||{text:''}).text;return t.length>n?t.slice(0,n).replace(/\s\S*$/,'')+'…':t}
function el(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstChild}

// ---------- Racha ----------
function streak(){const s=stored('streak',{last:'',count:0});const y=new Date();y.setDate(y.getDate()-1);if(s.last!==ymd()&&s.last!==ymd(y))s.count=0;return s}
function markPrayed(){const s=stored('streak',{last:'',count:0}),y=new Date();y.setDate(y.getDate()-1);if(s.last===ymd())return;s.count=s.last===ymd(y)?(s.count||0)+1:1;s.last=ymd();s.best=Math.max(s.best||0,s.count);localStorage.streak=JSON.stringify(s);renderStreak()}
function renderStreak(){const s=streak(),n=s.count||0;$('streak').innerHTML=n?'<strong>'+n+'</strong> '+(n===1?'día rezando':'días seguidos rezando')+(s.last===ymd()?' · hoy ya has rezado ✓':' · reza hoy para seguir')+(s.best>n?' <small>(mejor racha: '+s.best+')</small>':''):'Empieza hoy tu racha de oración ✧'}

// ---------- Tarjetas de inicio ----------
const featured=document.querySelector('.featured');featured.hidden=true;
const cards=el(`<div id="todayCards">
 <section class="featured daily"><span class="eyebrow">ORACIÓN DEL DÍA · <span id="dailyDate"></span></span><h2 id="dailyTitle"></h2><p id="dailyText"></p><div class="cardButtons"><button id="dailyListen">▶ &nbsp; Escuchar</button><button id="dailyRead" class="secondary">Leer</button></div><span class="flower" aria-hidden="true">✧</span></section>
 <p id="streak" class="streak"></p>
 <div class="tiles">
  <button class="tile" id="tileGospel"><span class="tileIcon" aria-hidden="true">✠</span><strong>Evangelio del día</strong><small id="gospelSub">Cargando…</small></button>
  <button class="tile" id="tileRosary"><span class="tileIcon" aria-hidden="true">✿</span><strong>Rosario del día</strong><small id="rosarySub"></small></button>
  <button class="tile" id="tileChaplet"><span class="tileIcon" aria-hidden="true">♱</span><strong>Coronilla</strong><small>Divina Misericordia</small></button>
  <button class="tile friday" id="tileSangre" hidden><span class="tileIcon" aria-hidden="true">✚</span><strong>Hoy es viernes</strong><small>Coronilla de la Divina Sangre de Cristo</small></button>
  <button class="tile" id="tileTimer"><span class="tileIcon" aria-hidden="true">◷</span><strong>Tiempo con el Altísimo</strong><small id="timerSub">De 1 a 60 minutos</small></button>
 </div>
</div>`);
featured.after(cards);
function listen(p){if(!p)return;openPrayer(p);play()}
function renderCards(){
 const p=dailyPrayer();$('dailyTitle').textContent=p.title;$('dailyText').textContent='«'+excerpt(p,90)+'»';
 $('dailyDate').textContent=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
 const r=rosaryToday();$('rosarySub').textContent=r.title.split('· ')[1];
 renderStreak();renderAlarmSummary();
}
$('dailyListen').onclick=()=>listen(dailyPrayer());$('dailyRead').onclick=()=>openPrayer(dailyPrayer());
$('tileRosary').onclick=()=>openPrayer(rosaryToday());$('tileChaplet').onclick=()=>openPrayer(byId('coronilla-misericordia'));
$('tileGospel').onclick=openGospel;$('tileSangre').onclick=()=>openPrayer(byId('coronilla-sangre'));$('tileSangre').hidden=new Date().getDay()!==5;
async function openGospel(){const g=byId(GID);if(g&&g.date===ymd()){openPrayer(g);return}await loadGospel();const h=byId(GID);if(h)openPrayer(h);else toast('No se ha podido cargar el Evangelio. Revisa tu conexión.')}
window.MO={openPrayer:id=>openPrayer(resolve(id)),openGospel,toast:m=>toast(m),resolve};
// ---------- Evangelio del día (evangeliodeldia.org / feed.evangelizo.org) ----------
const GID='evangelio-del-dia';
function decode(html){const d=document.createElement('textarea');d.innerHTML=html.replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'');return d.value}
function gospelPrayer(g){
 let body=g.text.split(/<br\s*\/?>\s*<br\s*\/?>/i)[0];
 const lines=decode(body).split('\n').map(s=>s.trim()).filter(Boolean),ref=decode(g.title).trim();
 const parts=[{text:ref,speech:'Lectura del santo Evangelio. '+ref}],chunk=[];
 for(const l of lines){chunk.push(l);if(chunk.join(' ').length>380){parts.push({text:chunk.join(' '),speech:chunk.join(' ')});chunk.length=0}}
 if(chunk.length)parts.push({text:chunk.join(' '),speech:chunk.join(' ')});
 parts.push({text:'Palabra del Señor. — Gloria a ti, Señor Jesús.',speech:'Palabra del Señor. Gloria a ti, Señor Jesús.'});
 return {id:GID,title:'Evangelio del día',ref,date:g.date,hidden:true,parts,minutes:Math.max(2,Math.round(lines.join(' ').split(/\s+/).length/115))};
}
function installGospel(p){
 const prev=custom.find(e=>e.id===GID);
 if(!prev||prev.date!==p.date||JSON.stringify(prev.parts)!==JSON.stringify(p.parts)){
  const updated=[...custom.filter(e=>e.id!==GID),p];
  try{if(native)Android.saveLibrary(JSON.stringify(updated));else localStorage.custom=JSON.stringify(updated);custom=updated}catch{}
 }
 refreshLibrary();
 setGospelSub(p.date===ymd()?(p.ref||'Hoy'):'Guardado del '+p.date);
}
function setGospelSub(t){if($('gospelSub'))$('gospelSub').textContent=t}
function gospelFailed(){
 const old=custom.find(e=>e.id===GID);
 if(old)installGospel(old);setGospelSub(old?'Sin conexión · guardado del '+old.date:'Sin conexión · toca para reintentar');
}
async function loadGospel(){
 const today=ymd(),key=today.replace(/-/g,'');const cached=custom.find(e=>e.id===GID);
 if(cached&&cached.date===today){installGospel(cached);return}
 setGospelSub('Cargando…');
 try{
  let g;
  if(alarmsNative){await new Promise(r=>setTimeout(r,50));const raw=AndroidAlarms.gospel(key);if(!raw)throw 0;g=JSON.parse(raw)}
  else{const base='https://feed.evangelizo.org/v2/reader.php?lang=SP&content=GSP&date='+key;const [t,x]=await Promise.all(['reading_lt','reading'].map(type=>fetch(base+'&type='+type).then(r=>{if(!r.ok)throw 0;return r.text()}).catch(()=>fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(base+'&type='+type)).then(r=>{if(!r.ok)throw 0;return r.text()}))));g={title:t,text:x}}
  if(!g.text||g.text.length<40)throw 0;g.date=today;installGospel(gospelPrayer(g));
 }catch{gospelFailed()}
}


// ---------- Lector: racha, metadatos y deslizar ----------
const baseOpen=openPrayer;
window.openPrayer=openPrayer=function(p){if(!p)return;baseOpen(p);markPrayed();
 $('editPrayer').hidden=GENERATED.test(p.id);
 if(p.id===GID)$('readerMeta').textContent='≈ '+p.minutes+' minutos · '+(p.ref||'')+' · Fuente: evangeliodeldia.org';
 else if(p.subtitle)$('readerMeta').textContent='≈ '+p.minutes+' minutos · '+p.subtitle+' · Guiado paso a paso';
};
function sequence(){const v=(window.visibleItems||[]).filter(Boolean);return v.some(p=>p.id===current?.id)?v:prayers.filter(p=>!p.hidden)}
function step(delta){
 const seq=sequence(),i=seq.findIndex(p=>p.id===current?.id);if(i<0)return;const next=seq[i+delta];
 if(!next){toast(delta>0?'Has llegado a la última oración de la lista':'Esta es la primera oración de la lista');return}
 const wasPlaying=state.playing;openPrayer(next);if(wasPlaying)play();toast((i+delta+1)+' de '+seq.length+' · '+next.title);
}
let touch=null;const reader=$('reader');
reader.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:true});
reader.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y,dt=Date.now()-touch.t;touch=null;
 if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8&&dt<800)step(dx<0?1:-1)},{passive:true});
reader.querySelector('header').insertAdjacentHTML('afterend','<p class="swipeHint">‹ Desliza para cambiar de oración ›</p>');
let toastTimer;function toast(msg){let t=$('toast');if(!t){t=el('<div id="toast" role="status"></div>');document.body.append(t)}t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}

// ---------- Alarmas ----------
document.body.append(el(`<dialog id="alarmsDialog"><h2>Alarmas de oración</h2>
<p class="hint">Elige a qué hora quieres rezar y qué oración. Con la app abierta verás el aviso en pantalla. Para que te avise siempre (también en iPhone), pulsa <strong>📅 Añadir al calendario</strong>: se crea un evento diario con alarma que abre esta oración.</p>
<div id="alarmList"></div><button type="button" id="addAlarm" class="secondary">＋ Añadir alarma</button>
<p id="alarmStatus" class="hint" role="status"></p>
<button type="button" id="exactAlarms" class="secondary" hidden>Permitir alarmas puntuales</button>
<button type="button" id="testAlarm" class="secondary">Probar aviso</button>
<button type="button" id="saveAlarms">Guardar alarmas</button><button type="button" id="closeAlarms" class="secondary">Volver</button></dialog>`));
let alarms=(()=>{try{if(alarmsNative){const a=JSON.parse(AndroidAlarms.get());if(a.length)return a}}catch{}return stored('alarms',[])})();
alarms=alarms.filter(a=>a.id!=='__night');
function prayerOptions(sel){const opts=[['__daily','☀ Oración del día (cambia cada día)'],['__rosary','Santo Rosario (misterios del día)'],['coronilla-misericordia','Coronilla de la Divina Misericordia'],['coronilla-sangre','Coronilla de la Divina Sangre de Cristo'],[GID,'Evangelio del día'],['rosario-completo','Santo Rosario completo'],...prayers.filter(p=>!p.hidden&&!GENERATED.test(p.id)).map(p=>[p.id,p.title])];
 return opts.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;o.selected=v===sel;return o})}
function titleFor(id){if(id==='__daily')return 'Oración del día';if(id==='__rosary')return 'Santo Rosario';return byId(id)?.title||'Tu oración'}
function renderAlarms(){
 const box=$('alarmList');box.replaceChildren();
 if(!alarms.length)box.append(el('<p class="empty">Aún no tienes alarmas. Añade una, por ejemplo a las 8:00 o antes de dormir.</p>'));
 alarms.forEach((a,i)=>{const row=el('<div class="alarmRow"><input type="time" required aria-label="Hora"><label class="toggle"><input type="checkbox"> Activa</label><button class="icon remove" aria-label="Eliminar alarma">✕</button><select aria-label="Oración"></select><button type="button" class="secondary ics">📅 Añadir al calendario</button></div>');
  const [time,on]=row.querySelectorAll('input');time.value=a.time;on.checked=a.on!==false;row.querySelector('select').append(...prayerOptions(a.id));
  time.onchange=()=>a.time=time.value;on.onchange=()=>a.on=on.checked;row.querySelector('select').onchange=e=>a.id=e.target.value;
  row.querySelector('.ics').onclick=()=>downloadICS(a);row.querySelector('.remove').onclick=()=>{alarms.splice(i,1);renderAlarms()};box.append(row)});
 $('addAlarm').disabled=alarms.length>=20;alarmStatus();
}
function alarmStatus(msg){
 let s=msg||'';
 if(alarmsNative){try{const st=JSON.parse(AndroidAlarms.status());if(st.notify===false)s+=' Las notificaciones están desactivadas para la app: actívalas en Ajustes de Android.';$('exactAlarms').hidden=st.exact!==false;if(st.exact===false)s+=' Sin permiso de «alarmas y recordatorios» el aviso puede retrasarse unos minutos.'}catch{}}
 else s+=' En la web los avisos solo aparecen con la app abierta'+(window.Notification?' (o como notificación del navegador si lo permites)':'')+'. Para avisos seguros usa «Añadir al calendario».';
 $('alarmStatus').textContent=s.trim();
}
function renderAlarmSummary(){if(!$('alarmsSummary'))return;const on=alarms.filter(a=>a.on!==false).map(a=>a.time).sort();$('alarmsSummary').textContent=on.length?'· '+on.join(', '):''}
window.MO.openAlarms=()=>{alarms=JSON.parse(JSON.stringify(alarms));renderAlarms();$('alarmsDialog').showModal()};
$('addAlarm').onclick=()=>{alarms.push({time:alarms.length?'21:30':'08:00',id:'__daily',on:true});renderAlarms()};
$('closeAlarms').onclick=()=>$('alarmsDialog').close();
$('exactAlarms').onclick=()=>{if(alarmsNative)AndroidAlarms.exactSettings()};
$('testAlarm').onclick=()=>{if(alarmsNative)AndroidAlarms.test();else webNotify({id:'__daily',time:''});alarmStatus('Aviso de prueba enviado.')};
$('saveAlarms').onclick=()=>{
 alarms=alarms.filter(a=>/^\d\d:\d\d$/.test(a.time||''));alarms.forEach(a=>a.title=titleFor(a.id));
 const withNight=[...alarms,...(window.MO.nightAlarm&&MO.nightAlarm()?[MO.nightAlarm()]:[])].slice(0,20);localStorage.alarms=JSON.stringify(withNight);let ok=true;
 if(alarmsNative)ok=AndroidAlarms.set(JSON.stringify(withNight));else if(window.Notification&&Notification.permission==='default')Notification.requestPermission();
 if(!ok){alarmStatus('No se han podido guardar las alarmas.');return}
 renderAlarmSummary();$('alarmsDialog').close();toast(alarms.length?'Alarmas guardadas ✓':'Alarmas eliminadas');
};
function downloadICS(a){
 if(!/^\d\d:\d\d$/.test(a.time||'')){alarmStatus('Elige primero la hora.');return}
 const t=titleFor(a.id),url=location.origin+location.pathname+'#open='+encodeURIComponent(a.id),d=new Date();
 const [h,m]=a.time.split(':'),dt=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+h+m+'00',stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
 const esc=x=>x.replace(/[\\;,]/g,c=>'\\'+c);
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis oraciones//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:misoraciones-'+a.id+'-'+h+m+'@misoraciones','DTSTAMP:'+stamp,'DTSTART:'+dt,'DURATION:PT15M','RRULE:FREQ=DAILY',
  'SUMMARY:'+esc('🙏 '+t),'DESCRIPTION:'+esc('Es hora de rezar. Abre Mis oraciones: '+url),'URL:'+url,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc('Es hora de rezar · '+t),'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const blob=new Blob([ics],{type:'text/calendar'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='mis-oraciones-'+h+m+'.ics';document.body.append(link);link.click();setTimeout(()=>{URL.revokeObjectURL(link.href);link.remove()},4000);
 alarmStatus('Abre el archivo descargado y pulsa «Añadir» para guardar el evento diario en tu calendario.');
}
// Alternativa web (sin la app nativa): avisos mientras la página está abierta.
function webNotify(a){const p=resolve(a.id),body=p?p.title:'Tu momento de oración';
 try{if(window.Notification&&Notification.permission==='granted'){const n=new Notification('Es hora de rezar ✝',{body});n.onclick=()=>{window.focus();openPrayer(p)};return}}catch{}
 toast('⏰ Es hora de rezar · '+body)}
if(!alarmsNative)setInterval(()=>{const now=new Date(),hm=pad(now.getHours())+':'+pad(now.getMinutes()),fired=stored('alarmsFired',{});
 alarms.forEach((a,i)=>{const k=i+'@'+a.time;if(a.on!==false&&a.time===hm&&fired[k]!==ymd()){fired[k]=ymd();localStorage.alarmsFired=JSON.stringify(fired);webNotify(a)}})},20000);

// ---------- Volver a inicio / abrir desde notificación ----------
const baseRender=renderList;window.renderList=renderList=function(){baseRender();if($('streak'))renderCards()};
renderCards();
const m=location.hash.match(/^#open=(.+)$/);
window.MO.startId=m?decodeURIComponent(m[1]):null;
if(m){const p=resolve(window.MO.startId);history.replaceState(null,'',location.pathname);if(p)openPrayer(p)}
setTimeout(loadGospel,400);
})();
