/* Mis oraciones · La Biblia (página de prueba). Claves nuevas: bibliaPos, bibliaPrefs, palabraHist (no toca ninguna clave existente). */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const prefs=Object.assign({fs:19,lang:null},LS.get('bibliaPrefs',{}));
let lang=prefs.lang||(()=>{try{return localStorage.getItem('moLang')==='en'?'en':'es'}catch{return 'es'}})();
const T={
 es:{eyebrow:'Palabra de Dios',title:'La <em>Biblia</em>',lead:'Las Sagradas Escrituras completas, en la traducción católica de Torres Amat.',
  pTitle:'¿Qué tiene Dios para mí hoy?',pLead:'Abre tu corazón. Una lectura del Nuevo Testamento, la que quizá necesitas hoy sin saberlo.',pBtn:'Ábrela',pNote:'Las palabras de Jesús, sus parábolas y los apóstoles. Texto bíblico literal.',
  resume:'Seguir leyendo',ot:'Antiguo Testamento',nt:'Nuevo Testamento',books:'Libros',chapters:'capítulos',chapter:'Capítulo',ch1:'capítulo',
  prev:'‹ Anterior',next:'Siguiente ›',eyebrowP:'Dios te dice hoy',again:'Otra palabra',open:'Leer el capítulo',close:'Cerrar',loading:'Cargando…',err:'No se ha podido cargar. Revisa la conexión.',
  credit:'Torres Amat (1823-1825), dominio público. Antiguo Testamento: ed. de 1884 (<a href="https://edicionescatolicas.org/biblia/" target="_blank" rel="noopener">edicionescatolicas.org</a>); Nuevo Testamento: 2.ª ed. revisada (<a href="https://fidesviva.org/es/biblia" target="_blank" rel="noopener">fidesviva.org</a>). Ortografía actual; en cursiva, las palabras que añade el traductor.',
  readCredit:'Torres Amat · dominio público · numeración de la Vulgata',
  groups:{pent:'Pentateuco',hist:'Libros históricos',sap:'Libros sapienciales',prof:'Profetas',gos:'Evangelios',act:'Hechos',paul:'Cartas de san Pablo',cath:'Cartas católicas',rev:'Apocalipsis'}},
 en:{eyebrow:'Word of God',title:'The <em>Bible</em>',lead:'The complete Holy Scriptures, in the Catholic Douay-Rheims translation.',
  pTitle:'What does God have for me today?',pLead:'Open your heart. A reading from the New Testament, perhaps the one you need today without knowing it.',pBtn:'Open it',pNote:'The words of Jesus, His parables and the apostles. Literal Bible text.',
  resume:'Continue reading',ot:'Old Testament',nt:'New Testament',books:'Books',chapters:'chapters',chapter:'Chapter',ch1:'chapter',
  prev:'‹ Previous',next:'Next ›',eyebrowP:'God tells you today',again:'Another word',open:'Read the chapter',close:'Close',loading:'Loading…',err:'Could not load. Please check your connection.',
  credit:'Douay-Rheims Bible, Challoner revision (1899 edition), public domain, from <a href="https://ebible.org/find/details.php?id=engDRA" target="_blank" rel="noopener">eBible.org</a>.',
  readCredit:'Douay-Rheims · public domain · Vulgate numbering',
  groups:{pent:'Pentateuch',hist:'Historical books',sap:'Wisdom books',prof:'Prophets',gos:'Gospels',act:'Acts',paul:'Letters of St Paul',cath:'Catholic letters',rev:'Revelation'}}};
const G=[['pent','gen','deu'],['hist','jos','2ma'],['sap','job','sir'],['prof','isa','mal'],['gos','mat','jhn'],['act','act','act'],['paul','rom','heb'],['cath','jas','jud'],['rev','rev','rev']];
let BOOKS=[],BY={},READ=null;const cache={};
const t=k=>T[lang][k];
const bname=b=>b[lang];
function load(url){return fetch(url).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})}
function book(id){const k=lang+'/'+id;return cache[k]||(cache[k]=load('data/'+lang+'/'+id+'.json').catch(e=>{delete cache[k];throw e}))}
/* ---------- textos de la interfaz ---------- */
function paint(){document.documentElement.lang=lang;
 $$('[data-t]').forEach(el=>{const v=t(el.dataset.t);if(el.hasAttribute('data-html'))el.innerHTML=v;else el.textContent=v});
 $$('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 $('#pClose').setAttribute('aria-label',t('close'));$('#pAgain').textContent=t('again');$('#pChapter').textContent=t('open');
 document.title=(lang==='es'?'La Biblia':'The Bible')+' · Mis oraciones'}
/* ---------- inicio ---------- */
let test='NT';
function renderBooks(){$$('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.test===test));
 const box=$('#bookList');box.innerHTML='';
 G.forEach(([g,a,z])=>{const i0=BOOKS.findIndex(b=>b.id===a),i1=BOOKS.findIndex(b=>b.id===z),list=BOOKS.slice(i0,i1+1);if(list[0].t!==test)return;
  const sec=document.createElement('div');sec.className='group';sec.innerHTML='<h3>'+t('groups')[g]+'</h3><div class="books"></div>';
  list.forEach(b=>{const n=lang==='en'?b.nen:b.n,btn=document.createElement('button');btn.type='button';btn.innerHTML='<b></b><small></small>';
   btn.querySelector('b').textContent=bname(b);btn.querySelector('small').textContent=n+' '+(n===1?t('ch1'):t('chapters'));btn.onclick=()=>go(n===1?'#/r/'+b.id+'/1':'#/b/'+b.id);sec.lastChild.appendChild(btn)});
  box.appendChild(sec)});
 const p=LS.get('bibliaPos',null),r=$('#resume');
 if(p&&BY[p.b]){r.hidden=false;$('#resumeWhere').textContent=bname(BY[p.b])+' '+p.c;r.onclick=()=>go('#/r/'+p.b+'/'+p.c)}else r.hidden=true}
/* ---------- capítulos ---------- */
function renderBook(id){const b=BY[id];if(!b)return go('#/');const n=lang==='en'?b.nen:b.n,p=LS.get('bibliaPos',{});
 $('#bookTitle').textContent=bname(b);$('#bookSub').textContent=n+' '+t('chapters');const g=$('#chapterGrid');g.innerHTML='';
 for(let c=1;c<=n;c++){const x=document.createElement('button');x.type='button';x.textContent=c;if(p.b===id&&p.c===c)x.className='here';x.onclick=()=>go('#/r/'+id+'/'+c);g.appendChild(x)}}
/* ---------- lector ---------- */
let hl=null,saveT=0;
async function renderRead(id,c){const b=BY[id];if(!b)return go('#/');const n=lang==='en'?b.nen:b.n;c=Math.max(1,Math.min(n,c|0||1));
 READ={id,c};$('#readBackLabel').textContent=bname(b);$('#readTitle').textContent=bname(b)+' '+c;$('#readArg').textContent='';
 const box=$('#readText');box.classList.add('loading');$('#readCredit').textContent=t('readCredit');
 $('#prevCh').textContent=t('prev');$('#nextCh').textContent=t('next');$('#prevCh').disabled=c<=1;$('#nextCh').disabled=c>=n;
 let data;try{data=await book(id)}catch{box.classList.remove('loading');box.textContent=t('err');return}
 if(!READ||READ.id!==id||READ.c!==c)return;
 const ch=data.c[c-1],vs=lang==='en'?ch:ch.v;$('#readArg').innerHTML=lang==='en'?'':(ch.a||'');
 box.innerHTML=vs.map((v,i)=>v?'<p id="v'+(i+1)+'"'+(hl&&hl.includes(i+1)?' class="hl"':'')+'><sup>'+(i+1)+'</sup>'+v+'</p>':'').join('');box.classList.remove('loading');
 const p=LS.get('bibliaPos',null);
 if(hl&&hl.length){const el=$('#v'+hl[0]);requestAnimationFrame(()=>el&&window.scrollTo({top:el.getBoundingClientRect().top+scrollY-80}))}
 else if(p&&p.b===id&&p.c===c&&p.y)requestAnimationFrame(()=>window.scrollTo({top:p.y*(document.documentElement.scrollHeight-innerHeight)}));
 else window.scrollTo({top:0});
 hl=null;savePos()}
function savePos(){if(!READ||$('#vRead').hidden)return;const h=document.documentElement.scrollHeight-innerHeight;LS.set('bibliaPos',{b:READ.id,c:READ.c,y:h>0?Math.round(scrollY/h*1000)/1000:0,t:Date.now()})}
addEventListener('scroll',()=>{clearTimeout(saveT);saveT=setTimeout(savePos,400)},{passive:true});
function setFs(d){prefs.fs=Math.max(15,Math.min(30,prefs.fs+d));document.documentElement.style.setProperty('--fs',prefs.fs+'px');LS.set('bibliaPrefs',prefs)}
/* ---------- rutas ---------- */
function go(h){if(location.hash===h)route();else location.hash=h}
function show(v){['vHome','vBook','vRead'].forEach(x=>$('#'+x).hidden=x!==v)}
function route(){const m=location.hash.match(/^#\/(b|r)\/([a-z0-9]+)(?:\/(\d+))?/);
 if(m&&m[1]==='b'){show('vBook');renderBook(m[2]);scrollTo(0,0)}
 else if(m&&m[1]==='r'){show('vRead');renderRead(m[2],+m[3]||1)}
 else{show('vHome');renderBooks()}}
$('#readBack').onclick=()=>{const b=BY[READ&&READ.id];go(b&&(lang==='en'?b.nen:b.n)>1?'#/b/'+b.id:'#/')};
$$('[data-go=home]').forEach(b=>b.onclick=()=>go('#/'));
$('#prevCh').onclick=()=>go('#/r/'+READ.id+'/'+(READ.c-1));$('#nextCh').onclick=()=>go('#/r/'+READ.id+'/'+(READ.c+1));
$('#fontUp').onclick=()=>setFs(1);$('#fontDown').onclick=()=>setFs(-1);
$$('.tabs button').forEach(b=>b.onclick=()=>{test=b.dataset.test;renderBooks()});
$$('.lang button').forEach(b=>b.onclick=()=>{if(b.dataset.lang===lang)return;lang=b.dataset.lang;prefs.lang=lang;LS.set('bibliaPrefs',prefs);paint();if(cur)fillPalabra(cur);route()});
/* ---------- ¿Qué tiene Dios para mí hoy? ---------- */
let PAL=null,cur=null;const pal=$('#palabra');
const cap=s=>s.replace(/^((?:<[^>]+>|[\s¿¡«"“(—–-])*)(\p{Ll})/u,(m,a,b)=>a+b.toUpperCase());
function draw(){const hist=LS.get('palabraHist',[]),keep=Math.min(hist.length,Math.floor(PAL.length*0.6));
 const recent=new Set(hist.slice(-keep).map(h=>h.id||h));let pool=PAL.filter(r=>!recent.has(r.id));if(!pool.length)pool=PAL;
 const a=new Uint32Array(1);(crypto.getRandomValues?crypto.getRandomValues(a):a[0]=Math.random()*4e9);const r=pool[a[0]%pool.length];
 hist.push({id:r.id,t:Date.now()});LS.set('palabraHist',hist.slice(-120));return r}
function fillPalabra(r){const th=lang==='en'?r.theme_en:r.theme_es,i=th.indexOf(':'),head=i>0?th.slice(i+1).trim():th;
 $('#pEyebrow').textContent=t('eyebrowP');$('#pHead').textContent=head.charAt(0).toUpperCase()+head.slice(1);
 $('#pTitle2').textContent=lang==='en'?r.title_en:r.title_es;$('#pRef').textContent=lang==='en'?r.refEn:r.ref;
 const vs=lang==='en'?r.verses_en:r.verses_es;let prev=null,out='';
 vs.forEach(([k,v],j)=>{const[c,n]=k.split(':').map(Number);if(prev&&!(c===prev[0]&&n===prev[1]+1)&&!(c===prev[0]+1&&n===1))out+='<p class="gap">[…]</p>';
  out+='<p><sup>'+n+'</sup>'+(j===0?cap(v):v)+'</p>';prev=[c,n]});
 $('#pText').innerHTML=out}
async function openPalabra(){if(!PAL){try{PAL=(await load('data/palabra.json')).readings}catch{alert(t('err'));return}}
 cur=draw();fillPalabra(cur);pal.hidden=false;document.body.classList.add('lock');$('.pSheet').scrollTop=0;
 pal.classList.remove('on');void pal.offsetWidth;requestAnimationFrame(()=>pal.classList.add('on'));setTimeout(()=>$('#pAgain').focus({preventScroll:true}),1500)}
function closePalabra(){pal.classList.remove('on');document.body.classList.remove('lock');setTimeout(()=>{if(!pal.classList.contains('on'))pal.hidden=true},650)}
$('#openPalabra').onclick=openPalabra;$('#pClose').onclick=closePalabra;$('.pBackdrop').onclick=closePalabra;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!pal.hidden)closePalabra()});
$('#pAgain').onclick=()=>{pal.classList.add('swap');setTimeout(()=>{cur=draw();fillPalabra(cur);$('.pSheet').scrollTop=0;pal.classList.remove('swap')},480)};
$('#pChapter').onclick=()=>{if(!cur)return;const ab=cur.ref.replace(/\s[\d,.\-]+$/,''),b=BOOKS.find(x=>x.ab===ab);if(!b)return;
 const first=cur.verses_es[0][0].split(':').map(Number);hl=cur.verses_es.map(x=>x[0].split(':').map(Number)).filter(x=>x[0]===first[0]).map(x=>x[1]);
 closePalabra();go('#/r/'+b.id+'/'+first[0])};
/* ---------- arranque ---------- */
document.documentElement.style.setProperty('--fs',prefs.fs+'px');paint();
load('data/books.json').then(b=>{BOOKS=b;b.forEach(x=>BY[x.id]=x);const p=LS.get('bibliaPos',null);if(p&&BY[p.b])test=BY[p.b].t;route()}).catch(()=>{$('#bookList').textContent=t('err')});
addEventListener('hashchange',()=>{savePos();route()});
})();
