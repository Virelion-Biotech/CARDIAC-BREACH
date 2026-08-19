/* CARDIAC//BREACH — canonical heart/selection bridge
 * Guarantees a visible anatomical fallback and a replayable selection state.
 */
(()=>{
'use strict';
const app=()=>window.CBApp;
const HEART_ID='ciHeart';
const state=()=>app()?.state||{};
const fallback=`<div class="ci-anatomy-fallback" role="img" aria-label="Interactive anatomical heart model">
<svg viewBox="0 0 620 760" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
 <radialGradient id="myo" cx="42%" cy="35%" r="72%"><stop offset="0" stop-color="#ff7d78"/><stop offset=".46" stop-color="#b92f45"/><stop offset="1" stop-color="#4b1223"/></radialGradient>
 <linearGradient id="vessel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6bbb2"/><stop offset="1" stop-color="#8b3140"/></linearGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<ellipse cx="315" cy="385" rx="180" ry="245" fill="#ff425c" opacity=".10" filter="url(#soft)"/>
<path d="M316 169 C292 117 218 104 170 142 C118 183 109 264 136 327 C163 389 205 407 224 474 C241 535 238 650 313 687 C362 711 401 660 407 602 C412 551 405 505 434 448 C469 378 523 347 518 262 C513 178 449 118 384 132 C354 138 331 154 316 169Z" fill="url(#myo)" stroke="#ff9b96" stroke-width="7" filter="url(#glow)"/>
<path d="M300 210 C257 205 227 226 215 270 C204 313 219 355 247 381 C273 405 282 445 283 492 C284 546 290 612 315 640 C333 660 349 640 351 606 C355 548 341 500 351 449 C360 402 389 364 400 313 C413 258 378 215 338 208Z" fill="#57162a" opacity=".83"/>
<path d="M331 215 C366 247 374 291 362 335 C347 387 326 428 327 475 C327 526 347 577 339 620" fill="none" stroke="#ff8a84" stroke-width="11" opacity=".72"/>
<path d="M214 191 C189 160 190 111 207 78 C222 50 256 40 277 59 C294 74 299 104 290 130 L270 190" fill="url(#vessel)" stroke="#ffc2b6" stroke-width="7"/>
<path d="M354 188 C347 143 353 92 373 62 C391 35 424 37 442 60 C462 84 461 127 444 159 L414 210" fill="url(#vessel)" stroke="#ffc2b6" stroke-width="7"/>
<path d="M401 134 C447 87 494 77 527 106 C554 131 550 171 523 192 C497 213 469 222 443 240" fill="none" stroke="#d66a73" stroke-width="28" stroke-linecap="round"/>
<path d="M187 175 C152 137 120 142 101 171 C83 198 94 229 126 243 L193 263" fill="none" stroke="#6d2738" stroke-width="31" stroke-linecap="round"/>
<g fill="none" stroke="#f36f75" stroke-width="6" opacity=".72">
 <path d="M167 267 C210 250 235 269 259 292"/><path d="M153 303 C201 279 237 304 259 325"/>
 <path d="M442 260 C407 244 390 264 371 290"/><path d="M458 301 C412 284 391 309 371 333"/>
</g>
<g fill="#ffd0c7" font-family="Inter,Arial,sans-serif" font-size="13" letter-spacing="3"><text x="88" y="710">ANATOMICAL HEART // INTERACTIVE FIELD</text></g>
</svg><div class="ci-anatomy-overlay"><span>ANATOMICAL MODEL</span><b>CLICK TO SELECT REGION</b></div></div>`;
function emit(name,detail){document.dispatchEvent(new CustomEvent(name,{detail}));}
function rememberSelection(index){window.CBImmersiveSelection={index,ts:Date.now()};document.documentElement.dataset.cbImmersiveSelection=String(index);emit('cb:immersive-selection',{index});window.CB_BeginnerGuide?.notifySelection?.();}
function install(){
 const host=document.getElementById(HEART_ID);if(!host)return false;
 if(!host.querySelector('canvas')&&!host.querySelector('.ci-anatomy-fallback')){host.insertAdjacentHTML('afterbegin',fallback);}
 host.addEventListener('click',e=>{
  if(e.target.closest('button'))return;
  const rect=host.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));
  const n=state().cells?.length||216;
  const index=Math.max(0,Math.min(n-1,Math.floor((y*n*.82+x*n*.18))));
  app()?.selectCell?.(index);rememberSelection(index);
 },true);
 return true;
}
function replay(){const s=window.CBImmersiveSelection;if(s&&Number.isInteger(s.index)){document.documentElement.dataset.cbImmersiveSelection=String(s.index);window.CB_BeginnerGuide?.notifySelection?.();emit('cb:immersive-selection',{index:s.index,replay:true});}}
function boot(){if(!install()){requestAnimationFrame(()=>{install();replay();});}else replay();setTimeout(()=>{install();replay();},0);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CBImmersiveHeartBridge={install,replay,rememberSelection};
})();
