'use strict';
// Mis oraciones v15: Modo adoración (Visita al Santísimo), aprobado en preview-santisimo.
// Usa el mismo temporizador de «Tiempo con el Altísimo» (clave altisimo, sin cambiar su formato), así la alarma nativa del APK sigue avisando.
// Clave nueva opcional: santiPrefs {img,track,bell}. No renombra ni borra ninguna clave existente.
// La luz respira con CSS (10 s ≈ 6 respiraciones/min); no hay temporizadores de oración: solo el reloj del tiempo elegido.
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es,$=id=>document.getElementById(id);
if(!$('timerView')||$('santiView'))return;
const NAT=!!(window.Android&&typeof Android.musicPlay==='function');
const KEEP=!!(window.Android&&typeof Android.keepScreenOn==='function');
const HAS_ALARM=!!window.AndroidAlarms;
const IMGS={custodia:{src:'frescos/santi-custodia.webp',w:1100,h:1410,fx:.5,fy:.5,hr:.032,g:1},
 disputa:{src:'frescos/santi-disputa.webp',w:1000,h:1614,fx:.502,fy:.452,hr:.05,g:.95,c:.5},
 juanes:{src:'frescos/santi-juanes.webp',w:1200,h:1605,fx:.2267,fy:.5053,hr:.065,g:.8}};
const PICS={custodia:T('Custodia expuesta','Exposed monstrance'),disputa:T('Rafael · La Disputa','Raphael · The Disputation'),juanes:T('Juan de Juanes · El Salvador','Juan de Juanes · The Saviour')};
const TRACKS={cello:'music/john-michel-ave-maria.mp3',violin:'music/katy-adelson-ave-maria.mp3'};
// Las piezas suenan siempre en bucle hasta que termina el tiempo: una sola pieza se repite; «alt» alterna las dos sin parar.
const tracksFor=k=>k==='cello'?[TRACKS.cello]:k==='violin'?[TRACKS.violin]:k==='alt'?[TRACKS.cello,TRACKS.violin]:[];
const J=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v&&typeof v==='object'?v:d}catch{return d}};
let prefs=Object.assign({img:'custodia',track:'none',bell:true},J('santiPrefs',{}));if(!(prefs.img in IMGS))prefs.img='custodia';
const savePrefs=()=>{try{localStorage.setItem('santiPrefs',JSON.stringify(prefs))}catch{}};
const timer=()=>J('altisimo',{state:'idle',minutes:10,end:0,remaining:0});
const fmt=s=>{s=Math.max(0,Math.ceil(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0')};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Entrada en «Tiempo con el Altísimo» ----------
const open=document.createElement('button');open.type='button';open.id='santiOpen';open.className='santiOpen';open.dataset.noi18n='1';
open.textContent='✨ '+T('Modo adoración','Adoration mode');
const hint=document.createElement('small');hint.className='santiOpenHint';hint.dataset.noi18n='1';hint.textContent=T('Pantalla solo con el Santísimo y una luz que respira','Only the Blessed Sacrament on screen, with a breathing light');
const tc=document.querySelector('#timerView .timerControls');if(tc)tc.after(open,hint);else $('timerView').append(open,hint);

// ---------- Capa ----------
const v=document.createElement('section');v.id='santiView';v.hidden=true;v.dataset.noi18n='1';v.setAttribute('aria-label',T('Modo adoración','Adoration mode'));
v.innerHTML=`<main id="sSetup">
 <div class="sTop"><span class="sEye"></span><button type="button" class="sClose" id="sClose"></button></div>
 <h1></h1><p class="sLead"></p>
 <section id="sDurBox"><h2 class="sDur"></h2><div class="sChips" id="sMins"></div></section>
 <p class="sRun" id="sRun" hidden></p>
 <section><h2 class="sImg"></h2><div class="sPics" id="sPics"></div></section>
 <section>
  <div class="sRow"><span><span class="sMus"></span><small class="sMusSub"></small></span><select id="sTrack"><option value="none"></option><option value="cello"></option><option value="violin"></option><option value="alt"></option></select></div>
  <label class="sRow" id="sBellRow"><span><span class="sBell"></span><small class="sBellSub"></small></span><input type="checkbox" id="sBell"></label>
 </section>
 <button type="button" id="sStart"></button>
 <p class="sNote" id="sNote"></p>
</main>
<section id="sAdore" hidden aria-label="Adoración">
 <div id="sPic"></div>
 <div class="sfx" id="sRays2"></div><div class="sfx" id="sRays"></div><div class="sfx" id="sGlow"></div><div class="sfx" id="sCore"></div>
 <canvas id="sDust"></canvas><div id="sVig"></div><div id="sDot" aria-hidden="true"></div>
 <div id="sHud"><div id="sLeft">00:00</div><button type="button" id="sExit"></button></div>
 <div id="sVeil"></div>
</section>
<section id="sEnd" hidden><div class="sMono" aria-hidden="true"></div><p class="sBig"></p><p class="sSub"></p><button type="button" id="sAgain"></button></section>
<audio id="sAud" preload="none"></audio>`;
document.body.append(v);
const q=s=>v.querySelector(s);
q('.sEye').textContent=T('Visita al Santísimo','Visit to the Blessed Sacrament');
q('#sClose').textContent='‹ '+T('Volver','Back');
q('h1').innerHTML=T('Quédate con Él.<br><em>Sin prisa.</em>','Stay with Him.<br><em>Unhurried.</em>');
q('.sLead').textContent=T('La pantalla se queda solo con la imagen y una luz suave que respira despacio. Sin letras. Toca la pantalla si necesitas ver el tiempo.','The screen shows only the image and a soft light that breathes slowly. No text. Tap the screen if you need to see the time.');
q('.sDur').textContent=T('¿Cuánto tiempo?','How long?');q('.sImg').textContent=T('Imagen','Image');
q('.sMus').textContent=T('Música de fondo','Background music');q('.sMusSub').textContent=T('Ave María instrumental, muy bajita, en bucle hasta el final','Instrumental Ave Maria, very soft, looping until the end');
const o=q('#sTrack').options;o[0].textContent=T('Sin música','No music');o[1].textContent=T('Violonchelo (Bach-Gounod)','Cello (Bach-Gounod)');o[2].textContent=T('Violín (Schubert)','Violin (Schubert)');o[3].textContent=T('Las dos, alternando','Both, alternating');
q('.sBell').textContent=T('Campana suave al terminar','Soft bell at the end');q('.sBellSub').textContent=T('Un solo toque, muy suave','A single, very gentle tone');
q('#sExit').textContent=T('Terminar','Finish');q('#sAgain').textContent='‹ '+T('Volver','Back');
q('.sBig').textContent=T('Alabado sea el Santísimo Sacramento del altar.','Praised be the Most Blessed Sacrament of the altar.');
q('.sSub').textContent=T('Sea por siempre bendito y alabado.','Forever blessed and praised.');
// En el APK el aviso final lo da la alarma nativa del temporizador (suena aunque se apague la pantalla).
if(HAS_ALARM)q('#sBellRow').hidden=true;
const note=()=>KEEP?T('La pantalla se mantendrá encendida. Al terminar sonará el aviso suave del temporizador.','The screen will stay on. When time is up, the timer’s gentle alert will sound.')
 :('wakeLock' in navigator)?T('Consejo: pon el móvil en silencio. La pantalla se mantendrá encendida mientras dure.','Tip: silence your phone. The screen will stay on for the whole time.')
 :T('Tu navegador no puede mantener la pantalla encendida: sube el tiempo de apagado de pantalla en los ajustes del móvil.','Your browser cannot keep the screen on: increase the screen timeout in your phone settings.');

function minutes(){return timer().minutes||10}
function setMinutes(m){const r=$('timerMinutes');if(!r)return;r.value=m;r.dispatchEvent(new Event('input',{bubbles:true}))}
function render(){
 const t=timer(),busy=t.state==='running'||t.state==='paused';
 q('#sDurBox').hidden=busy;q('#sRun').hidden=!busy;
 if(busy){const l=t.state==='running'?(t.end-Date.now())/1000:t.remaining;q('#sRun').textContent=T('Tu tiempo con el Altísimo sigue en curso: quedan ','Your time with the Most High is still running: ')+fmt(l)}
 const mins=minutes();
 q('#sMins').replaceChildren(...[5,10,15,20,30,45,60].map(m=>{const b=document.createElement('button');b.type='button';b.textContent=m+' min';b.setAttribute('aria-pressed',String(m===mins));b.onclick=()=>{setMinutes(m);render()};return b}));
 q('#sPics').replaceChildren(...Object.entries(IMGS).map(([k,I])=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(k===prefs.img));b.innerHTML=`<img src="${I.src}" alt="" loading="lazy"><span></span>`;b.querySelector('span').textContent=PICS[k];b.onclick=()=>{prefs.img=k;savePrefs();render()};return b}));
 q('#sTrack').value=['none','cello','violin','alt'].includes(prefs.track)?prefs.track:'none';q('#sBell').checked=!!prefs.bell;
 q('#sStart').textContent=busy?T('Continuar','Continue'):T('Empezar','Begin')+' · '+mins+' min';
 q('#sNote').textContent=note();
}
q('#sTrack').onchange=e=>{prefs.track=e.target.value;savePrefs()};
q('#sBell').onchange=e=>{prefs.bell=e.target.checked;savePrefs()};

function show(){v.hidden=false;document.body.classList.add('santiOn');q('#sSetup').hidden=false;q('#sAdore').hidden=true;q('#sEnd').hidden=true;q('#sEnd').classList.remove('on');render();v.scrollTop=0;try{window.MO&&MO.music&&MO.music.tick()}catch{}}
function hide(){v.hidden=true;document.body.classList.remove('santiOn');try{window.MO&&MO.music&&MO.music.tick()}catch{}}
open.onclick=show;q('#sClose').onclick=hide;
q('#sAgain').onclick=()=>{hide();try{window.MO&&MO.openTimer&&MO.openTimer()}catch{}};

// ---------- Pantalla encendida ----------
let wake=null;
async function keepAwake(on){
 if(KEEP){try{Android.keepScreenOn(!!on)}catch{}}
 if(on){try{if(!KEEP&&'wakeLock' in navigator&&!document.hidden&&!wake){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null})}}catch{wake=null}}
 else{try{wake&&wake.release()}catch{}wake=null}
}

// ---------- Música (en bucle) ----------
const aud=q('#sAud');let list=[],idx=0,vol=0,fadeRaf=0,musicOn=false;const VOL=.12;
aud.addEventListener('ended',()=>{if(!musicOn)return;if(list.length>1){idx=(idx+1)%list.length;aud.src=list[idx]}aud.currentTime=0;aud.play().catch(()=>{})});
function setVol(x){vol=Math.max(0,Math.min(1,x));if(NAT){try{Android.musicVolume(vol)}catch{}}else aud.volume=vol}
function fade(to,ms,done){cancelAnimationFrame(fadeRaf);const from=vol,t0=performance.now();(function step(n){const k=Math.min(1,(n-t0)/ms);setVol(from+(to-from)*k);if(k<1)fadeRaf=requestAnimationFrame(step);else done&&done()})(t0)}
function musicStart(){list=tracksFor(prefs.track);if(!list.length)return;musicOn=true;idx=0;vol=0;
 if(NAT){try{Android.musicPlay(list.join('|'),0);fade(VOL,6000)}catch{}return}
 aud.loop=list.length===1;aud.src=list[0];aud.volume=0;aud.play().then(()=>fade(VOL,6000)).catch(()=>{})}
function musicStop(ms){if(!musicOn)return;const end=()=>{musicOn=false;if(NAT){try{Android.musicStop()}catch{}}else{aud.pause()}};if(ms)fade(0,ms,end);else{cancelAnimationFrame(fadeRaf);end()}}

// ---------- Adoración ----------
let endAt=0,tick=0,revealT=0,raf=0,running=false,audioCtx=null;
function layout(){
 const I=IMGS[prefs.img],W=innerWidth,H=innerHeight,s=Math.max(W/I.w,H/I.h),w=I.w*s,h=I.h*s;
 const x=Math.min(0,Math.max(W-w,W/2-I.fx*w)),y=Math.min(0,Math.max(H-h,H*.46-I.fy*h));
 const p=q('#sPic');Object.assign(p.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',backgroundImage:`url("${I.src}")`});
 p.style.setProperty('--fx',I.fx*100+'%');p.style.setProperty('--fy',I.fy*100+'%');
 const hx=x+I.fx*w,hy=y+I.fy*h,hr=I.hr*w,a=q('#sAdore').style;
 a.setProperty('--x',hx+'px');a.setProperty('--y',hy+'px');a.setProperty('--h',hr+'px');
 const g=Math.max(hr*14,Math.min(W,H)*.9)*I.g;
 q('#sCore').style.filter=I.c?`opacity(${I.c})`:'';
 for(const [id,k] of [['#sGlow',1],['#sRays',1.25],['#sRays2',1.5]])q(id).style.setProperty('--s',g*k+'px');
 dustOrigin={x:hx,y:hy,r:g*.45};sizeCanvas();
}
const cv=q('#sDust'),cx=cv.getContext('2d');let parts=[],dustOrigin={x:0,y:0,r:200},last=0;
function sizeCanvas(){const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;cx.setTransform(d,0,0,d,0,0)}
function seed(p){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*dustOrigin.r*1.6;p.x=dustOrigin.x+Math.cos(a)*r;p.y=dustOrigin.y+Math.sin(a)*r;p.vx=(Math.random()-.5)*.08;p.vy=-(.05+Math.random()*.12);p.s=.6+Math.random()*1.6;p.life=0;p.max=600+Math.random()*900;return p}
function breath(){try{const an=q('#sGlow').getAnimations().find(a=>a.animationName==='sBreathe');const t=((an?an.currentTime:performance.now())%10000)/1000,E=u=>.5-.5*Math.cos(Math.PI*u);
 return t<.4?0:t<4.2?E((t-.4)/3.8):t<4.6?1:E(1-(t-4.6)/5.4)}catch{return .5}}
function frame(ts){raf=requestAnimationFrame(frame);if(ts-last<41)return;const dt=Math.min(3,(ts-last)/41);last=ts;
 cx.clearRect(0,0,innerWidth,innerHeight);const b=.6+.4*breath();
 for(const p of parts){p.life+=dt;p.x+=p.vx*dt*4;p.y+=p.vy*dt*4;const k=p.life/p.max;if(k>=1){seed(p);continue}
  cx.globalAlpha=Math.sin(Math.PI*k)*.5*b;const gr=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*3);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(1,'rgba(255,220,150,0)');cx.fillStyle=gr;cx.beginPath();cx.arc(p.x,p.y,p.s*3,0,7);cx.fill()}
 cx.globalAlpha=1}
function startDust(){if(reduce||raf)return;if(!parts.length)parts=Array.from({length:Math.round(Math.min(46,innerWidth*innerHeight/9000))},()=>{const p=seed({});p.life=Math.random()*p.max;return p});last=performance.now();raf=requestAnimationFrame(frame)}
function stopDust(){cancelAnimationFrame(raf);raf=0}
// Para pruebas/capturas: congela la respiración (1 = inspirado, 0 = espirado) o la reanuda (null)
function hold(b){const ms=b==null?null:(b?4400:200);for(const id of ['#sGlow','#sCore','#sRays','#sRays2'])for(const an of q(id).getAnimations()){if(!/^sBreathe|^sRaysB/.test(an.animationName))continue;if(ms==null)an.play();else{an.currentTime=ms;an.pause()}}}
addEventListener('resize',()=>{if(running)layout()});
document.addEventListener('visibilitychange',()=>{if(!running)return;if(document.hidden){stopDust()}else{if(Date.now()>=endAt){finish(true,true);return}keepAwake(true);startDust()}});
function bell(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const c=audioCtx,s=c.currentTime+.05;
 for(const [f,g0] of [[523.25,.09],[1046.5,.03],[1568,.012]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(g0,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+5.5);o.start(s);o.stop(s+5.6)}}catch{}}
function reveal(){q('#sLeft').textContent=fmt((endAt-Date.now())/1000);q('#sAdore').classList.add('reveal');clearTimeout(revealT);revealT=setTimeout(()=>q('#sAdore').classList.remove('reveal'),3000)}
q('#sAdore').addEventListener('click',e=>{if(e.target.id==='sExit')return;reveal()});
q('#sExit').onclick=e=>{e.stopPropagation();finish(false)};

function start(){
 // Si se está leyendo una oración en voz alta, se detiene: este es un rato de silencio.
 try{if(typeof state!=='undefined'&&(state.playing||state.paused))$('stop').click()}catch{}
 const t=timer();if(t.state!=='running')$('timerStart').click();   // mismo inicio que «Comenzar»: guarda altisimo y programa la alarma nativa
 endAt=timer().end||Date.now()+minutes()*60000;
 try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}catch{}
 q('#sSetup').hidden=true;q('#sEnd').hidden=true;const a=q('#sAdore');a.hidden=false;a.className='';
 running=true;keepAwake(true);layout();startDust();musicStart();
 requestAnimationFrame(()=>requestAnimationFrame(()=>a.classList.add('on')));
 clearInterval(tick);tick=setInterval(()=>{if(Date.now()>=endAt)finish(true);else if(a.classList.contains('reveal'))q('#sLeft').textContent=fmt((endAt-Date.now())/1000)},500);
}
q('#sStart').onclick=start;
function finish(natural,late){
 if(!running)return;running=false;clearInterval(tick);const a=q('#sAdore');a.classList.remove('reveal');a.classList.add('ending');
 if(!natural){try{const t=timer();if(t.state==='running'||t.state==='paused')$('timerCancel').click()}catch{}}
 if(natural&&!late){if(prefs.bell&&!HAS_ALARM)bell();try{navigator.vibrate&&navigator.vibrate([40,120,40])}catch{}}
 musicStop(late?0:4000);
 setTimeout(()=>{stopDust();a.hidden=true;keepAwake(false);const e=q('#sEnd');e.hidden=false;requestAnimationFrame(()=>e.classList.add('on'))},natural&&!late?5200:1200);
}

// Botón atrás del móvil (el APK llama a goHome()): termina la adoración o cierra la capa.
const prevHome=window.goHome;
window.goHome=goHome=function(){if(!v.hidden){if(running)finish(false);else hide();return}return prevHome.apply(this,arguments)};

// ☰ Menú: «Modo adoración» justo debajo de «Tiempo con el Altísimo»
(function menu(){const ul=document.querySelector('#drawer ul');if(!ul)return;const items=[...ul.querySelectorAll('li button')];
 const ref=items.find(b=>/Altísimo|Most High/.test(b.textContent));
 const li=document.createElement('li');const b=document.createElement('button');b.dataset.noi18n='1';b.innerHTML='<span class="dIcon" aria-hidden="true">✨</span><span></span>';b.lastChild.textContent=T('Modo adoración','Adoration mode');
 b.onclick=()=>{try{$('drawer').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');$('drawerShade').hidden=true}catch{}try{MO.openTimer()}catch{}show()};li.append(b);
 if(ref)ref.closest('li').after(li);else ul.append(li)})();

// Créditos
const cr=document.querySelector('.v8credits');
if(cr){const d=document.createElement('div');d.className='raCredits santiCredits';d.dataset.noi18n='1';const h=document.createElement('h4');h.textContent=T('Modo adoración','Adoration mode');const p=document.createElement('p');
 p.textContent=T('Imágenes: custodia en St. Gabriel (Connersville), foto de Nheyob, CC0 · Rafael, «Disputa del Sacramento» (1509-1510), dominio público · Juan de Juanes, «El Salvador» (Museo del Prado), dominio público. Fuente: Wikimedia Commons.','Images: monstrance at St. Gabriel (Connersville), photo by Nheyob, CC0 · Raphael, “Disputation of the Holy Sacrament” (1509–1510), public domain · Juan de Juanes, “The Saviour” (Prado Museum), public domain. Source: Wikimedia Commons.');
 d.append(h,p);cr.append(d)}

// Estilo v15: la ventanita del «Rosario del día» muestra un fresco de los misterios de hoy
(function rosaryArt(){const t=$('tileRosary'),sub=$('rosarySub');if(!t||!sub)return;const M={gozosos:'gozosos-1',joyful:'gozosos-1',dolorosos:'dolorosos-3',sorrowful:'dolorosos-3',gloriosos:'gloriosos-1',glorious:'gloriosos-1',luminosos:'luminosos-1',luminous:'luminosos-1'};
 const set=()=>{const m=(sub.textContent||'').toLowerCase().match(/gozosos|dolorosos|gloriosos|luminosos|joyful|sorrowful|glorious|luminous/);if(m)t.style.setProperty('--art',`url(frescos/${M[m[0]]}.webp)`)};set();new MutationObserver(set).observe(sub,{childList:true,characterData:true,subtree:true})})();

window.MO=Object.assign(window.MO||{},{santi:{show,hide,start,finish,layout,hold,breath,state:()=>({open:!v.hidden,running,endAt,wake:!!wake,keep:KEEP,prefs:Object.assign({},prefs),music:{on:musicOn,list:list.slice(),idx,native:NAT,loop:aud.loop,src:(aud.src||'').split('/').pop(),paused:aud.paused,vol:Math.round(vol*1000)/1000}})}});
})();
