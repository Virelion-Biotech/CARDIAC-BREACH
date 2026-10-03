/* CARDIAC//BREACH — Deep Physiology Kernel
 * Hidden game mechanics only. The player never needs to see these variables.
 * Synthetic model: deliberately game-oriented, not a clinical simulator.
 */
(()=>{
 'use strict';
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const mean=(cells,key)=>cells.reduce((n,c)=>n+(Number(c[key])||0),0)/(cells.length||1);
 const neighbors=(cells,i,W,H)=>{const c=cells[i],out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=c.x+dx,y=c.y+dy;if(x>=0&&x<W&&y>=0&&y<H)out.push(y*W+x)}return out};
 const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
 const sigmoid=x=>1/(1+Math.exp(-x));
 function init(c,R){
  c.perfusion=Math.max(c.perfusion||0,30+R()*55);
  c.oxygen=Math.max(c.oxygen||0,35+R()*55);
  c.atp=Math.max(c.atp||0,35+R()*55);
  c.ros=c.ros||5+R()*8;
  c.calcium=c.calcium||8+R()*8;
  c.edema=c.edema||R()*4;
  c.immune=c.immune||8+R()*8;
  c.repair=c.repair||45+R()*30;
  c.matrix=c.matrix||3+R()*5;
  c.conduction=c.conduction||45+R()*45;
  c.membrane=c.membrane||85+R()*15;
  c.perfusionDebt=c.perfusionDebt||0;
  c.injuryMemory=c.injuryMemory||0;
  c.reperfusionDebt=c.reperfusionDebt||0;
  c.recoveryPhase=c.recoveryPhase||0;
  c.wavefront=c.wavefront||0;
 }
 function seed(game){
  const R=game.rng;
  for(const c of game.cells)init(c,R);
  const h=game.hidden||(game.hidden={});
  Object.assign(h,{systemicROS:h.systemicROS??10,neurohumoral:h.neurohumoral??8,hemodynamicReserve:h.hemodynamicReserve??82,repairCapacity:h.repairCapacity??72,conductionReserve:h.conductionReserve??84,scarBurden:h.scarBurden??8,globalPerfusion:h.globalPerfusion??82,globalATP:h.globalATP??78,immuneReserve:h.immuneReserve??72,fluidReserve:h.fluidReserve??84,conductionWave:0,phase:'acute',cascade:0,lastDominant:'oxygen'});
 }
 function applyAgents(game,agents,rules){
  for(const a of agents){const origin=game.cells[a.targetCell];const rule=rules[a.id];if(!origin||!rule)continue;for(let i=0;i<game.cells.length;i++){
   const c=game.cells[i],d=dist(origin,c);if(d>a.range)continue;const fall=d===0?1:d===1?.7:d===2?.38:.18;
   const e=rule.effects||{};
   c.perfusion=clamp(c.perfusion+(e.perfusion||0)*fall);
   c.oxygen=clamp(c.oxygen+(e.oxygen||0)*fall);
   c.atp=clamp(c.atp+(e.atp||0)*fall);
   c.ros=clamp(c.ros+(e.ros||0)*fall);
   c.stress=clamp(c.stress+(e.stress||0)*fall);
   c.damage=clamp(c.damage+(e.damage||0)*fall);
   c.repair=clamp(c.repair+(e.repair||0)*fall);
   c.immune=clamp(c.immune+(e.immune||0)*fall);
   c.matrix=clamp(c.matrix+(e.matrix||0)*fall);
   c.conduction=clamp(c.conduction+(e.conduction||0)*fall);
   c.mature=clamp((c.mature||0)+(e.mature||0)*fall);
   c.edema=clamp(c.edema+(e.edema||0)*fall);
  }}
 }
 function transport(game,scenario){
  const {cells,hidden:h}=game;const R=game.rng;const W=18,H=12;
  const avgPerf=mean(cells,'perfusion');
  h.globalPerfusion=clamp(avgPerf-(h.neurohumoral*.04)+(h.hemodynamicReserve-70)*.06+(R()-.5)*2+scenario.base.perfusion);
  for(let i=0;i<cells.length;i++){
   const c=cells[i],ns=neighbors(cells,i,W,H);const localPerf=ns.reduce((n,j)=>n+cells[j].perfusion,0)/(ns.length||1);
   const trait=c.trait==='PERFUSION RICH'?1.12:c.trait==='LOW OXYGEN'?.8:1;
   const demand=(c.type==='cardiomyocyte'?1.35:0.65)*(1+(c.mature||0)/180)*(1+(c.stress||0)/260);
   c.perfusion=clamp(c.perfusion+(h.globalPerfusion-c.perfusion)*.045+scenario.base.perfusion*trait-(c.edema*.03)+(R()-.5)*1.7);
   c.perfusionDebt=clamp(c.perfusionDebt+Math.max(0,68-c.perfusion)*.065-Math.max(0,c.perfusion-72)*.025);
   const diffusion=(c.perfusion*.57+localPerf*.28+(c.oxygen*.15));
   c.oxygen=clamp(c.oxygen+(diffusion-c.oxygen)*.17-c.perfusionDebt*.045-demand*.72+(R()-.5)*1.5);
   c.reperfusionDebt=clamp(c.reperfusionDebt+(c.oxygen<45?1.4:0)-(c.oxygen>70?.9:0));
  }
 }
 function metabolismAndInjury(game,scenario){
  const {cells,hidden:h}=game,R=game.rng;let rosSum=0,damageSum=0;
  for(let i=0;i<cells.length;i++){
   const c=cells[i],ns=neighbors(cells,i,18,12);const localStress=ns.reduce((n,j)=>n+cells[j].stress,0)/(ns.length||1);const localImmune=ns.reduce((n,j)=>n+cells[j].immune,0)/(ns.length||1);
   const oxygenDebt=Math.max(0,58-c.oxygen), energyDebt=Math.max(0,55-c.atp);
   const oxidativeLoad=oxygenDebt*.065+c.stress*.025+h.systemicROS*.018;
   c.atp=clamp(c.atp+(c.oxygen-62)*.055-(c.stress*.018)-c.calcium*.004+(R()-.5)*1.4);
   c.ros=clamp(c.ros+oxidativeLoad-(c.repair*.011)-c.immune*.012+(R()-.5)*.9);
   c.calcium=clamp(c.calcium+oxygenDebt*.018+c.ros*.012+c.stress*.009-c.atp*.007+(R()-.5)*.8);
   c.membrane=clamp(c.membrane-c.ros*.015-c.calcium*.01+Math.max(0,c.atp-60)*.006);
   c.stress=clamp(c.stress+oxygenDebt*.027+c.ros*.017+localStress*.012+scenario.base.insult*.7-c.repair*.012+(R()-.5)*2);
   const necrotic=oxygenDebt*.035+energyDebt*.025+c.calcium*.007+c.ros*.012+(100-c.membrane)*.02;
   const repairOffset=c.repair*.018+c.atp*.004;
   c.damage=clamp(c.damage+necrotic-repairOffset+(R()-.5)*1.1);
   c.injuryMemory=clamp(c.injuryMemory+c.damage*.008-c.repair*.004);
   rosSum+=c.ros;damageSum+=c.damage;
   c.wavefront=clamp((100-c.conduction)*.35+c.ros*.05+c.matrix*.08);
   if(c.type==='cardiomyocyte'){
    const load=(100-c.oxygen)*.22+c.calcium*.16+c.ros*.12+c.matrix*.19;
    c.conduction=clamp(c.conduction+(c.oxygen*.11+c.atp*.09+c.repair*.06-load)*.06+(localStress<30?1.2:0)-.4);
   }
   c.immune=clamp(c.immune+scenario.base.immune*.38+c.stress*.018+c.ros*.012-c.repair*.008+(R()-.5));
   const immuneExcess=Math.max(0,c.immune-45);
   c.edema=clamp(c.edema+oxygenDebt*.015+immuneExcess*.012-c.perfusion*.003-(c.repair>65?.2:0));
   c.repair=clamp(c.repair+h.repairCapacity*.006-c.damage*.012-c.ros*.006+c.atp*.004+(R()-.5)*.6);
  }
  h.systemicROS=clamp(rosSum/cells.length*.65+h.systemicROS*.35);
  h.cascade=clamp(h.cascade+(h.systemicROS>22?4:0)+(damageSum/cells.length>30?3:0)-(h.repairCapacity>70?1.5:0));
 }
 function inflammation(game,scenario){
  const {cells,hidden:h}=game,R=game.rng;const avgImmune=mean(cells,'immune'),avgROS=mean(cells,'ros'),avgStress=mean(cells,'stress');
  h.neurohumoral=clamp(h.neurohumoral+scenario.base.immune*.4+h.systemicROS*.02+avgStress*.012-h.immuneReserve*.007+(R()-.5));
  h.immuneReserve=clamp(h.immuneReserve-(avgImmune>55?1.2:0.25)+h.repairCapacity*.006+(R()-.5));
  for(const c of cells){const infl=c.immune+(c.ros*.18)+(h.neurohumoral*.1);c.stress=clamp(c.stress+infl*.006-(c.repair*.005));c.matrix=clamp(c.matrix+Math.max(0,infl-35)*.012-(c.repair*.006));}
 }
 function remodeling(game,scenario){
  const {cells,hidden:h}=game,R=game.rng;let matrix=0,scar=0;
  for(const c of cells){const fibDriver=Math.max(0,c.damage-12)*.018+Math.max(0,c.immune-28)*.009+Math.max(0,c.ros-15)*.008;const resolution=c.repair*.006+c.atp*.003;c.matrix=clamp(c.matrix+scenario.base.matrix*.08+fibDriver-resolution);if(c.matrix>35)c.conduction=clamp(c.conduction-(c.matrix-35)*.018);matrix+=c.matrix;scar+=Math.max(0,c.matrix-15)}
  h.scarBurden=clamp(h.scarBurden+scar/cells.length*.12-h.repairCapacity*.004+(R()-.5)*.4);
 }
 function conduction(game,scenario){
  const {cells,hidden:h}=game,R=game.rng;let avg=0;for(let i=0;i<cells.length;i++){const c=cells[i],ns=neighbors(cells,i,18,12);const local=ns.reduce((n,j)=>n+cells[j].conduction,0)/(ns.length||1);const heterogeneity=Math.abs(c.conduction-local);c.conduction=clamp(c.conduction-(heterogeneity*.018)-(c.matrix*.006)+(c.oxygen>68?.35:0)+(R()-.5)*.7);if(c.type==='cardiomyocyte')avg+=c.conduction}
  avg/=cells.filter(c=>c.type==='cardiomyocyte').length||1;h.conductionReserve=clamp(avg*.75+mean(cells,'oxygen')*.15-h.scarBurden*.18);
  h.conductionWave=(h.conductionWave+3.5)%360;
 }
 function repair(game){
  const {cells,hidden:h}=game;const avgATP=mean(cells,'atp'),avgROS=mean(cells,'ros'),avgDamage=mean(cells,'damage');
  h.repairCapacity=clamp(h.repairCapacity+avgATP*.004-(avgROS*.006)-(avgDamage*.004)+h.hemodynamicReserve*.003);
  for(const c of cells){const healing=Math.max(0,c.repair-52)*.012+Math.max(0,c.atp-60)*.004-c.ros*.004;c.damage=clamp(c.damage-healing);c.injuryMemory=clamp(c.injuryMemory-healing*.3);c.membrane=clamp(c.membrane+healing*.4);if(c.damage<12&&c.matrix<20)c.recoveryPhase=clamp(c.recoveryPhase+1);}
 }
 function organ(game){
  const {cells,state:s,hidden:h}=game;const alive=cells.filter(c=>c.alive).length/(cells.length||1);const O=mean(cells,'oxygen'),ATP=mean(cells,'atp'),ROS=mean(cells,'ros'),DMG=mean(cells,'damage'),M=mean(cells,'matrix'),RPR=mean(cells,'repair');const cardiac=cells.filter(c=>c.type==='cardiomyocyte');const C=cardiac.reduce((n,c)=>n+c.conduction,0)/(cardiac.length||1);const Mat=cardiac.reduce((n,c)=>n+c.mature,0)/(cardiac.length||1);
  s.oxygen=clamp(O*.64+h.hemodynamicReserve*.2+h.globalPerfusion*.16);s.metabolic=clamp(ATP*.74+h.globalATP*.26);s.arrhythmia=clamp((100-C)*.82+M*.16+ROS*.08);s.inflammation=clamp(mean(cells,'immune')*.7+h.neurohumoral*.24+h.systemicROS*.12);s.fibrosis=clamp(M*1.75+h.scarBurden*.32);s.viability=clamp(alive*84-DMG*.13-(100-O)*.05+ATP*.04+RPR*.02);s.func=clamp(Mat*.36+C*.31+O*.16+(100-s.fibrosis)*.10+ATP*.07);
  if(s.viability<28||s.func<24||s.arrhythmia>94)game.running=false;
 }
 function phase(game,scenario){
  transport(game,scenario);applyAgents(game,game.agents,game.agentRules||{});metabolismAndInjury(game,scenario);inflammation(game,scenario);remodeling(game,scenario);conduction(game,scenario);repair(game);organ(game,scenario);
  return {hidden:game.hidden,averages:{oxygen:mean(game.cells,'oxygen'),atp:mean(game.cells,'atp'),ros:mean(game.cells,'ros'),stress:mean(game.cells,'stress'),damage:mean(game.cells,'damage'),repair:mean(game.cells,'repair'),matrix:mean(game.cells,'matrix'),conduction:mean(game.cells,'conduction')},phase:game.hidden.phase};
 }
 function classify(game){const h=game.hidden,s=game.state;const scores={oxygen:(100-s.oxygen)+(100-h.globalPerfusion),energy:(100-s.metabolic)+(100-h.globalATP),inflammation:s.inflammation+h.neurohumoral,scar:s.fibrosis+h.scarBurden,electric:s.arrhythmia+(100-h.conductionReserve),damage:(100-s.viability)};const dominant=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];h.lastDominant=dominant;h.phase=dominant==='scar'?'remodeling':dominant==='electric'?'electrical':dominant==='inflammation'?'inflammatory':dominant==='energy'?'metabolic':'acute';return dominant;}
 window.CBPhysiology={seed,phase,classify,mean,clamp};
})();
