/* CARDIAC//BREACH — beginner-friendly spatial agent placement */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 function marker(){
  if($('targetedAgentLegend'))return;
  const host=document.querySelector('.tissue-panel');if(!host)return;
  const el=document.createElement('div');el.id='targetedAgentLegend';el.innerHTML='<span>PLACED AGENTS</span><b id="placedAgentCount">0</b><small>Click a cell first, then deploy an agent. The marker shows where it was placed.</small>';
  host.appendChild(el);
 }
 function wrapDeploy(){
  const original=window.deploy;if(!original||original.__targeted)return;
  const wrapped=function(id,name=null){
   const target=typeof window.selected==='number'?window.selected:0;
   const before=(window.agents||[]).length;
   original(id,name);
   if((window.agents||[]).length>before){
    const a=window.agents[window.agents.length-1];
    a.targetCell=target;
    a.targetX=(window.cells?.[target]?.x)||0;
    a.targetY=(window.cells?.[target]?.y)||0;
    a.placementLabel=`Region ${target+1}`;
    if(window.log)window.log(`${a.name} placed on Region ${target+1}.`);
    renderPlacement();
    window.draw?.();
    window.updateUI?.();
  }};
  wrapped.__targeted=true;window.deploy=wrapped;
 }
 function renderPlacement(){
  marker();const list=$('placedAgentCount');if(list)list.textContent=(window.agents||[]).filter(a=>a.targetCell!==undefined).length;
  let el=$('placedAgents');
  if(!el){el=document.createElement('div');el.id='placedAgents';document.querySelector('.tissue-panel')?.appendChild(el)}
  const agents=(window.agents||[]).filter(a=>a.targetCell!==undefined);el.innerHTML=agents.map(a=>`<span><b>${a.name}</b> · R${a.targetCell+1}</span>`).join('');
 }
 function applyLocalEffects(){
  const cs=window.cells||[];for(const a of (window.agents||[])){
   if(a.targetCell===undefined)continue;
   const c=cs[a.targetCell];if(!c)continue;
   const id=a.id;
   if(id==='stabilizer'){c.stress=Math.max(0,c.stress-1.4);c.damage=Math.max(0,c.damage-.7);}
   else if(id==='regenerator'){c.damage=Math.max(0,c.damage-1.1);c.energy=Math.min(100,c.energy+.5);}
   else if(id==='immune'){c.stress=Math.max(0,c.stress-.6);}
   else if(id==='vascular'){c.oxygen=Math.min(100,c.oxygen+1.8);c.energy=Math.min(100,c.energy+.3);}
   else if(id==='maturation'){c.mature=Math.min(100,c.mature+1.4);}
   else if(id==='electrical'){c.stress=Math.max(0,c.stress-.4);}
  }
 }
 function wrapAdvance(){
  const original=window.advance;if(!original||original.__targetedAdvance)return;
  const wrapped=function(){const before=(window.day||0);original();if((window.day||0)!==before){applyLocalEffects();renderPlacement();window.draw?.();window.updateUI?.();}};wrapped.__targetedAdvance=true;window.advance=wrapped;$('nextDay')?.addEventListener('click',()=>{});
 }
 function init(){marker();wrapDeploy();wrapAdvance();renderPlacement();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,220));else setTimeout(init,220);
})();
