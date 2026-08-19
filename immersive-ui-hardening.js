/* CARDIAC//BREACH — immersive UI audit hardening */
(()=>{
'use strict';
let restoreFocus=null;
const panel=()=>document.getElementById('ciPanel');
const crisis=()=>document.getElementById('ciCrisis');
function focusables(root){return [...root.querySelectorAll('button,select,input,[href],[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.offsetParent!==null)}
function openPanel(){const p=panel();if(!p)return;restoreFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;requestAnimationFrame(()=>focusables(p)[0]?.focus())}
function closePanel(){if(restoreFocus?.isConnected){restoreFocus.focus()}else document.querySelector('.ci-tools button')?.focus();restoreFocus=null}
function closeCrisis(){const c=crisis();if(!c)return;c.classList.remove('open');c.setAttribute('aria-hidden','true');document.querySelector('.ci-end')?.focus()}
function trap(root,e){if(e.key!=='Tab')return;const f=focusables(root);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
function bind(){
 document.addEventListener('keydown',e=>{
  const p=panel(),c=crisis();
  if(e.key==='Escape'){if(c?.classList.contains('open')){closeCrisis();return}if(p?.classList.contains('open')){document.querySelector('#ciPanel [data-close]')?.click();return}}
  if(c?.classList.contains('open')){trap(c,e);return}
  if(p?.classList.contains('open'))trap(p,e);
 },true);
 const p=panel();
 if(p)new MutationObserver(()=>{if(p.classList.contains('open'))openPanel();else closePanel()}).observe(p,{attributes:true,attributeFilter:['class']});
 document.addEventListener('cb:immersive-crisis',()=>requestAnimationFrame(()=>focusables(crisis()||document).find(Boolean)?.focus()));
 // Never leave hidden overlays focusable.
 new MutationObserver(()=>{for(const el of document.querySelectorAll('.ci-panel[aria-hidden="true"],.ci-crisis[aria-hidden="true"]'))el.inert=true;for(const el of document.querySelectorAll('.ci-panel[aria-hidden="false"],.ci-crisis[aria-hidden="false"]'))el.inert=false}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-hidden','class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.CBImmersiveUIHardening={closePanel,closeCrisis};
})();