'use strict';
// v5: resaltado palabra a palabra y desplazamiento suave que mantiene la palabra en la parte media-alta de la pantalla.
// Fuentes: eventos 'boundary' (Web Speech), onRangeStart nativo (Android) o, si no hay, estimación por tiempo.
window.Follow=(()=>{
 let on=null,onPi=-1,est=null,real=false,cps=14,cal=0,userT=0,anim=null,goal=0;
 const words=s=>{const r=[];String(s).replace(/\S+/g,(w,i)=>{r.push(i);return w});return r};
 function wrap(pi){const el=document.getElementById('part-'+pi);if(!el)return null;
  if(!el.dataset.w){const t=el.textContent,f=document.createDocumentFragment();for(const tok of t.split(/(\s+)/)){if(!tok)continue;if(/^\s+$/.test(tok))f.append(tok);else{const s=document.createElement('span');s.className='w';s.textContent=tok;f.append(s)}}el.replaceChildren(f);el.dataset.w='1'}
  return el}
 function visible(){return document.visibilityState==='visible'&&!$('reader').hidden&&current&&current.id===state.id}
 function clear(){if(on)on.classList.remove('w-on');on=null;onPi=-1}
 function scrollTo(y){goal=Math.max(0,Math.min(y,document.documentElement.scrollHeight-innerHeight));if(anim)return;let last=performance.now();
  const step=t=>{const dt=Math.min(64,t-last);last=t;const cur=scrollY,d=goal-cur;if(Math.abs(d)<1||Date.now()-userT<4000){anim=null;return}
   window.scrollTo(0,cur+d*Math.min(1,dt/220)+(d>0?.5:-.5));anim=requestAnimationFrame(step)};anim=requestAnimationFrame(step)}
 function keep(span){if(Date.now()-userT<4000)return;const r=span.getBoundingClientRect(),h=innerHeight;
  if(r.top<h*.18||r.bottom>h*.55)scrollTo(scrollY+r.top-h*.33)}
 function setWord(pi,wi){if(!visible())return;const el=wrap(pi);if(!el)return;const sp=el.querySelectorAll('.w');if(!sp.length)return;
  const s=sp[Math.max(0,Math.min(sp.length-1,wi))];if(s===on)return;clear();on=s;onPi=pi;s.classList.add('w-on');keep(s)}
 // charIndex (sobre el texto hablado) -> índice de palabra del texto mostrado
 function at(pi,speech,ci){const p=current&&current.parts[pi];if(!p)return;const sw=words(speech);let wi=0;while(wi+1<sw.length&&sw[wi+1]<=ci)wi++;
  const tn=(p.text.match(/\S+/g)||[]).length;if(p.text!==speech&&sw.length)wi=Math.round(wi*tn/sw.length);setWord(pi,wi)}
 function halt(keepWord){if(est){clearInterval(est.t);est=null}if(!keepWord)clear()}
 // Estimación: avanza por caracteres según la velocidad medida (se recalibra al terminar cada frase).
 function estimate(pi,speech,base,len,rate){halt(true);const t0=Date.now(),c=cps*(rate||1)/1;
  est={pi,t0,base,len,rate:rate||1,t:setInterval(()=>{const ci=base+Math.min(len-1,(Date.now()-t0)/1000*c);at(pi,speech,ci)},90)}}
 function calibrate(len,ms,rate){if(ms>400&&len>8){const v=len/(ms/1000)/(rate||1);if(v>5&&v<40)cps=cal++?cps*.6+v*.4:v}}
 ['wheel','touchstart','keydown'].forEach(e=>addEventListener(e,ev=>{if(e==='keydown'&&!/Arrow|Page|Home|End|Space/.test(ev.code||''))return;userT=Date.now();if(anim){cancelAnimationFrame(anim);anim=null}},{passive:true}));
 // ---- Android nativo ----
 let nUid='',nT=null;
 const nPart=uid=>{const i=Number(String(uid).split(':')[1]);return isNaN(i)?-1:i};
 window.__moStart=uid=>{const pi=nPart(uid);if(pi<0||!current)return;const p=current.parts[pi];if(!p||p.pause)return;nUid=uid;const sp=p.speech||p.text;halt(true);setWord(pi,0);
  clearTimeout(nT);nT=setTimeout(()=>{if(nUid===uid&&!real)estimate(pi,sp,0,sp.length,state.rate||rate)},700)};
 window.__moWord=(uid,s)=>{const pi=nPart(uid);if(pi<0||!current)return;const p=current.parts[pi];if(!p)return;real=true;halt(true);nUid=uid;at(pi,p.speech||p.text,s)};
 // Tras cada actualización del reproductor: limpiar al parar.
 const up=window.updatePlayer;if(typeof up==='function')window.updatePlayer=function(){const r=up.apply(this,arguments);try{if(!state.playing&&!state.paused)halt();else if(!state.playing)halt(true)}catch{}return r};
 return {at,estimate,calibrate,halt,setWord,wrap,boundary:()=>real,setReal:v=>{real=v}};
})();
