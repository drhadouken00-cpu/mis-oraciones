'use strict';
// Mis oraciones v18: La Biblia completa (Torres Amat / Douay-Rheims) y «¿Qué tiene Dios para mí hoy?» (aprobado en preview-biblia).
// Claves nuevas: bibliaPos, bibliaPrefs, palabraHist. No renombra ni borra ninguna clave existente. El idioma es el de la app (moLang / MO_LANG).
// Los libros se cargan uno a uno desde biblia/ (en el APK van dentro de la app; en la web se guardan al abrirlos).
(()=>{
if(document.getElementById('bibliaView'))return;
const EN=window.MO_LANG==='en',L=EN?'en':'es',T=(es,en)=>EN?en:es,$=id=>document.getElementById(id);
const DV='1',BASE='biblia/';
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const prefs=Object.assign({fs:19},LS.get('bibliaPrefs',{}));
const G=[['pent','gen','deu',T('Pentateuco','Pentateuch')],['hist','jos','2ma',T('Libros históricos','Historical books')],['sap','job','sir',T('Libros sapienciales','Wisdom books')],['prof','isa','mal',T('Profetas','Prophets')],
 ['gos','mat','jhn',T('Evangelios','Gospels')],['act','act','act',T('Hechos','Acts')],['paul','rom','heb',T('Cartas de san Pablo','Letters of St Paul')],['cath','jas','jud',T('Cartas católicas','Catholic letters')],['rev','rev','rev',T('Apocalipsis','Revelation')]];
let BOOKS=null,BY={},PAL=null;const cache={};
const load=u=>fetch(BASE+u+'?v='+DV).then(r=>{if(!r.ok)throw new Error(r.status);return r.text()}).then(t=>JSON.parse(t));
const books=()=>BOOKS?Promise.resolve(BOOKS):load('books.json').then(b=>{BOOKS=b;b.forEach(x=>BY[x.id]=x);return b});
const book=id=>cache[id]||(cache[id]=load(L+'/'+id+'.json').catch(e=>{delete cache[id];throw e}));
const nCh=b=>EN?b.nen:b.n,bname=b=>b[L];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ERR=T('No se ha podido cargar. Revisa la conexión e inténtalo de nuevo.','Could not load. Please check your connection and try again.');

// ---------- Vista ----------
const v=document.createElement('main');v.id='bibliaView';v.hidden=true;v.dataset.noi18n='1';v.style.setProperty('--bfs',prefs.fs+'px');
v.innerHTML=`<div class="bTop"><button type="button" class="bBack" id="bBack"></button><div class="bSizer" id="bSizer" hidden><button type="button" id="bFsDown" aria-label="${T('Letra más pequeña','Smaller text')}">A−</button><button type="button" id="bFsUp" aria-label="${T('Letra más grande','Larger text')}">A+</button></div></div><div id="bBody"></div>`;
const player=$('player');document.body.insertBefore(v,player||null);
const pv=document.createElement('div');pv.id='palabraView';pv.hidden=true;pv.dataset.noi18n='1';
pv.innerHTML=`<div class="pvBackdrop"></div><div class="pvBook" aria-hidden="true"><div class="pvLeaf l"></div><div class="pvLeaf r"></div></div>
<section class="pvSheet" role="dialog" aria-modal="true" aria-labelledby="pvHead"><button type="button" class="pvClose" id="pvClose" aria-label="${T('Cerrar','Close')}">×</button>
<span class="pvEye">${T('Dios te dice hoy','God tells you today')}</span><h2 id="pvHead"></h2><div class="pvRef"><span id="pvTitle"></span> · <b id="pvRef"></b></div><div class="pvOrn" aria-hidden="true"></div>
<article class="bScr" id="pvText"></article><div class="pvActions"><button type="button" class="bPrimary" id="pvAgain">${T('Otra palabra','Another word')}</button><button type="button" class="bSecondary" id="pvChapter">${T('Leer el capítulo','Read the chapter')}</button></div></section>`;
document.body.append(pv);
const body=$('bBody');let view=null,READ=null,hl=null,test='NT',saveT=0;
const others=['home','reader','timerView'];
function playerBack(){try{if(typeof state!=='undefined'&&(state.playing||state.paused)&&player){player.hidden=false;document.body.classList.add('hasPlayer')}}catch{}}
function enter(){others.forEach(id=>{const e=$(id);if(e)e.hidden=true});if(player)player.hidden=true;document.body.classList.remove('hasPlayer');v.hidden=false;document.body.classList.add('bibliaOn')}
function leave(){if(v.hidden)return;savePos();v.hidden=true;view=null;document.body.classList.remove('bibliaOn');const h=$('home');if(h)h.hidden=false;playerBack();renderCard();scrollTo(0,0)}
// Si otra parte de la app abre su pantalla (oración, temporizador, inicio), la Biblia se aparta sola
const mo=new MutationObserver(()=>{if(!v.hidden&&others.some(id=>{const e=$(id);return e&&!e.hidden})){savePos();v.hidden=true;view=null;document.body.classList.remove('bibliaOn')}});
others.forEach(id=>{const e=$(id);if(e)mo.observe(e,{attributes:true,attributeFilter:['hidden']})});

function back(){if(view==='read'){const b=BY[READ.id];return b&&nCh(b)>1?showBook(b.id):showIndex()}if(view==='book')return showIndex();leave()}
$('bBack').onclick=back;
$('bFsUp').onclick=()=>setFs(1);$('bFsDown').onclick=()=>setFs(-1);
function setFs(d){prefs.fs=Math.max(15,Math.min(30,prefs.fs+d));v.style.setProperty('--bfs',prefs.fs+'px');LS.set('bibliaPrefs',prefs)}

async function showIndex(){enter();view='index';$('bBack').textContent='‹  '+T('Inicio','Home');$('bSizer').hidden=true;
 body.innerHTML=`<span class="bEye">${T('Palabra de Dios','Word of God')}</span><h1>${T('La <em>Biblia</em>','The <em>Bible</em>')}</h1>
 <p class="bLead">${T('Las Sagradas Escrituras completas, en la traducción católica de Torres Amat.','The complete Holy Scriptures, in the Catholic Douay-Rheims translation.')}</p><div class="bOrn" aria-hidden="true"></div>
 <button type="button" class="bPrimary bPalBtn" id="bPal">📖 &nbsp;${T('¿Qué tiene Dios para mí hoy?','What does God have for me today?')}</button>
 <button type="button" class="bResume" id="bResume" hidden><span>${T('Seguir leyendo','Continue reading')}</span><strong></strong><i aria-hidden="true">›</i></button>
 <div class="bTabs" role="tablist"><button type="button" role="tab" data-t="AT">${T('Antiguo Testamento','Old Testament')}</button><button type="button" role="tab" data-t="NT">${T('Nuevo Testamento','New Testament')}</button></div>
 <div id="bList"></div><p class="bCredit">${T('Torres Amat (1823-1825), dominio público. Antiguo Testamento: ed. de 1884 (edicionescatolicas.org); Nuevo Testamento: 2.ª ed. revisada (fidesviva.org). Ortografía actual; en cursiva, las palabras que añade el traductor.','Douay-Rheims Bible, Challoner revision (1899 edition), public domain, from eBible.org.')}</p>`;
 $('bPal').onclick=openPalabra;
 body.querySelectorAll('.bTabs button').forEach(b=>b.onclick=()=>{test=b.dataset.t;list()});
 try{await books()}catch{$('bList').textContent=ERR;return}
 if(view!=='index')return;
 const p=LS.get('bibliaPos',null);if(p&&BY[p.b]){const r=$('bResume');r.hidden=false;r.querySelector('strong').textContent=bname(BY[p.b])+' '+p.c;r.onclick=()=>showRead(p.b,p.c,true)}
 list();scrollTo(0,0)}
function list(){body.querySelectorAll('.bTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===test));const box=$('bList');if(!box||!BOOKS)return;box.innerHTML='';
 for(const [,a,z,name] of G){const i0=BOOKS.findIndex(b=>b.id===a),i1=BOOKS.findIndex(b=>b.id===z),ls=BOOKS.slice(i0,i1+1);if(!ls.length||ls[0].t!==test)continue;
  const sec=document.createElement('div');sec.innerHTML='<h3>'+esc(name)+'</h3><div class="bBooks"></div>';
  for(const b of ls){const n=nCh(b),x=document.createElement('button');x.type='button';x.innerHTML='<b>'+esc(bname(b))+'</b><small>'+n+' '+(n===1?T('capítulo','chapter'):T('capítulos','chapters'))+'</small>';x.onclick=()=>n===1?showRead(b.id,1):showBook(b.id);sec.lastChild.append(x)}
  box.append(sec)}}
function showBook(id){const b=BY[id];if(!b)return showIndex();enter();view='book';$('bBack').textContent='‹  '+T('Libros','Books');$('bSizer').hidden=true;
 const n=nCh(b),p=LS.get('bibliaPos',{});body.innerHTML=`<h1>${esc(bname(b))}</h1><p class="bLead">${n} ${T('capítulos','chapters')}</p><div class="bChaps" id="bChaps"></div>`;
 for(let c=1;c<=n;c++){const x=document.createElement('button');x.type='button';x.textContent=c;if(p&&p.b===id&&p.c===c)x.className='here';x.onclick=()=>showRead(id,c);$('bChaps').append(x)}scrollTo(0,0)}
async function showRead(id,c,resume){await books().catch(()=>{});const b=BY[id];if(!b)return showIndex();const n=nCh(b);c=Math.max(1,Math.min(n,c|0||1));
 savePos();enter();view='read';READ={id,c};$('bBack').textContent='‹  '+bname(b);$('bSizer').hidden=false;
 body.innerHTML=`<div class="bRead"><h1>${esc(bname(b))} ${c}</h1><p class="bArg" id="bArg"></p><div class="bRule"></div><article class="bScr loading" id="bText" aria-live="polite">${T('Cargando…','Loading…')}</article>
 <nav class="bNav"><button type="button" class="bSecondary" id="bPrev">${T('‹ Anterior','‹ Previous')}</button><button type="button" class="bSecondary" id="bNext">${T('Siguiente ›','Next ›')}</button></nav>
 <p class="bCredit">${T('Torres Amat · dominio público · numeración de la Vulgata','Douay-Rheims · public domain · Vulgate numbering')}</p></div>`;
 $('bPrev').disabled=c<=1;$('bNext').disabled=c>=n;$('bPrev').onclick=()=>showRead(id,c-1);$('bNext').onclick=()=>showRead(id,c+1);scrollTo(0,0);
 let data;try{data=await book(id)}catch{const t=$('bText');if(t){t.classList.remove('loading');t.textContent=ERR}return}
 if(!READ||READ.id!==id||READ.c!==c||view!=='read')return;
 const ch=data.c[c-1]||{},vs=EN?ch:(ch.v||[]);if(!EN)$('bArg').innerHTML=ch.a||'';
 const t=$('bText');t.innerHTML=vs.map((s,i)=>s?'<p id="bv'+(i+1)+'"'+(hl&&hl.includes(i+1)?' class="hl"':'')+'><sup>'+(i+1)+'</sup>'+s+'</p>':'').join('');t.classList.remove('loading');
 const p=LS.get('bibliaPos',null);
 if(hl&&hl.length){const e=$('bv'+hl[0]);requestAnimationFrame(()=>e&&scrollTo({top:e.getBoundingClientRect().top+scrollY-90}))}
 else if(resume&&p&&p.b===id&&p.c===c&&p.y)requestAnimationFrame(()=>scrollTo({top:p.y*(document.documentElement.scrollHeight-innerHeight)}));
 hl=null;setTimeout(savePos,600)}
function savePos(){if(view!=='read'||!READ||v.hidden)return;const h=document.documentElement.scrollHeight-innerHeight;LS.set('bibliaPos',{b:READ.id,c:READ.c,y:h>0?Math.round(scrollY/h*1000)/1000:0,t:Date.now()})}
addEventListener('scroll',()=>{if(view!=='read')return;clearTimeout(saveT);saveT=setTimeout(savePos,400)},{passive:true});
addEventListener('pagehide',savePos);document.addEventListener('visibilitychange',()=>{if(document.hidden)savePos()});

// ---------- ¿Qué tiene Dios para mí hoy? ----------
let cur=null;
const cap=s=>s.replace(/^((?:<[^>]+>|[\s¿¡«"“(—–-])*)(\p{Ll})/u,(m,a,b)=>a+b.toUpperCase());
function draw(){const hist=LS.get('palabraHist',[]),keep=Math.min(hist.length,Math.floor(PAL.length*.6)),recent=new Set(hist.slice(-keep).map(h=>h&&h.id||h));
 let pool=PAL.filter(r=>!recent.has(r.id));if(!pool.length)pool=PAL;let i;try{const a=new Uint32Array(1);crypto.getRandomValues(a);i=a[0]%pool.length}catch{i=Math.floor(Math.random()*pool.length)}
 const r=pool[i];hist.push({id:r.id,t:Date.now()});LS.set('palabraHist',hist.slice(-120));return r}
function fill(r){const th=EN?r.theme_en:r.theme_es,k=th.indexOf(':'),head=k>0?th.slice(k+1).trim():th;
 $('pvHead').textContent=head.charAt(0).toUpperCase()+head.slice(1);$('pvTitle').textContent=EN?r.title_en:r.title_es;$('pvRef').textContent=EN?r.refEn:r.ref;
 let prev=null,out='';(EN?r.verses_en:r.verses_es).forEach(([key,s],j)=>{const [c,n]=key.split(':').map(Number);if(prev&&!(c===prev[0]&&n===prev[1]+1)&&!(c===prev[0]+1&&n===1))out+='<p class="gap">[…]</p>';out+='<p><sup>'+n+'</sup>'+(j===0?cap(s):s)+'</p>';prev=[c,n]});
 $('pvText').innerHTML=out}
async function openPalabra(){if(!PAL){try{PAL=(await load('palabra.json')).readings}catch{try{MO.toast(ERR)}catch{alert(ERR)}return}}
 cur=draw();fill(cur);pv.hidden=false;document.body.classList.add('palabraOn');pv.querySelector('.pvSheet').scrollTop=0;pv.classList.remove('on');void pv.offsetWidth;requestAnimationFrame(()=>pv.classList.add('on'))}
function closePalabra(){if(pv.hidden)return;pv.classList.remove('on');document.body.classList.remove('palabraOn');setTimeout(()=>{if(!pv.classList.contains('on'))pv.hidden=true},650)}
$('pvClose').onclick=closePalabra;pv.querySelector('.pvBackdrop').onclick=closePalabra;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!pv.hidden)closePalabra()});
$('pvAgain').onclick=()=>{pv.classList.add('swap');setTimeout(()=>{cur=draw();fill(cur);pv.querySelector('.pvSheet').scrollTop=0;pv.classList.remove('swap')},480)};
$('pvChapter').onclick=async()=>{if(!cur)return;await books().catch(()=>{});const ab=cur.ref.replace(/\s[\d,.\-]+$/,''),b=(BOOKS||[]).find(x=>x.ab===ab);if(!b)return;
 const f=cur.verses_es[0][0].split(':').map(Number);hl=cur.verses_es.map(x=>x[0].split(':').map(Number)).filter(x=>x[0]===f[0]).map(x=>x[1]);closePalabra();showRead(b.id,f[0])};

// ---------- Atrás (botón del móvil y de la app) ----------
const baseHome=window.goHome;
if(typeof baseHome==='function')window.goHome=function(){if(!pv.hidden)return closePalabra();if(!v.hidden)return back();return baseHome.apply(this,arguments)};

// ---------- Tarjeta en el inicio ----------
const card=document.createElement('section');card.id='bibliaCard';card.dataset.noi18n='1';
card.innerHTML=`<div class="bcGlow" aria-hidden="true"></div><div class="bcPal"><span class="bcEye">✠ &nbsp;${T('Palabra de Dios','Word of God')}</span><h2>${T('¿Qué tiene Dios para mí hoy?','What does God have for me today?')}</h2>
<p>${T('Abre tu corazón. Una lectura del Nuevo Testamento, la que quizá necesitas hoy sin saberlo.','Open your heart. A reading from the New Testament, perhaps the one you need today without knowing it.')}</p>
<button type="button" class="bPrimary" id="bcOpen">📖 &nbsp;${T('Ábrela','Open it')}</button></div>
<button type="button" class="bcBible" id="bcBible"><span class="bcIcon" aria-hidden="true">✝</span><span class="bcTxt"><strong>${T('La Biblia','The Bible')}</strong><small id="bcSub"></small></span><span class="bcGo" aria-hidden="true">›</span></button>`;
const tiles=document.querySelector('#todayCards .tiles');if(tiles)tiles.after(card);else{const h=$('home');h&&h.append(card)}
$('bcOpen').onclick=openPalabra;
$('bcBible').onclick=()=>showIndex();
function renderCard(){const p=LS.get('bibliaPos',null),s=$('bcSub');if(!s)return;
 if(p&&p.b){books().then(()=>{s.textContent=BY[p.b]?T('Seguir leyendo: ','Continue reading: ')+bname(BY[p.b])+' '+p.c:''}).catch(()=>{})}
 s.textContent=T('Antiguo y Nuevo Testamento · Torres Amat','Old and New Testament · Douay-Rheims')}
renderCard();

// ---------- Menú ☰ ----------
(function menu(){const ul=document.querySelector('#drawer ul');if(!ul)return;const ref=[...ul.querySelectorAll('li button')].find(b=>/Evangelio del día|Gospel of the day|Today’s Gospel|Gospel/.test(b.textContent));
 const mk=(icon,txt,fn)=>{const li=document.createElement('li'),b=document.createElement('button');b.dataset.noi18n='1';b.innerHTML='<span class="dIcon" aria-hidden="true"></span><span></span>';b.firstChild.textContent=icon;b.lastChild.textContent=txt;
  b.onclick=()=>{try{$('drawer').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');$('drawerShade').hidden=true;$('menuButton')&&$('menuButton').setAttribute('aria-expanded','false')}catch{}fn()};li.append(b);return li};
 const a=mk('✝',T('La Biblia','The Bible'),()=>showIndex()),b=mk('📖',T('¿Qué tiene Dios para mí hoy?','What does God have for me today?'),()=>openPalabra());
 if(ref)ref.closest('li').after(a,b);else ul.prepend(a,b)})();

// ---------- Barra superior del ordenador ----------
function navLink(){const links=document.querySelector('#siteNav .snLinks');if(!links||links.querySelector('[data-k=bible]'))return;const x=document.createElement('button');x.type='button';x.dataset.k='bible';x.textContent=T('Biblia','Bible');x.onclick=()=>showIndex();
 const g=links.querySelector('[data-k=gospel]');if(g)g.after(x);else links.append(x)}
navLink();try{matchMedia('(min-width: 900px)').addEventListener('change',()=>setTimeout(navLink,50))}catch{}new MutationObserver(navLink).observe(document.body,{childList:true});

// Créditos
const cr=document.querySelector('.v8credits');
if(cr){const d=document.createElement('div');d.className='raCredits';d.dataset.noi18n='1';const h=document.createElement('h4');h.textContent=T('La Biblia','The Bible');const p=document.createElement('p');
 p.textContent=T('Torres Amat (1823-1825), dominio público. Antiguo Testamento: edición de 1884 (edicionescatolicas.org); Nuevo Testamento: 2.ª edición revisada (fidesviva.org, desde Internet Archive). Inglés: Douay-Rheims, revisión de Challoner (1899), dominio público, eBible.org.','Spanish: Torres Amat (1823–1825), public domain (edicionescatolicas.org, fidesviva.org). English: Douay-Rheims, Challoner revision (1899), public domain, eBible.org.');d.append(h,p);cr.append(d)}

window.MO=Object.assign(window.MO||{},{biblia:{open:showIndex,read:showRead,palabra:openPalabra,close:leave,state:()=>({shown:!v.hidden,view,read:READ,palabra:!pv.hidden,cur:cur&&cur.id})}});
})();
