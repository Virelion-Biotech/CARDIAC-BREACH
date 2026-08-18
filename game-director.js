/* CARDIAC//BREACH — simple first-run guide. Advanced systems remain available, but beginners see one decision at a time. */
(()=>{
 const $=id=>document.getElementById(id);
 let guided=localStorage.getItem('cb-guided')!=='off';
 let introSeen=localStorage.getItem('cb-simple-guide-v1');
 const scenarioHelp={
  ischemia:'Keep OXYGEN and VIABILITY up. Start with Stabilizer + Vascular support.',
  inflammation:'Keep INFLAMMATION down. Start with Stabilizer + Immune modulator.',
  fibrosis:'Keep FIBROSIS down while protecting FUNCTION. Start with Stabilizer + Regenerator.',
  maturation:'Protect FUNCTION and mature cells. Start with Stabilizer + Maturation.',
  arrhythmia:'Keep ARRHYTHMIA down. Start with Stabilizer + Electrical buffer.'
 };
 function sc(){return $('scenario')?.value||'ischemia'}
 function coach(title,text){if(!guided)return;let p=$('cbCoach');if(!p){p=document.createElement('div');p.id='cbCoach';document.body.appendChild(p)}p.innerHTML=`<b>${title}</b><span>${text}</span><button aria-label="Close">×</button>`;p.querySelector('button').onclick=()=>p.remove();clearTimeout(p._timer);p._timer=setTimeout(()=>p.remove(),9000)}
 function objective(){const box=$('cbObjectives');if(!box)return;box.innerHTML=`<div class="simple-objective"><b>YOUR GOAL</b><span>${scenarioHelp[sc()]}</span></div>`}
 function directorPanel(){if($('cbDirector'))return;const host=document.querySelector('.scenario-row');if(!host)return;const box=document.createElement('div');box.id='cbDirector';box.innerHTML=`<div id="cbObjectives"></div><button class="secondary small" id="cbGuide">GUIDE: ON</button>`;host.after(box);$('cbGuide').onclick=()=>{guided=!guided;localStorage.setItem('cb-guided',guided?'on':'off');$('cbGuide').textContent='GUIDE: '+(guided?'ON':'OFF');if(guided)coach('GUIDE',nextInstruction())};objective();$('scenario')?.addEventListener('change',()=>{objective();if(guided)coach('NEW SCENARIO',scenarioHelp[sc()])})}
 function nextInstruction(){if(typeof running!=='undefined'&&!running)return 'Press NEW RUN. Nothing happens until you start.';if(typeof agents!=='undefined'&&agents.length===0)return 'Step 1: choose 1–2 agents below. Start with Stabilizer and the specialist suggested above.';if(typeof day!=='undefined'&&day===0)return 'Step 2: click ADVANCE DAY once. Then read the numbers on the right.';return 'Step 3: look for the metric getting worse. If needed, add one complementary agent, then advance again.'}
 function intro(){if(introSeen)return;const o=document.createElement('div');o.id='cbStart';o.innerHTML=`<div class="cd-card simple-guide"><div class="cd-kicker">QUICK START</div><h2>Let's play.</h2><p class="cd-lede">You are protecting a <b>synthetic cardiac tissue model</b>. You do not need to understand everything on screen yet.</p><div class="quick-steps"><div><b>1</b><span><strong>Choose a scenario</strong>Pick the problem you want to solve.</span></div><div><b>2</b><span><strong>Deploy 1–2 agents</strong>Use the recommendation shown above the tissue.</span></div><div><b>3</b><span><strong>Advance one day</strong>Watch the numbers change.</span></div><div><b>4</b><span><strong>React</strong>If something gets worse, add a helpful agent and continue.</span></div></div><div class="beginner-tip"><b>FIRST RUN</b><span>Don't try to optimize the whole screen. Just follow the guide.</span></div><button id="cbEnter">START — I'LL GUIDE YOU</button><button id="cbSkip" class="secondary">SKIP GUIDE</button><div class="cd-note">Everything in the tissue model is synthetic.</div></div>`;document.body.appendChild(o);$('cbEnter').onclick=()=>{guided=true;localStorage.setItem('cb-guided','on');localStorage.setItem('cb-simple-guide-v1','1');o.remove();coach('START HERE',nextInstruction())};$('cbSkip').onclick=()=>{localStorage.setItem('cb-simple-guide-v1','1');o.remove()}}
 function wrap(){
  const r=window.reset,a=window.advance,d=window.deploy;
  if(r&&!r.__simpleDirector){const wr=()=>{r();objective();if(guided)coach('STEP 1 — BUILD','Choose 1–2 agents. The recommendation above tells you where to start.')};wr.__simpleDirector=true;window.reset=wr;if($('newRun'))$('newRun').onclick=wr}
  if(a&&!a.__simpleDirector){const wa=(...args)=>{a(...args);objective();if(guided&&day===1)coach('STEP 3 — READ','Look at the six main numbers on the right. Find the one that moved in the wrong direction.');else if(guided&&day>1&&day<MAX_DAYS)coach('STEP 4 — REACT','If one problem is worsening, add one complementary agent. Then advance another day.')};wa.__simpleDirector=true;window.advance=wa;if($('nextDay'))$('nextDay').onclick=wa}
  if(d&&!d.__simpleDirector){const wd=(...args)=>{d(...args);objective()};wd.__simpleDirector=true;window.deploy=wd}
 }
 function init(){directorPanel();intro();wrap();setTimeout(()=>{objective();if(introSeen&&guided)coach('GUIDE',nextInstruction())},300)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,30));else setTimeout(init,30)
})();
