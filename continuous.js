'use strict';
// Mis oraciones v8: modo de reproducción claro — «Lista del día», «Lista de la noche» o «Solo esta oración».
// Clave nueva: playMode. La antigua continuousPlayback se respeta (false → solo esta oración) y se mantiene sincronizada.
(()=>{
 const KEY='continuousPlayback',SESSION='playlistSession',MODE='playMode',MODES=['day','night','single'];
 let session=stored(SESSION,null),stopped=false;
 let mode=(()=>{const m=localStorage.getItem(MODE);if(MODES.includes(m))return m;return stored(KEY,true)===false?'single':'day'})();
 if(!session||!Array.isArray(session.ids))session=null;
 const persist=()=>{if(session)localStorage[SESSION]=JSON.stringify(session)};
 const saveMode=()=>{localStorage[MODE]=mode;localStorage[KEY]=JSON.stringify(mode!=='single')};
 const rawStart=startQueue;
 const exists=id=>prayers.some(p=>p.id===id);
 function queueFor(id){if(mode==='single')return [id];const l=(lists[mode]||[]).filter(exists),i=l.indexOf(id);return i>=0?l.slice(i):[id,...l.filter(x=>x!==id)]}
 function snapshot(){if(native&&!window.PrayerAudio?.active)try{state=JSON.parse(Android.state())}catch{}
  if(session&&(state.playing||state.paused)&&session.ids.includes(state.id)){session.id=state.id;session.index=state.index||0;persist()}}
 function remaining(id){if(!session||session.ended)return [id];const i=session.ids.indexOf(id);return i<0?[id]:session.ids.slice(i)}
 function launch(ids,index){stopped=false;rawStart(mode==='single'?ids.slice(0,1):ids,index)}
 window.startQueue=startQueue=function(ids,index=0){ids=ids.filter(exists);if(!ids.length)return;
  if(ids.length===1&&mode!=='single'&&(!session||session.ended||!session.ids.includes(ids[0])))ids=queueFor(ids[0]);
  if(ids.length>1||!session||session.ended||!session.ids.includes(ids[0]))session={ids:ids.slice(),id:ids[0],index,ended:false,mode};
  else{session.id=ids[0];session.index=index}
  persist();launch(remaining(ids[0]),index)};
 const rawUpdate=updatePlayer;window.updatePlayer=updatePlayer=function(){rawUpdate.apply(this,arguments);
  if(!stopped&&session&&session.ids.includes(state.id)){
   if(state.playing||state.paused){session.id=state.id;session.index=state.index||0;persist()}
   else if(state.completed&&state.id===session.ids.at(-1)){session.ended=true;persist()}
  }
  document.dispatchEvent(new CustomEvent('mo-player'))};
 const paused=()=>window.PrayerAudio?.hybrid?PrayerAudio.pause():native?Android.pause():TTS.pause();
 const resume=()=>window.PrayerAudio?.hybrid?PrayerAudio.resume():native?Android.resume():TTS.resume();
 const stopAll=()=>{if(window.PrayerAudio?.hybrid)PrayerAudio.stop();else if(native)Android.stop();else TTS.stop()};
 window.play=play=function(){if(!current)return;
  if(!stopped&&state.paused&&state.id===current.id){resume();return}
  if(session&&!session.ended&&session.ids.includes(current.id)&&(session.mode||mode)===mode){const index=session.id===current.id?session.index||0:0;startQueue([current.id],index);return}
  session=null;startQueue(queueFor(current.id),0)};
 $('toggle').onclick=()=>{if(state.playing){snapshot();paused()}else if(state.paused&&!stopped)resume();else play()};
 $('stop').onclick=()=>{snapshot();stopped=true;stopAll();document.dispatchEvent(new CustomEvent('mo-player'))};
 $('restart').onclick=()=>{if(current)startQueue([current.id],0)};
 $('playList').onclick=()=>{const items=listPrayers(filter);if(!items.length)return;if(filter==='day'||filter==='night'){mode=filter;saveMode()}session=null;openPrayer(items[0]);startQueue(items.map(p=>p.id),0)};
 function setMode(m){if(!MODES.includes(m)||m===mode)return;snapshot();mode=m;saveMode();
  if(current&&(state.playing||state.paused)&&state.id){const wasPaused=state.paused,id=state.id,index=state.index||0;session=null;startQueue(queueFor(id),index);if(wasPaused)setTimeout(paused,60)}
  document.dispatchEvent(new CustomEvent('mo-player'))}
 // Anterior / siguiente oración, según el modo.
 function sequenceFor(id){if(mode!=='single'){if(session&&!session.ended&&session.ids.includes(id))return session.ids;const l=(lists[mode]||[]).filter(exists);if(l.includes(id))return l}
  const v=(window.visibleItems||[]).filter(Boolean).map(p=>p.id);return v.includes(id)?v:prayers.filter(p=>!p.hidden).map(p=>p.id)}
 function step(delta){if(!current)return null;const seq=sequenceFor(current.id),i=seq.indexOf(current.id),nid=seq[i+delta];if(i<0||!nid)return null;
  const was=state.playing||state.paused;if(was){snapshot();stopped=true;stopAll()}const p=prayers.find(x=>x.id===nid);openPrayer(p);
  if(was){const ids=session&&!session.ended&&session.ids.includes(nid)?remaining(nid):queueFor(nid);session=null;startQueue(ids,0)}return p}
 function upNext(){if(!current||mode==='single')return null;const q=session&&!session.ended&&session.ids.includes(current.id)?session.ids:queueFor(current.id);const i=q.indexOf(current.id);const n=q[i+1];return n?prayers.find(p=>p.id===n):null}
 window.MO=Object.assign(window.MO||{},{playMode:()=>mode,setPlayMode:setMode,stepPrayer:step,upNext,isStopped:()=>stopped,queueFor});
 addEventListener('pagehide',snapshot);
})();
