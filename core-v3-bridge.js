/* CARDIAC//BREACH v3 compatibility surface. The mechanistic engine owns rules. */
(()=>{
 'use strict';
 const M=window.CBMechanisticV3;
 if(!M) throw new Error('CBMechanisticV3 must load before core-v3-bridge.js');
 const compat={
  W:M.W,H:M.H,MAX_DAYS:M.MAX_DAYS,MAX_AGENTS:M.MAX_AGENTS,
  scenarios:Object.fromEntries(Object.entries(M.SCENARIOS).map(([k,v])=>[k,{name:v.name,focus:v.focus}])),
  agentRules:Object.fromEntries(Object.entries(M.AGENTS).map(([k,v])=>[k,{cost:v.cost,cp:1,range:v.range}])),
  createGame:(seed,scenario)=>M.create(seed,scenario),
  place:(g,id,target,name)=>M.place(g,id,target,name),
  resolve:(g)=>M.resolve(g),
  score:(g)=>M.score(g),
  snapshot:(g)=>M.snapshot(g),
  neighbors:(cells,i)=>M.neighbours(cells,i),
  distance:M.dist,
  rehydrate:M.rehydrate,
  phases:M.PHASES
 };
 window.CBGameCoreV2=compat;
 window.CBMechanisticGameEngine=M;
})();
