/* CARDIAC//BREACH — canonical immersive bootstrap */
(()=>{'use strict';
window.CB_IMMERSIVE_UI=true;
function add(id,href){
 if(document.getElementById(id))return Promise.resolve();
 return new Promise((resolve,reject)=>{const s=document.createElement('script');s.id=id;s.src=href;s.async=false;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})
}
function css(id,href){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
async function boot(){
 document.body.classList.add('cb-immersive');
 document.querySelectorAll('#beginnerGuide,#introOverlay,.cb-immersive-root,#cbFeatureTray,#cbFeaturePanel,#cbFeatureModal,#crisisLayer').forEach(e=>e.remove());
 css('cb-v2-css','immersive-command-center-v2.css?v=5');
 css('cb-v2-compact','immersive-compact-panels.css?v=3');
 css('cb-heart-bridge-css','immersive-heart-bridge.css?v=2');
 css('cb-v6-redesign','immersive-redesign-v6.css?v=1');
 css('cb-game-feel','immersive-game-feel.css?v=1');
 try{
  await add('cb-v2-js','immersive-command-center-v2.js?v=6');
  await add('cb-heart-bridge','immersive-heart-bridge.js?v=3');
  await add('cb-tutorial-sync','immersive-tutorial-sync.js?v=3');
  await add('cb-immersive-audio','immersive-audio.js?v=3');
  await add('cb-ui-hardening','immersive-ui-hardening.js?v=2');
 }catch(error){console.error('[CARDIAC//BREACH] immersive boot failed',error);document.body.dataset.immersiveBootError='true'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
