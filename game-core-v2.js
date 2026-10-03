/* CARDIAC//BREACH v2.3 — deeper hidden tissue model
 * Player-facing complexity stays low; simulation depth lives underneath.
 * Synthetic game model only. No claims of biological fidelity.
 */
(()=>{
'use strict';
const W=18,H=12,MAX_DAYS=24,MAX_AGENTS=5;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const scenarios={
 ischemia:{name:'Ventricular Crisis',focus:'oxygen',base:{insult:2.8,perfusion:-5.2,immune:1.2,matrix:.55,electric:.35},mission:s=>s.oxygen>=62&&s.viability>=60},
 inflammation:{name:'Inflammatory Surge',focus:'inflammation',base:{insult:1.7,perfusion:-.9,immune:5.8,matrix:.85,electric:.25},mission:s=>s.inflammation<=38&&s.viability>=58},
 fibrosis:{name:'Remodeling Crisis',focus:'fibrosis',base:{insult:1.15,perfusion:-1.0,immune:2.1,matrix:3.3,electric:.18},mission:s=>s.fibrosis<=28&&s.func>=58},
 maturation:{name:'Recovery Window',focus:'function',base:{insult:.65,perfusion:.2,immune:.55,matrix:.25,electric:.1},mission:s=>s.func>=70&&s.viability>=62},
 arrhythmia:{name:'Conduction Crisis',focus:'arrhythmia',base:{insult:1.7,perfusion:-1.8,immune:.65,matrix:.5,electric:3.9},mission:s=>s.arrhythmia<=28&&s.func>=58}
};
const agentRules={
 stabilizer:{cost:14,cp:1,range:2,kind:'guard',effects:{stress:-3.0,ros:-1.5,matrix:-.45},adjacent:{stress:-.7}},
 regenerator:{cost:20,cp:1,range:1,kind:'repair',effects:{damage:-2.6,repair:+2.2,atp:+1.0},adjacent:{damage:-.4}},
 immune:{cost:17,cp:1,range:2,kind:'immune',effects:{immune:-2.2,stress:-1.2,ros:-.8},adjacent:{immune:-.45}},
 vascular:{cost:19,cp:1,range:3,kind:'supply',effects:{perfusion:+3.4,atp:+1.0,oxygen:+2.2},adjacent:{perfusion:+.65,oxygen:+.45}},
 maturation:{cost:15,cp:1,range:2,kind:'mature',effects:{mature:+2.3,conduction:+.9},adjacent:{mature:+.4}},
 electrical:{cost:18,cp:1,range:2,kind:'buffer',effects:{conduction:+3.2,stress:-.8,ros:-.4},adjacent:{conduction:+.75}}
};
const regionTraits=['PERFUSION RICH','LOW OXYGEN','INFLAMMATORY','SCAR PRONE','ELECTRICALLY SENSITIVE','RECOVERY NICHE'];
function hashSeed(seed){let x=Number(seed)>>>0;x^=x>>>16;x=Math.imul(x,2246822519);x^=x>>>13;x=Math.imul(x,3266489917);x^=x>>>16;return x>>>0}
function rng(seed){let s=hashSeed(seed)||1;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}}
function dist(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
function neighbors(cells,i){const c=cells[i],out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=c.x+dx,y=c.y+dy;if(x>=0&&x<W&&y>=0&&y<H)out.push(y*W+x)}return out}
function makeCells(R){const cells=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const edge=Math.hypot(x-(W-1)/2,y-(H-1)/2)/(W*.62),r=R();const type=r<.68?'cardiomyocyte':r<.82?'fibroblast':r<.94?'endothelial':'immune';
 const trait=regionTraits[Math.floor(R()*regionTraits.length)];
 cells.push({x,y,type,trait,alive:true,phase:R()*Math.PI*2,
  perfusion:clamp(82-edge*22+R()*10-5),oxygen:clamp(80-edge*18+R()*12-6),atp:62+R()*30,ros:7+R()*8,stress:8+R()*16,damage:R()*9,repair:45+R()*35,immune:12+R()*9,matrix:4+R()*4,conduction:type==='cardiomyocyte'?72+R()*20:25+R()*30,mature:type==='cardiomyocyte'?35+R()*35:55+R()*35,
  perfusionDebt:0,calcium:10+R()*8,edema:R()*5,commanded:false});
 }return cells}
function missionFor(scenario,R){const hot=[];for(let i=0;i<4;i++)hot.push({id:i+1,cell:Math.floor(R(W*H)),type:regionTraits[Math.floor(R(regionTraits.length))],severity:Math.round(35+R()*45),resolved:false,chain:0});return{title:scenarios[scenario].name,focus:scenarios[scenario].focus,targets:hot.map(h=>h.cell),hotspots:hot,objectives:[
 {id:'survive',label:'Keep the heart alive',status:false,done:s=>s.viability>=45},
 {id:'focus',label:`Control the ${scenarios[scenario].focus} crisis`,status:false,done:s=>s.missionFocus===true},
 {id:'energy',label:'Finish with energy remaining',status:false,done:s=>s.energy>0}
]}}
function createGame(seed,scenario='ischemia'){
 const R=rng(seed),cells=makeCells(R);const g={version:2,seed:seed>>>0,scenario,day:0,running:true,commandPoints:1,maxCommandPoints:1,state:{viability:78,func:64,inflammation:28,fibrosis:12,oxygen:82,arrhythmia:8,metabolic:76,energy:100},cells,agents:[],history:[],events:[],mission:missionFor(scenario,R),rng:R,queued:[],lastResolve:null,hidden:{daysSinceCrisis:0,systemicROS:10,neurohumoral:8,hemodynamicReserve:82,repairCapacity:72,conductionReserve:84,scarBurden:8,globalPerfusion:82,globalATP:78}};
 return g;
}
function place(g,id,targetCell,name){if(!g.running)return{ok:false,reason:'RUN COMPLETE'};const rule=agentRules[id];if(!rule)return{ok:false,reason:'UNKNOWN INTERVENTION'};if(g.agents.length>=MAX_AGENTS)return{ok:false,reason:'DEPLOYMENT LIMIT'};if(g.state.energy<rule.cost)return{ok:false,reason:'NOT ENOUGH ENERGY'};if(g.commandPoints<rule.cp)return{ok:false,reason:'NO MOVES LEFT'};if(!Number.isInteger(targetCell)||!g.cells[targetCell])return{ok:false,reason:'SELECT A REGION'};
 g.state.energy-=rule.cost;g.commandPoints-=rule.cp;const a={id,name:name||id.toUpperCase(),targetCell,range:rule.range,cost:rule.cost,cp:rule.cp,uses:0};g.agents.push(a);g.cells[targetCell].commanded=true;g.events.push({day:g.day,type:'DEPLOY',text:`${a.name} committed to the threatened region.`,tone:'good'});return{ok:true,agent:a}}
function resolve(g){if(!g.running)return{ok:false,reason:'COMPLETE'};if(g.day>=MAX_DAYS){g.running=false;return{ok:false,reason:'COMPLETE'}};
 const sc=scenarios[g.scenario],R=g.rng,s=g.state,h=g.hidden;g.day++;g.commandPoints=g.maxCommandPoints;g.cells.forEach(c=>c.commanded=false);
 // 1. Threat dynamics: injuries create systemic pressure and spatial propagation.
 const avg=(key)=>g.cells.reduce((n,c)=>n+c[key],0)/g.cells.length;
 const avgStress=avg('stress'),avgROS=avg('ros'),avgPerf=avg('perfusion'),avgATP=avg('atp'),avgCond=avg('conduction');
 h.neurohumoral=clamp(h.neurohumoral+sc.base.insult*.55+h.systemicROS*.018-(avgPerf-55)*.02-R()*1.2+.6);
 h.systemicROS=clamp(h.systemicROS+sc.base.insult*.9+(100-avgPerf)*.025+avgStress*.014-h.neurohumoral*.014-R()*1.4+.7);
 h.globalPerfusion=clamp(avgPerf+R()*2-1+sc.base.perfusion-h.neurohumoral*.01);
 h.globalATP=clamp(avgATP+(h.globalPerfusion-65)*.08-h.systemicROS*.03+R()*2-1);
 h.hemodynamicReserve=clamp(h.hemodynamicReserve-(100-h.globalPerfusion)*.04-sc.base.insult*.4+h.globalATP*.008+R()*1.5);
 // 2. Agent fields: distance-based local effects with diminishing reach.
 for(const a of g.agents){const origin=g.cells[a.targetCell];if(!origin)continue;a.uses++;const rule=agentRules[a.id];for(let i=0;i<g.cells.length;i++){const c=g.cells[i],d=dist(origin,c);if(d>rule.range)continue;const fall=d===0?1:d===1?.62:.34;for(const[k,v]of Object.entries(rule.effects)){
  if(k==='perfusion')c.perfusion=clamp(c.perfusion+v*fall);else if(k==='oxygen')c.oxygen=clamp(c.oxygen+v*fall);else if(k==='atp')c.atp=clamp(c.atp+v*fall);else if(k==='ros')c.ros=clamp(c.ros+v*fall);else if(k==='stress')c.stress=clamp(c.stress+v*fall);else if(k==='damage')c.damage=clamp(c.damage+v*fall);else if(k==='repair')c.repair=clamp(c.repair+v*fall);else if(k==='immune')c.immune=clamp(c.immune+v*fall);else if(k==='matrix')c.matrix=clamp(c.matrix+v*fall);else if(k==='conduction')c.conduction=clamp(c.conduction+v*fall);else if(k==='mature')c.mature=clamp(c.mature+v*fall);
 }if(d>0&&d<=1.5)for(const[k,v]of Object.entries(rule.adjacent||{})){if(k==='perfusion')c.perfusion=clamp(c.perfusion+v);else if(k==='oxygen')c.oxygen=clamp(c.oxygen+v);else if(k==='conduction')c.conduction=clamp(c.conduction+v);else if(k==='stress')c.stress=clamp(c.stress+v);else if(k==='damage')c.damage=clamp(c.damage+v);else if(k==='immune')c.immune=clamp(c.immune+v)}}}
 // 3. Cell physiology: coupled perfusion -> oxygen -> ATP -> ROS/stress -> damage -> matrix.
 for(let i=0;i<g.cells.length;i++){const c=g.cells[i],ns=neighbors(g.cells,i);const neighborStress=ns.reduce((n,j)=>n+g.cells[j].stress,0)/(ns.length||1);const neighborCond=ns.reduce((n,j)=>n+g.cells[j].conduction,0)/(ns.length||1);
  const perfTrait=c.trait==='PERFUSION RICH'?1.08:c.trait==='LOW OXYGEN'?.86:1;const scarTrait=c.trait==='SCAR PRONE'?1.35:1;const immuneTrait=c.trait==='INFLAMMATORY'?1.28:1;
  const demand=(c.type==='cardiomyocyte'?1.1:.45)*(1+c.mature/220)*(1+c.stress/180);
  c.perfusion=clamp(c.perfusion+(h.globalPerfusion-c.perfusion)*.055+sc.base.perfusion*perfTrait-(c.edema*.035)+R()*2-1);
  c.oxygen=clamp(c.oxygen+(c.perfusion-c.oxygen)*.14-c.perfusionDebt*.05-(demand*.8)+R()*2-1);
  const effectiveATP=c.atp+(c.oxygen-60)*.16-(c.ros*.08);
  c.atp=clamp(c.atp+(effectiveATP-c.atp)*.15+(c.perfusion-65)*.05-c.stress*.018+R()*1.8-.9);
  c.ros=clamp(c.ros+(100-c.oxygen)*.055+c.stress*.022+h.systemicROS*.018-c.immune*.025-(c.repair*.012)+R()*1.2-.6);
  c.stress=clamp(c.stress+sc.base.insult*1.45+(100-c.oxygen)*.026+c.ros*.016+neighborStress*.012+(h.neurohumoral*.018*immuneTrait)-c.repair*.014+R()*2.4-1.2);
  c.calcium=clamp(c.calcium+(100-c.oxygen)*.018+c.ros*.012+c.stress*.01-c.atp*.006+R()*1.2-.6);
  c.damage=clamp(c.damage+sc.base.insult*.85+c.ros*.024+c.calcium*.01+(100-c.atp)*.018-c.repair*.022+R()*1.3-.65);
  const reparativeSignal=Math.max(0,c.repair-50)*.008+Math.max(0,c.atp-60)*.004-c.ros*.003;
  c.matrix=clamp(c.matrix+sc.base.matrix*.12+c.damage*.006+(c.immune*immuneTrait)*.002-c.repair*.004-reparativeSignal*.5);
  c.edema=clamp(c.edema+(100-c.perfusion)*.018+c.ros*.007-c.perfusion*.004+R()*.8-.3);
  c.immune=clamp(c.immune+sc.base.immune*.55+c.stress*.018+c.ros*.01-c.repair*.009+R()*1.1-.5);
  c.repair=clamp(c.repair+h.repairCapacity*.008-c.damage*.012-c.matrix*.004+c.atp*.005+R()*1.0-.4);
  if(c.type==='cardiomyocyte'){
    c.mature=clamp(c.mature+Math.max(0,c.atp-55)*.015+c.repair*.004-(100-c.oxygen)*.011);
    const conductionDrive=(c.oxygen*.28+c.atp*.22+c.mature*.18)-(c.ros*.25+c.matrix*.35+c.calcium*.12);
    c.conduction=clamp(c.conduction+(conductionDrive-c.conduction)*.07+(neighborCond-c.conduction)*.025+R()*1.5-.7);
  }
  c.perfusionDebt=clamp(c.perfusionDebt+(70-c.perfusion)*.045-c.perfusion*.008);
  if(c.damage>91&&c.atp<22&&c.oxygen<17)c.alive=false;
 }
 // 4. Cell-to-organ aggregation.
 const aliveRatio=g.cells.filter(c=>c.alive).length/g.cells.length;
 const avgO=avg('oxygen'),avgDamage=avg('damage'),avgMatrix=avg('matrix'),avgImmune=avg('immune'),avgMature=avg('mature');
 const cond=avgCond*.58+avg('conduction')*.42;
 s.oxygen=clamp(avgO*.72+h.globalPerfusion*.18+h.hemodynamicReserve*.10);
 s.arrhythmia=clamp((100-cond)*.86+avg('matrix')*.14+avg('ros')*.10);
 s.inflammation=clamp(avgImmune*.82+h.neurohumoral*.22+h.systemicROS*.12);
 s.fibrosis=clamp(avgMatrix*2.3+h.scarBurden*.22);
 s.viability=clamp(aliveRatio*86-avgDamage*.15-(100-avgO)*.08+avgATP*.035);
 s.func=clamp(avgMature*.46+cond*.24+s.oxygen*.18+(100-s.fibrosis)*.12);
 s.metabolic=clamp(h.globalATP*.78+avgATP*.22);
 h.repairCapacity=clamp(h.repairCapacity+s.metabolic*.006-s.inflammation*.008-h.systemicROS*.006+R()*1.3-.6);
 h.conductionReserve=clamp(cond*.7+s.oxygen*.12-s.fibrosis*.12);
 h.scarBurden=clamp(h.scarBurden+s.fibrosis*.018+h.systemicROS*.01-h.repairCapacity*.006+R()*1.0-.4);
 s.energy=clamp(s.energy+7-g.agents.reduce((n,a)=>n+(a.id==='regenerator'?3:a.id==='vascular'?2:1),0)-Math.max(0,avgDamage-35)*.025);
 // 5. Crisis propagation and containment.
 g.mission.hotspots.forEach(hs=>{if(hs.resolved)return;const c=g.cells[hs.cell];const localAgents=g.agents.filter(a=>dist(g.cells[a.targetCell],c)<=a.range);const containment=localAgents.reduce((n,a)=>n+(a.id==='stabilizer'?13:a.id==='regenerator'?10:a.id==='immune'?12:a.id==='vascular'?13:a.id==='maturation'?8:14),0);const pressure=(c.ros+c.stress+(100-c.perfusion)+c.matrix)*.13;hs.severity=clamp(hs.severity+sc.base.insult*.7+pressure*.025-containment*.055+R()*4-2);if(hs.severity>82){hs.chain++;g.events.push({day:g.day,type:'CHAIN',text:`${hs.type.toLowerCase()} is spreading.`,tone:'warn'})}if(hs.severity<28){hs.resolved=true;g.events.push({day:g.day,type:'RESOLVE',text:`${hs.type.toLowerCase()} contained.`,tone:'good'})}});
 const focusOk=g.mission.hotspots.filter(hs=>hs.resolved).length>=2;g.mission.objectives.forEach(o=>{o.status=o.done({...s,energy:s.energy,missionFocus:focusOk})});
 const hardFail=s.viability<25||s.func<25||s.arrhythmia>92;const complete=g.day>=MAX_DAYS||hardFail;const win=g.day>=MAX_DAYS&&!hardFail&&sc.mission(s)&&focusOk;
 if(complete){g.running=false;g.result={win,hardFail,score:score(g),resolved:g.mission.hotspots.filter(hs=>hs.resolved).length}}
 g.history.push({day:g.day,...s,hidden:{globalPerfusion:h.globalPerfusion,globalATP:h.globalATP,systemicROS:h.systemicROS,repairCapacity:h.repairCapacity,conductionReserve:h.conductionReserve,scarBurden:h.scarBurden},resolved:g.mission.hotspots.filter(hs=>hs.resolved).length});g.lastResolve={day:g.day,win,hardFail};return{ok:true,win,complete,day:g.day,state:{...s},hiddenSummary:{oxygenSupply:h.globalPerfusion,cellEnergy:h.globalATP,oxidativeLoad:h.systemicROS,repairWindow:h.repairCapacity,electricalReserve:h.conductionReserve}};
}
function score(g){const s=g.state,m=g.mission;const base=s.viability*.28+s.func*.25+s.oxygen*.14+(100-s.inflammation)*.09+(100-s.fibrosis)*.08+(100-s.arrhythmia)*.10+s.metabolic*.06;const objective=m.objectives.filter(o=>o.status).length/m.objectives.length*10;const hotspots=m.hotspots.filter(h=>h.resolved).length/m.hotspots.length*10;return Math.round(clamp(base*.8+objective+hotspots))}
function snapshot(g){return JSON.parse(JSON.stringify({...g,rng:undefined}))}
window.CBGameCoreV2={W,H,MAX_DAYS,MAX_AGENTS,scenarios,agentRules,createGame,place,resolve,score,snapshot,neighbors,distance};
})();
