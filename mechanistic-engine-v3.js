/* CARDIAC//BREACH v3 — deterministic mechanistic game engine
 * Player complexity stays low. Internal state is explicit, phase-ordered,
 * bounded, auditable and reproducible. This is a synthetic game model.
 */
(()=>{
 'use strict';
 const W=18,H=12,N=W*H,MAX_DAYS=24,MAX_AGENTS=5;
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const mean=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
 const sq=(v)=>v*v;
 const PHASES=['insult','delivery','metabolism','injury','immune','repair','remodel','electrical','organ','mission'];
 const SCENARIOS={
  ischemia:{name:'Ventricular Crisis',focus:'oxygen',insult:{oxygen:5.2,immune:1.1,matrix:.5,electric:.3},mission:s=>s.oxygen>=62&&s.viability>=60},
  inflammation:{name:'Inflammatory Surge',focus:'inflammation',insult:{oxygen:.8,immune:5.8,matrix:.8,electric:.2},mission:s=>s.inflammation<=38&&s.viability>=58},
  fibrosis:{name:'Remodeling Crisis',focus:'fibrosis',insult:{oxygen:1.0,immune:2.0,matrix:3.2,electric:.2},mission:s=>s.fibrosis<=28&&s.func>=58},
  maturation:{name:'Recovery Window',focus:'function',insult:{oxygen:0,immune:.6,matrix:.2,electric:.1},mission:s=>s.func>=70&&s.viability>=62},
  arrhythmia:{name:'Conduction Crisis',focus:'arrhythmia',insult:{oxygen:1.8,immune:.6,matrix:.5,electric:4.0},mission:s=>s.arrhythmia<=28&&s.func>=58}
 };
 const AGENTS={
  stabilizer:{cost:14,range:2,field:{stress:-5,ros:-2,matrix:-.55,repair:+1}},
  regenerator:{cost:20,range:1,field:{damage:-4,repair:+4,atp:+2,ros:-.6}},
  immune:{cost:17,range:2,field:{immune:-4,stress:-1.5,ros:-1.2}},
  vascular:{cost:19,range:3,field:{perfusion:+5,oxygen:+3,atp:+1.8,edema:-1}},
  maturation:{cost:15,range:2,field:{mature:+3,conduction:+1.2,repair:+1}},
  electrical:{cost:18,range:2,field:{conduction:+5,calcium:-1.8,ros:-.5,stress:-1}}
 };
 const TRAITS={
  'PERFUSION RICH':{perfusion:1.08,oxygen:1.03},
  'LOW OXYGEN':{perfusion:.9,oxygen:.86,ros:1.08},
  'INFLAMMATORY':{immune:1.28,stress:1.05},
  'SCAR PRONE':{matrix:1.35},
  'ELECTRICALLY SENSITIVE':{conduction:.9,calcium:1.1},
  'RECOVERY NICHE':{repair:1.15,atp:1.05}
 };
 function rng(seed){let s=(seed>>>0)||1;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}}
 function idx(x,y){return y*W+x}
 function dist(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
 function neighbours(cells,i){const c=cells[i],out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=c.x+dx,y=c.y+dy;if(x>=0&&x<W&&y>=0&&y<H)out.push(idx(x,y))}return out}
 function weighted(value,low,high){return clamp((value-low)/(high-low)*100)}
 function makeCell(R,x,y){
  const edge=Math.hypot(x-(W-1)/2,y-(H-1)/2)/(W*.62),r=R();
  const type=r<.68?'cardiomyocyte':r<.82?'fibroblast':r<.94?'endothelial':'immune';
  const trait=Object.keys(TRAITS)[Math.floor(R()*Object.keys(TRAITS).length)];
  return {id:idx(x,y),x,y,type,trait,alive:true,
   supply:{perfusion:clamp(86-edge*22+(R()-.5)*8),oxygen:clamp(84-edge*18+(R()-.5)*10),debt:0,edema:R()*4},
   energy:{atp:clamp(72+(R()-.5)*18),reserve:clamp(70+(R()-.5)*22)},
   injury:{ros:clamp(9+(R()-.5)*6),calcium:clamp(12+(R()-.5)*6),stress:clamp(13+(R()-.5)*10),damage:clamp(5+R()*8)},
   immune:{signal:clamp(13+(R()-.5)*6),recruitment:clamp(R()*6),resolution:clamp(55+(R()-.5)*18)},
   repair:{capacity:clamp(62+(R()-.5)*18),repairing:clamp(8+R()*8)},
   matrix:{turnover:clamp(55+(R()-.5)*18),scar:clamp(4+R()*5),stiffness:clamp(6+R()*5)},
   electrical:{conduction:type==='cardiomyocyte'?clamp(82+(R()-.5)*16):clamp(25+(R()-.5)*20),coupling:clamp(70+(R()-.5)*18)},
   maturation:{functional:type==='cardiomyocyte'?clamp(50+(R()*.3)):clamp(70+R()*25)},
   flags:{commanded:false,injuryMemory:0,recovering:false},phase:R()*Math.PI*2
  };
 }
 function createCells(R){const cells=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)cells.push(makeCell(R,x,y));return cells}
 function hotspots(R){return Array.from({length:4},(_,i)=>({id:i+1,cell:Math.floor(R()*N),severity:Math.round(40+R()*40),resolved:false,chain:0,age:0}))}
 function create(seed,scenario='ischemia'){
  const R=rng(seed);const cells=createCells(R);
  return {version:3,seed:seed>>>0,scenario,day:0,running:true,moves:1,energy:100,cells,agents:[],events:[],history:[],hotspots:hotspots(R),audit:[],rng:R,
   state:{viability:78,func:64,oxygen:82,inflammation:28,fibrosis:12,arrhythmia:8,metabolic:76},
   hidden:{systemicROS:10,hemodynamicReserve:82,repairReserve:72,conductionReserve:84,neurohumoral:8,scarBurden:8,globalPerfusion:82,globalATP:78},
   mission:{objectives:[{id:'alive',done:false},{id:'focus',done:false},{id:'energy',done:false}]}}
 }
 function place(g,id,targetCell,name){
  const a=AGENTS[id];if(!g.running)return{ok:false,reason:'RUN COMPLETE'};if(!a)return{ok:false,reason:'UNKNOWN INTERVENTION'};if(g.moves<1)return{ok:false,reason:'NO MOVE LEFT'};if(g.energy<a.cost)return{ok:false,reason:'NOT ENOUGH ENERGY'};if(g.agents.length>=MAX_AGENTS)return{ok:false,reason:'INTERVENTION LIMIT'};if(!g.cells[targetCell])return{ok:false,reason:'SELECT A REGION'};
  g.energy=clamp(g.energy-a.cost);g.moves=0;const agent={id,name:name||id.toUpperCase(),targetCell,range:a.range,cost:a.cost,uses:0};g.agents.push(agent);g.cells[targetCell].flags.commanded=true;g.events.push({day:g.day,type:'intervention',agent:agent.name,cell:targetCell});return{ok:true,agent}
 }
 function applyField(g){
  for(const a of g.agents){const origin=g.cells[a.targetCell],rule=AGENTS[a.id];if(!origin)continue;for(const c of g.cells){const d=dist(origin,c);if(d>rule.range)continue;const fall=d===0?1:d===1?.62:.34;for(const[k,v] of Object.entries(rule.field)){
    if(k==='perfusion')c.supply.perfusion=clamp(c.supply.perfusion+v*fall);
    else if(k==='oxygen')c.supply.oxygen=clamp(c.supply.oxygen+v*fall);
    else if(k==='atp')c.energy.atp=clamp(c.energy.atp+v*fall);
    else if(k==='ros')c.injury.ros=clamp(c.injury.ros+v*fall);
    else if(k==='stress')c.injury.stress=clamp(c.injury.stress+v*fall);
    else if(k==='damage')c.injury.damage=clamp(c.injury.damage+v*fall);
    else if(k==='repair')c.repair.capacity=clamp(c.repair.capacity+v*fall);
    else if(k==='immune')c.immune.signal=clamp(c.immune.signal+v*fall);
    else if(k==='matrix')c.matrix.scar=clamp(c.matrix.scar+v*fall);
    else if(k==='conduction')c.electrical.conduction=clamp(c.electrical.conduction+v*fall);
    else if(k==='mature')c.maturation.functional=clamp(c.maturation.functional+v*fall);
    else if(k==='calcium')c.injury.calcium=clamp(c.injury.calcium+v*fall);
    else if(k==='edema')c.supply.edema=clamp(c.supply.edema+v*fall);
  }a.uses++}}
 }
 function phaseInsult(g,log){const sc=SCENARIOS[g.scenario],R=g.rng;for(const c of g.cells){const trait=TRAITS[c.trait];const pressure=sc.insult;const localized=g.hotspots.filter(h=>!h.resolved&&dist(c,g.cells[h.cell])<=2).reduce((n,h)=>n+h.severity*.025,0);c.injury.stress=clamp(c.injury.stress+pressure.insult*0.6+localized+R()*1.2-.5);c.immune.signal=clamp(c.immune.signal+pressure.immune*(trait.immune||1)*.25);c.matrix.scar=clamp(c.matrix.scar+pressure.matrix*(trait.matrix||1)*.08);c.electrical.coupling=clamp(c.electrical.coupling-(pressure.electric||0)*.12)}log.push('insult')}
 function phaseDelivery(g,log){const h=g.hidden,R=g.rng;const global=mean(g.cells.map(c=>c.supply.perfusion));h.globalPerfusion=clamp((h.globalPerfusion*.62+global*.38)-R()*1.2+.6);for(const c of g.cells){const trait=TRAITS[c.trait];const target=h.globalPerfusion*(trait.perfusion||1);c.supply.perfusion=clamp(c.supply.perfusion+(target-c.supply.perfusion)*.08-c.supply.edema*.045+(R()-.5)*1.1);c.supply.debt=clamp(c.supply.debt+(62-c.supply.perfusion)*.045-c.supply.perfusion*.006);c.supply.oxygen=clamp(c.supply.oxygen+(c.supply.perfusion-c.supply.oxygen)*.16-c.supply.debt*.018-(trait.oxygen? (1-trait.oxygen)*1.5:0)+(R()-.5)*1.2)}log.push('delivery')}
 function phaseMetabolism(g,log){const h=g.hidden,R=g.rng;for(const c of g.cells){const demand=(c.type==='cardiomyocyte'?1.3:.5)*(1+c.maturation.functional/170)*(1+c.injury.stress/180);const substrate=c.supply.oxygen*.46+c.supply.perfusion*.18+c.energy.reserve*.08;const fatigue=Math.max(0,55-substrate);c.energy.atp=clamp(c.energy.atp+(substrate-c.energy.atp)*.18-fatigue*.055-c.injury.ros*.018+(R()-.5)*1.4);c.energy.reserve=clamp(c.energy.reserve+(c.energy.atp-62)*.06-c.injury.stress*.018);c.injury.calcium=clamp(c.injury.calcium+(100-c.energy.atp)*.018+c.injury.ros*.012-c.energy.atp*.004+(R()-.5));c.injury.stress=clamp(c.injury.stress+fatigue*.08+c.injury.calcium*.01-c.energy.atp*.006+(R()-.5)*1.2)}h.globalATP=clamp(mean(g.cells.map(c=>c.energy.atp))*.72+h.globalATP*.28-R()*1.2+.6);log.push('metabolism')}
 function phaseInjury(g,log){const R=g.rng;for(let i=0;i<g.cells.length;i++){const c=g.cells[i],ns=neighbours(g.cells,i),neighStress=mean(ns.map(j=>g.cells[j].injury.stress));const injuryFlux=c.injury.ros*.028+c.injury.calcium*.013+c.injury.stress*.018+(100-c.energy.atp)*.015;const recoveryFlux=c.repair.capacity*.018+c.energy.atp*.006;c.injury.ros=clamp(c.injury.ros+(100-c.supply.oxygen)*.045+c.injury.stress*.018-c.repair.capacity*.009+(R()-.5)*1.2);c.injury.stress=clamp(c.injury.stress+neighStress*.014+c.injury.ros*.015+(100-c.supply.oxygen)*.02-c.repair.capacity*.012+(R()-.5)*1.4);c.injury.damage=clamp(c.injury.damage+injuryFlux-recoveryFlux+(R()-.5)*1.0);c.flags.injuryMemory=clamp(c.flags.injuryMemory+c.injury.damage*.012-c.repair.capacity*.006);if(c.injury.damage>92&&c.energy.atp<18&&c.supply.oxygen<15)c.alive=false}log.push('injury')}
 function phaseImmune(g,log){const h=g.hidden,R=g.rng;for(const c of g.cells){const damageSignal=c.injury.damage*.018+c.injury.ros*.014+c.injury.stress*.01;const resolution=c.immune.resolution*.012+c.repair.capacity*.008;c.immune.recruitment=clamp(c.immune.recruitment+damageSignal-c.immune.signal*.01+R()*.6-.3);c.immune.signal=clamp(c.immune.signal+(c.immune.recruitment*0.18)+damageSignal-resolution+(R()-.5)*.8);c.immune.resolution=clamp(c.immune.resolution+c.energy.atp*.012-c.immune.signal*.018+(R()-.5)*.7);c.injury.stress=clamp(c.injury.stress+c.immune.signal*.012-c.immune.resolution*.006)}h.neurohumoral=clamp(h.neurohumoral+mean(g.cells.map(c=>c.immune.signal))*.025+h.systemicROS*.012-h.hemodynamicReserve*.004+(R()-.5));log.push('immune')}
 function phaseRepair(g,log){const h=g.hidden,R=g.rng;for(const c of g.cells){const energyGate=weighted(c.energy.atp,25,75)/100;const scarPenalty=c.matrix.scar*.012;const capacity=c.repair.capacity*energyGate*(1-scarPenalty);c.repair.repairing=clamp(c.repair.repairing+(capacity-c.repair.repairing)*.12-c.injury.damage*.01);c.injury.damage=clamp(c.injury.damage-c.repair.repairing*.055);c.injury.ros=clamp(c.injury.ros-c.repair.repairing*.025);c.flags.recovering=c.repair.repairing>10&&c.injury.damage<50;c.repair.capacity=clamp(c.repair.capacity+h.repairReserve*.005-c.injury.ros*.006-c.matrix.stiffness*.004+(R()-.5));}h.repairReserve=clamp(h.repairReserve+mean(g.cells.map(c=>c.repair.capacity))*.004-h.neurohumoral*.008+h.globalATP*.004-R()*.5+.25);log.push('repair')}
 function phaseRemodel(g,log){const R=g.rng;for(const c of g.cells){const formation=c.injury.damage*.010+c.immune.signal*.006+c.flags.injuryMemory*.004;const resolution=c.repair.repairing*.006+c.immune.resolution*.004;c.matrix.turnover=clamp(c.matrix.turnover+formation*3-resolution*2+(R()-.5));c.matrix.scar=clamp(c.matrix.scar+formation-resolution);c.matrix.stiffness=clamp(c.matrix.stiffness+c.matrix.scar*.012-c.repair.capacity*.004+(R()-.5)*.4)}log.push('remodel')}
 function phaseElectrical(g,log){const h=g.hidden,R=g.rng;for(let i=0;i<g.cells.length;i++){const c=g.cells[i],ns=neighbours(g.cells,i);const neigh=mean(ns.map(j=>g.cells[j].electrical.conduction));const substrate=c.supply.oxygen*.28+c.energy.atp*.25+c.maturation.functional*.18;const burden=c.injury.ros*.22+c.matrix.stiffness*.25+c.injury.calcium*.12;c.electrical.conduction=clamp(c.electrical.conduction+(substrate-burden-c.electrical.conduction)*.055+(neigh-c.electrical.conduction)*.028+(R()-.5)*1.2);c.electrical.coupling=clamp(c.electrical.coupling+(c.electrical.conduction-neigh)*.018-c.matrix.stiffness*.012+(R()-.5)*.5);if(c.type==='cardiomyocyte')c.maturation.functional=clamp(c.maturation.functional+Math.max(0,c.energy.atp-55)*.012+c.repair.capacity*.003-(100-c.supply.oxygen)*.009)}h.conductionReserve=clamp(mean(g.cells.map(c=>c.electrical.conduction))*.72+h.conductionReserve*.28-h.hemodynamicReserve*.003);log.push('electrical')}
 function phaseOrgan(g,log){const h=g.hidden,s=g.state,c=g.cells,R=g.rng;const alive=mean(c.map(x=>x.alive?1:0));const o=mean(c.map(x=>x.supply.oxygen));const atp=mean(c.map(x=>x.energy.atp));const dmg=mean(c.map(x=>x.injury.damage));const imm=mean(c.map(x=>x.immune.signal));const scar=mean(c.map(x=>x.matrix.scar));const cond=mean(c.map(x=>x.electrical.conduction));const mature=mean(c.map(x=>x.maturation.functional));const ros=mean(c.map(x=>x.injury.ros));
  h.systemicROS=clamp(h.systemicROS*.7+ros*.3-h.repairReserve*.008+R()*.8-.4);h.scarBurden=clamp(h.scarBurden*.8+scar*.2+h.systemicROS*.008-h.repairReserve*.005);h.hemodynamicReserve=clamp(h.hemodynamicReserve+(h.globalATP-60)*.025-(100-h.globalPerfusion)*.04-h.neurohumoral*.01+R()*.6-.3);
  s.oxygen=clamp(o*.72+h.globalPerfusion*.18+h.hemodynamicReserve*.10);s.arrhythmia=clamp((100-cond)*.90+scar*.18+(100-h.conductionReserve)*.08+ros*.05);s.inflammation=clamp(imm*.86+h.neurohumoral*.20+h.systemicROS*.12);s.fibrosis=clamp(scar*2.35+h.scarBurden*.18);s.viability=clamp(alive*84-dmg*.17+(o-60)*.12+(atp-55)*.05);s.func=clamp(mature*.43+cond*.28+s.oxygen*.16+(100-s.fibrosis)*.13);s.metabolic=clamp(h.globalATP*.78+atp*.22);s.energy=clamp(s.energy+7-g.agents.reduce((n,a)=>n+(a.id==='regenerator'?3:a.id==='vascular'?2:1),0));log.push('organ')}
 function phaseMission(g,log){const sc=SCENARIOS[g.scenario],focus=sc.focus;for(const h of g.hotspots){if(h.resolved){continue}h.age++;const c=g.cells[h.cell];const local=(c.injury.damage+c.injury.ros+(100-c.supply.oxygen))*0.34;const support=g.agents.reduce((n,a)=>{const o=g.cells[a.targetCell];return n+(o&&dist(o,c)<=a.range?1:0)},0);h.severity=clamp(h.severity+local*.035-support*4+(g.rng()-.5)*2);if(h.severity<28&&support>0){h.resolved=true;g.events.push({day:g.day,type:'resolved',hotspot:h.id})}else if(h.severity>82){h.chain++;if(h.chain%2===0)g.events.push({day:g.day,type:'escalation',hotspot:h.id})}}
  const focusValue={oxygen:g.state.oxygen,inflammation:g.state.inflammation,fibrosis:g.state.fibrosis,arrhythmia:g.state.arrhythmia,function:g.state.func}[focus];const focusGood=(focus==='oxygen'||focus==='function')?focusValue>=60:focusValue<=40;const resolved=g.hotspots.filter(h=>h.resolved).length>=2;g.mission.objectives[0].done=g.state.viability>=45;g.mission.objectives[1].done=focusGood&&resolved;g.mission.objectives[2].done=g.energy>0;const hardFail=g.state.viability<20||g.state.func<20||g.state.arrhythmia>95;const complete=g.day>=MAX_DAYS||hardFail;const win=g.day>=MAX_DAYS&&!hardFail&&sc.mission(g.state)&&resolved;g.history.push({day:g.day,score:{...g.state},hidden:{...g.hidden},resolved,phases:PHASES.slice()});if(complete){g.running=false;g.result={win,hardFail,score:score(g),resolved}};g.audit.push({day:g.day,phaseOrder:PHASES.slice(),stateDigest:digest(g)});log.push('mission')}
 function digest(g){return {day:g.day,energy:g.energy,meanOxygen:mean(g.cells.map(c=>c.supply.oxygen)),meanATP:mean(g.cells.map(c=>c.energy.atp)),meanROS:mean(g.cells.map(c=>c.injury.ros)),meanDamage:mean(g.cells.map(c=>c.injury.damage)),meanImmune:mean(g.cells.map(c=>c.immune.signal)),meanScar:mean(g.cells.map(c=>c.matrix.scar)),meanConduction:mean(g.cells.map(c=>c.electrical.conduction)),viability:g.state.viability,func:g.state.func,arrhythmia:g.state.arrhythmia}}
 function resolve(g){if(!g.running)return{ok:false,reason:'COMPLETE'};g.day++;g.moves=1;const phases=[];applyField(g);phaseInsult(g,phases);phaseDelivery(g,phases);phaseMetabolism(g,phases);phaseInjury(g,phases);phaseImmune(g,phases);phaseRepair(g,phases);phaseRemodel(g,phases);phaseElectrical(g,phases);phaseOrgan(g,phases);phaseMission(g,phases);g.cells.forEach(c=>c.flags.commanded=false);g.lastResolve={day:g.day,phases,complete:!g.running,win:g.result?.win??false};return{ok:true,day:g.day,complete:!g.running,win:g.result?.win??false,phases}}
 function score(g){const s=g.state,mission=g.mission;return Math.round(clamp(s.viability*.3+s.func*.25+s.oxygen*.12+(100-s.inflammation)*.08+(100-s.fibrosis)*.08+(100-s.arrhythmia)*.1+s.metabolic*.07+mission.objectives.filter(o=>o.done).length*4+g.hotspots.filter(h=>h.resolved).length*2))}
 function snapshot(g){const copy=structuredClone?structuredClone(g):JSON.parse(JSON.stringify(g));delete copy.rng;return copy}
 function rehydrate(g){g.rng=rng(g.seed);return g}
 window.CBMechanisticV3={W,H,N,MAX_DAYS,MAX_AGENTS,SCENARIOS,AGENTS,create,place,resolve,score,snapshot,rehydrate,digest,PHASES,neighbours,dist};
})();
