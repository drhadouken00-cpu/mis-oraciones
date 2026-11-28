'use strict';
// Mis oraciones v3.1 (26): San Judas Tadeo · aviso opcional el día 28 de cada mes.
// · Botón en la propia oración («Aviso el día 28»): apagado por defecto; tú eliges la hora (por defecto 9:00).
// · En el APK usa las alarmas nativas de la app (la entrada lleva «dom»:28 y se repite cada mes);
//   en la web, aviso con la app abierta y evento de calendario .ics (RRULE mensual, BYMONTHDAY=28).
// · Clave nueva: judasReminder ({on,time}). No renombra ni borra ninguna clave ni toca oraciones personales.
(()=>{
const ID='san-judas-tadeo-28',AID='__judas',EN=window.MO_LANG==='en',T=(es,en)=>EN?en:es,$=id=>document.getElementById(id),ANAL=!!window.AndroidAlarms;
const pad=n=>String(n).padStart(2,'0');
const ls={get(k,f){try{const v=localStorage.getItem(k);return v==null?f:v}catch(e){return f}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function cfg(){let r={};try{r=JSON.parse(ls.get('judasReminder','{}'))||{}}catch(e){}return {on:!!r.on,time:/^\d\d:\d\d$/.test(r.time||'')?r.time:'09:00'}}
const title=()=>T('San Judas Tadeo · día 28','Saint Jude Thaddeus · the 28th');
function judasAlarms(){const c=cfg();return c.on?[{time:c.time,id:AID,title:title(),on:true,dom:28}]:[]}
function currentAlarms(){try{if(ANAL){const a=JSON.parse(AndroidAlarms.get());if(Array.isArray(a))return a}}catch(e){}try{const a=JSON.parse(localStorage.getItem('alarms'));return Array.isArray(a)?a:[]}catch(e){return []}}
function syncAlarms(){const list=currentAlarms().filter(a=>a.id!==AID).concat(judasAlarms()).slice(0,20);
 try{localStorage.setItem('alarms',JSON.stringify(list))}catch(e){}if(ANAL){try{return AndroidAlarms.set(JSON.stringify(list))!==false}catch(e){return false}}return true}
const L=EN?{btn:'🔔 Reminder on the 28th',btnOn:t=>`🔔 Reminder on the 28th · ${t}`,h:'Saint Jude Thaddeus · the 28th',
 lead:'A reminder on the 28th of every month, if you like. It is optional and off unless you turn it on.',
 row:'Remind me on the 28th',rowSub:'every month',time:'Time',timeSub:'when the reminder sounds',
 noteA:'The app’s own alarms are used (the same as in “Prayer alarms”), once a month. Tapping the reminder opens this prayer.',
 noteW:'On the web the reminder appears while the app is open. To be reminded always (also on iPhone), tap “Add to calendar”: a monthly event with an alarm is created.',
 ics:'📅 Add to calendar',close:'Back',save:'Save',on:t=>`Reminder saved ✓ · every 28th at ${t}`,off:'Reminder turned off',fail:'The reminder could not be saved.',icsNone:'Turn on the reminder first.',icsOk:'Open the downloaded file and tap “Add” to save the monthly event in your calendar.',
 sum:'Saint Jude Thaddeus · the 28th',desc:'It is the 28th: time for the prayer to Saint Jude. Open Mis oraciones: '}
:{btn:'🔔 Aviso el día 28',btnOn:t=>`🔔 Aviso el día 28 · ${t}`,h:'San Judas Tadeo · día 28',
 lead:'Un aviso el día 28 de cada mes, si quieres. Es opcional y está apagado salvo que lo actives.',
 row:'Avisarme el día 28',rowSub:'cada mes',time:'Hora',timeSub:'a la que suena el aviso',
 noteA:'Se usan las alarmas de la propia app (las mismas de «Alarmas de oración»), una vez al mes. Al tocar el aviso se abre esta oración.',
 noteW:'En la web el aviso aparece con la app abierta. Para que te avise siempre (también en iPhone), pulsa «Añadir al calendario»: se crea un evento mensual con alarma.',
 ics:'📅 Añadir al calendario',close:'Volver',save:'Guardar',on:t=>`Aviso guardado ✓ · cada día 28 a las ${t}`,off:'Aviso desactivado',fail:'No se ha podido guardar el aviso.',icsNone:'Activa primero el aviso.',icsOk:'Abre el archivo descargado y pulsa «Añadir» para guardar el evento mensual en tu calendario.',
 sum:'San Judas Tadeo · día 28',desc:'Hoy es 28: toca la oración a San Judas Tadeo. Abre Mis oraciones: '};
const reader=$('reader'),tgl=document.createElement('button');tgl.type='button';tgl.id='judToggle';tgl.className='secondary';tgl.hidden=true;tgl.dataset.noi18n='1';
if(reader)(($('readerMeta')||$('readerTitle'))||reader).after(tgl);
const paintBtn=()=>{const c=cfg();tgl.textContent=c.on?L.btnOn(c.time):L.btn;tgl.setAttribute('aria-pressed',String(c.on))};
function update(){const cur=(typeof current!=='undefined'&&current)?current.id:null;tgl.hidden=cur!==ID;if(!tgl.hidden)paintBtn()}
const dlg=document.createElement('dialog');dlg.id='judRemDlg';dlg.dataset.noi18n='1';
dlg.innerHTML=`<h2></h2><p class="remLead"></p><label class="remRow"><span><b class="jr"></b><small class="jrs"></small></span><input type="checkbox" class="judOn"></label><div class="judTime"><span><b class="jt"></b><small class="jts"></small></span><input type="time" class="judT" aria-label=""></div><p class="remNote"></p><p class="remMsg" role="status"></p><div class="remBtns"><button type="button" class="secondary remIcs"></button><button type="button" class="secondary remClose"></button><button type="button" class="remSave"></button></div>`;
document.body.append(dlg);
const q=s=>dlg.querySelector(s);
function paintDlg(){const c=cfg();q('h2').textContent=L.h;q('.remLead').textContent=L.lead;q('.jr').textContent=L.row;q('.jrs').textContent=L.rowSub;q('.jt').textContent=L.time;q('.jts').textContent=L.timeSub;
 q('.judT').setAttribute('aria-label',L.time);q('.judOn').setAttribute('aria-label',L.row);q('.judOn').checked=c.on;q('.judT').value=c.time;q('.judT').disabled=!c.on;
 q('.remNote').textContent=ANAL?L.noteA:L.noteW;q('.remMsg').textContent='';const ics=q('.remIcs');ics.hidden=ANAL;ics.textContent=L.ics;q('.remClose').textContent=L.close;q('.remSave').textContent=L.save}
q('.judOn').onchange=()=>{q('.judT').disabled=!q('.judOn').checked};
tgl.onclick=()=>{paintDlg();dlg.showModal()};
q('.remClose').onclick=()=>dlg.close();
q('.remSave').onclick=()=>{const on=q('.judOn').checked,t=/^\d\d:\d\d$/.test(q('.judT').value)?q('.judT').value:'09:00';
 ls.set('judasReminder',JSON.stringify({on,time:t}));const ok=syncAlarms();
 if(!ok){q('.remMsg').textContent=L.fail;return}
 if(!ANAL&&on&&window.Notification&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}
 paintBtn();q('.remMsg').textContent=on?L.on(t):L.off;try{if(typeof toast==='function')toast(on?L.on(t):L.off)}catch(e){}};
q('.remIcs').onclick=()=>{const c={on:q('.judOn').checked,time:/^\d\d:\d\d$/.test(q('.judT').value)?q('.judT').value:'09:00'};
 if(!c.on){q('.remMsg').textContent=L.icsNone;return}
 const [h,m]=c.time.split(':').map(Number),now=new Date();let d=new Date(now.getFullYear(),now.getMonth(),28,h,m,0);if(d<=now)d=new Date(now.getFullYear(),now.getMonth()+1,28,h,m,0);
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),url=location.origin+location.pathname+'#open='+AID,e=x=>String(x).replace(/[\\;,]/g,s=>'\\'+s).replace(/\n/g,'\\n');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis oraciones//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:misoraciones-judas-28@misoraciones','DTSTAMP:'+stamp,
  'DTSTART:'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(h)+pad(m)+'00','DURATION:PT15M','RRULE:FREQ=MONTHLY;BYMONTHDAY=28','SUMMARY:'+e(L.sum),'DESCRIPTION:'+e(L.desc+url),'URL:'+url,
  'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+e(L.sum),'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'];
 const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mis-oraciones-san-judas-28.ics';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 q('.remMsg').textContent=L.icsOk};
// mostrar/ocultar el botón según la oración abierta
{const o=window.openPrayer;if(typeof o==='function')window.openPrayer=openPrayer=function(){const r=o.apply(this,arguments);update();return r}}
update();
// si hay aviso activado, mantén sincronizada la alarma (p. ej. tras cambiar de idioma el título)
try{const want=judasAlarms();if(want.length){const have=currentAlarms().filter(a=>a.id===AID);if(have.length!==1||have[0].time!==want[0].time||have[0].title!==want[0].title||have[0].dom!==28)syncAlarms()}}catch(e){}
window.MO=Object.assign(window.MO||{},{judasAlarms});
})();
