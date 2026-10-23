'use strict';
// v3.1b: buscador completo, recordatorio de la noche y modo oscuro.
(()=>{
const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const AN=!!window.AndroidAlarms;
const homeHeader=document.querySelector('#home header'),settingsBtn=$('settings');
const icons=el('<div class="topIcons"><button class="icon" id="searchOpen" aria-label="Buscar oraciones">⌕</button><button class="icon" id="themeToggle" aria-label="Modo oscuro">☾</button></div>');
settingsBtn.replaceWith(icons);icons.append(settingsBtn);
const drawerUl=document.querySelector('#drawer ul');
function drawerItem(icon,label,fn,before){const li=el('<li><button><span class="dIcon" aria-hidden="true"></span><span></span></button></li>');li.querySelector('.dIcon').textContent=icon;li.querySelector('span+span').textContent=label;li.firstChild.onclick=()=>{$('drawerShade').click();fn()};before?drawerUl.insertBefore(li,before):drawerUl.append(li);return li}

// ================= BUSCADOR =================
document.body.insertBefore(el(`<main id="searchView" hidden><header><button class="back" id="searchBack">‹ &nbsp; Inicio</button></header>
<span class="eyebrow">BUSCAR EN TODAS LAS ORACIONES</span>
<label class="searchBig"><span aria-hidden="true">⌕</span><input id="fullSearch" type="search" placeholder="Título o palabras del texto…" aria-label="Buscar en todas las oraciones" autocomplete="off"></label>
<div class="searchHints"></div><p id="searchCount" role="status"></p><div id="searchResults"></div></main>`),$('player'));
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function foldMap(s){let out='';const map=[];for(let i=0;i<s.length;i++){const f=fold(s[i]);for(let k=0;k<f.length;k++){out+=f[k];map.push(i)}}map.push(s.length);return {out,map}}
function highlight(s,q){const node=document.createDocumentFragment();if(!q){node.append(s);return node}const {out,map}=foldMap(s);let pos=0,i;
 while((i=out.indexOf(q,pos))>=0){const a=map[i],b=map[i+q.length];node.append(s.slice(map[pos]??s.length,a));const m=document.createElement('mark');m.textContent=s.slice(a,b);node.append(m);pos=i+q.length}
 node.append(s.slice(map[pos]??s.length));return node}
function kind(p){if(/^rosario-/.test(p.id))return 'Rosario';if(/^coronilla-/.test(p.id))return 'Coronilla';if(p.id==='evangelio-del-dia')return 'Evangelio';if(/^personal-/.test(p.id)||custom.some(c=>c.id===p.id))return 'Mi oración';if(/letan/i.test(p.title))return 'Letanías';return 'Oración'}
let lastResults=[];
function runSearch(){
 const raw=$('fullSearch').value.trim(),q=fold(raw);const box=$('searchResults');box.replaceChildren();
 const all=prayers.filter(p=>p.id!=='evangelio-del-dia'||p.date);
 if(!q){$('searchCount').textContent=all.length+' oraciones. Escribe para buscar en títulos y textos.';lastResults=all;}
 const res=[];
 for(const p of all){if(!q){res.push({p,score:0});continue}
  const t=fold(p.title);let score=t.includes(q)?(t.startsWith(q)?3:2):0,snip='';
  for(const part of p.parts){const f=fold(part.text);const i=f.indexOf(q);if(i>=0){if(!score)score=1;const s=Math.max(0,i-50);snip=(s?'…':'')+part.text.slice(s,i+q.length+80)+(i+q.length+80<part.text.length?'…':'');break}}
  if(score)res.push({p,score,snip})}
 res.sort((a,b)=>b.score-a.score);lastResults=res.map(r=>r.p);
 if(q)$('searchCount').textContent=res.length?res.length+(res.length===1?' resultado':' resultados'):'Sin resultados para «'+raw+'». Prueba con otra palabra.';
 for(const r of res.slice(0,150)){const b=el('<button class="result"><span class="tag"></span><strong></strong><small></small></button>');
  b.querySelector('.tag').textContent=kind(r.p)+' · ≈ '+r.p.minutes+' min';b.querySelector('strong').append(highlight(r.p.title,q));
  if(r.snip)b.querySelector('small').append(highlight(r.snip,q));else b.querySelector('small').remove();
  b.onclick=()=>{window.visibleItems=lastResults.slice();$('searchView').hidden=true;openPrayer(r.p);window.visibleItems=lastResults.slice()};box.append(b)}
}
$('fullSearch').addEventListener('input',runSearch);
const hints=document.querySelector('.searchHints');for(const w of ['Rosario','Sangre','Misericordia','María','San José','noche','Espíritu Santo']){const b=el('<button class="secondary"></button>');b.textContent=w;b.onclick=()=>{$('fullSearch').value=w;runSearch()};hints.append(b)}
function openSearch(){for(const id of ['home','reader','timerView'])if($(id))$(id).hidden=true;$('searchView').hidden=false;$('player').hidden=true;document.body.classList.remove('hasPlayer');window.scrollTo(0,0);runSearch();setTimeout(()=>$('fullSearch').focus(),60)}
$('searchOpen').onclick=openSearch;$('searchBack').onclick=()=>goHome();
drawerItem('⌕','Buscar',openSearch,drawerUl.firstChild);
// keep swipe on search results after renderList() runs inside openPrayer flows
const baseRender=renderList;window.renderList=renderList=function(){const keep=!$('reader').hidden&&lastResults.length&&lastResults.some(p=>p.id===current?.id)&&window.__fromSearch;baseRender();if(keep)window.visibleItems=lastResults.slice()};
const openBase=openPrayer;window.openPrayer=openPrayer=function(p){window.__fromSearch=!$('searchView').hidden||window.__fromSearch&&lastResults.some(x=>x.id===p?.id);$('searchView').hidden=true;openBase(p)};

// ================= RECORDATORIO DE LA NOCHE =================
const NR='nightReminder';
function nr(){return stored(NR,{on:false,time:'22:00'})}
function currentAlarms(){try{if(AN){const a=JSON.parse(AndroidAlarms.get());if(Array.isArray(a))return a}}catch{}return stored('alarms',[])}
function syncNight(){const n=nr();let list=currentAlarms().filter(a=>a.id!=='__night');if(n.on)list.push({time:n.time,id:'__night',title:'Oración de la noche · Mi noche',on:true});
 list=list.slice(0,20);localStorage.alarms=JSON.stringify(list);if(AN)AndroidAlarms.set(JSON.stringify(list))}
window.MO.nightAlarm=()=>{const n=nr();return n.on?{time:n.time,id:'__night',title:'Oración de la noche · Mi noche',on:true}:null};
document.body.append(el(`<dialog id="nightDialog"><h2>Recordatorio de la noche</h2>
<p class="hint">Recordatorio diario de la oración de la noche. Al tocar el aviso se abrirá tu lista «☾ Mi noche».</p>
<label class="switch"><input type="checkbox" id="nightOn"> Recordármelo cada día</label>
<label class="setting">Hora<input type="time" id="nightTime" class="bigTime" value="22:00"></label>
<p id="nightStatus" class="hint" role="status"></p>
<button type="button" id="nightSave">Guardar</button>
<button type="button" id="nightIcs" class="secondary">📅 Añadir al calendario</button>
<button type="button" id="nightList" class="secondary">☾ Ver mi lista de la noche</button>
<button type="button" id="nightClose" class="secondary">Volver</button></dialog>`));
function openNight(){const n=nr();$('nightOn').checked=n.on;$('nightTime').value=n.time||'22:00';
 const cnt=(lists.night||[]).length;$('nightStatus').textContent=(cnt?'Tu lista de la noche tiene '+cnt+(cnt===1?' oración.':' oraciones.'):'Tu lista de la noche está vacía: abre una oración y marca «☾ Mi noche».')+(AN?'':' En la web el aviso solo aparece con la app abierta; para un aviso fiable usa «Añadir al calendario».');
 $('nightIcs').hidden=AN;$('nightDialog').showModal()}
$('nightSave').onclick=()=>{const time=/^\d\d:\d\d$/.test($('nightTime').value)?$('nightTime').value:'22:00';localStorage[NR]=JSON.stringify({on:$('nightOn').checked,time});localStorage.nightTipDismissed='1';syncNight();
 if(!AN&&$('nightOn').checked&&window.Notification&&Notification.permission==='default')Notification.requestPermission();
 $('nightDialog').close();renderTip();MO.toast($('nightOn').checked?'Te lo recordaré cada día a las '+time+' ☾':'Recordatorio de la noche desactivado')};
$('nightClose').onclick=()=>$('nightDialog').close();
$('nightList').onclick=()=>{$('nightDialog').close();showNightList()};
$('nightIcs').onclick=()=>{const time=$('nightTime').value||'22:00',[h,m]=time.split(':'),d=new Date(),pad=n=>String(n).padStart(2,'0');
 const url=location.origin+location.pathname+'#open=__night',stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis oraciones//ES','BEGIN:VEVENT','UID:misoraciones-noche@misoraciones','DTSTAMP:'+stamp,'DTSTART:'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+h+m+'00','DURATION:PT15M','RRULE:FREQ=DAILY','SUMMARY:☾ Oración de la noche','DESCRIPTION:Es hora de tu oración de la noche. Abre Mis oraciones: '+url,'URL:'+url,'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Oración de la noche','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='mis-oraciones-noche.ics';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
 $('nightStatus').textContent='Abre el archivo descargado y pulsa «Añadir» para guardar el aviso diario en tu calendario.'};
function showNightList(){goHome();if(!$('home').hidden){document.querySelector('[data-filter="night"]').click();setTimeout(()=>document.querySelector('.collection').scrollIntoView({behavior:'smooth'}),60)}}
const alarmsLi=[...drawerUl.querySelectorAll('li')].find(li=>/Alarmas/.test(li.textContent));
drawerItem('☾','Recordatorio de la noche',openNight,alarmsLi?alarmsLi.nextSibling:null);
// Sugerencia en inicio
const tip=el('<div class="nightTip" hidden><button class="close" aria-label="Descartar sugerencia">✕</button><p><strong>☾ ¿Te recuerdo rezar por la noche?</strong><br>Un aviso diario que abre tu lista «Mi noche».</p><div class="cardButtons"><button id="tipOn">Activar a las 22:00</button><button id="tipAdjust" class="secondary">Elegir hora</button></div></div>');
document.querySelector('.tiles').after(tip);
function renderTip(){tip.hidden=nr().on||localStorage.nightTipDismissed==='1'}
tip.querySelector('.close').onclick=()=>{localStorage.nightTipDismissed='1';renderTip()};
$('tipOn').onclick=()=>{localStorage[NR]=JSON.stringify({on:true,time:'22:00'});localStorage.nightTipDismissed='1';syncNight();renderTip();MO.toast('Te lo recordaré cada día a las 22:00 ☾')};
$('tipAdjust').onclick=openNight;renderTip();
// aviso dentro de la web (sin app nativa)
if(!AN)setInterval(()=>{const n=nr();if(!n.on)return;const d=new Date(),hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),k=d.toDateString();
 if(hm===n.time&&localStorage.nightFired!==k){localStorage.nightFired=k;try{if(window.Notification&&Notification.permission==='granted'){const x=new Notification('☾ Oración de la noche',{body:'Es hora de tu oración de la noche'});x.onclick=()=>{focus();showNightList()};return}}catch{}MO.toast('☾ Es hora de tu oración de la noche');}},20000);
if(MO.startId==='__night')setTimeout(showNightList,50);
addEventListener('hashchange',()=>{if(location.hash==='#open=__night'){history.replaceState(null,'',location.pathname);showNightList()}});

// ================= MODO OSCURO =================
const sel=$('theme');
if(!sel.querySelector('[value=auto]'))sel.append(new Option('Automático (como el sistema)','auto'),new Option('Automático (oscuro de 21:00 a 07:00)','night'));
sel.value=localStorage.theme||'light';if(!sel.value)sel.value='light';
const mq=matchMedia('(prefers-color-scheme: dark)');
function effective(){const v=localStorage.theme||'light';if(v==='auto')return mq.matches?'dark':'light';if(v==='night'){const h=new Date().getHours();return h>=21||h<7?'dark':'light'}return v==='dark'?'dark':'light'}
function applyTheme(){const e=effective();document.documentElement.dataset.theme=e;document.querySelector('meta[name=theme-color]').content=e==='dark'?'#1b1713':'#f8f5ed';
 $('themeToggle').textContent=e==='dark'?'☀':'☾';$('themeToggle').setAttribute('aria-label',e==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro')}
function onAppearance(){appearance();applyTheme()}
sel.onchange=onAppearance;$('fontSize').onchange=onAppearance;
$('themeToggle').onclick=()=>{const next=effective()==='dark'?'light':'dark';sel.value=next;onAppearance();MO.toast(next==='dark'?'Modo oscuro ☾ (cámbialo a «Automático» en Ajustes)':'Modo claro ☀')};
mq.addEventListener?.('change',applyTheme);setInterval(applyTheme,60000);applyTheme();
// goHome: cerrar vistas nuevas
const baseHome=goHome;window.goHome=goHome=function(){if($('nightDialog').open){$('nightDialog').close();return}if(!$('searchView').hidden){$('searchView').hidden=true;$('home').hidden=false;if(state.playing||state.paused){$('player').hidden=false;document.body.classList.add('hasPlayer')}renderList();window.scrollTo(0,0);return}window.__fromSearch=false;baseHome()};
window.MO.openSearch=openSearch;window.MO.openNight=openNight;
})();
