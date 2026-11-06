'use strict';
// La lista es una sesión: parar la voz no debe convertirla en una oración suelta.
(()=>{
 const KEY='continuousPlayback',SESSION='playlistSession';
 let continuous=stored(KEY,true),session=stored(SESSION,null),stopped=false;
 if(typeof continuous!=='boolean')continuous=true;
 if(!session||!Array.isArray(session.ids))session=null;
 const persist=()=>{localStorage[KEY]=JSON.stringify(continuous);if(session)localStorage[SESSION]=JSON.stringify(session)};
 const button=document.createElement('button');button.id='continuous';button.type='button';$('toggle').after(button);
 function ui(){button.textContent='⟳ Lista: '+(continuous?'sí':'no');button.setAttribute('aria-pressed',String(continuous));button.title='Seguir con las siguientes oraciones de la lista';button.setAttribute('aria-label','Reproducción continua de la lista: '+(continuous?'activada':'desactivada'))}
 const rawStart=startQueue;
 function snapshot(){if(native&&!window.PrayerAudio?.active)try{state=JSON.parse(Android.state())}catch{}
  if(session&&(state.playing||state.paused)&&session.ids.includes(state.id)){session.id=state.id;session.index=state.index||0;persist()}}
 function remaining(id){if(!session||session.ended)return [id];const i=session.ids.indexOf(id);return i<0?[id]:session.ids.slice(i)}
 function launch(ids,index){stopped=false;const effective=continuous?ids:ids.slice(0,1);rawStart(effective,index)}
 window.startQueue=startQueue=function(ids,index=0){ids=ids.filter(id=>prayers.some(p=>p.id===id));if(!ids.length)return;
  if(ids.length>1||!session||session.ended||!session.ids.includes(ids[0]))session={ids:ids.slice(),id:ids[0],index,ended:false};
  else{session.id=ids[0];session.index=index}
  persist();ui();launch(remaining(ids[0]),index)};
 const rawUpdate=updatePlayer;window.updatePlayer=updatePlayer=function(){rawUpdate.apply(this,arguments);ui();
  if(!stopped&&session&&session.ids.includes(state.id)){
   if(state.playing||state.paused){session.id=state.id;session.index=state.index||0;persist()}
   else if(state.completed&&state.id===session.ids.at(-1)){session.ended=true;persist()}
  }};
 const paused=()=>window.PrayerAudio?.hybrid?PrayerAudio.pause():native?Android.pause():TTS.pause();
 const resume=()=>window.PrayerAudio?.hybrid?PrayerAudio.resume():native?Android.resume():TTS.resume();
 window.play=play=function(){if(!current)return;
  if(!stopped&&state.paused&&state.id===current.id){resume();return}
  const index=session&&!session.ended&&session.id===current.id?session.index||0:0;
  startQueue([current.id],index)};
 $('toggle').onclick=()=>{if(state.playing){snapshot();paused()}else if(state.paused&&!stopped)resume();else play()};
 $('stop').onclick=()=>{snapshot();stopped=true;if(window.PrayerAudio?.hybrid)PrayerAudio.stop();else if(native)Android.stop();else TTS.stop();};
 $('restart').onclick=()=>{if(current)startQueue([current.id],0)};
 $('playList').onclick=()=>{const items=listPrayers(filter);if(!items.length)return;session=null;openPrayer(items[0]);startQueue(items.map(p=>p.id),0)};
 button.onclick=()=>{snapshot();continuous=!continuous;persist();ui();
  if(session&&(state.playing||state.paused)){const wasPaused=state.paused,id=state.id,index=state.index||0;
   // Reconfigurar también la cola nativa. Si está sonando, repite solo el bloque actual.
   launch(remaining(id),index);if(wasPaused)paused()}};
 addEventListener('pagehide',snapshot);ui();
})();
