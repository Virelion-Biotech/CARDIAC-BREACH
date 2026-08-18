/* CARDIAC//BREACH — roguelike crisis director
 * Converts the hidden tissue model into player-facing crises and meaningful choices.
 * The simulation remains authoritative; this layer controls presentation and choice framing.
 */
(()=>{
'use strict';
const app=()=>window.CBApp;
const core=()=>app()?.core;
const $=id=>document.getElementById(id);
const CRISES={
 ischemia:{
  title:'VENTRICULAR CRISIS',
  lines:['Oxygen-starved tissue is spreading.','A perfusion bottleneck is threatening nearby viable cells.'],
  choices:[
   {id:'vascular',title:'RESTORE PERFUSION',desc:'Push oxygen into the endangered region.',tone:'blue',tip:'Best when oxygen is the immediate threat.'},
   {id:'stabilizer',title:'STABILIZE TISSUE',desc:'Buy time and slow secondary damage.',tone:'gold',tip:'Best when the region is deteriorating fast.'},
   {id:'regenerator',title:'REPAIR THE CORE',desc:'Repair damaged tissue before it is lost.',tone:'green',tip:'Best when the region is already damaged.'}
  ]
 },
 inflammation:{title:'INFLAMMATORY CRISIS',lines:['The tissue is amplifying its own damage.','Inflammatory pressure is spilling into neighboring regions.'],choices:[
  {id:'immune',title:'QUIET THE RESPONSE',desc:'Suppress the runaway inflammatory loop.',tone:'blue',tip:'Best when inflammation is the dominant threat.'},
  {id:'stabilizer',title:'HOLD THE LINE',desc:'Reduce secondary tissue stress.',tone:'gold',tip:'Best when damage is accelerating.'},
  {id:'vascular',title:'FEED THE FIELD',desc:'Improve oxygen delivery while the crisis burns.',tone:'green',tip:'Best when stressed tissue is oxygen-limited.'}
 ]},
 fibrosis:{title:'REMODELING CRISIS',lines:['Scar formation is beginning to lock the tissue into a worse state.','You have a short window to preserve function.'],choices:[
  {id:'stabilizer',title:'PROTECT THE FIELD',desc:'Slow the transition toward fibrotic damage.',tone:'gold',tip:'Best when damage is still reversible.'},
  {id:'regenerator',title:'REPAIR EARLY',desc:'Replace damaged tissue before remodeling hardens.',tone:'green',tip:'Best when damage is concentrated.'},
  {id:'immune',title:'REDUCE THE SIGNAL',desc:'Lower inflammatory pressure feeding remodeling.',tone:'blue',tip:'Best when inflammation is driving the problem.'}
 ]},
 maturation:{title:'RECOVERY CRISIS',lines:['The tissue survived—but it is not recovering properly.','Function is lagging behind viability.'],choices:[
  {id:'maturation',title:'PUSH MATURATION',desc:'Move surviving tissue toward useful function.',tone:'green',tip:'Best when viability is good but function lags.'},
  {id:'vascular',title:'RESTORE SUPPORT',desc:'Give the recovering tissue more oxygen and energy.',tone:'blue',tip:'Best when the field is under-supplied.'},
  {id:'regenerator',title:'REPAIR WEAK SPOTS',desc:'Close remaining pockets of damage.',tone:'gold',tip:'Best when damaged cells remain concentrated.'}
 ]},
 arrhythmia:{title:'ELECTRICAL CRISIS',lines:['Conduction is becoming unstable.','One bad region can destabilize the field around it.'],choices:[
  {id:'electrical',title:'BUFFER CONDUCTION',desc:'Protect the vulnerable region from electrical instability.',tone:'blue',tip:'Best when arrhythmia is rising.'},
  {id:'stabilizer',title:'STABILIZE THE REGION',desc:'Reduce stress that can destabilize conduction.',tone:'gold',tip:'Best when electrical stress follows tissue injury.'},
  {id:'vascular',title:'RESTORE OXYGEN',desc:'Support the stressed tissue that is feeding instability.',tone:'green',tip:'Best when low oxygen is contributing.'}
 ]}
};
let state={open:false,crisis:null,locked:false};
function metrics(g){const s=g.state;return {oxygen:s.oxygen,inflammation:s.inflammation,arrhythmia:s.arrhythmia,viability:s.viability,func:s.func,fibrosis:s.fibrosis};}
function severity(g){const s=metrics(g);if(g.scenario==='ischemia')return Math.round(100-s.oxygen*.65+s.inflammation*.15);if(g.scenario==='inflammation')return Math.round(s.inflammation*.85+(100-s.viability)*.25);if(g.scenario==='fibrosis')return Math.round(s.fibrosis*1.3+(100-s.func)*.2);if(g.scenario==='maturation')return Math.round((100-s.func)*.7+(100-s.viability)*.15);return Math.round(s.arrhythmia*1.05+(100-s.func)*.2)}
function chooseBest(g){const m=metrics(g);if(g.scenario==='ischemia')return m.oxygen<55?'vascular':m.viability<55?'regenerator':'stabilizer';if(g.scenario==='inflammation')return m.inflammation>45?'immune':m.viability<60?'stabilizer':'vascular';if(g.scenario==='fibrosis')return m.fibrosis>22?'stabilizer':m.inflammation>40?'immune':'regenerator';if(g.scenario==='maturation')return m.func<62?'maturation':m.oxygen<65?'vascular':'regenerator';return m.arrhythmia>35?'electrical':m.viability<55?'stabilizer':'vascular'}
function create(){if($('crisisLayer'))return;const l=document.createElement('div');l.id='crisisLayer';l.innerHTML=`<div class="crisis-shell" role="dialog" aria-modal="true"><div class="crisis-kicker">CARDIAC//BREACH · CRISIS</div><div class="crisis-layout"><div class="crisis-art" id="crisisArt"><div class="pulse-orbit"></div><div class="crisis-heart">♥</div></div><div class="crisis-main"><div class="crisis-head"><div><div class="crisis-title" id="crisisTitle"></div><div class="crisis-sub" id="crisisSub"></div></div><div class="crisis-moves"><b id="crisisMoves">2</b><span>MOVES LEFT</span></div></div><div class="crisis-threat" id="crisisThreat"></div><div class="crisis-choices" id="crisisChoices"></div><div class="crisis-note">You do not need to understand the numbers. Choose the intervention that best matches the problem.</div></div></div></div>`;document.body.appendChild(l)}
function show(force=false){const g=app()?.state;if(!g||!g.running)return;if(state.open&&!force)return;create();const c=CRISES[g.scenario];const sev=Math.max(0,Math.min(100,severity(g)));const best=chooseBest(g);state={open:true,crisis:c,locked:false};$('crisisTitle').textContent=c.title;$('crisisSub').textContent=c.lines[Math.floor((g.day/2)%c.lines.length)];$('crisisMoves').textContent=g.commandPoints;$('crisisThreat').innerHTML=`<span class="threat-dot"></span><div><b>${sev>70?'CRITICAL':sev>45?'HIGH':'RISING'} THREAT</b><p>${c.lines[0]}</p></div>`;const wrap=$('crisisChoices');wrap.innerHTML=c.choices.map(ch=>`<button class="crisis-choice ${ch.tone} ${ch.id===best?'recommended':''}" data-agent="${ch.id}"><span class="choice-icon">${icon(ch.id)}</span><span><b>${ch.title}</b><small>${ch.desc}</small><em>${ch.id===best?'RECOMMENDED · ':''}${ch.tip}</em></span></button>`).join('');wrap.querySelectorAll('.crisis-choice').forEach(btn=>btn.addEventListener('click',()=>act(btn.dataset.agent)));$('crisisLayer').classList.add('show')}
function icon(id){return ({vascular:'↗',stabilizer:'◇',regenerator:'✦',immune:'⊙',maturation:'↑',electrical:'⌁'})[id]||'•'}
function act(id){const g=app()?.state;if(!g||state.locked)return;state.locked=true;const r=app().deploy(id);if(!r.ok){state.locked=false;return}app().save?.();$('crisisLayer')?.classList.remove('show');state.open=false;window.CB_Audio?.deploy?.();}
function update(){const g=app()?.state;if(!g||!g.running)return;if(g.day===0||g.commandPoints===g.maxCommandPoints)show()}
window.CBCrisis={show,update};
function mount(){app()?.subscribe(({type})=>{if(type==='mounted'||type==='new-run'||type==='resolved'||type==='load')setTimeout(()=>update(),0)});create()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
})();
