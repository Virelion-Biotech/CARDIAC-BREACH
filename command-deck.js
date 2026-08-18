/* CARDIAC//BREACH — command deck telemetry bridge */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const num=id=>Number(String($(id)?.textContent||'0').replace(/[^0-9.-]/g,''))||0;
function sync(){
 const day=num('day'),score=num('score'),viability=num('viability'),inflammation=num('inflammation'),arrhythmia=num('arrhythmia');
 const heroDay=$('heroDay'),heroScore=$('heroScore'),heroThreat=$('heroThreat');
 if(heroDay)heroDay.textContent=`DAY ${day}`;
 if(heroScore)heroScore.textContent=score;
 const threat=clamp((100-viability)*.52+inflammation*.28+arrhythmia*.20,0,100);
 if(heroThreat){heroThreat.textContent=threat>=70?'CRITICAL':threat>=42?'ELEVATED':'LOW';heroThreat.dataset.level=threat>=70?'critical':threat>=42?'elevated':'low';}
 document.dispatchEvent(new CustomEvent('cardiac:heart-state',{detail:{severity:threat/100,day,score,viability,inflammation,arrhythmia}}));
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function init(){['day','score','viability','inflammation','arrhythmia'].forEach(id=>{const el=$(id);if(el)new MutationObserver(sync).observe(el,{childList:true,characterData:true,subtree:true});});sync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
