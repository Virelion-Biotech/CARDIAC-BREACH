/* Replayable tutorial handshake: interaction state must survive load order. */
(()=>{
'use strict';
function sync(){if(window.CBImmersiveSelection&&Number.isInteger(window.CBImmersiveSelection.index)){window.CB_BeginnerGuide?.notifySelection?.();}}
function boot(){sync();document.addEventListener('cb:immersive-selection',sync);document.documentElement.addEventListener('cb:immersive-selection',sync);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
