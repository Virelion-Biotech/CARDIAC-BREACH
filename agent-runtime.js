/* v0.7: evolved policies become deployable, deliberately bounded game agents. */
window.AgentRuntime={
  fromPolicy(p){const t=p.traits,mean=Object.values(t).reduce((a,b)=>a+b,0)/6;return {id:p.id,name:p.name,level:p.level,source:'evolved',policy:t,cost:15+Math.round((1-mean)*8),uses:0}},
  effect(a){const t=a.policy;return {stabilize:t.stability*1.8,recover:t.recovery*2.0,immune:t.inflammationControl*1.7,vascular:t.perfusion*1.6,mature:t.maturation*1.55,electrical:t.electricalSafety*1.8}}
};
