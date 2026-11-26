'use strict';
/* Prueba del Ángelus / Regina Caeli · Mis oraciones.
   No toca la app, ni el SW, ni localStorage (solo LEE theme/moLang para empezar con tus ajustes).
   Voz: speechSynthesis; cada frase avanza en su onend (sin temporizadores). */
(function(){
const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);

/* ---------- Textos ---------- */
const AVE={es:{a:'Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús.',b:'Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.'},
 en:{a:'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',b:'Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.'}};
const GLORIA={es:'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',en:'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.'};
/* Ave María y Gloria: se leen de los textos reales de la app (library.js / library-en.js) si se pueden cargar. */
async function appTexts(){
  for(const [lg,url] of [['es','../library.js'],['en','../library-en.js']]){
    try{
      const code=await (await fetch(url,{cache:'no-cache'})).text(),w={};new Function('window',code)(w);
      const P=w.PRAYERS||[],ang=P.find(p=>p.id==='angelus'),glo=P.find(p=>p.id==='gloria');
      if(ang&&ang.parts[1]){const t=ang.parts[1].text,i=t.search(/ (Santa María|Holy Mary)/);if(i>0){AVE[lg]={a:t.slice(0,i).trim(),b:t.slice(i).trim()}}}
      if(glo&&glo.parts[0])GLORIA[lg]=glo.parts[0].text;
    }catch(e){}
  }
}

/* V = guía, R = todos. img = fresco que acompaña esa frase. */
function angelusSteps(lg){
  const A=AVE[lg],t=lg==='es'?{
    v1:'El Ángel del Señor anunció a María.',r1:'Y concibió por obra y gracia del Espíritu Santo.',
    v2:'He aquí la esclava del Señor.',r2:'Hágase en mí según tu palabra.',
    v3:'Y el Verbo se hizo carne.',r3:'Y habitó entre nosotros.',
    v4:'Ruega por nosotros, Santa Madre de Dios.',r4:'Para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo.',
    oz:'Oremos.',o1:'Derrama, Señor, tu gracia sobre nosotros, que, por el anuncio del Ángel, hemos conocido la encarnación de tu Hijo,',
    o2:'para que lleguemos, por su pasión y su cruz, a la gloria de la resurrección. Por Jesucristo, nuestro Señor. Amén.'}:{
    v1:'The Angel of the Lord declared unto Mary.',r1:'And she conceived of the Holy Spirit.',
    v2:'Behold the handmaid of the Lord.',r2:'Be it done unto me according to thy word.',
    v3:'And the Word was made flesh.',r3:'And dwelt among us.',
    v4:'Pray for us, O holy Mother of God.',r4:'That we may be made worthy of the promises of Christ.',
    oz:'Let us pray.',o1:'Pour forth, we beseech thee, O Lord, thy grace into our hearts;',
    o2:'that we, to whom the Incarnation of Christ, thy Son, was made known by the message of an angel, may by his Passion and Cross be brought to the glory of his Resurrection. Through the same Christ, our Lord. Amen.'};
  const S=[],add=(k,x,img,bead)=>S.push({k,t:x,img,bead});
  add('V',t.v1,'gab',0);add('R',t.r1,'gab',0);add('ave',A.a,'gab',0);add('ave',A.b,'gab',0);
  add('V',t.v2,'vir',1);add('R',t.r2,'vir',1);add('ave',A.a,'vir',1);add('ave',A.b,'vir',1);
  add('V',t.v3,'c3',2);add('R',t.r3,'c3',2);add('ave',A.a,'c3',2);add('ave',A.b,'c3',2);
  add('V',t.v4,'c3',3);add('R',t.r4,'c3',3);
  add('ora',t.oz,'c3',3);add('oraP',t.o1,'c3',3);add('oraP',t.o2,'c3',3);
  return S;
}
function reginaSteps(lg){
  const t=lg==='es'?{
    v1:'Reina del cielo, alégrate, aleluya.',r1:'Porque el Señor, a quien mereciste llevar, aleluya,',
    v2:'ha resucitado, según su palabra, aleluya.',r2:'Ruega a Dios por nosotros, aleluya.',
    v3:'Gózate y alégrate, Virgen María, aleluya.',r3:'Porque ha resucitado verdaderamente el Señor, aleluya.',
    oz:'Oremos.',o1:'¡Oh Dios, que por la resurrección de tu Hijo, nuestro Señor Jesucristo, te has dignado alegrar al mundo!',
    o2:'Concédenos, te rogamos, que por la intercesión de su Madre, la Virgen María, alcancemos los gozos de la vida eterna. Por el mismo Jesucristo, nuestro Señor. Amén.'}:{
    v1:'Queen of heaven, rejoice, alleluia.',r1:'For he whom you were worthy to bear, alleluia,',
    v2:'has risen as he said, alleluia.',r2:'Pray for us to God, alleluia.',
    v3:'Rejoice and be glad, O Virgin Mary, alleluia.',r3:'For the Lord has truly risen, alleluia.',
    oz:'Let us pray.',o1:'O God, who through the resurrection of your Son, our Lord Jesus Christ, did vouchsafe to give joy to the world;',
    o2:'grant, we beseech you, that through his Mother, the Virgin Mary, we may obtain the joys of everlasting life. Through the same Christ our Lord. Amen.'};
  const S=[],add=(k,x,img,bead)=>S.push({k,t:x,img,bead});
  add('V',t.v1,'c8',0);add('R',t.r1,'c8',0);add('V',t.v2,'c8',1);add('R',t.r2,'c8',1);
  add('V',t.v3,'noli',2);add('R',t.r3,'noli',2);
  add('ora',t.oz,'noli',3);add('oraP',t.o1,'noli',3);add('oraP',t.o2,'noli',3);
  return S;
}

/* ---------- Frescos (dominio público, Wikimedia Commons) ---------- */
const IMG={
 gab:{f:'img/angelus-gabriel.webp',artist:'Giotto',es:'Anunciación: el ángel Gabriel (Capilla Scrovegni, Padua)',en:'Annunciation: the Angel Gabriel (Scrovegni Chapel, Padua)',yr:'1306',src:'https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._14_Annunciation_-_The_Angel_Gabriel_Sent_by_God_-_WGA09190.jpg',note:{es:'detalle recortado',en:'cropped detail'},pos:'50% 60%'},
 vir:{f:'img/angelus-virgen.webp',artist:'Giotto',es:'Anunciación: la Virgen recibe el mensaje (Capilla Scrovegni, Padua)',en:'Annunciation: the Virgin receives the message (Scrovegni Chapel, Padua)',yr:'1306',src:'https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._15_Annunciation_-_The_Virgin_Receiving_the_Message_-_WGA09191.jpg',note:{es:'detalle recortado',en:'cropped detail'},pos:'50% 60%'},
 c3:{f:'img/angelus-cell3.webp',artist:'Fra Angelico',es:'La Anunciación (celda 3, San Marcos, Florencia)',en:'The Annunciation (cell 3, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Annunciation_(Cell_3)_-_WGA00538.jpg',pos:'50% 40%'},
 c8:{f:'img/regina-cell8.webp',artist:'Fra Angelico',es:'La Resurrección y las santas mujeres en el sepulcro (celda 8, San Marcos, Florencia)',en:'The Resurrection and the Women at the Tomb (cell 8, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Resurrection_of_Christ_and_Women_at_the_Tomb_(Cell_8)_-_WGA00542.jpg',pos:'50% 40%'},
 noli:{f:'img/regina-noli.webp',artist:'Fra Angelico',es:'Noli me tangere (celda 1, San Marcos, Florencia)',en:'Noli me tangere (cell 1, San Marco, Florence)',yr:'c. 1439–1443',src:'https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_Noli_Me_Tangere_(Cell_1)_-_WGA00535.jpg',pos:'50% 40%'}
};

/* ---------- Textos de la interfaz ---------- */
const UI={
es:{pvTitle:'Prueba · Ángelus',pvSub:'Página sin enlazar: no cambia la app ni tus datos.',dbgSum:'Opciones de prueba',dbgSeason:'Temporada',dbgDate:'Fecha',dbgClock:'Hora',
 sAuto:'Automática (por la fecha)',sAng:'Ver Ángelus',sReg:'Ver Regina Caeli',clockDev:'Reloj del dispositivo',
 ctx:'Así se vería el panel de inicio con el Ángelus junto a las coronillas.',
 tGospel:'Evangelio del día',tGospelSub:'Evangelio según San Lucas 21,20-28.',tRosary:'Rosario del día',tRosarySub:'Misterios luminosos',tChaplet:'Coronilla',tChapletSub:'Divina Misericordia',tTimer:'Tiempo con el Altísimo',tTimerSub:'De 1 a 60 minutos',
 angName:'Ángelus',angSub:'La Anunciación · tres veces al día',regName:'Regina Caeli',regSub:'Reina del cielo · tiempo de Pascua',
 now:'Ahora toca el Ángelus',nowReg:'Ahora toca el Regina Caeli',next:(h,d)=>`Próximo: ${h} · ${d}`,inH:(h,m)=>h?`dentro de ${h} h ${m} min`:`dentro de ${m} min`,tomorrow:'mañana',
 pray:'Rezar',rem:'Avisos',remOn:n=>n?`Avisos · ${n}`:'Avisos',
 remH:'Avisos',remLead:'Un aviso a cada hora del Ángelus, si quieres. Es opcional.',remNote:'Solo es una maqueta: aquí no se programa nada. En la app de Android se usarían las alarmas nativas que ya tiene «Recordatorios»; en la web, un evento de calendario (.ics), como ahora.',remClose:'Cerrar',
 remRowSub:{6:'Al amanecer',12:'Mediodía',18:'Atardecer'},
 streak:'Empieza hoy tu racha de oración ✧',
 title:'ÁNGELUS',titleR:'REGINA CAELI',set:'La Anunciación del Señor',setR:'Tiempo de Pascua',
 mysA:['El anuncio del ángel','«Hágase en mí»','El Verbo se hizo carne','Oremos'],mysR:['Reina del cielo, alégrate','Alégrate, Virgen María','Ha resucitado el Señor','Oremos'],
 modeVoice:'🔊 Con voz',modeManual:'👆 Manual',play:'Escuchar',pause:'Pausa',gloria:'Añadir Gloria',
 vatican:'Escuchar el Ángelus del Papa en Vatican News ↗',vaticanR:'Escuchar el Regina Caeli del Papa en Vatican News ↗',vaturl:'https://www.vaticannews.va/es/papa.pagelist.angelus.html',
 noVoice:'Este navegador no tiene voz: usa el modo Manual.',
 V:'V.',R:'R.',credSum:'Créditos de esta prueba',
 dbgInfo:(y,e,p,s)=>`Pascua ${y}: ${e} → Pentecostés: ${p}. Hoy toca: ${s}.`,
 months:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']},
en:{pvTitle:'Preview · Angelus',pvSub:'Unlinked page: it does not change the app or your data.',dbgSum:'Test options',dbgSeason:'Season',dbgDate:'Date',dbgClock:'Time',
 sAuto:'Automatic (by date)',sAng:'Show Angelus',sReg:'Show Regina Caeli',clockDev:'Device clock',
 ctx:'This is how the home panel would look with the Angelus next to the chaplets.',
 tGospel:'Gospel of the day',tGospelSub:'Gospel according to St Luke 21:20-28.',tRosary:'Rosary of the day',tRosarySub:'Luminous mysteries',tChaplet:'Chaplet',tChapletSub:'Divine Mercy',tTimer:'Time with the Most High',tTimerSub:'From 1 to 60 minutes',
 angName:'Angelus',angSub:'The Annunciation · three times a day',regName:'Regina Caeli',regSub:'Queen of Heaven · Eastertide',
 now:'It is time for the Angelus',nowReg:'It is time for the Regina Caeli',next:(h,d)=>`Next: ${h} · ${d}`,inH:(h,m)=>h?`in ${h} h ${m} min`:`in ${m} min`,tomorrow:'tomorrow',
 pray:'Pray',rem:'Reminders',remOn:n=>n?`Reminders · ${n}`:'Reminders',
 remH:'Reminders',remLead:'A reminder at each Angelus hour, if you like. It is optional.',remNote:'This is only a mock-up: nothing is scheduled here. In the Android app it would use the native alarms that “Reminders” already has; on the web, a calendar event (.ics), as today.',remClose:'Close',
 remRowSub:{6:'Dawn',12:'Noon',18:'Evening'},
 streak:'Start your prayer streak today ✧',
 title:'THE ANGELUS',titleR:'REGINA CAELI',set:'The Annunciation of the Lord',setR:'Eastertide',
 mysA:['The angel’s message','“Be it done unto me”','The Word made flesh','Let us pray'],mysR:['Queen of heaven, rejoice','Rejoice, O Virgin Mary','The Lord is risen','Let us pray'],
 modeVoice:'🔊 Voice',modeManual:'👆 Manual',play:'Listen',pause:'Pause',gloria:'Add Glory Be',
 vatican:'Listen to the Pope’s Angelus on Vatican News ↗',vaticanR:'Listen to the Pope’s Regina Caeli on Vatican News ↗',vaturl:'https://www.vaticannews.va/en/pope.pagelist.angelus.html',
 noVoice:'This browser has no voice: use Manual mode.',
 V:'V.',R:'R.',credSum:'Credits for this preview',
 dbgInfo:(y,e,p,s)=>`Easter ${y}: ${e} → Pentecost: ${p}. Today: ${s}.`,
 months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']}};

/* ---------- Estado ---------- */
const pad=n=>String(n).padStart(2,'0'),today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
let LS={};try{LS={theme:localStorage.getItem('theme'),lang:localStorage.getItem('moLang')}}catch(e){}   // solo lectura
const st={lang:Q.get('lang')||(LS.lang==='en'?'en':'es'),theme:Q.get('theme')||LS.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),
 season:Q.get('season')||'auto',date:Q.get('date')||today(),clock:Q.get('t')||'',rem:{6:Q.get('rem')==='1',12:Q.get('rem')==='1',18:Q.get('rem')==='1'},
 gloria:Q.get('gloria')==='1',mode:Q.get('mode')||'voice',idx:0,playing:false};

/* ---------- Pascua ---------- */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
const dayNum=d=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
function pdate(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function isEaster(dateStr){const d=pdate(dateStr),E=easter(d.getFullYear()),n=dayNum(d);return n>=dayNum(E)&&n<=dayNum(E)+49}   // Domingo de Pascua → Pentecostés (inclusive)
function regina(){return st.season==='regina'||(st.season==='auto'&&isEaster(st.date))}
const fmt=d=>d.getDate()+' '+UI[st.lang].months[d.getMonth()];
window.__easter=easter;window.__isEaster=isEaster;

/* ---------- Reloj ---------- */
function nowMin(){if(st.clock){const [h,m]=st.clock.split(':').map(Number);return h*60+m}const d=new Date();return d.getHours()*60+d.getMinutes()}
const SLOTS=[6,12,18],WINDOW=45;
function slotInfo(){const n=nowMin();let cur=null;for(const h of SLOTS){if(n>=h*60&&n<h*60+WINDOW)cur=h}
 let nx=SLOTS.find(h=>h*60>n),tom=false;if(nx==null){nx=SLOTS[0];tom=true}
 const diff=(tom?1440:0)+nx*60-n;return {cur,nx,tom,h:Math.floor(diff/60),m:diff%60}}

/* ---------- Panel ---------- */
function paintHome(){
  const L=UI[st.lang],R=regina(),si=slotInfo();
  document.documentElement.lang=st.lang;document.documentElement.dataset.theme=st.theme;
  document.querySelector('meta[name=theme-color]').content=st.theme==='dark'?'#16130f':'#f8f5ed';
  $('themeToggle').textContent=st.theme==='dark'?'☀':'☾';
  document.querySelectorAll('.langToggle button').forEach(b=>b.setAttribute('aria-pressed',b.lang===st.lang));
  document.querySelectorAll('[data-k]').forEach(e=>e.textContent=L[e.dataset.k]);
  $('pvTitle').textContent=L.pvTitle;$('pvSub').textContent=L.pvSub;$('dbgSum').textContent=L.dbgSum;$('dbgSeason').textContent=L.dbgSeason;$('dbgDate').textContent=L.dbgDate;$('dbgClock').textContent=L.dbgClock;
  $('ctxNote').textContent=L.ctx;$('streak').textContent=L.streak;$('credSum').textContent=L.credSum;
  const o=$('dbgSeasonSel').options;o[0].text=L.sAuto;o[1].text=L.sAng;o[2].text=L.sReg;$('dbgSeasonSel').value=st.season;$('dbgDateIn').value=st.date;
  const cs=$('dbgClockSel');cs.innerHTML='';[['',L.clockDev],['05:55','05:55'],['06:10','06:10'],['09:00','09:00'],['11:50','11:50'],['12:20','12:20'],['15:00','15:00'],['17:30','17:30'],['18:05','18:05'],['22:30','22:30']].forEach(([v,t])=>cs.add(new Option(t,v)));cs.value=st.clock;
  const y=pdate(st.date).getFullYear(),E=easter(y),P=new Date(E.getFullYear(),E.getMonth(),E.getDate()+49);
  $('dbgInfo').textContent=L.dbgInfo(y,fmt(E),fmt(P),R?'Regina Caeli':(st.lang==='es'?'Ángelus':'Angelus'));
  const tile=$('tileAngelus');tile.classList.toggle('regina',R);
  tile.style.setProperty('--art',`url(${new URL(R?'img/regina-cell8.webp':'img/angelus-cell3.webp',location.href).href})`);tile.style.setProperty('--pos',R?'center 12%':'center 44%');
  $('angName').textContent=R?L.regName:L.angName;$('angSub').textContent=R?L.regSub:L.angSub;
  $('angChips').innerHTML=SLOTS.map(h=>`<span class="angChip${h===si.cur?' cur':h===si.nx&&si.cur==null?' nx':''}" role="listitem"><b>${h}:00</b></span>`).join('');
  $('angStatus').innerHTML=si.cur!=null?`<span class="dot"></span>${R?L.nowReg:L.now}`:L.next(si.nx+':00',(si.tom?L.tomorrow+' · ':'')+L.inH(si.h,si.m));
  $('angStatus').classList.toggle('nowS',si.cur!=null);
  $('angPray').textContent=L.pray;const n=SLOTS.filter(h=>st.rem[h]).length;$('angRem').textContent=L.remOn(n||'');
  // diálogo de avisos
  $('remH').textContent=(R?L.regName:L.angName)+' · '+L.remH.toLowerCase();$('remLead').textContent=L.remLead;$('remNote').textContent=L.remNote;$('remClose').textContent=L.remClose;
  $('remRows').innerHTML=SLOTS.map(h=>`<label class="remRow"><span><b>${h}:00</b><small>${L.remRowSub[h]}</small></span><input type="checkbox" data-h="${h}" ${st.rem[h]?'checked':''}></label>`).join('');
  $('remRows').querySelectorAll('input').forEach(i=>i.onchange=()=>{st.rem[i.dataset.h]=i.checked;paintHome()});
  paintCredits();
  if(!$('angView').hidden)paintPrayer(true);
}

/* ---------- Créditos ---------- */
function paintCredits(){
  const es=st.lang==='es',l=st.lang;
  const li=k=>{const m=IMG[k];return `<li><b>${m.artist}</b>, <i>${m[l]}</i>, ${m.yr}${m.note?` (${m.note[l]})`:''}. ${es?'Fresco. Dominio público (PD-Art, reproducción fiel de una obra 2D de dominio público). Fuente:':'Fresco. Public domain (PD-Art, faithful reproduction of a public-domain 2D work). Source:'} <a href="${m.src}" target="_blank" rel="noopener">Wikimedia Commons</a>.</li>`};
  $('credBody').innerHTML=es?`
  <h3>Textos</h3>
  <p>Ángelus y Regina Caeli: devoción tradicional de la Iglesia (el Ángelus es una devoción de los siglos XI–XVI; el Regina Caeli es una antífona mariana, probablemente de los siglos X–XI, que se reza en Pascua en lugar del Ángelus por disposición de Benedicto XIV, 1742). No son textos de la app ni de su autor.</p>
  <ul>
   <li>Estructura y versículos: <a href="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_sp.html" target="_blank" rel="noopener">Compendio del Catecismo de la Iglesia Católica, Apéndice «Oraciones comunes» (vatican.va)</a> y <i>Enchiridion Indulgentiarum</i>.</li>
   <li>Texto español de la oración final y del Regina Caeli: versión litúrgica en uso en las diócesis de España (p. ej. Diócesis de Asidonia-Jerez, <a href="https://familiayvidajerez.org/rezo-del-angelus/" target="_blank" rel="noopener">«Rezo del Ángelus»</a>).</li>
   <li>Ave María y Gloria: los mismos textos que ya tiene la app.</li>
   <li>Horas (6:00, 12:00 y 18:00) y cambio de Pascua: <a href="https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_sp.html" target="_blank" rel="noopener">Directorio sobre la piedad popular y la liturgia, nn. 195–196 (vatican.va)</a>.</li>
  </ul>
  <h3>Imágenes</h3><ul>${['gab','vir','c3','c8','noli'].map(li).join('')}</ul>
  <h3>Audio</h3><p>La voz es la del propio dispositivo. No se usa ningún audio del Papa: las grabaciones son de Vatican Media. Solo hay un enlace opcional a Vatican News.</p>`
  :`
  <h3>Texts</h3>
  <p>Angelus and Regina Caeli: traditional devotions of the Church (the Angelus developed between the 11th and 16th centuries; the Regina Caeli is a Marian antiphon, probably of the 10th–11th century, said in Eastertide in place of the Angelus by decree of Benedict XIV, 1742). They are not texts written by the app or its author.</p>
  <ul>
   <li>Structure and versicles: <a href="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html" target="_blank" rel="noopener">Compendium of the Catechism of the Catholic Church, Appendix “Common Prayers” (vatican.va)</a>, and the <i>Enchiridion of Indulgences</i>.</li>
   <li>English wording of the Angelus: the traditional text, as in the <a href="https://usccb.org/sites/default/files/flipbooks/uscca/files/assets/basic-html/page-563.html" target="_blank" rel="noopener">United States Catholic Catechism for Adults, Appendix B (USCCB)</a>.</li>
   <li>Hail Mary and Glory Be: the same texts the app already has.</li>
   <li>Hours (6:00, 12:00 and 18:00) and the Easter change: <a href="https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html" target="_blank" rel="noopener">Directory on Popular Piety and the Liturgy, nn. 195–196 (vatican.va)</a>.</li>
  </ul>
  <h3>Images</h3><ul>${['gab','vir','c3','c8','noli'].map(li).join('')}</ul>
  <h3>Audio</h3><p>The voice is the device’s own. No audio of the Pope is used: those recordings belong to Vatican Media. There is only an optional link to Vatican News.</p>`;
}

/* ---------- Pantalla de oración ---------- */
let steps=[],gen=0,synth=window.speechSynthesis||null;
function buildSteps(){const R=regina();let s=(R?reginaSteps:angelusSteps)(st.lang);if(st.gloria)s=s.concat([{k:'gl',t:GLORIA[st.lang],img:s[s.length-1].img,bead:3}]);steps=s}
const KB=[[1.04,-1.2,.6],[1.07,1,-.8],[1.05,-.6,1],[1.08,.8,.4],[1.045,-1,-.5],[1.075,.5,-1]];   // zoom/pan sutil por frase
function ensureSlides(){
  const keys=regina()?['c8','noli']:['gab','vir','c3'],bg=$('avBg'),stg=$('avStage');
  if(stg.dataset.keys===keys.join())return;stg.dataset.keys=keys.join();bg.innerHTML='';stg.innerHTML='';
  keys.forEach(k=>{const m=IMG[k];const b=document.createElement('div');b.className='bgi';b.dataset.k=k;b.style.backgroundImage=`url(${m.f})`;bg.append(b);
    const im=document.createElement('img');im.src=m.f;im.alt=m[st.lang];im.dataset.k=k;im.decoding='async';stg.append(im)});
}
function paintPrayer(keep){
  const L=UI[st.lang],R=regina();buildSteps();if(!keep)st.idx=0;st.idx=Math.min(st.idx,steps.length-1);
  $('angView').classList.toggle('regina',R);
  $('avTitle').textContent=R?L.titleR:L.title;$('avSet').textContent=R?L.setR:L.set;
  $('avMode').textContent=st.mode==='voice'?L.modeVoice:L.modeManual;$('avMode').setAttribute('aria-pressed',st.mode==='voice');
  $('avGloria').checked=st.gloria;$('avGloriaT').textContent=L.gloria;
  const v=$('avVatican');v.textContent=R?L.vaticanR:L.vatican;v.href=L.vaturl;
  ensureSlides();
  const box=$('avText');box.innerHTML='';
  steps.forEach((s,i)=>{const p=document.createElement('p');p.className='ph '+s.k;p.dataset.i=i;
    const lab=s.k==='V'?L.V:s.k==='R'?L.R:'';
    p.innerHTML=(lab?`<b class="lab">${lab}</b>`:'')+`<span>${s.t.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`;
    p.onclick=()=>{go(i)};box.append(p)});
  show();
}
const ICO={prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',more:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'};
function show(scroll=true){
  const L=UI[st.lang],s=steps[st.idx],R=regina();
  document.querySelectorAll('#avText .ph').forEach((p,i)=>{p.classList.toggle('cur',i===st.idx);p.classList.toggle('done',i<st.idx)});
  const cur=document.querySelector('#avText .ph.cur'),bx=$('avText');if(cur&&scroll)bx.scrollTo({top:cur.offsetTop-bx.clientHeight/2+cur.offsetHeight/2,behavior:'smooth'});
  // fresco de esta frase: fundido + zoom/desplazamiento muy suave (transición CSS al cambiar de frase)
  document.querySelectorAll('#avBg .bgi').forEach(b=>b.classList.toggle('on',b.dataset.k===s.img));
  const kb=KB[st.idx%KB.length];
  document.querySelectorAll('#avStage img').forEach(im=>{const on=im.dataset.k===s.img;im.classList.toggle('on',on);if(on){im.style.setProperty('--s',kb[0]);im.style.setProperty('--x',kb[1]+'%');im.style.setProperty('--y',kb[2]+'%')}});
  const m=IMG[s.img];const c=$('avCredit');c.textContent=m.artist+' · '+m[st.lang].split(' (')[0];c.href=m.src;
  $('avMys').textContent=(R?L.mysR:L.mysA)[Math.min(s.bead,3)];
  document.querySelectorAll('#avBeads i').forEach((b,i)=>{b.classList.toggle('done',i<s.bead);b.classList.toggle('cur',i===s.bead)});
  $('avPlay').innerHTML=st.playing?ICO.pause:ICO.play;$('avPrev').innerHTML=ICO.prev;$('avPlay').setAttribute('aria-label',st.playing?L.pause:L.play);
  $('angView').classList.toggle('manual',st.mode!=='voice');$('avPlay').hidden=st.mode!=='voice';
  $('avNext').innerHTML=st.mode==='voice'?ICO.next:ICO.more;
}
/* ---------- Voz: onend de cada frase avanza (sin temporizadores) ---------- */
function pickVoice(){const v=synth?synth.getVoices():[];if(st.lang==='en')return v.find(x=>/^en[-_](US|GB)/i.test(x.lang)&&/samantha|daniel|google|karen|serena|aria|jenny|libby|sonia/i.test(x.name))||v.find(x=>/^en[-_](US|GB)/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang));
  return v.find(x=>/^es[-_]ES/i.test(x.lang)&&/m[oó]nica|paulina|google|helena|laura/i.test(x.name))||v.find(x=>/^es[-_]ES/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))}
function speak(){
  if(!synth||!window.SpeechSynthesisUtterance){stopVoice();return}
  const my=++gen;synth.cancel();
  const u=new SpeechSynthesisUtterance(steps[st.idx].t);const v=pickVoice();if(v)u.voice=v;u.lang=st.lang==='en'?'en-GB':'es-ES';u.rate=.92;
  u.onend=()=>{if(my!==gen||!st.playing)return;if(st.idx>=steps.length-1){stopVoice();return}st.idx++;show();speak()};
  u.onerror=e=>{if(my!==gen)return;if(e&&(e.error==='interrupted'||e.error==='canceled'))return;stopVoice()};
  synth.speak(u);
}
function stopVoice(){gen++;st.playing=false;try{synth&&synth.cancel()}catch(e){}show(false)}
function go(i){st.idx=Math.max(0,Math.min(steps.length-1,i));show();if(st.playing)speak()}
$('avPlay').onclick=()=>{if(st.playing){stopVoice();return}if(st.idx>=steps.length-1&&0)st.idx=0;st.playing=true;show(false);speak()};
$('avNext').onclick=()=>go(st.idx+1);$('avPrev').onclick=()=>go(st.idx-1);
$('avMode').onclick=()=>{if(st.playing)stopVoice();st.mode=st.mode==='voice'?'manual':'voice';paintPrayer(true)};
$('avGloria').onchange=e=>{if(st.playing)stopVoice();st.gloria=e.target.checked;paintPrayer(true)};
$('avText').addEventListener('click',()=>{});
function open(){$('angView').hidden=false;document.body.classList.add('avOn');paintPrayer(false);$('avBack').focus({preventScroll:true})}
function close(){stopVoice();$('angView').hidden=true;document.body.classList.remove('avOn')}
$('avBack').onclick=close;
addEventListener('keydown',e=>{if($('angView').hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowRight')go(st.idx+1);if(e.key==='ArrowLeft')go(st.idx-1)});

/* ---------- Eventos del panel ---------- */
$('angPray').onclick=open;$('angRem').onclick=()=>$('remDlg').showModal();$('remClose').onclick=()=>$('remDlg').close();
$('tileAngelus').addEventListener('click',e=>{if(e.target.closest('button'))return;open()});
document.querySelectorAll('.langToggle button').forEach(b=>b.onclick=()=>{st.lang=b.lang;if(st.playing)stopVoice();paintHome()});
$('themeToggle').onclick=()=>{st.theme=st.theme==='dark'?'light':'dark';paintHome()};
$('dbgSeasonSel').onchange=e=>{st.season=e.target.value;paintHome()};
$('dbgDateIn').onchange=e=>{if(e.target.value){st.date=e.target.value;paintHome()}};
$('dbgClockSel').onchange=e=>{st.clock=e.target.value;paintHome()};
if(synth)synth.onvoiceschanged=()=>{};

window.__ang={st,open,close,go,paintHome,steps:()=>steps};
paintHome();
appTexts().then(()=>{paintHome();if(Q.get('view')==='pray'){open();if(Q.get('step'))go(+Q.get('step'))}});
})();
