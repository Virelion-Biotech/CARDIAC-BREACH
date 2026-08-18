/* v0.4: evolved policies become deployable game agents. */
window.AgentRuntime={
  fromPolicy(p){const t=p.traits;return {id:p.id,name:p.name,level:p.level,source:'evolved',policy:t,cost:12+Math.round((1-(t.stability+t.recovery)/2)*10),uses:0}},
  effect(a){const t=a.policy;return {stabilize:t.stability*2.6,recover:t.recovery*2.9,immune:t.inflammationControl*2.4,vascular:t.perfusion*2.2,mature:t.maturation*2.1,electrical:t.electricalSafety*2.5}}
};
