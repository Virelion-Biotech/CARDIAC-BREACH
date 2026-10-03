/* CARDIAC//BREACH v0.7 — balance layer.
   Goal: preserve distinct agent identities, reward counter-picks, and prevent
   duplicate stacking/evolved-policy stacking from becoming the default answer.
   All mechanics are abstract game systems. */
(()=>{
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const tune=()=>{
   if(typeof defs!=='undefined'){
     const costs={stabilizer:18,regenerator:25,immune:19,vascular:22,maturation:16,electrical:18};
     defs.forEach(d=>{if(costs[d.id])d.cost=costs[d.id]});
   }
   if(window.AgentRuntime) window.AgentRuntime.balanceVersion=1;
 };
 const apply=()=>{
   if(typeof agents==='undefined'||typeof state==='undefined')return;
   const scenario=document.getElementById('scenario')?.value;
   const count=id=>agents.filter(a=>a.id===id).length;
   const n={stabilizer:count('stabilizer'),regenerator:count('regenerator'),immune:count('immune'),vascular:count('vascular'),maturation:count('maturation'),electrical:count('electrical')};
   // Small identity bonuses make every class matter in at least one context.
   if(n.stabilizer){state.viability=clamp(state.viability+n.stabilizer*.25);state.fibrosis=clamp(state.fibrosis-n.stabilizer*.20);if(scenario==='fibrosis')state.viability=clamp(state.viability+n.stabilizer*.40)}
   if(n.regenerator){state.viability=clamp(state.viability-n.regenerator*.30);state.func=clamp(state.func-n.regenerator*.25)}
   if(n.immune){if(scenario==='inflammation')state.viability=clamp(state.viability+n.immune*.40);else state.viability=clamp(state.viability+n.immune*.08)}
   if(n.vascular){state.func=clamp(state.func-n.vascular*.20);if(scenario==='ischemia')state.viability=clamp(state.viability+n.vascular*.30)}
   if(n.maturation){state.func=clamp(state.func+n.maturation*(scenario==='maturation'?.40:.12))}
   if(n.electrical){state.func=clamp(state.func+n.electrical*(scenario==='arrhythmia'?.50:.10))}
   // Diminishing returns: stacking the same role should be useful, but never optimal by default.
   const duplicate=(id,metric,penalty)=>{const extra=Math.max(0,n[id]-1);if(extra)state[metric]=clamp(state[metric]+penalty*extra)};
   duplicate('regenerator','viability',-.35);duplicate('regenerator','func',-.30);
   duplicate('vascular','func',-.30);duplicate('immune','inflammation',.45);
   duplicate('stabilizer','fibrosis',.30);duplicate('maturation','func',-.25);duplicate('electrical','arrhythmia',.35);
   // Evolved policies receive a soft cap through diminishing returns across the evolved pool.
   const evolved=agents.filter(a=>a.source==='evolved');
   if(evolved.length>1){
     const extra=evolved.length-1;
     state.viability=clamp(state.viability-extra*.20);
     state.func=clamp(state.func-extra*.18);
   }
 };
 const wrap=()=>{
   const original=window.advance;if(!original||original.__cbBalanceWrapped)return;
   const wrapped=()=>{original();apply();if(typeof history!=='undefined'&&history.length)Object.assign(history[history.length-1],state);if(typeof updateUI==='function')updateUI();if(typeof renderChart==='function')renderChart()};
   wrapped.__cbBalanceWrapped=true;window.advance=wrapped;
   const next=document.getElementById('nextDay');if(next)next.onclick=wrapped;
 };
 tune();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(wrap,0));else setTimeout(wrap,0);
 window.CardiacBalance={version:1,apply};
})();
