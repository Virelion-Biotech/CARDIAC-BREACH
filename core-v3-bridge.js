/* CARDIAC//BREACH v4 compatibility surface. The mechanistic engine owns rules. */
(()=>{
 'use strict';
 const M=window.CBMechanisticV3;
 const P=window.CBPrecisionV4;
 if(!M) throw new Error('CBMechanisticV3 must load before core-v3-bridge.js');
 if(!P) throw new Error('CBPrecisionV4 must load before core-v3-bridge.js');
 const create=(seed,scenario)=>{
   const g=M.create(seed,scenario);
   P.attach(g);
   return g;
 };
 const resolve=(g)=>{
   if(g.precision?.ledger){
     g.precision.ledger.tick++;
     g.precision.phase('turn.snapshot.before',()=>g.precision.sync());
   }
   const out=M.resolve(g);
   if(g.precision?.ledger){
     g.precision.phase('turn.snapshot.after',()=>g.precision.sync());
     g.precision.ledger.accounts.set('clock.day',BigInt(g.day)*P.SCALE);
     g.precision.ledger.accounts.set('clock.microstep',BigInt(g.precision.ledger.microstep));
   }
   return out;
 };
 const compat={
  W:M.W,H:M.H,MAX_DAYS:M.MAX_DAYS,MAX_AGENTS:M.MAX_AGENTS,
  scenarios:Object.fromEntries(Object.entries(M.SCENARIOS).map(([k,v])=>[k,{name:v.name,focus:v.focus}])),
  agentRules:Object.fromEntries(Object.entries(M.AGENTS).map(([k,v])=>[k,{cost:v.cost,cp:1,range:v.range}])),
  createGame:create,
  place:(g,id,target,name)=>{
    const before=g.precision?.ledger.get('game.energy');
    const out=M.place(g,id,target,name);
    if(out.ok&&g.precision){
      g.precision.ledger.set('game.energy',g.energy);
      g.precision.ledger.set('game.moves',g.moves);
      g.precision.ledger.accounts.set(`intervention.${out.agent.id}.commitments`,BigInt(out.agent.uses)*P.SCALE);
      if(before!==undefined)g.precision.ledger.accounts.set(`intervention.${out.agent.id}.energy_delta`,P.q(g.energy-(Number(before)/1e18)));
    }
    return out;
  },
  resolve,
  score:(g)=>M.score(g),
  snapshot:(g)=>{const snap=M.snapshot(g);if(g.precision)snap.precision=g.precision.snapshot();return snap},
  neighbors:(cells,i)=>M.neighbours(cells,i),
  distance:M.dist,
  rehydrate:M.rehydrate,
  phases:M.PHASES,
  precision:{scale:'1e-18',unit:'Q18',microstepsPerTurn:4096}
 };
 window.CBGameCoreV2=compat;
 window.CBMechanisticGameEngine=M;
})();
