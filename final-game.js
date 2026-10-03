/* CARDIAC//BREACH — Final game layer
 * Adds campaign, procedural regional crises, tactical decisions, uncertainty,
 * contextual coaching, scoring, run narrative, discoveries and responsive HUD.
 * Core simulation remains synthetic and educational; this layer orchestrates presentation/gameplay.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const KEY='cb-final-meta-v1';
 const meta=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{chapter:1,runs:0,wins:0,best:0,discoveries:[],badges:[],scenarioWins:{}}}catch{return {chapter:1,runs:0,wins:0,best:0,discoveries:[],badges:[],scenarioWins:{}}}})();
 const saveMeta=()=>{try{localStorage.setItem(KEY,JSON.stringify(meta))}catch{}};
 const scenarioInfo={
  ischemia:{name:'ISCHAEMIC CRISIS',goal:'Restore perfusion without sacrificing tissue viability.',primary:'oxygen',bad:['arrhythmia','fibrosis'],recommend:['vascular','stabilizer'],color:'blue'},
  inflammation:{name:'INFLAMMATORY CASCADE',goal:'Break the inflammatory loop before secondary injury spreads.',primary:'inflammation',bad:['fibrosis','viability'],recommend:['immune','stabilizer'],color:'amber'},
  fibrosis:{name:'PROGRESSIVE REMODELING',goal:'Prevent scar from locking the tissue into low function.',primary:'fibrosis',bad:['func','viability'],recommend:['regenerator','stabilizer'],color:'violet'},
  maturation:{name:'MATURATION FAILURE',goal:'Preserve survival now while building mature function.',primary:'func',bad:['viability','metabolic'],recommend:['maturation','stabilizer'],color:'teal'},
  arrhythmia:{name:'CONDUCTION CRISIS',goal:'Keep electrical instability low while protecting function.',primary:'arrhythmia',bad:['func','oxygen'],recommend:['electrical','vascular'],color:'cyan'}
 };
 const regionTypes=['PERFUSION BOTTLENECK','INFLAMMATORY FOCUS','FIBROTIC NICHE','ELECTRICAL HOTSPOT','RECOVERY ZONE','VULNERABLE REGION'];
 let regions=[],briefing=null,lastState=null,decisionDay=-1,runStartedAt=0,clickAudio=null;
 let uiBuilt=false;
 function currentSc(){return $('scenario')?.value||'ischemia'};
 function info(){return scenarioInfo[currentSc()]||scenarioInfo.ischemia};
 function avgMaturity(){const cs=(window.cells||[]).filter(c=>c.type==='cardiomyocyte');return cs.length?cs.reduce((a,c)=>a+c.mature,0)/cs.length:0}
 function stateRisk(){const s=window.state||{}; const vals={viability:100-(s.viability||0),func:100-(s.func||0),inflammation:s.inflammation||0,fibrosis:s.fibrosis||0,oxygen:100-(s.oxygen||0),arrhythmia:s.arrhythmia||0,metabolic:100-(s.metabolic||0)};return Object.entries(vals).sort((a,b)=>b[1]-a[1]);}
 function makeRegions(){
  regions=[]; const count=7+Math.floor(Math.random()*4), max=(window.cells||[]).length||216;
  for(let i=0;i<count;i++){const idx=Math.floor(Math.random()*max);const type=regionTypes[Math.floor(Math.random()*regionTypes.length)];let sev=30+Math.random()*55;
   if(currentSc()==='ischemia'&&type==='PERFUSION BOTTLENECK')sev+=15;
   if(currentSc()==='arrhythmia'&&type==='ELECTRICAL HOTSPOT')sev+=15;
   regions.push({id:i+1,cell:idx,type,severity:Math.round(clamp(sev)),resolved:false,confidence:Math.round(55+Math.random()*35)});
  }
  // annotate a few cells for spatial inspection without changing core simulation formulas
  (window.cells||[]).forEach((c,i)=>{const r=regions.find(x=>x.cell===i);if(r)c.regionTag=r.type;c.regionSeverity=r?.severity||0;c.regionConfidence=r?.confidence||0;});
 }
 function makeMission(){
  const inf=info(); const target=55+Math.floor(Math.random()*13);
  briefing={title:inf.name,goal:inf.goal,target,primary:inf.primary,recommend:inf.recommend.slice(),turns:[]};
  decisionDay=-1;
 }
 function playTone(kind='click'){
  try{if(!clickAudio)clickAudio=new (window.AudioContext||window.webkitAudioContext)();const o=clickAudio.createOscillator(),g=clickAudio.createGain();o.type='sine';o.frequency.value=kind==='warn'?180:kind==='good'?560:360;g.gain.value=.025;o.connect(g);g.connect(clickAudio.destination);o.start();o.stop(clickAudio.currentTime+(kind==='warn'?.12:.07))}catch{}
 }
 function addShell(){
  if(uiBuilt)return; uiBuilt=true;
  const top=document.createElement('section');top.id='finalMissionBar';
  top.innerHTML=`<div class="fm-left"><div class="fm-kicker">CURRENT OPERATION</div><div id="fmTitle">—</div><div id="fmGoal">—</div></div><div class="fm-center"><div id="fmThreat">NO ACTIVE THREAT</div><div class="fm-sub">TACTICAL FEEDBACK</div><div id="fmFeedback">Start a run to establish the tissue state.</div></div><div class="fm-right"><div><span>DAY</span><b id="fmDay">0/24</b></div><div><span>SCORE</span><b id="fmScore">0</b></div><div><span>RISK</span><b id="fmRisk">LOW</b></div></div>`;
  const anchor=document.querySelector('.scenario-row');anchor?.after(top);
  const action=document.createElement('section');action.id='finalActionBar';action.innerHTML=`<div class="fm-action-main"><div><span class="fm-label">RECOMMENDED OPENING</span><strong id="fmRec">—</strong><small id="fmRecWhy">—</small></div><div class="fm-actions" id="fmActions"><button id="fmInspect">INSPECT AFFECTED REGION</button><button id="fmWhy" class="secondary">WHY IS THIS HAPPENING?</button><button id="fmNext" class="primary">ADVANCE DAY</button></div></div><div class="fm-progress"><div><span>CAMPAIGN</span><b id="fmCampaign">CHAPTER 1 · FIRST RESPONSE</b></div><div><span>RUN STATE</span><b id="fmState">READY</b></div></div>`;
  document.querySelector('main')?.prepend(action);
  const narrative=document.createElement('section');narrative.id='finalNarrative';narrative.innerHTML=`<div class="fn-head"><span>RUN NARRATIVE</span><button id="fnClear" class="secondary small">CLEAR</button></div><div id="fnFeed"><div class="fn-empty">Your run events will appear here.</div></div>`;
  document.querySelector('main')?.append(narrative);
  const campaign=document.createElement('section');campaign.id='finalCampaign';campaign.innerHTML=`<div class="fc-head"><span>CAMPAIGN</span><b id="fcChapter">CHAPTER 1</b></div><div id="fcSteps"></div>`;
  document.querySelector('main')?.append(campaign);
  const overlay=document.createElement('div');overlay.id='finalOverlay';document.body.appendChild(overlay);
  const canvas=$('tissue'); if(canvas)canvas.addEventListener('click',onMapClick);
  $('fmNext')?.addEventListener('click',()=>{playTone();window.advance?.()});
  $('fmInspect')?.addEventListener('click',()=>{playTone();inspectHotspot()});
  $('fmWhy')?.addEventListener('click',()=>{playTone();showWhy()});
  $('fnClear')?.addEventListener('click',()=>{$('fnFeed').innerHTML='<div class="fn-empty">Narrative cleared for readability.</div>'});
  $('scenario')?.addEventListener('change',()=>{makeRegions();makeMission();renderAll();logEvent('SCENARIO CHANGED',`New operation: ${info().name}.`,'neutral');});
 }
 function onMapClick(e){
  const cv=e.currentTarget;if(!window.cells?.length)return;const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*18,y=(e.clientY-r.top)/r.height*12;const cx=Math.max(0,Math.min(17,Math.floor(x))),cy=Math.max(0,Math.min(11,Math.floor(y)));window.selected=cy*18+cx;window.updateUI?.();
  const c=window.cells[window.selected];const reg=regions.find(x=>x.cell===window.selected);showRegion(c,reg);playTone('click');
 }
 function showRegion(c,reg){
  const label=reg?`${reg.type} · ${reg.severity}% severity`:`LOCAL TISSUE ZONE`;
  const txt=reg?`Confidence ${reg.confidence}%. ${reg.resolved?'This region is recovering.':'This region is an active concern.'}`:`${c.type.toUpperCase()} · stress ${Math.round(c.stress)} · oxygen ${Math.round(c.oxygen)}.`;
  setFeedback(label,txt,reg&&!reg.resolved?'warn':'good');
 }
 function inspectHotspot(){const active=regions.filter(r=>!r.resolved).sort((a,b)=>b.severity-a.severity)[0];if(!active){setFeedback('FIELD STABLE','No unresolved regional hotspot is currently dominant.','good');return}window.selected=active.cell;window.updateUI?.();const c=window.cells[active.cell];showRegion(c,active);window.scrollTo({top:Math.max(0,($('tissue')?.getBoundingClientRect().top||0)+scrollY-85),behavior:'smooth'});}
 function riskLabel(){const r=stateRisk()[0]?.[1]||0;return r>65?'CRITICAL':r>42?'HIGH':r>25?'MODERATE':'LOW'}
 function renderAll(){
  const inf=info(),s=window.state||{};if(!uiBuilt)return;
  $('fmTitle').textContent=inf.name;$('fmGoal').textContent=inf.goal;$('fmDay').textContent=`${window.day||0}/24`;$('fmScore').textContent=window.score?.()??0;$('fmRisk').textContent=riskLabel();
  const rec=inf.recommend.map(id=>({id,name:(window.defs?.find(d=>d.id===id)?.name)||id.toUpperCase()}));
  $('fmRec').textContent=rec.map(r=>r.name).join(' + ');$('fmRecWhy').textContent=`Suggested starting pair for ${inf.name.toLowerCase()}. You can ignore it and experiment.`;
  const active=regions.filter(r=>!r.resolved).sort((a,b)=>b.severity-a.severity)[0];
  $('fmThreat').textContent=active?`THREAT · ${active.type} · ${active.severity}%`:'NO ACTIVE THREAT';
  $('fmDay').classList.toggle('danger',riskLabel()==='CRITICAL');
  $('fmState').textContent=!window.running?'READY':window.day===0?'AWAITING FIRST DAY':window.day>=24?'DEBRIEF':'LIVE';
  $('fmCampaign').textContent=`CHAPTER ${meta.chapter} · ${chapterName(meta.chapter)}`;
  renderCampaign();renderNarrative();updateBodyState();
 }
 function chapterName(n){return ['FIRST RESPONSE','THE CASCADE','REMODELING','RECOVERY','CONDUCTION','COMBINED BREACH','MASTER CRISIS'][Math.max(0,Math.min(6,n-1))]||'MASTER CRISIS'}
 function renderCampaign(){const el=$('fcSteps');if(!el)return;const items=[['1','FIRST RESPONSE',1],['2','THE CASCADE',2],['3','REMODELING',3],['4','RECOVERY',4],['5','CONDUCTION',5],['6','COMBINED BREACH',6]];el.innerHTML=items.map(x=>`<div class="fc-step ${meta.chapter>=x[2]?'on':''} ${meta.chapter===x[2]?'active':''}"><i>${meta.chapter>=x[2]?'✓':x[0]}</i><span>${x[1]}</span></div>`).join('');$('fcChapter').textContent=`CHAPTER ${meta.chapter}`;}
 function renderNarrative(){const el=$('fnFeed');if(!el||!briefing)return;const turns=briefing.turns||[];if(!turns.length){el.innerHTML='<div class="fn-empty">No events yet. Start the run and watch the situation evolve.</div>';return}el.innerHTML=turns.slice(-10).map(t=>`<div class="fn-row ${t.kind}"><b>${t.day===0?'BRIEFING':'DAY '+t.day}</b><div><strong>${t.title}</strong><span>${t.text}</span></div></div>`).join('');}
 function logEvent(title,text,kind='neutral'){
  briefing?.turns?.push({day:window.day||0,title,text,kind});renderNarrative();setFeedback(title,text,kind);}
 function setFeedback(title,text,kind='neutral'){if($('fmFeedback')){$('fmFeedback').textContent=text;$('fmThreat').textContent=title;$('fmThreat').className=kind}document.body.dataset.feedback=kind;}
 function updateBodyState(){const r=riskLabel();document.body.dataset.risk=r.toLowerCase();}
 function showWhy(){
  const s=window.state||{},h=lastState||{};const sc=info();let arr=[];
  Object.entries(sc).forEach(()=>{});
  const metrics=['oxygen','viability','func','inflammation','fibrosis','arrhythmia','metabolic'];
  metrics.forEach(k=>{if(h[k]!==undefined){const d=(s[k]||0)-h[k];if(Math.abs(d)>=1)arr.push({k,d})}});
  arr.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));const top=arr.slice(0,3);const o=$('finalOverlay');o.innerHTML=`<div class="why-card"><div class="why-kicker">STATE EXPLANATION · DAY ${window.day||0}</div><h2>Why did the tissue move?</h2><p>The largest changes this day were driven by the synthetic scenario pressure, your deployed agents, local tissue feedback and randomness.</p><div class="why-list">${top.length?top.map(x=>`<div><b>${x.k.toUpperCase()}</b><span>${x.d>0?'+':''}${x.d.toFixed(1)} this day</span><small>${['inflammation','fibrosis','arrhythmia'].includes(x.k)&&x.d>0?'This is harmful pressure. Look for a complementary intervention.':'This movement may support recovery depending on the scenario.'}</small></div>`).join(''):'<div><b>BASELINE</b><span>No prior day to compare.</span><small>Advance one day and the game will explain the largest movement.</small></div>'}</div><button id="whyClose">CLOSE</button></div>`;o.classList.add('show');$('whyClose').onclick=()=>o.classList.remove('show');}
 function chooseDecision(){
  if((window.day||0)<=0||window.day===decisionDay||!window.running)return;
  const frequency=(currentSc()==='arrhythmia'?2:currentSc()==='ischemia'?3:4);if(window.day%frequency!==0)return;decisionDay=window.day;
  const active=regions.filter(r=>!r.resolved).sort((a,b)=>b.severity-a.severity)[0];if(!active)return;
  const variants=eventVariants(active);const o=$('finalOverlay');o.innerHTML=`<div class="decision-card"><div class="why-kicker">DAY ${window.day} · COMMAND DECISION</div><h2>${active.type}</h2><p>${variants.text}</p><div class="decision-meta"><span>REGIONAL SEVERITY <b>${active.severity}%</b></span><span>CONFIDENCE <b>${active.confidence}%</b></span></div><div class="decision-actions"><button id="decA">${variants.a}</button><button id="decB" class="secondary">${variants.b}</button><button id="decC" class="ghost">${variants.c}</button></div><small>There is no universally correct choice. Preserve your overall objective.</small></div>`;o.classList.add('show');
  ['A','B','C'].forEach(letter=>{$('dec'+letter).onclick=()=>{playTone(letter==='A'?'good':letter==='B'?'click':'warn');variants.apply[letter]();active.resolved=letter==='A';logEvent('COMMAND DECISION',variants.result[letter],letter==='A'?'good':letter==='B'?'neutral':'warn');o.classList.remove('show');renderAll();window.updateUI?.();window.draw?.()}});
 }
 function eventVariants(active){
  const s=currentSc();if(s==='ischemia')return{a:'BOOST PERFUSION',b:'STABILIZE TISSUE',c:'WAIT & OBSERVE',text:'A regional perfusion bottleneck is threatening nearby cells.',apply:{A:()=>{window.energy=clamp(window.energy-10);window.state.oxygen=clamp(window.state.oxygen+5);window.state.func=clamp(window.state.func+2)},B:()=>{window.energy=clamp(window.energy-7);window.state.viability=clamp(window.state.viability+3)},C:()=>{window.state.oxygen=clamp(window.state.oxygen-3);active.severity+=8}},result:{A:'Perfusion was boosted; oxygen stabilized locally at an energy cost.',B:'Tissue stabilization reduced immediate injury but spent energy.',C:'You conserved resources, but the regional threat intensified.'}};
  if(s==='inflammation')return{a:'MODULATE',b:'STABILIZE',c:'MONITOR',text:'A local inflammatory focus is amplifying secondary injury.',apply:{A:()=>{window.energy=clamp(window.energy-8);window.state.inflammation=clamp(window.state.inflammation-6);window.state.fibrosis=clamp(window.state.fibrosis-.8)},B:()=>{window.energy=clamp(window.energy-6);window.state.viability=clamp(window.state.viability+2)},C:()=>{window.state.inflammation=clamp(window.state.inflammation+4);active.severity+=6}},result:{A:'Inflammatory pressure fell, reducing downstream remodeling.',B:'Viability was protected without fully suppressing the inflammatory signal.',C:'The signal was monitored and continued to build.'}};
  if(s==='fibrosis')return{a:'REPAIR',b:'PROTECT FUNCTION',c:'OBSERVE',text:'A scar-prone niche is beginning to lock in structural damage.',apply:{A:()=>{window.energy=clamp(window.energy-10);window.state.fibrosis=clamp(window.state.fibrosis-3);window.state.viability=clamp(window.state.viability+1)},B:()=>{window.energy=clamp(window.energy-7);window.state.func=clamp(window.state.func+3)},C:()=>{window.state.fibrosis=clamp(window.state.fibrosis+2);active.severity+=5}},result:{A:'Repair pressure reduced scar burden.',B:'Function was protected, but remodeling pressure remains.',C:'The scar niche progressed without intervention.'}};
  if(s==='maturation')return{a:'INVEST IN MATURATION',b:'PROTECT SURVIVAL',c:'HOLD',text:'A recovery zone can mature, but it is metabolically expensive.',apply:{A:()=>{window.energy=clamp(window.energy-9);window.state.func=clamp(window.state.func+2);(window.cells||[]).filter(c=>c.type==='cardiomyocyte').slice(0,24).forEach(c=>c.mature=clamp(c.mature+3))},B:()=>{window.energy=clamp(window.energy-5);window.state.viability=clamp(window.state.viability+3)},C:()=>{window.state.metabolic=clamp(window.state.metabolic-2)}},result:{A:'Maturation accelerated in a local recovery zone.',B:'Survival was favored over longer-term maturation.',C:'Resources were preserved, but maturation slowed.'}};
  return{a:'BUFFER SIGNAL',b:'BOOST SUPPORT',c:'MONITOR',text:'An electrical hotspot is approaching a critical threshold.',apply:{A:()=>{window.energy=clamp(window.energy-9);window.state.arrhythmia=clamp(window.state.arrhythmia-6);window.state.func=clamp(window.state.func+2)},B:()=>{window.energy=clamp(window.energy-7);window.state.oxygen=clamp(window.state.oxygen+3)},C:()=>{window.state.arrhythmia=clamp(window.state.arrhythmia+5);active.severity+=7}},result:{A:'Electrical instability was buffered before it spread.',B:'Supportive perfusion improved the local environment.',C:'The hotspot remained active and electrical risk increased.'}};
 }
 function scoreRun(){
  const s=window.state||{};const outcome=clamp((s.viability*.34)+(s.func*.28)+(s.oxygen*.12)+((100-s.inflammation)*.08)+((100-s.fibrosis)*.08)+((100-s.arrhythmia)*.10));
  const energyEff=clamp((window.energy||0));const events=briefing?.turns?.filter(x=>x.title==='COMMAND DECISION').length||0;const resolved=regions.filter(r=>r.resolved).length;return Math.round(clamp(outcome*.82+energyEff*.12+resolved*2+Math.min(4,events)*1.5));
 }
 function debrief(){
  if(meta.lastDebriefDay===window.day)return;meta.lastDebriefDay=window.day;meta.runs++;const sc=currentSc(),score=scoreRun();meta.best=Math.max(meta.best,score);meta.wins++;
  meta.scenarioWins[sc]=(meta.scenarioWins[sc]||0)+1;
  if(score>=88&&!meta.badges.includes('MASTER OPERATOR'))meta.badges.push('MASTER OPERATOR');
  if((window.energy||0)>=45&&!meta.badges.includes('EFFICIENT'))meta.badges.push('EFFICIENT');
  if(regions.filter(r=>r.resolved).length>=3&&!meta.badges.includes('REGIONAL COMMANDER'))meta.badges.push('REGIONAL COMMANDER');
  const ev=discoverAgent();if(ev&&!meta.discoveries.includes(ev))meta.discoveries.push(ev);
  if(score>=75&&meta.chapter<6)meta.chapter++;
  saveMeta();showDebrief(score,ev);renderAll();
 }
 function discoverAgent(){const evolved=(window.agents||[]).filter(a=>a.source==='evolved');if(!evolved.length)return null;const a=evolved.slice().sort((x,y)=>((y.uses||0)-(x.uses||0)))[0];const traits=a.traits||{};if((traits.electrical||0)>.72&&currentSc()==='arrhythmia')return `${a.name} · CONDUCTION SPECIALIST`;if((traits.recovery||0)>.72&&currentSc()==='fibrosis')return `${a.name} · REPAIR SPECIALIST`;if((traits.inflammation||traits.immune||0)>.72&&currentSc()==='inflammation')return `${a.name} · IMMUNE SPECIALIST`;if((traits.perfusion||0)>.72)return `${a.name} · PERFUSION SPECIALIST`;return `${a.name} · ADAPTIVE SPECIALIST`}
 function showDebrief(score,discovery){const o=$('finalOverlay');o.innerHTML=`<div class="debrief-card"><div class="why-kicker">OPERATION COMPLETE</div><h2>BREACH CONTAINED</h2><div class="big-score">${score}<small>/100</small></div><div class="db-grid"><div><b>OUTCOME</b><span>Viability ${Math.round(window.state.viability)} · Function ${Math.round(window.state.func)}</span></div><div><b>CONTROL</b><span>O₂ ${Math.round(window.state.oxygen)} · Arrhythmia ${Math.round(window.state.arrhythmia)}</span></div><div><b>REMODELING</b><span>Inflammation ${Math.round(window.state.inflammation)} · Fibrosis ${Math.round(window.state.fibrosis)}</span></div><div><b>REGIONS</b><span>${regions.filter(r=>r.resolved).length}/${regions.length} hotspots resolved</span></div></div><div class="db-insight"><b>WHAT YOU LEARNED</b><span>${discovery?'Discovery: '+discovery+'. ':' '}Next run, try changing one decision rather than replacing the whole team.</span></div><button id="dbNew">NEW RUN</button></div>`;o.classList.add('show');$('dbNew').onclick=()=>{o.classList.remove('show');window.reset?.();renderAll()};}
 function snapshot(){const s=window.state||{};lastState={...s};}
 function wrapCore(){
  const oldReset=window.reset,oldAdvance=window.advance;
  if(oldReset&&!oldReset.__finalWrapped){const r=()=>{oldReset();makeRegions();makeMission();runStartedAt=Date.now();meta.lastDebriefDay=-1;logEvent('RUN BRIEFING',`${info().goal} Suggested opening: ${info().recommend.join(' + ')}.`,'good');snapshot();renderAll();};r.__finalWrapped=true;window.reset=r;}
  if(oldAdvance&&!oldAdvance.__finalWrapped){const a=()=>{snapshot();oldAdvance();renderAll();chooseDecision();if(window.day===24&&window.running===false)debrief();else{const r=stateRisk()[0];if(r&&Math.abs((window.state[r[0]]||0)-(lastState?.[r[0]]||0))>2)logEvent('STATE SHIFT',`${r[0].toUpperCase()} is now the dominant pressure in the tissue.`,'warn')}};a.__finalWrapped=true;window.advance=a;}
 }
 function init(){addShell();makeRegions();makeMission();wrapCore();setTimeout(()=>{if(window.cells?.length){makeRegions();renderAll()}},200);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,40));else setTimeout(init,40);
})();
