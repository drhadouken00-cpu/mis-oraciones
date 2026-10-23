'use strict';
// Lectura en voz alta con la Web Speech API (sustituye al servicio nativo de Android).
window.TTS=(()=>{
 const synth=window.speechSynthesis;let gen=0,q=[],qi=0,parts=[],pi=0,timerEnd=0,waitT=null,keepAlive=null;
 function voice(){const v=synth?synth.getVoices():[];return v.find(x=>/^es[-_]ES/i.test(x.lang)&&/m[oó]nica|paulina|google|helena|laura/i.test(x.name))||v.find(x=>/^es[-_]ES/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))}
 if(synth&&synth.onvoiceschanged!==undefined)synth.onvoiceschanged=()=>{};
 function set(o){state=Object.assign({},state,o);try{updatePlayer()}catch{}}
 function find(id){return prayers.find(p=>p.id===id)}
 function saveProgress(){try{const remaining=q.slice(qi);checkpoint={id:q[qi],index:pi,queue:remaining,rate,repeat};localStorage.progress=JSON.stringify(checkpoint)}catch{}}
 function clearProgress(){checkpoint={};localStorage.progress='{}'}
 function load(){const p=find(q[qi]);if(!p)return false;parts=p.parts;
  if(!$('reader').hidden&&current?.id!==p.id)openPrayer(p);
  set({id:p.id,total:parts.length,queuePosition:qi,queueTotal:q.length});return true}
 function speakCurrent(){
  const my=++gen;clearTimeout(waitT);
  if(timerEnd&&Date.now()>timerEnd){stop();return}
  if(pi>=parts.length){
   if(timer===-1){stop();clearProgress();return}
   qi++;pi=0;
   if(qi>=q.length){if(repeat){qi=0}else{clearProgress();set({playing:false,paused:false,completed:true,index:0});stopKeep();return}}
   if(!load())return;
   if(gap>0){set({waiting:true,index:0});waitT=setTimeout(()=>{if(my===gen){set({waiting:false});speakCurrent()}},gap*1000);return}
  }
  const part=parts[pi];set({index:pi,playing:true,paused:false,petition:!!part.pause,waiting:false,ready:true,error:''});saveProgress();
  const el=document.getElementById('part-'+pi);if(el&&current?.id===state.id)el.scrollIntoView({behavior:'smooth',block:'center'});
  if(part.pause){set({playing:false,paused:true,petition:true});return}
  if(!synth){set({error:'Tu navegador no permite leer en voz alta.',playing:false});return}
  const u=new SpeechSynthesisUtterance(part.speech||part.text);u.lang='es-ES';const v=voice();if(v)u.voice=v;u.rate=Math.max(.5,Math.min(1.6,rate));
  u.onend=()=>{if(my!==gen)return;pi++;speakCurrent()};
  u.onerror=e=>{if(my!==gen||e.error==='interrupted'||e.error==='canceled')return;pi++;speakCurrent()};
  synth.cancel();synth.speak(u);startKeep();
 }
 // Chrome corta lecturas largas: mantenerla viva
 function startKeep(){if(keepAlive||!/Chrome/.test(navigator.userAgent)||/Mobile/.test(navigator.userAgent))return;keepAlive=setInterval(()=>{if(synth.speaking&&!synth.paused){synth.pause();synth.resume()}},10000)}
 function stopKeep(){clearInterval(keepAlive);keepAlive=null}
 function play(ids,index=0){q=ids.slice();qi=0;pi=Math.max(0,index|0);timerEnd=timer>0?Date.now()+timer*60000:0;showPlayer();if(!load())return;speakCurrent()}
 function pause(){gen++;clearTimeout(waitT);if(synth)synth.cancel();set({playing:false,paused:true,waiting:false});saveProgress()}
 function resume(){if(state.petition){pi++;}speakCurrent()}
 function stop(){gen++;clearTimeout(waitT);if(synth)synth.cancel();stopKeep();set({playing:false,paused:false,waiting:false,petition:false,index:0})}
 function configure(){if(state.playing){pause();resume()}}
 return {play,pause,resume,stop,configure,supported:!!synth};
})();
