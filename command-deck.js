/* CARDIAC//BREACH — command deck + live visual theme loader */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const num=id=>Number(String($(id)?.textContent||'0').replace(/[^0-9.-]/g,''))||0;
function installTheme(){
 if(document.body.classList.contains('cb-v43'))return;
 document.body.classList.add('cb-v43');
 const link=document.createElement('link');link.id='cb-v43-style';link.rel='stylesheet';link.href='ui-v43-force.css?v=43';document.head.appendChild(link);
 const small=document.querySelector('.topbar small');if(small)small.textContent=' MEDICAL ROGUELIKE · v4.3 / ANATOMICAL';
 const model=document.querySelector('.cockpit-foot div b');if(model)model.textContent='ANATOMICAL GLB';
}
function sync(){
 const day=num('day'),score=num('score'),viability=num('viability'),inflammation=num('inflammation'),arrhythmia=num('arrhythmia');
 const heroDay=$('heroDay'),heroScore=$('heroScore'),heroThreat=$('heroThreat');
 if(heroDay)heroDay.textContent=`DAY ${day}`;
 if(heroScore)heroScore.textContent=score;
 const threat=Math.max(0,Math.min(100,(100-viability)*.52+inflammation*.28+arrhythmia*.20));
 if(heroThreat){heroThreat.textContent=threat>=70?'CRITICAL':threat>=42?'ELEVATED':'LOW';heroThreat.dataset.level=threat>=70?'critical':threat>=42?'elevated':'low';}
 document.dispatchEvent(new CustomEvent('cardiac:heart-state',{detail:{severity:threat/100,day,score,viability,inflammation,arrhythmia}}));
}
function init(){installTheme();['day','score','viability','inflammation','arrhythmia'].forEach(id=>{const el=$(id);if(el)new MutationObserver(sync).observe(el,{childList:true,characterData:true,subtree:true});});sync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
