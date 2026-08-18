/* CARDIAC//BREACH — Advanced Systems Layer */
(function(){
  'use strict';
  const KEY='cb_advanced_v2';
  const $=id=>document.getElementById(id);
  const get=(k,d)=>{try{const v=localStorage.getItem(KEY+':'+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
  const put=(k,v)=>{try{localStorage.setItem(KEY+':'+k,JSON.stringify(v))}catch(e){}};
  const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
  let stats=get('stats',{runs:0,wins:0,best:0,days:0,contracts:0,perfect:0,efficiency:0});
  let unlocked=get('achievements',[]), modifier=get('modifier','standard'), notes=get('notes','');
  const modifiers={
    standard:{name:'STANDARD',desc:'Baseline simulation conditions.',energy:0,damage:0},
    scarcity:{name:'ENERGY SCARCITY',desc:'Start with less energy. Rewards efficient teams.',energy:-18,damage:0},
    volatility:{name:'HIGH VOLATILITY',desc:'Adds unpredictable daily perturbations after each simulated day.',energy:0,damage:.10},
    no_regen:{name:'NO REGENERATION',desc:'Regenerator policies cannot be deployed.',energy:0,damage:.05}
  };
  const contracts=[
    {id:'stability',name:'STABLE GROUND',desc:'Finish with viability ≥ 70 and arrhythmia ≤ 20.',reward:8,check:()=>state.viability>=70&&state.arrhythmia<=20},
    {id:'oxygen',name:'PERFUSION LOCK',desc:'Finish with oxygen ≥ 80.',reward:7,check:()=>state.oxygen>=80},
    {id:'quiet',name:'QUIET IMMUNE FIELD',desc:'Finish with inflammation ≤ 25.',reward:7,check:()=>state.inflammation<=25},
    {id:'scar',name:'SCAR SUPPRESSION',desc:'Finish with fibrosis ≤ 18.',reward:7,check:()=>state.fibrosis<=18},
    {id:'function',name:'FUNCTION FIRST',desc:'Finish with function ≥ 75.',reward:8,check:()=>state.func>=75},
    {id:'efficiency',name:'LEAN INTERVENTION',desc:'Finish with ≥ 35 energy remaining.',reward:10,check:()=>energy>=35}
  ];
  let activeContracts=[];
  function style(){if($('advancedStyle'))return;const s=document.createElement('style');s.id='advancedStyle';s.textContent=`
    .advanced-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.advanced-card{background:rgba(8,18,22,.72);border:1px solid rgba(117,230,208,.16);padding:12px;border-radius:8px}.advanced-card h3{margin:0 0 6px;font-size:11px;letter-spacing:.14em}.advanced-card p{margin:0;color:#91a7ad;font-size:12px;line-height:1.5}.contract{padding:9px 0;border-top:1px solid rgba(255,255,255,.06)}.contract:first-child{border-top:0}.contract strong{font-size:12px}.contract small{display:block;color:#7f969d;margin-top:3px}.contract.done strong{color:#d9ff62}.badge{display:inline-flex;gap:5px;padding:4px 7px;margin:3px;border:1px solid rgba(217,255,98,.2);border-radius:99px;font-size:10px}.advanced-select,.advanced-note{width:100%;box-sizing:border-box;background:#071216;color:#d8e6e9;border:1px solid rgba(255,255,255,.12);padding:8px;border-radius:5px}.advanced-note{min-height:70px;resize:vertical}.diagnostic-row{display:flex;justify-content:space-between;padding:5px 0;font-size:11px}.risk-high{color:#ef6969}.risk-mid{color:#f1bd62}.risk-low{color:#d9ff62}@media(max-width:760px){.advanced-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(s)}
  function panel(){if($('advancedPanel'))return;const wrap=document.createElement('section');wrap.className='lower';wrap.innerHTML=`
    <div class="panel" id="advancedPanel"><div class="panel-head"><span>COMMAND DECK</span><span id="advStatus">AUTOSAVE ON</span></div><div class="advanced-grid">
      <div class="advanced-card"><h3>MISSION CONTRACTS</h3><div id="contracts"></div></div>
      <div class="advanced-card"><h3>RISK RADAR</h3><div id="riskRadar"></div></div>
      <div class="advanced-card"><h3>CHALLENGE MODIFIER</h3><select id="modifier" class="advanced-select"></select><p id="modifierDesc" style="margin-top:7px"></p></div>
      <div class="advanced-card"><h3>RUN NOTES</h3><textarea id="runNotes" class="advanced-note" placeholder="Record why you chose this team..."></textarea></div>
    </div></div>
    <div class="panel"><div class="panel-head"><span>CAREER & ACHIEVEMENTS</span><span id="careerScore">0</span></div><div id="careerStats" class="readout"></div><div id="badges"></div><div style="margin-top:8px"><button class="secondary small" id="resumeRun">RESUME AUTOSAVE</button> <button class="secondary small" id="clearCareer">RESET CAREER</button></div></div>`;document.querySelector('main').appendChild(wrap);
    const sel=$('modifier');Object.entries(modifiers).forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v.name;sel.appendChild(o)});sel.value=modifier;sel.onchange=()=>{modifier=sel.value;put('modifier',modifier);$('modifierDesc').textContent=modifiers[modifier].desc;log('CHALLENGE MODIFIER ARMED — applies on the next new run.')};$('modifierDesc').textContent=modifiers[modifier].desc;
    $('runNotes').value=notes;$('runNotes').oninput=e=>{notes=e.target.value;put('notes',notes)};
    $('clearCareer').onclick=()=>{if(confirm('Reset career achievements and statistics?')){stats={runs:0,wins:0,best:0,days:0,contracts:0,perfect:0,efficiency:0};unlocked=[];put('stats',stats);put('achievements',unlocked);renderCareer()}};$('resumeRun').onclick=resume;
  }
  function chooseContracts(){activeContracts=contracts.slice().sort(()=>Math.random()-.5).slice(0,3);renderContracts()}
  function renderContracts(){const el=$('contracts');if(!el)return;el.innerHTML=activeContracts.map(c=>`<div class="contract ${c.check()?'done':''}"><strong>${c.check()?'✓ ':''}${c.name}</strong><small>${c.desc} · +${c.reward} career pts</small></div>`).join('')}
  function risk(){const vals=[['VIABILITY',state.viability,false],['FUNCTION',state.func,false],['INFLAMMATION',state.inflammation,true],['FIBROSIS',state.fibrosis,true],['OXYGEN',state.oxygen,false],['ARRHYTHMIA',state.arrhythmia,true],['ENERGY',energy,false]];return vals.map(([n,v,bad])=>{const r=bad?v:100-v,cls=r>65?'risk-high':r>35?'risk-mid':'risk-low';return `<div class="diagnostic-row"><span>${n}</span><b class="${cls}">${Math.round(v)}%</b></div>`}).join('')}
  function renderCareer(){if(!$('careerStats'))return;const pts=stats.wins*100+stats.contracts*20+stats.perfect*50;$('careerScore').textContent=pts;$('careerStats').innerHTML=`Runs <b>${stats.runs}</b> · Completed <b>${stats.wins}</b> · Best score <b>${stats.best}</b> · Days simulated <b>${stats.days}</b> · Contracts <b>${stats.contracts}</b>`;$('badges').innerHTML=unlocked.length?unlocked.map(x=>`<span class="badge">◆ ${x}</span>`).join(''):'<span class="muted">No achievements yet.</span>'}
  function autosave(){if(typeof day==='undefined')return;put('save',{day,energy,agents:JSON.parse(JSON.stringify(agents||[])),state:JSON.parse(JSON.stringify(state)),history:JSON.parse(JSON.stringify(history||[])),scenario:$('scenario')?.value||'ischemia',modifier,notes})}
  function resume(){const s=get('save',null);if(!s)return log('NO AUTOSAVE FOUND.',true);try{day=s.day;energy=s.energy;agents=s.agents||[];Object.assign(state,s.state);history=s.history||[];if($('scenario'))$('scenario').value=s.scenario;notes=s.notes||'';if($('runNotes'))$('runNotes').value=notes;running=day<MAX_DAYS;renderAgents();renderArchive();updateUI();renderChart();draw();log('AUTOSAVE RESTORED — run state recovered.')}catch(e){log('AUTOSAVE COULD NOT BE RESTORED.',true)}}
  function finish(){if(typeof day==='undefined'||day!==MAX_DAYS)return;stats.wins++;stats.days+=day;const sc=score();stats.best=Math.max(stats.best,sc);const passed=activeContracts.filter(c=>c.check());stats.contracts+=passed.length;if(sc>=90)stats.perfect++;if(energy>=35)stats.efficiency++;const unlock=n=>{if(!unlocked.includes(n)){unlocked.push(n);log('ACHIEVEMENT UNLOCKED — '+n)}};if(sc>=85)unlock('High Performer');if(energy>=50)unlock('Resource Steward');if(passed.length===3)unlock('Contract Master');if(state.viability>=80&&state.func>=80)unlock('Tissue Guardian');if(sc>=80)unlock('Consistent Operator');put('stats',stats);put('achievements',unlocked);autosave();renderCareer()}
  function applyModifier(){const m=modifiers[modifier];if(m.damage){state.inflammation=clamp(state.inflammation+(Math.random()-.5)*14*m.damage);state.arrhythmia=clamp(state.arrhythmia+(Math.random()-.5)*12*m.damage);state.oxygen=clamp(state.oxygen+(Math.random()-.5)*10*m.damage)}if(modifier==='no_regen'){}if($('riskRadar'))$('riskRadar').innerHTML=risk()}
  function hook(){const newRun=$('newRun'),next=$('nextDay');
    if(newRun)newRun.addEventListener('click',()=>setTimeout(()=>{const m=modifiers[modifier];if(m.energy)energy=clamp(energy+m.energy);chooseContracts();stats.runs++;put('stats',stats);autosave();renderCareer();log('COMMAND DECK — contracts assigned. Modifier: '+m.name);},30));
    if(next)next.addEventListener('click',()=>setTimeout(()=>{if(day>0&&day<MAX_DAYS){if(modifier==='volatility')applyModifier();autosave()}if(day===MAX_DAYS)finish();renderContracts();if($('riskRadar'))$('riskRadar').innerHTML=risk()},40));
    document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;const k=e.key.toLowerCase();if(k==='n')newRun?.click();if(k==='d')next?.click();if(k==='s')autosave();if(k==='r')resume();if(k==='?')alert('KEYBOARD\nN — new run\nD — advance day\nS — autosave\nR — resume autosave\n? — shortcuts')});
    if(window.deploy){const original=window.deploy;window.deploy=function(id,name){if(modifier==='no_regen'&&id==='regenerator')return log('NO REGENERATION MODIFIER — regenerator deployment blocked.',true);return original.apply(this,arguments)}}
    setInterval(()=>{autosave();if($('riskRadar'))$('riskRadar').innerHTML=risk();renderContracts()},5000)
  }
  function init(){style();panel();chooseContracts();renderCareer();hook();if($('riskRadar'))$('riskRadar').innerHTML=risk()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
