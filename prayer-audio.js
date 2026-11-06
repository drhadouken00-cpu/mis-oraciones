'use strict';
// Campo opcional p.audio: URL mp3 autorizada. Ninguna oración trae grabaciones.
// TTS conserva su motor y sus eventos palabra a palabra; una grabación no tiene tiempos por palabra.
window.PrayerAudio=(()=>{
 let audio=null,queue=[],index=0,backend=null,waiting=false,serial=0,deadline=0,wait=null;
 const find=id=>prayers.find(p=>p.id===id);
 function valid(p){if(!p||typeof p.audio!=='string'||!p.audio.trim())return false;try{return /^(https?:|file:)$/.test(new URL(p.audio,location.href).protocol)}catch{return false}}
 function set(x){state=Object.assign({},state,x);updatePlayer()}
 function stop(){if(waiting){if(native)Android.stop();else TTS.stop()}serial++;clearTimeout(wait);if(audio){audio.pause();audio.onended=audio.onerror=null;audio=null}waiting=false;queue=[];set({playing:false,paused:false,waiting:false})}
 function advance(){if(!queue.length)return;const token=serial;
  if(timer===-1||(deadline&&Date.now()>=deadline)){stop();return}
  queue.shift();index=0;
  if(!queue.length){if(repeat){queue=original.slice()}else{audio=null;waiting=false;set({playing:false,paused:false,completed:true});return}}
  wait=setTimeout(()=>{if(token===serial)next()},Math.max(0,gap)*1000)}
 let original=[];
 function next(){const p=find(queue[0]);if(!p)return stop();
  if(!valid(p)){audio=null;waiting=true;backend([p.id],index);return}
  waiting=false;audio=new Audio(p.audio);const a=audio,token=serial;
  audio.setAttribute('playsinline','');set({id:p.id,index:0,total:p.parts.length,playing:true,paused:false,completed:false,petition:false,waiting:false,error:''});
  checkpoint={id:p.id,index:0,queue:queue.slice()};if(!native)localStorage.progress=JSON.stringify(checkpoint);
  if(current?.id!==p.id&&!$('reader').hidden)openPrayer(p);
  audio.onended=()=>{if(token===serial)advance()};audio.onerror=()=>{if(token!==serial)return;set({playing:false,paused:true,error:'No se ha podido cargar la grabación. Comprueba la conexión.'})};
  audio.play().catch(()=>{if(token===serial&&audio===a)set({playing:false,paused:true,error:'Pulsa ▶ para iniciar la grabación.'})});
 }
 function finish(id){if(waiting&&queue[0]===id){waiting=false;advance()}}
 document.addEventListener('mo-finished',e=>finish(e.detail?.id));
 setInterval(()=>{if(native&&waiting&&state.completed&&!state.playing&&!state.paused)finish(state.id)},550);
 function play(ids,i,raw){if(!ids.some(id=>valid(find(id)))){stopMedia();raw(ids,i);return}
  stopMedia();if(native)Android.stop();else TTS.stop();original=ids.slice();queue=ids.slice();index=i;backend=raw;deadline=timer>0?Date.now()+timer*60000:0;next()}
 function stopMedia(){serial++;clearTimeout(wait);if(audio){audio.pause();audio.onended=audio.onerror=null}audio=null;waiting=false;queue=[]}
 function pause(){if(audio){audio.pause();set({playing:false,paused:true})}else if(native)Android.pause();else TTS.pause()}
 function resume(){if(audio){set({playing:true,paused:false,error:''});audio.play().catch(()=>set({playing:false,paused:true,error:'No se ha podido iniciar la grabación.'}))}else if(native)Android.resume();else TTS.resume()}
 return {play,pause,resume,stop,get active(){return !!audio},get hybrid(){return queue.length>0}};
})();
