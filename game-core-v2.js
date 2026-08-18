/* CARDIAC//BREACH v2 tactical core
 * One authoritative rule layer for the browser game.
 * Design goals: deterministic runs, meaningful spatial decisions, finite commands,
 * explicit mission rules, event chains, adjacency/range, and reproducible outcomes.
 * This is a synthetic game model, not a biological simulator.
 */
(()=>{
'use strict';
const W=18,H=12,MAX_DAYS=24,MAX_AGENTS=5;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const scenarios={
 ischemia:{name:'Ischaemic Injury',focus:'oxygen',base:{damage:0.9,oxygen:-4.6,inflammation:1.8,fibrosis:1.0},mission:(s)=>s.oxygen>=62&&s.viability>=60},
 inflammation:{name:'Inflammatory Cascade',focus:'inflammation',base:{damage:.55,oxygen:-.6,inflammation:5.4,fibrosis:1.3},mission:(s)=>s.inflammation<=38&&s.viability>=58},
 fibrosis:{name:'Progressive Fibrosis',focus:'fibrosis',base:{damage:.35,oxygen:-.8,inflammation:1.8,fibrosis:3.1},mission:(s)=>s.fibrosis<=28&&s.func>=58},
 maturation:{name:'Maturation Failure',focus:'function',base:{damage:.22,oxygen:0,inflammation:.7,fibrosis:.35},mission:(s)=>s.func>=70&&s.viability>=62},
 arrhythmia:{name:'Conduction Crisis',focus:'arrhythmia',base:{damage:.48,oxygen:-1.3,inflammation:.7,fibrosis:.55},mission:(s)=>s.arrhythmia<=28&&s.func>=58}
};
const agentRules={
 stabilizer:{cost:14,cp:1,range:2,power:'guard',effects:{stress:-2.5,damage:-1.1},adjacent:{stress:-.65}},
 regenerator:{cost:20,cp:1,range:1,power:'repair',effects:{damage:-2.2,energy:+1.2},adjacent:{damage:-.35}},
 immune:{cost:17,cp:1,range:2,power:'suppress',effects:{stress:-1.0,inflammation:-1.2},adjacent:{inflammation:-.3}},
 vascular:{cost:19,cp:1,range:3,power:'supply',effects:{oxygen:+2.5,energy:+.7},adjacent:{oxygen:+.45}},
 maturation:{cost:15,cp:1,range:2,power:'mature',effects:{mature:+2.0},adjacent:{mature:+.35}},
 electrical:{cost:18,cp:1,range:2,power:'buffer',effects:{stress:-.8,damage:-.25},adjacent:{arrhythmia:-.45}}
};
const regionTraits=['PERFUSION RICH','LOW OXYGEN','INFLAMMATORY','SCAR PRONE','ELECTRICALLY SENSITIVE','RECOVERY NICHE'];
function hashSeed(seed){let x=Number(seed)>>>0; x^=x>>>16; x=Math.imul(x,2246822519); x^=x>>>13; x=Math.imul(x,3266489917); x^=x>>>16; return x>>>0}
function rng(seed){let s=hashSeed(seed)||1;return ()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}}
function distance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
function neighbors(cells,i){const c=cells[i],out=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){if(!x&&!y)continue;const nx=c.x+x,ny=c.y+y;if(nx>=0&&nx<W&&ny>=0&&ny<H)out.push(ny*W+nx)}return out}
function makeCells(R){const cells=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const edge=Math.hypot(x-(W-1)/2,y-(H-1)/2)/(W*.62);const r=R();const type=r<.68?'cardiomyocyte':r<.82?'fibroblast':r<.94?'endothelial':'immune';const trait=regionTraits[Math.floor(R()*regionTraits.length)];cells.push({x,y,type,stress:clamp(8+R()*18+edge*18),damage:clamp(R()*12+(r<.08?35:0)),scar:R()*5,oxygen:clamp(88-edge*18+(R()*14-7)),energy:65+R()*27,mature:type==='cardiomyocyte'?35+R()*37:55+R()*35,alive:true,phase:R()*Math.PI*2,trait,threat:0,commanded:false})}return cells}
function missionFor(scenario,R){const s=scenarios[scenario];const hot=[];for(let i=0;i<4;i++)hot.push({id:i+1,cell:Math.floor(R(W*H)),type:regionTraits[Math.floor(R(regionTraits.length))],severity:Math.round(34+R()*48),resolved:false,chain:0});return {title:s.name,focus:s.focus,target:s.mission,hotspots:hot,objectives:[
 {id:'survive',label:'Keep viability above 45',done:s=>s.viability>=45},
 {id:'focus',label:`Control ${s.focus}`,done:s=>s.missionFocus===true},
 {id:'energy',label:'Finish with energy remaining',done:s=>s.energy>0}
]}}
function createGame(seed,scenario='ischemia'){
 const R=rng(seed);const cells=makeCells(R);const st={viability:78,func:64,inflammation:28,fibrosis:12,oxygen:82,arrhythmia:8,metabolic:76,energy:100};
 const game={version:2,seed:seed>>>0,scenario,day:0,running:true,commandPoints:2,maxCommandPoints:2,state:st,cells,agents:[],history:[],events:[],mission:missionFor(scenario,R),rng:R,queued:[],lastResolve:null};
 game.mission.targets=game.mission.hotspots.map(h=>h.cell);
 return game;
}
function place(game,id,targetCell,name){if(!game.running)return {ok:false,reason:'RUN COMPLETE'};const rule=agentRules[id];if(!rule)return {ok:false,reason:'UNKNOWN AGENT'};if(game.agents.length>=MAX_AGENTS)return {ok:false,reason:'DEPLOYMENT LIMIT'};if(game.state.energy<rule.cost)return {ok:false,reason:'NOT ENOUGH ENERGY'};if(game.commandPoints<rule.cp)return {ok:false,reason:'NO COMMAND POINTS'};if(!Number.isInteger(targetCell)||!game.cells[targetCell])return {ok:false,reason:'SELECT A CELL'};
 game.state.energy-=rule.cost;game.commandPoints-=rule.cp;const a={id,name:name||id.toUpperCase(),targetCell,range:rule.range,cp:rule.cp,cost:rule.cost,uses:0};game.agents.push(a);game.cells[targetCell].commanded=true;game.events.push({day:game.day,type:'DEPLOY',text:`${a.name} assigned to cell ${targetCell+1}.`,tone:'good'});return {ok:true,agent:a}}
function remove(game,index){if(index<0||index>=game.agents.length)return false;game.agents.splice(index,1);return true}
function resolve(game){if(!game.running)return {ok:false,reason:'COMPLETE'};if(game.day>=MAX_DAYS){game.running=false;return {ok:false,reason:'COMPLETE'}};
 const sc=scenarios[game.scenario],s=game.state,R=game.rng;game.day++;game.commandPoints=game.maxCommandPoints;game.cells.forEach(c=>c.commanded=false);
 // Event pressure moves spatially. Nearby hotspots become more dangerous.
 game.mission.hotspots.forEach(h=>{if(h.resolved)return;const c=game.cells[h.cell];h.severity=clamp(h.severity+sc.base.damage*2+(100-c.oxygen)*.04+s.inflammation*.012+(R()-.5)*5);if(h.severity>82){h.chain++;game.events.push({day:game.day,type:'CHAIN',text:`${h.type} intensified in the local field.`,tone:'warn'})}});
 // System pressure.
 s.oxygen=clamp(s.oxygen+sc.base.oxygen+R()*2-1);
 s.inflammation=clamp(s.inflammation+sc.base.inflammation+R()*2-1);
 s.fibrosis=clamp(s.fibrosis+sc.base.fibrosis+s.inflammation*.012);
 s.arrhythmia=clamp(s.arrhythmia+(game.scenario==='arrhythmia'?2.9:sc.base.damage*.6)+R()*1.4-.7);
 s.metabolic=clamp(s.metabolic-sc.base.damage*2.1+R()*2);
 // Agent field resolution.
 for(const a of game.agents){const origin=game.cells[a.targetCell];if(!origin)continue;a.uses++;const rule=agentRules[a.id];for(let i=0;i<game.cells.length;i++){const c=game.cells[i],d=distance(origin,c);if(d>a.range)continue;const fall=d===0?1:d===1?.62:.34;Object.entries(rule.effects).forEach(([k,v])=>{if(k==='inflammation')s.inflammation=clamp(s.inflammation+v*fall);else if(k==='oxygen')c.oxygen=clamp(c.oxygen+v*fall);else if(k==='mature')c.mature=clamp(c.mature+v*fall);else if(k==='energy')c.energy=clamp(c.energy+v*fall);else c[k]=clamp((c[k]||0)+v*fall)});Object.entries(rule.adjacent||{}).forEach(([k,v])=>{if(d>0&&d<=1.5){if(k==='arrhythmia')s.arrhythmia=clamp(s.arrhythmia+v);else if(k==='oxygen')c.oxygen=clamp(c.oxygen+v);else if(k==='inflammation')s.inflammation=clamp(s.inflammation+v);else c[k]=clamp((c[k]||0)+v)}})}}
 // Cell field.
 for(let i=0;i<game.cells.length;i++){const c=game.cells[i],ns=neighbors(game.cells,i);const local=ns.reduce((n,j)=>n+game.cells[j].stress,0)/(ns.length||1);const traitMod=c.trait==='LOW OXYGEN'?.9:c.trait==='PERFUSION RICH'?1.15:c.trait==='SCAR PRONE'?1.08:1;c.oxygen=clamp(c.oxygen+(s.oxygen-c.oxygen)*.06-sc.base.damage*1.4*traitMod+(R()*3-1.5));c.stress=clamp(c.stress+sc.base.damage*3.2+(s.inflammation-25)*.03+(100-c.oxygen)*.03+local*.018-(R()*2+0.5));c.damage=clamp(c.damage+sc.base.damage*2.0+c.stress*.012+(100-c.oxygen)*.016);c.energy=clamp(c.energy+(s.metabolic-c.energy)*.08-c.stress*.018);c.scar=clamp(c.scar+sc.base.fibrosis*.22+s.inflammation*.008-c.damage*.002);if(c.type==='cardiomyocyte')c.mature=clamp(c.mature+(game.scenario==='maturation'?1.0:.35)-(100-c.energy)*.009);if(c.damage>90&&c.oxygen<18)c.alive=false}
 // Collapse/recovery from cell field.
 const alive=game.cells.filter(c=>c.alive).length;const avgO=game.cells.reduce((n,c)=>n+c.oxygen,0)/game.cells.length;const avgD=game.cells.reduce((n,c)=>n+c.damage,0)/game.cells.length;
 s.viability=clamp(alive/game.cells.length*82-avgD*.08+s.oxygen*.12);s.func=clamp(s.func-sc.base.damage*1.1-s.fibrosis*.018-s.arrhythmia*.028+avgO*.028+(game.scenario==='maturation'?avgO*.012:0));
 s.energy=clamp(s.energy+7-game.agents.reduce((n,a)=>n+(a.id==='regenerator'?3:a.id==='vascular'?2:1),0));
 // Hotspot resolution and chain consequences.
 game.mission.hotspots.forEach(h=>{const c=game.cells[h.cell];const nearby=game.agents.filter(a=>distance(game.cells[a.targetCell],c)<=a.range);const power=nearby.reduce((n,a)=>n+(a.id==='stabilizer'?10:a.id==='regenerator'?8:a.id==='immune'?9:a.id==='vascular'?10:a.id==='maturation'?7:9),0);if(power>=h.severity*.15){h.severity=clamp(h.severity-power*.08);if(h.severity<30&&!h.resolved){h.resolved=true;game.events.push({day:game.day,type:'RESOLVE',text:`${h.type} contained.`,tone:'good'})}}});
 const focusOk=game.mission.hotspots.filter(h=>h.resolved).length>=2;game.mission.objectives.forEach(o=>{o.status=o.done({...s,energy:s.energy,missionFocus:focusOk})});
 const hardFail=s.viability<25||s.func<25||s.arrhythmia>92;const complete=game.day>=MAX_DAYS||hardFail;const win=game.day>=MAX_DAYS&&!hardFail&&sc.mission(s)&&focusOk;
 if(complete){game.running=false;game.result={win,hardFail,score:score(game),resolved:game.mission.hotspots.filter(h=>h.resolved).length}};
 game.history.push({day:game.day,...s,commands:game.commandPoints,resolved:game.mission.hotspots.filter(h=>h.resolved).length});game.lastResolve={day:game.day,win,hardFail};return {ok:true,win,complete,day:game.day,state:{...s}};
}
function score(game){const s=game.state,m=game.mission;const survival=s.viability*.3+s.func*.25+s.oxygen*.12+(100-s.inflammation)*.08+(100-s.fibrosis)*.08+(100-s.arrhythmia)*.1+s.metabolic*.07;const objective=m.objectives.filter(o=>o.status).length/m.objectives.length*10;const hotspots=m.hotspots.filter(h=>h.resolved).length/m.hotspots.length*10;return Math.round(clamp(survival*.8+objective+hotspots))}
function snapshot(game){return JSON.parse(JSON.stringify({...game,rng:undefined}))}
window.CBGameCoreV2={W,H,MAX_DAYS,MAX_AGENTS,scenarios,agentRules,createGame,place,remove,resolve,score,snapshot,neighbors,distance};
})();
