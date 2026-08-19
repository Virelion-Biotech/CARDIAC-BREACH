/* CARDIAC//BREACH — immersive functional hardening */
(()=>{
'use strict';
let restoreFocus=null,heartGesture=null,lastCrisisOpen=false;
const panel=()=>document.getElementById('ciPanel');
const crisis=()=>document.getElementById('ciCrisis');
const app=()=>window.CBApp;
function focusables(root){return [...root.querySelectorAll('button,select,input,[href],[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.offsetParent!==null)}
function openPanel(){const p=panel();if(!p)return;restoreFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;requestAnimationFrame(()=>focusables(p)[0]?.focus())}
function closePanel(){if(restoreFocus?.isConnected)restoreFocus.focus();else document.querySelector('.ci-tools button')?.focus();restoreFocus=null}
function closeCrisis(){const c=crisis();if(!c)return;c.classList.remove('open');c.setAttribute('aria-hidden','true');document.dispatchEvent(new CustomEvent('cb:immersive-crisis-closed',{detail:{reason:'dismissed'}}));document.querySelector('.ci-end')?.focus()}
function trap(root,e){if(e.key!=='Tab')return;const f=focusables(root);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
function syncDock(){
 const g=app()?.state,engine=window.CBMechanisticGameEngine||window.CBGameCoreV2;if(!g)return;
 document.querySelectorAll('.ci-ability[data-agent]').forEach(b=>{
  const id=b.dataset.agent,rule=engine?.AGENTS?.[id]||engine?.agentRules?.[id],cost=Number(rule?.cost??0);
  const small=b.querySelector('small');if(small&&cost)small.textContent=`${cost}E`;
  const selectable=!!g.running&&(Number(g.moves??0)>0)&&(Number(g.energy??0)>=cost);
  b.disabled=!selectable;
  b.setAttribute('aria-disabled',String(!selectable));
  b.title=!g.running?'RUN COMPLETE':Number(g.moves??0)<1?'MOVE ALREADY USED':Number(g.energy??0)<cost?'INSUFFICIENT ENERGY':`Cost ${cost} energy`;
 });
 const end=document.getElementById('ciEnd');if(end){const enabled=!!g.running;end.disabled=!enabled;end.setAttribute('aria-disabled',String(!enabled))}
}
function suppressDragSelection(){
 const host=document.getElementById('ciHeart');if(!host||host.dataset.cbDragGuard==='1')return;host.dataset.cbDragGuard='1';
 host.addEventListener('pointerdown',e=>{heartGesture={x:e.clientX,y:e.clientY,moved:false};},true);
 host.addEventListener('pointermove',e=>{if(!heartGesture)return;if(Math.hypot(e.clientX-heartGesture.x,e.clientY-heartGesture.y)>8)heartGesture.moved=true},true);
 host.addEventListener('pointerup',e=>{if(!heartGesture)return;if(heartGesture.moved){e.stopImmediatePropagation();e.stopPropagation()}heartGesture=null},true);
 host.addEventListener('pointercancel',e=>{if(heartGesture){e.stopImmediatePropagation();e.stopPropagation()}heartGesture=null},true);
 host.addEventListener('click',e=>{if(e.detail!==0&&window.__cbHeartWasDragging){e.stopImmediatePropagation();e.preventDefault();window.__cbHeartWasDragging=false}},true);
 host.addEventListener('pointerup',e=>{if(!heartGesture&&e.detail===0)return;},false);
 host.addEventListener('pointermove',e=>{if(heartGesture?.moved)window.__cbHeartWasDragging=true},true);
}
function bind(){
 document.addEventListener('keydown',e=>{
  const p=panel(),c=crisis();
  if(e.key==='Escape'){if(c?.classList.contains('open')){closeCrisis();return}if(p?.classList.contains('open')){document.querySelector('#ciPanel [data-close]')?.click();return}}
  if(c?.classList.contains('open')){trap(c,e);return}
  if(p?.classList.contains('open'))trap(p,e);
 },true);
 const p=panel();if(p)new MutationObserver(()=>{if(p.classList.contains('open'))openPanel();else closePanel()}).observe(p,{attributes:true,attributeFilter:['class']});
 const c=crisis();if(c)new MutationObserver(()=>{const isOpen=c.classList.contains('open');if(isOpen&&!lastCrisisOpen){requestAnimationFrame(()=>focusables(c)[0]?.focus())}if(!isOpen&&lastCrisisOpen)document.dispatchEvent(new CustomEvent('cb:immersive-crisis-closed',{detail:{reason:'resolved'}}));lastCrisisOpen=isOpen}).observe(c,{attributes:true,attributeFilter:['class']});
 document.addEventListener('cb:immersive-crisis',()=>requestAnimationFrame(()=>focusables(crisis()||document).find(Boolean)?.focus()));
 document.addEventListener('cb:immersive-selection',syncDock);
 app()?.on?.('new-run',()=>{window.CBImmersiveSelection=null;syncDock()});
 app()?.on?.('load',()=>syncDock());
 new MutationObserver(syncDock).observe(document.body,{subtree:true,childList:true});
 // Hidden overlays must never remain interactive.
 new MutationObserver(()=>{for(const el of document.querySelectorAll('.ci-panel[aria-hidden="true"],.ci-crisis[aria-hidden="true"]'))el.inert=true;for(const el of document.querySelectorAll('.ci-panel[aria-hidden="false"],.ci-crisis[aria-hidden="false"]'))el.inert=false}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-hidden','class']});
 suppressDragSelection();syncDock();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.CBImmersiveUIHardening={closePanel,closeCrisis,syncDock};
})();