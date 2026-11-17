'use strict';
// Mis oraciones v9: reproductor compacto. Barra fina abajo (⏮ ⏯ ⏭ ↺ modo ▲ ✕), panel completo al desplegar,
// y modo oculto (pastilla pequeña). Clave nueva: playerUi ('compact' | 'hidden'). No toca ninguna clave existente.
(()=>{
const T=(es,en)=>window.MO_LANG==='en'?en:es,$=id=>document.getElementById(id);
const player=$('player');if(!player)return;
const tg=$('toggle'),prev=$('prevPrayer'),next=$('nextPrayer'),restart=$('restart'),chip=$('modeChip'),menu=$('modeMenu');
const mk=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
const IC={'prev': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="2.6" height="14" rx="1"/><path d="M19 5.6v12.8a.8.8 0 0 1-1.2.7L8.6 12.7a.8.8 0 0 1 0-1.4l9.2-6.4a.8.8 0 0 1 1.2.7z"/></svg>', 'next': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="16.4" y="5" width="2.6" height="14" rx="1"/><path d="M5 5.6v12.8a.8.8 0 0 0 1.2.7l9.2-6.4a.8.8 0 0 0 0-1.4L6.2 4.9A.8.8 0 0 0 5 5.6z"/></svg>', 'play': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.3v13.4a.9.9 0 0 0 1.4.8l10.2-6.7a.9.9 0 0 0 0-1.6L9.4 4.5A.9.9 0 0 0 8 5.3z"/></svg>', 'pause': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>', 'again': '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7l2 .7A4.9 4.9 0 1 0 12 7.1V10L7.5 6 12 2v3z"/></svg>'};
const btn=(cls,sym,label)=>{const b=mk('<button type="button" class="'+cls+'"><span aria-hidden="true">'+sym+'</span></button>');b.setAttribute('aria-label',label);b.title=label;return b};
const bar=mk('<div class="puiBar" id="puiBar" role="toolbar"></div>');bar.setAttribute('aria-label',T('Controles de reproducción','Playback controls'));
const bPrev=btn('puiPrev',IC.prev,T('Oración anterior','Previous prayer'));
const bPlay=btn('puiPlay',IC.play,T('Reproducir','Play'));bPlay.id='puiPlay';
const bNext=btn('puiNext',IC.next,T('Oración siguiente','Next prayer'));
const bAgain=btn('puiAgain',IC.again,T('Otra vez: desde el principio','Again: from the start'));
const info=mk('<div class="puiInfo" id="puiInfo"><b></b><span><i class="dot" aria-hidden="true"></i><em></em></span></div>');
const bMode=btn('puiMode','☀',T('Cambiar qué se reproduce','Change what plays'));
const bExp=btn('puiExp','▲',T('Más controles','More controls'));bExp.id='puiExp';bExp.setAttribute('aria-controls','puiMore');bExp.setAttribute('aria-expanded','false');
const bHide=btn('puiHide','✕',T('Ocultar el reproductor','Hide the player'));
const pill=mk('<button type="button" class="puiPill" id="puiPill"><i class="dot" aria-hidden="true"></i><span aria-hidden="true">♪ ▴</span></button>');pill.setAttribute('aria-label',T('Mostrar el reproductor','Show the player'));pill.title=pill.getAttribute('aria-label');
bar.append(bPrev,bPlay,bNext,bAgain,info,bMode,bExp,bHide);
// Todo lo demás del reproductor pasa al panel desplegable
const more=mk('<div class="puiMore" id="puiMore"></div>');
const prog=player.querySelector('.progress');
[...player.children].forEach(el=>{if(el!==prog)more.append(el)});
const sb=more.querySelector('#stop')?.closest('.controls');
const collapseRow=mk('<div style="display:flex;justify-content:center;margin:4px 0 0"><button type="button" class="secondary puiCollapse" id="puiCollapse"></button></div>');
collapseRow.firstChild.textContent='▼ '+T('Recoger','Collapse');collapseRow.firstChild.onclick=()=>setUi('compact');
more.append(collapseRow);
player.append(bar,more,pill);player.classList.add('pui');
// Estado
let ui=(()=>{try{return localStorage.getItem('playerUi')==='hidden'?'hidden':'compact'}catch{return 'compact'}})();
function setUi(v){ui=v;if(v!=='open'){try{localStorage.setItem('playerUi',v)}catch{}}
 player.classList.toggle('puiOpen',v==='open');player.classList.toggle('puiHidden',v==='hidden');
 bExp.setAttribute('aria-expanded',String(v==='open'));bExp.setAttribute('aria-label',v==='open'?T('Recoger el reproductor','Collapse the player'):T('Más controles','More controls'));bExp.title=bExp.getAttribute('aria-label');
 if(v!=='open'&&menu&&!menu.hidden){menu.hidden=true;chip?.setAttribute('aria-expanded','false')}
 if(v==='hidden'&&player.contains(document.activeElement))pill.focus();if(v==='compact'&&document.activeElement===pill)bPlay.focus();
 measure()}
window.MO_playerUi={get:()=>ui,set:setUi};
// Botones
bPrev.onclick=()=>prev.click();bNext.onclick=()=>next.click();bPlay.onclick=()=>tg.click();bAgain.onclick=()=>restart.click();
bExp.onclick=()=>setUi(ui==='open'?'compact':'open');info.onclick=()=>setUi(ui==='open'?'compact':'open');
bHide.onclick=()=>setUi('hidden');pill.onclick=()=>setUi('compact');
bMode.onclick=()=>{setUi('open');if(chip&&menu&&menu.hidden)setTimeout(()=>chip.click(),0)};
// Gestos: deslizar hacia abajo recoge/oculta, hacia arriba despliega
let y0=null;bar.addEventListener('touchstart',e=>{y0=e.touches[0].clientY},{passive:true});
bar.addEventListener('touchend',e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;y0=null;if(dy>35)setUi(ui==='open'?'compact':'hidden');else if(dy<-35)setUi('open')},{passive:true});
pill.addEventListener('touchstart',e=>{y0=e.touches[0].clientY},{passive:true});
// Recoger solo al desplazar el texto o tocar fuera (el desplazamiento automático no cuenta)
const outside=t=>!player.contains(t)&&!t.closest?.('dialog')&&!t.closest?.('#toast');
const auto=e=>{if(ui==='open'&&outside(e.target))setUi('compact')};
document.addEventListener('touchmove',auto,{passive:true});document.addEventListener('wheel',auto,{passive:true});document.addEventListener('pointerdown',auto,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui==='open'&&!document.querySelector('dialog[open]'))setUi('compact')});
// Sincronizar la barra con el reproductor completo
function sync(){const sym=tg.querySelector('.sym')?.textContent||tg.textContent||'▶';const pausing=sym.includes('⏸');
 bPlay.firstChild.innerHTML=pausing?IC.pause:IC.play;const pl=tg.getAttribute('aria-label')||T('Reproducir','Play');bPlay.setAttribute('aria-label',pl);bPlay.title=pl;bPlay.dataset.state=pausing?'pause':'play';
 const st=$('v8State'),s=st?.dataset.s||'stop';info.dataset.s=s;pill.dataset.s=s;
 info.querySelector('b').textContent=$('playerTitle')?.textContent||'';
 let line=st?.querySelector('b')?.textContent||'';if(s==='pet'&&$('petSec')?.textContent)line='🙏 '+line+' · '+$('petSec').textContent;
 const m=chip?.querySelector('.nm')?.textContent;if(m&&s!=='pet')line+=(line?' · ':'')+m;info.querySelector('em').textContent=line;
 const ic=chip?.querySelector('.ic')?.textContent;if(ic){bMode.firstChild.textContent=ic;bMode.setAttribute('aria-label',T('Modo: ','Mode: ')+(m||'')+'. '+T('Toca para cambiar','Tap to change'))}
 pill.setAttribute('aria-label',T('Mostrar el reproductor','Show the player')+(s==='play'?' ('+T('reproduciendo','playing')+')':''))}
const mo=new MutationObserver(sync);
for(const el of [tg,$('status'),$('playerTitle'),$('v8State'),chip,$('petSec')])if(el)mo.observe(el,{childList:true,subtree:true,characterData:true,attributes:true});
document.addEventListener('mo-player',()=>setTimeout(sync,0));
// Altura real → espacio inferior del texto
function measure(){const h=player.hidden?0:(ui==='hidden'?56:Math.ceil(player.getBoundingClientRect().height));document.documentElement.style.setProperty('--puiH',h+'px')}
try{new ResizeObserver(measure).observe(player)}catch{}new MutationObserver(measure).observe(player,{attributes:true,attributeFilter:['hidden']});
setUi(ui);sync();
})();
