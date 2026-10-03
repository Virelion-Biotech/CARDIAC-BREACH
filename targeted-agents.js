/* CARDIAC//BREACH — spatial intervention bridge
 * Uses CBCompat when available; no timing-based initialization.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const api=()=>window.CBCompat||{};
 const cells=()=>api().cells||window.cells||[];
 const agents=()=>api().agents||window.agents||[];
 const selected=()=>Number.isInteger(api().selected)?api().selected:(Number.isInteger(window.CBApp?.selectedCell)?window.CBApp.selectedCell:0);
 const day=()=>Number(api().day??window.day??0);
 function marker(){if($('targetedAgentLegend')||!document.querySelector('.tissue-panel'))return;const el=document.createElement('div');el.id='targetedAgentLegend';el.innerHTML='<span>PLACED AGENTS</span><b id="placedAgentCount">0</b><small>Assigned to the selected cell. The active marker appears immediately; local response resolves at END TURN.</small>';document.querySelector('.tissue-panel').appendChild(el);}
 function renderPlacement(){marker();const aa=agents().filter(a=>a&&a.targetCell!==undefined),count=$('placedAgentCount');if(count)count.textContent=aa.length;let list=$('placedAgents');if(!list){list=document.createElement('div');list.id='placedAgents';document.querySelector('.tissue-panel')?.appendChild(list);}list.innerHTML=aa.map(a=>`<span><b>${String(a.name||'INTERVENTION')}</b> · R${Number(a.targetCell)+1}</span>`).join('');}
 function drawPlacementOverlay(){const cv=$('tissue'),cs=cells();if(!cv||!cs.length)return;const ctx=cv.getContext('2d'),cols=18,rows=12,cw=cv.width/cols,ch=cv.height/rows;agents().filter(a=>a&&a.targetCell!==undefined).forEach(a=>{const idx=Number(a.targetCell),c=cs[idx],x=(Number(c?.x??idx%cols)+.5)*cw,y=(Number(c?.y??Math.floor(idx/cols))+.5)*ch;ctx.save();ctx.strokeStyle='#d8f36a';ctx.lineWidth=2;ctx.shadowColor='#d8f36a';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,Math.min(cw,ch)*.25+Math.sin(performance.now()*.006)*2,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#d8f36a';ctx.font='800 9px system-ui';ctx.textAlign='center';ctx.fillText('ACTIVE',x,y-13);ctx.restore();});}
 function wrapDeploy(){const original=window.deploy;if(typeof original!=='function'||original.__cbTargeted)return;function wrapped(id,name=null){const target=selected(),before=agents().length;original(id,name);const aa=agents();if(aa.length>before){const a=aa[aa.length-1],c=cells()[target];a.targetCell=target;a.targetX=Number(c?.x??target%18);a.targetY=Number(c?.y??Math.floor(target/18));a.placementLabel=`Region ${target+1}`;if(c){c.agentPresence=(c.agentPresence||0)+1;c.agentPulseUntil=Date.now()+1600;}window.log?.(`${a.name||'Intervention'} placed on Region ${target+1}.`);window.CB_Audio?.deploy?.();renderPlacement();window.draw?.();window.updateUI?.();}}wrapped.__cbTargeted=true;window.deploy=wrapped;}
 function wrapAdvance(){const original=window.advance;if(typeof original!=='function'||original.__cbTargetedAdvance)return;function wrapped(){const before=day();original();if(day()!==before){renderPlacement();window.CB_Audio?.heal?.();window.draw?.();window.updateUI?.();}}wrapped.__cbTargetedAdvance=true;window.advance=wrapped;}
 function wrapDraw(){const original=window.draw;if(typeof original!=='function'||original.__cbTargetedDraw)return;function wrapped(){original();drawPlacementOverlay();}wrapped.__cbTargetedDraw=true;window.draw=wrapped;}
 function init(){marker();wrapDeploy();wrapAdvance();wrapDraw();renderPlacement();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 document.addEventListener('cardiac:app-ready',init,{once:false});
 window.CB_TargetedAgents={renderPlacement};
})();
