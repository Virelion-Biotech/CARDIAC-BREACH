/* CARDIAC//BREACH v2 adapter
 * Exposes the compact tactical core through the legacy UI contract.
 * UI modules may read globals, but turn resolution lives in CBGameCoreV2.
 */
(()=>{
'use strict';
const core=window.CBGameCoreV2;if(!core)return;
let G=null;
const $=id=>document.getElementById(id);
function sync(){if(!G)return;window.cells=G.cells;window.selected=window.selected||0;window.day=G.day;window.energy=G.state.energy;window.agents=G.agents;window.history=G.history;window.running=G.running;window.state=G.state;window.CBGameState=G;document.body.dataset.commands=String(G.commandPoints);document.body.dataset.seed=String(G.seed);if($('day'))$('day').textContent=G.day;if($('energy'))$('energy').textContent=Math.round(G.state.energy);if($('score'))$('score').textContent=core.score(G);if($('agentCount'))$('agentCount').textContent=`${G.agents.length} / ${core.MAX_AGENTS} deployed`;renderObjectives();}
function renderObjectives(){let el=$('coreObjectives');if(!el){el=document.createElement('div');el.id='coreObjectives';const a=document.querySelector('.scenario-row');a?.after(el)}const m=G.mission;el.innerHTML=`<div class="core-objective-main"><b>${m.title}</b><span>Focus: ${m.focus.toUpperCase()}</span></div><div class="core-objective-list">${m.objectives.map(o=>`<span class="${o.status?'done':''}">${o.status?'✓':'○'} ${o.label}</span>`).join('')}</div><div class="core-cp"><b>${G.commandPoints}</b> COMMANDS</div>`;}
function draw(){window.CBGameLegacyDraw?.();if(typeof window.draw==='function'&&!window.draw.__v2proxy){const d=window.draw;window.draw=function(){d();drawTacticalOverlay()};window.draw.__v2proxy=true;}}
function drawTacticalOverlay(){const cv=$('tissue');if(!cv||!G)return;const c=cv.getContext('2d'),cw=cv.width/core.W,ch=cv.height/core.H;c.save();for(const h of G.mission.hotspots){const cell=G.cells[h.cell];if(!cell||h.resolved)continue;const x=cell.x*cw+cw/2,y=cell.y*ch+ch/2;const r=Math.min(cw,ch)*(.18+h.severity/250);c.strokeStyle=h.severity>72?'#ff7079':'#f2b55d';c.lineWidth=2;c.globalAlpha=.55;c.beginPath();c.arc(x,y,r+Math.sin((window.anim||0)*.09+h.id)*2,0,Math.PI*2);c.stroke();c.globalAlpha=1;c.fillStyle='#eef3f5';c.font='700 9px system-ui';c.textAlign='center';c.fillText(String(h.id),x,y+3)}for(const a of G.agents){const cell=G.cells[a.targetCell];if(!cell)continue;const x=cell.x*cw+cw/2,y=cell.y*ch+ch/2;c.strokeStyle='#d9f36a';c.lineWidth=2;c.beginPath();c.arc(x,y,Math.min(cw,ch)*.30,0,Math.PI*2);c.stroke();c.globalAlpha=.18;c.fillStyle='#d9f36a';c.beginPath();c.arc(x,y,Math.min(cw,ch)*a.range*.48,0,Math.PI*2);c.fill();c.globalAlpha=1}}
function resetV2(){const scenario=$('scenario')?.value||'ischemia';const seed=Number(localStorage.getItem('cb-seed-v2'))||Math.floor(Math.random()*4294967295);localStorage.setItem('cb-seed-v2',String(seed));G=core.createGame(seed,scenario);window.selected=0;sync();window.renderAgents?.();window.renderArchive?.();window.updateUI?.();window.draw?.();window.renderChart?.();window.CB_Audio?.confirm?.();}
function advanceV2(){if(!G)return resetV2();const result=core.resolve(G);sync();window.log?.(`DAY ${G.day} — ${result.complete?'RUN RESOLVED':'TACTICAL STATE UPDATED'}: ${G.mission.title}.` ,result.hardFail);window.updateUI?.();window.renderChart?.();window.draw?.();if(result.complete){window.CB_Audio?.(result.win?'win':'fail');}}
function deployV2(id,name=null){if(!G)resetV2();const target=Number.isInteger(window.selected)?window.selected:0;const out=core.place(G,id,target,name);if(!out.ok){window.log?.(out.reason,true);window.CB_Audio?.warning?.();return null}sync();window.log?.(`${out.agent.name} deployed to Cell ${target+1} · Range ${out.agent.range} · 1 command.`);window.updateUI?.();window.draw?.();window.CB_Audio?.deploy?.();return out.agent}
window.CBGameV2={get:()=>G,reset:resetV2,advance:advanceV2,deploy:deployV2};
window.reset=resetV2;window.advance=advanceV2;window.deploy=deployV2;
const oldDraw=window.draw;window.CBGameLegacyDraw=oldDraw;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{if(!G)resetV2()},420));else setTimeout(()=>{if(!G)resetV2()},420);
})();
