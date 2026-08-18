/* CARDIAC//BREACH — command deck + immersive visual bootstrap */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const num=id=>Number(String($(id)?.textContent||'0').replace(/[^0-9.-]/g,''))||0;
function installLegacyTheme(){
 if(!document.getElementById('cb-v43-style')){
  const link=document.createElement('link');link.id='cb-v43-style';link.rel='stylesheet';link.href='ui-v43-force.css?v=43';document.head.appendChild(link);
 }
 document.body.classList.add('cb-v43');
 const small=document.querySelector('.topbar small');if(small)small.textContent=' MEDICAL ROGUELIKE · v5 / IMMERSIVE';
 const model=document.querySelector('.cockpit-foot div b');if(model)model.textContent='IMMERSIVE FIELD';
}
function syncLegacyTelemetry(){
 const day=num('day'),score=num('score'),viability=num('viability'),inflammation=num('inflammation'),arrhythmia=num('arrhythmia');
 const heroDay=$('heroDay'),heroScore=$('heroScore'),heroThreat=$('heroThreat');
 if(heroDay)heroDay.textContent=`DAY ${day}`;
 if(heroScore)heroScore.textContent=score;
 const threat=Math.max(0,Math.min(100,(100-viability)*.52+inflammation*.28+arrhythmia*.20));
 if(heroThreat){heroThreat.textContent=threat>=70?'CRITICAL':threat>=42?'ELEVATED':'LOW';heroThreat.dataset.level=threat>=70?'critical':threat>=42?'elevated':'low';}
 document.dispatchEvent(new CustomEvent('cardiac:heart-state',{detail:{severity:threat/100,day,score,viability,inflammation,arrhythmia}}));
}
function boot(){
 installLegacyTheme();
 ['day','score','viability','inflammation','arrhythmia'].forEach(id=>{const el=$(id);if(el)new MutationObserver(syncLegacyTelemetry).observe(el,{childList:true,characterData:true,subtree:true});});
 syncLegacyTelemetry();
 if(!document.getElementById('cb-immersive-css')){const link=document.createElement('link');link.id='cb-immersive-css';link.rel='stylesheet';link.href='immersive-command-center.css?v=1';document.head.appendChild(link);}
 if(!document.querySelector('script[data-immersive-command-center]')){const script=document.createElement('script');script.src='immersive-command-center.js?v=1';script.dataset.immersiveCommandCenter='true';document.body.appendChild(script);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
