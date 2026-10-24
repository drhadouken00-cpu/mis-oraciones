'use strict';
// Mis oraciones v4: progreso del Rosario/Coronillas, elegir por dónde empezar y bloques pulsables.
(()=>{
const KEY='rosaryProgress',isR=id=>/^(rosario-|coronilla-)/.test(id||'');
const ORD=['Primer','Segundo','Tercer','Cuarto','Quinto'];
const get=()=>{try{return JSON.parse(localStorage[KEY]||'null')}catch{return null}};
const clear=()=>{localStorage.removeItem(KEY)};
const find=id=>prayers.find(p=>p.id===id);
const cut=(s,n=70)=>s.length>n?s.slice(0,n).replace(/\s\S*$/,'')+'…':s;
// Secciones de una oración: [{i,label,group}]
function sections(p){const out=[];let group='';const seen=new Set();
 p.parts.forEach((x,i)=>{const t=x.text.trim();let label=null;
  if(i===0)label='Oraciones iniciales';
  else if(t.startsWith('✧')){const h=t.replace(/^✧\s*/,'');if(/^MISTERIOS /.test(h)){group=h.charAt(0)+h.slice(1).toLowerCase();label=group+' · inicio'}else label=/^[A-ZÁÉÍÓÚÑ ]+$/.test(h)?(h.charAt(0)+h.slice(1).toLowerCase()).replace('virgen','Virgen'):h}
  else{const pre=t.split(' · ')[0];const m=/^(Salve|Letanías|Decena \d+ de|Al final|Oración final|Oración inicial)/.exec(pre);if(m&&!(m[1]==='Letanías'&&out.some(o=>/^Letan/i.test(o.label)))&&!seen.has(group+pre.replace(/ de \d+$/,''))){seen.add(group+pre.replace(/ de \d+$/,''));label=pre.replace(/ · .*/,'')}}
  if(label&&!(out.length&&out[out.length-1].i===i-1&&/inicio$/.test(out[out.length-1].label)&&/misterio/i.test(label)&&false))out.push({i,label:cut(label),group})});
 return out}
function where(p,i){const s=sections(p).filter(s=>s.i<=i).pop();const t=(p.parts[i]?.text||'').split(' · ');const sub=t.length>1?t.slice(0,-1).filter(x=>!/^Misterios /.test(x)&&!/misterio$/.test(x)).join(' · '):'';
 return [s?.group&&!s.label.startsWith(s.group)?s.group:'',s?.label,sub&&sub!==s?.label?sub:''].filter(Boolean).join(' · ')}
function save(id,i){if(!isR(id))return;const p=find(id);if(!p)return;const set=(/^rosario-(\w+)/.exec(id)||[])[1]||id;localStorage[KEY]=JSON.stringify({id,set,index:i,label:where(p,i),ts:Date.now()})}
function jump(id,i){const p=find(id);if(!p)return;if(current?.id!==id){origOpen(p);fillPanel(p)}save(id,i);startQueue([id],i);const el=$('part-'+i);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}
// Barra de la pausa de peticiones (8 s)
const pb=document.createElement('div');pb.id='petBox';pb.hidden=true;pb.innerHTML='<div class="petText">🙏 Tus peticiones <small>(ej.: Madre del Rosario, ruega por nosotros…)</small> <b id="petSec"></b></div><div class="petTrack"><div id="petFill"></div></div>';document.querySelector('#player .playerLabel').after(pb);
let petTick=0,petOn=false,petStart=0;function petUI(){const sp=find(state.id)?.parts?.[state.index],nat=!!(state.playing&&sp&&sp.silenceMs>0);const on=!!(state.playing&&state.waiting&&state.petWait>0)||nat;
 if(on&&!petOn)petStart=Date.now();if(on){const left=state.petWait>0?state.petWait:Math.max(1,Math.ceil(((sp?.silenceMs||8000)-(Date.now()-petStart))/1000));$('status').textContent='Tus peticiones…';$('petSec').textContent=left+' s';if(nat&&!petTick)petTick=setInterval(()=>{try{updatePlayer()}catch{}},500)}
 if(!on&&petTick){clearInterval(petTick);petTick=0}
 if(on&&!petOn){pb.hidden=false;const f=$('petFill');f.style.transition='none';f.style.width='0%';void f.offsetWidth;f.style.transition='width 8s linear';f.style.width='100%'}if(!on&&petOn)pb.hidden=true;petOn=on}
// Guardar en cada cambio de paso
const origUpdate=window.updatePlayer;window.updatePlayer=updatePlayer=function(){origUpdate.apply(this,arguments);petUI();if(isR(state.id)&&state.completed&&get()?.id===state.id)clear();else if(isR(state.id)&&(state.playing||state.paused)&&Number.isInteger(state.index))save(state.id,state.index)};
document.addEventListener('mo-finished',e=>{const g=get();if(g&&(!e.detail?.id||g.id===e.detail.id))clear()});
// Diálogo «Ibas por aquí»
const dlg=document.createElement('dialog');dlg.id='resumeRosary';dlg.innerHTML='<h2>Ibas por aquí</h2><p id="rrWhere"></p><p class="hint" id="rrWhen"></p><p>¿Quieres continuar?</p><button id="rrGo">▶ Continuar</button><button id="rrNew" class="secondary">Empezar de nuevo</button><button id="rrLater" class="secondary">Ahora no</button>';document.body.append(dlg);
function ask(g){const p=find(g.id);if(!p)return;$('rrWhere').textContent=p.title+' — '+(g.label||'paso '+(g.index+1));$('rrWhen').textContent='Guardado el '+new Date(g.ts).toLocaleString('es-ES',{dateStyle:'medium',timeStyle:'short'})+' · paso '+(g.index+1)+' de '+p.parts.length;
 $('rrGo').onclick=()=>{dlg.close();jump(g.id,g.index)};$('rrNew').onclick=()=>{dlg.close();clear();if(current?.id!==g.id){origOpen(p);fillPanel(p)}window.scrollTo(0,0)};$('rrLater').onclick=()=>dlg.close();if(!dlg.open)dlg.showModal()}
// Selector «Empezar desde»
const panel=document.createElement('div');panel.id='startPanel';panel.className='startPanel';panel.innerHTML='<label for="startFrom">Empezar desde</label><div class="startRow"><select id="startFrom"></select><button id="startGo">▶ Empezar aquí</button></div><small>También puedes tocar cualquier bloque del texto para escuchar desde ahí.</small>';
document.querySelector('#reader .membership').after(panel);
function fillPanel(p){const r=isR(p.id);panel.hidden=!r;$('jumpBtn').hidden=!r;if(!r)return;const sel=$('startFrom');sel.replaceChildren();let og=null,last='#';
 for(const s of sections(p)){if(s.group!==last){last=s.group;og=s.group?document.createElement('optgroup'):null;if(og){og.label=s.group;sel.append(og)}}const o=document.createElement('option');o.value=s.i;o.textContent=s.group&&s.label.startsWith(s.group)?'Inicio de '+s.group.toLowerCase():s.label;(og||sel).append(o)}
 $('startGo').onclick=()=>jump(p.id,Number(sel.value))}
const jb=document.createElement('button');jb.id='jumpBtn';jb.textContent='⇢ Ir a…';jb.setAttribute('aria-label','Elegir misterio o parte del rosario');jb.onclick=()=>{panel.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>$('startFrom').focus(),300)};$('repeat').after(jb);
// Bloques pulsables (todas las oraciones)
$('passages').addEventListener('click',e=>{const el=e.target.closest('p[id^="part-"]');if(!el||!current||getSelection().toString())return;jump(current.id,Number(el.id.slice(5)))});
// Al abrir una oración
const origOpen=window.openPrayer;window.openPrayer=openPrayer=function(p){origOpen.apply(this,arguments);if(!p)return;fillPanel(p);
 const g=get(),busy=state.id===p.id&&(state.playing||state.paused);if(g&&g.id===p.id&&!busy&&g.index>0)ask(g)};
// Al abrir la app
const g=get();if(g&&find(g.id)&&!(window.MO&&MO.startId))setTimeout(()=>{if(!dlg.open&&!state.playing)ask(g)},300);
window.MO=Object.assign(window.MO||{},{rosaryProgress:get,rosarySections:id=>sections(find(id)),rosaryJump:jump});
})();
