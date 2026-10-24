'use strict';
// Lectura en voz alta con la Web Speech API (sustituye al servicio nativo de Android).
// v4: frases troceadas, vigilante anti-cortes, Wake Lock, audio silencioso + Media Session para seguir con pantalla apagada.
window.TTS=(()=>{
 const synth=window.speechSynthesis;let gen=0,q=[],qi=0,parts=[],pi=0,timerEnd=0,waitT=null,keepAlive=null,watch=null,lastActivity=0,lock=null,silent=null;
 const mobile=/Android|iPhone|iPad|Mobile/.test(navigator.userAgent);
 function voice(){const v=synth?synth.getVoices():[];return v.find(x=>/^es[-_]ES/i.test(x.lang)&&/m[oó]nica|paulina|google|helena|laura/i.test(x.name))||v.find(x=>/^es[-_]ES/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))}
 if(synth&&synth.onvoiceschanged!==undefined)synth.onvoiceschanged=()=>{};
 function set(o){state=Object.assign({},state,o);try{updatePlayer()}catch{}}
 function find(id){return prayers.find(p=>p.id===id)}
 function saveProgress(){try{const remaining=q.slice(qi);checkpoint={id:q[qi],index:pi,queue:remaining,rate,repeat};localStorage.progress=JSON.stringify(checkpoint)}catch{}}
 function clearProgress(){checkpoint={};localStorage.progress='{}'}
 // Trocea textos largos en frases (<≈180 caracteres): Chrome corta las locuciones largas a los ~15 s.
 function chunks(t){const out=[];for(const s of String(t).split(/(?<=[.;:!?¡¿…])\s+|\n+/)){let x=s.trim();while(x.length>180){let c=x.lastIndexOf(',',180);if(c<60)c=x.lastIndexOf(' ',180);if(c<60)c=180;out.push(x.slice(0,c+1));x=x.slice(c+1).trim()}if(x)out.push(x)}return out.length?out:[String(t)]}
 // ---- Mantener viva la página ----
 async function wake(){try{if('wakeLock' in navigator&&!lock&&document.visibilityState==='visible'){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}}catch{lock=null}}
 function unwake(){try{lock&&lock.release()}catch{}lock=null}
 function silentSrc(){const sr=8000,n=sr,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);for(let i=0;i<n;i++)v.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
 function bgOn(){try{if(!silent){silent=new Audio(silentSrc());silent.loop=true;silent.volume=0.01;silent.setAttribute('playsinline','')}silent.play().catch(()=>{})}catch{}
  try{if('mediaSession' in navigator){const p=find(q[qi]);navigator.mediaSession.metadata=new MediaMetadata({title:p?p.title:'Mis oraciones',artist:'Mis oraciones',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]});navigator.mediaSession.playbackState='playing';
   const h={play:()=>resume(),pause:()=>pause(),stop:()=>stop(),nexttrack:()=>{gen++;if(synth)synth.cancel();pi++;speakCurrent()},previoustrack:()=>{gen++;if(synth)synth.cancel();pi=Math.max(0,pi-1);speakCurrent()}};for(const k in h)try{navigator.mediaSession.setActionHandler(k,h[k])}catch{}}}catch{}
  wake()}
 function bgOff(paused){try{silent&&silent.pause()}catch{}try{if('mediaSession' in navigator)navigator.mediaSession.playbackState=paused?'paused':'none'}catch{}unwake()}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;if(state.playing){wake();if(silent&&silent.paused)silent.play().catch(()=>{});if(synth&&!synth.speaking&&!state.waiting&&!state.petition)speakCurrent()}});
 function load(){const p=find(q[qi]);if(!p)return false;parts=p.parts;
  if(!$('reader').hidden&&current?.id!==p.id)openPrayer(p);
  set({id:p.id,total:parts.length,queuePosition:qi,queueTotal:q.length});return true}
 function speakCurrent(){
  const my=++gen;clearTimeout(waitT);lastActivity=Date.now();
  if(timerEnd&&Date.now()>timerEnd){stop();return}
  if(pi>=parts.length){
   if(timer===-1){stop();clearProgress();return}
   qi++;pi=0;
   if(qi>=q.length){if(repeat){qi=0}else{clearProgress();set({playing:false,paused:false,completed:true,index:0});stopKeep();bgOff();try{document.dispatchEvent(new CustomEvent('mo-finished',{detail:{id:q[q.length-1]}}))}catch{}return}}
   if(!load())return;
   if(gap>0){set({waiting:true,index:0});waitT=setTimeout(()=>{if(my===gen){set({waiting:false});speakCurrent()}},gap*1000);return}
  }
  const part=parts[pi];set({index:pi,playing:true,paused:false,petition:!!part.pause,waiting:false,petWait:0,ready:true,error:'',completed:false});saveProgress();
  const el=document.getElementById('part-'+pi);if(el&&current?.id===state.id&&document.visibilityState==='visible')el.scrollIntoView({behavior:'smooth',block:'center'});
  if(part.pause){set({playing:false,paused:true,petition:true});bgOff(true);return}
  if(!synth){set({error:'Tu navegador no permite leer en voz alta.',playing:false});return}
  bgOn();
  const list=chunks(part.speech||part.text),v=voice();let ci=0;synth.cancel();
  const next=()=>{if(my!==gen)return;lastActivity=Date.now();if(ci>=list.length){pi++;if(/^rosario-/.test(state.id||'')&&/^(?:[^·]*· )*Oh Jesús mío/.test(part.text)&&parts.slice(pi,pi+3).some(x=>/misterio/i.test(x.text.split(' · ')[0])||/^✧/.test(x.text))&&!parts.slice(pi,pi+2).some(x=>/^(Salve|✧ LETAN)/.test(x.text))){petitionWait(my);return}speakCurrent();return}
   const u=new SpeechSynthesisUtterance(list[ci++]);u.lang='es-ES';if(v)u.voice=v;u.rate=Math.max(.5,Math.min(1.6,rate));
   u.onstart=()=>{lastActivity=Date.now()};u.onend=next;
   u.onerror=e=>{if(my!==gen||e.error==='interrupted'||e.error==='canceled')return;next()};
   synth.speak(u)};
  next();startKeep();
 }
 // Chrome de escritorio corta lecturas largas: pausa/reanuda periódica. Vigilante: si la voz se queda muda, retoma el pasaje.
 // Pausa de 8 s para peticiones personales tras «Oh Jesús mío» (el audio silencioso sigue sonando).
 const PETITION_SECONDS=8;
 function petitionWait(my){const end=Date.now()+PETITION_SECONDS*1000;lastActivity=Date.now();set({waiting:true,petWait:PETITION_SECONDS});
  const tick=()=>{if(my!==gen)return;lastActivity=Date.now();const left=Math.ceil((end-Date.now())/1000);if(left<=0){set({waiting:false,petWait:0});speakCurrent();return}set({petWait:left});waitT=setTimeout(tick,Math.min(1000,end-Date.now()))};waitT=setTimeout(tick,1000)}
 function startKeep(){
  if(!keepAlive&&!mobile&&/Chrome/.test(navigator.userAgent))keepAlive=setInterval(()=>{if(synth.speaking&&!synth.paused){synth.pause();synth.resume()}},10000);
  if(!watch)watch=setInterval(()=>{if(state.playing&&!state.waiting&&!state.petition&&synth&&!synth.speaking&&!synth.pending&&Date.now()-lastActivity>4000)speakCurrent()},3000)}
 function stopKeep(){clearInterval(keepAlive);keepAlive=null;clearInterval(watch);watch=null}
 function play(ids,index=0){q=ids.slice();qi=0;pi=Math.max(0,index|0);timerEnd=timer>0?Date.now()+timer*60000:0;showPlayer();if(!load())return;speakCurrent()}
 function pause(){gen++;clearTimeout(waitT);if(synth)synth.cancel();set({playing:false,paused:true,waiting:false});saveProgress();bgOff(true)}
 function resume(){if(state.petition){pi++;}speakCurrent()}
 function stop(){gen++;clearTimeout(waitT);if(synth)synth.cancel();stopKeep();bgOff();set({playing:false,paused:false,waiting:false,petition:false,index:0})}
 function configure(){if(state.playing){pause();resume()}}
 return {play,pause,resume,stop,configure,supported:!!synth};
})();
