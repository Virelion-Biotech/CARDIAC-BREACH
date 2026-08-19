/* CARDIAC//BREACH — canonical immersive bootstrap */
(()=>{'use strict';
window.CB_IMMERSIVE_UI=true;
function add(id,href){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=href;s.defer=true;document.body.appendChild(s)}
function css(id,href){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
function boot(){
 document.body.classList.add('cb-immersive');
 document.querySelectorAll('#beginnerGuide,#introOverlay,.cb-immersive-root,#cbFeatureTray,#cbFeaturePanel,#cbFeatureModal,#crisisLayer').forEach(e=>e.remove());
 css('cb-v2-css','immersive-command-center-v2.css?v=5');
 css('cb-v2-compact','immersive-compact-panels.css?v=3');
 css('cb-heart-bridge-css','immersive-heart-bridge.css?v=2');
 css('cb-v6-redesign','immersive-redesign-v6.css?v=1');
 add('cb-v2-js','immersive-command-center-v2.js?v=5');
 add('cb-heart-bridge','immersive-heart-bridge.js?v=2');
 add('cb-tutorial-sync','immersive-tutorial-sync.js?v=2');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
