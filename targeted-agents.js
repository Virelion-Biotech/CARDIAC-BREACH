/* CARDIAC//BREACH — beginner-friendly spatial agent placement */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 function marker(){
  if($('targetedAgentLegend'))return;
  const host=document.querySelector('.tissue-panel');if(!host)return;
  const el=document.createElement('div');el.id='targetedAgentLegend';el.innerHTML='<span>PLACED AGENTS</span><b id="placedAgentCount">0</b><small>Agents are assigned to the selected cell/region. The cell gets an ACTIVE marker immediately; the actual tissue effect is applied when you advance the day.</small>';
  host.appendChild(el);
 }
 function wrapDeploy(){
  const original=window.deploy;if(!original||original.__targeted)return;
  const wrapped=function(id,name=null){
   const target=typeof window.selected==='number'?window.selected:0;
   const before=(window.agents||[]).length;
   original(id,name);
   if((window.agents||[]).length>before){
    const a=window.agents[window.agents.length-1],c=window.cells?.[target];
    a.targetCell=target;a.targetX=c?.x||0;a.targetY=c?.y||0;a.placementLabel=`Region ${target+1}`;
    if(c){c.agentPresence=(c.agentPresence||0)+1;c.agentPulseUntil=Date.now()+1600;}
    window.log?.(`${a.name} placed on Region ${target+1}. The cell is now under active support.`);
    window.CB_Audio?.deploy?.();
    renderPlacement();window.draw?.();window.updateUI?.();
   }
  };
  wrapped.__targeted=true;window.deploy=wrapped;
 }
 function renderPlacement(){
  marker();const count=$('placedAgentCount');if(count)count.textContent=(window.agents||[]).filter(a=>a.targetCell!==undefined).length;
  let el=$('placedAgents');if(!el){el=document.createElement('div');el.id='placedAgents';document.querySelector('.tissue-panel')?.appendChild(el)}
  const agents=(window.agents||[]).filter(a=>a.targetCell!==undefined);el.innerHTML=agents.map(a=>`<span><b>${a.name}</b> · R${a.targetCell+1}</span>`).join('');
 }
 function applyLocalEffects(){
  const cs=window.cells||[];for(const a of (window.agents||[])){
   if(a.targetCell===undefined)continue;const c=cs[a.targetCell];if(!c)continue;const id=a.id;
   if(id==='stabilizer'){c.stress=Math.max(0,c.stress-2.8);c.damage=Math.max(0,c.damage-1.5)}
   else if(id==='regenerator'){c.damage=Math.max(0,c.damage-2);c.energy=Math.min(100,c.energy+1)}
   else if(id==='immune'){c.stress=Math.max(0,c.stress-1.2)}
   else if(id==='vascular'){c.oxygen=Math.min(100,c.oxygen+3);c.energy=Math.min(100,c.energy+.6)}
   else if(id==='maturation'){c.mature=Math.min(100,c.mature+2.2)}
   else if(id==='electrical'){c.stress=Math.max(0,c.stress-.9);c.damage=Math.max(0,c.damage-.35)}
  }
 }
 function drawPlacementOverlay(){
  const cv=$('tissue');if(!cv||!window.cells?.length)return;const cctx=cv.getContext('2d'),cw=cv.width/18,ch=cv.height/12;
  (window.agents||[]).filter(a=>a.targetCell!==undefined).forEach(a=>{const c=window.cells[a.targetCell];if(!c)return;const x=c.x*cw+cw/2,y=c.y*ch+ch/2;
   cctx.save();cctx.strokeStyle='#8ef0d0';cctx.lineWidth=2;cctx.shadowColor='#8ef0d0';cctx.shadowBlur=10;cctx.beginPath();cctx.arc(x,y,Math.min(cw,ch)*.25+Math.sin((window.anim||0)*.12)*2,0,Math.PI*2);cctx.stroke();cctx.shadowBlur=0;cctx.fillStyle='#d8f36a';cctx.font='700 10px system-ui';cctx.textAlign='center';cctx.fillText('ACTIVE',x,y-12);cctx.restore();
  });
 }
 function wrapAdvance(){const original=window.advance;if(!original||original.__targetedAdvance)return;const wrapped=function(){const before=window.day||0;original();if((window.day||0)!==before){applyLocalEffects();window.CB_Audio?.heal?.();renderPlacement();window.draw?.();window.updateUI?.()}};wrapped.__targetedAdvance=true;window.advance=wrapped;}
 function wrapDraw(){const original=window.draw;if(!original||original.__targetedDraw)return;const wrapped=function(){original();drawPlacementOverlay()};wrapped.__targetedDraw=true;window.draw=wrapped;}
 function init(){marker();wrapDeploy();wrapAdvance();wrapDraw();renderPlacement()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,220));else setTimeout(init,220);
})();
