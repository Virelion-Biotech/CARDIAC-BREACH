/* CARDIAC//BREACH — roguelike player-facing layer
 * Turns the hidden simulation into a readable crisis loop.
 * No new simulation rules: this is a presentation/decision adapter over CBApp.
 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const choices={
    ischemia:[
      {id:'vascular',name:'RESTORE PERFUSION',copy:'Push oxygen into the endangered region.',tag:'BEST FOR OXYGEN',risk:'Costs energy.'},
      {id:'stabilizer',name:'STABILIZE THE REGION',copy:'Buy time while slowing secondary tissue damage.',tag:'BUY TIME',risk:'Recovery will be slower.'},
      {id:'regenerator',name:'REPAIR THE CORE',copy:'Repair the most damaged tissue before it is lost.',tag:'HIGH IMPACT',risk:'Uses more energy.'}],
    inflammation:[
      {id:'immune',name:'SUPPRESS THE SURGE',copy:'Turn down the inflammatory cascade before it spreads.',tag:'CONTROL SPREAD',risk:'Leaves damage untreated for now.'},
      {id:'stabilizer',name:'HOLD THE LINE',copy:'Reduce secondary injury while the surge burns out.',tag:'SAFE',risk:'Does not remove the source.'},
      {id:'vascular',name:'SUPPORT THE FIELD',copy:'Improve local supply so tissue can tolerate the stress.',tag:'RECOVERY',risk:'Inflammation remains.'}],
    fibrosis:[
      {id:'regenerator',name:'REPAIR BEFORE SCAR',copy:'Restore damaged tissue while the repair window is open.',tag:'REPAIR WINDOW',risk:'Expensive.'},
      {id:'stabilizer',name:'STOP FURTHER DAMAGE',copy:'Slow the cascade that feeds new scar.',tag:'CONTAIN',risk:'Existing scar remains.'},
      {id:'maturation',name:'PUSH RECOVERY',copy:'Improve functional recovery in tissue that can still adapt.',tag:'LONG GAME',risk:'Slower immediate protection.'}],
    maturation:[
      {id:'maturation',name:'PUSH MATURATION',copy:'Invest in functional recovery now.',tag:'GROWTH',risk:'Less immediate protection.'},
      {id:'vascular',name:'FEED THE RECOVERY',copy:'Improve supply to tissue trying to recover.',tag:'SUPPORT',risk:'Does not directly mature cells.'},
      {id:'stabilizer',name:'PROTECT THE WINDOW',copy:'Keep fragile tissue alive long enough to recover.',tag:'PROTECT',risk:'Recovery takes longer.'}],
    arrhythmia:[
      {id:'electrical',name:'STABILIZE CONDUCTION',copy:'Reduce electrical instability before it cascades.',tag:'URGENT',risk:'Tissue damage continues.'},
      {id:'vascular',name:'RESTORE SUPPLY',copy:'Support stressed tissue that is feeding the instability.',tag:'INDIRECT',risk:'Electrical risk remains.'},
      {id:'stabilizer',name:'HOLD THE TISSUE',copy:'Reduce secondary injury while you watch the rhythm.',tag:'SAFE',risk:'Does not directly correct conduction.'}]
  };
  let root=null, els={};
  function dominant(g){
    if(!g)return 'ischemia';
    const s=g.state;
    const vals={ischemia:(100-s.oxygen)+(100-s.viability),inflammation:s.inflammation*1.4,fibrosis:s.fibrosis*1.6,maturation:(100-s.func)+(100-s.metabolic),arrhythmia:s.arrhythmia*1.7};
    return Object.keys(vals).sort((a,b)=>vals[b]-vals[a])[0]||g.scenario;
  }
  function hottest(g){return g?.mission?.hotspots?.filter(h=>!h.resolved).sort((a,b)=>b.severity-a.severity)[0]||g?.mission?.hotspots?.[0]||null}
  function ensure(){
    if($('rogueHud'))return;
    const h=document.createElement('section');h.id='rogueHud';h.innerHTML=`<div class="rogue-kicker">MEDICAL ROGUELIKE</div><div class="rogue-main"><div><div id="rogueThreat">VENTRICULAR CRISIS</div><div id="rogueExplain">The heart is under pressure.</div></div><div class="rogue-moves"><b id="rogueMoveCount">1</b><span>critical move</span></div></div><div class="rogue-status"><span id="rogueRisk">RISK HIGH</span><span id="rogueDay">DAY 1</span><span id="rogueObjective">KEEP THE HEART ALIVE</span></div>`;
    const anchor=document.querySelector('.hero');anchor?.after(h);
    const card=document.createElement('section');card.id='rogueChoices';card.innerHTML='<div class="choice-head"><span>THE HEART IS CHANGING</span><b>CHOOSE ONE</b></div><div id="rogueChoiceGrid"></div><div id="rogueAfter"></div>';
    document.querySelector('.dashboard')?.before(card);
    els={hud:h,threat:$('rogueThreat'),explain:$('rogueExplain'),moves:$('rogueMoveCount'),risk:$('rogueRisk'),day:$('rogueDay'),objective:$('rogueObjective'),grid:$('rogueChoiceGrid'),after:$('rogueAfter')};
  }
  function render(g,showChoices=true){
    ensure();
    if(!g)return;
    const type=dominant(g);const hot=hottest(g);const s=g.state;
    const names={ischemia:'VENTRICULAR CRISIS',inflammation:'INFLAMMATORY SURGE',fibrosis:'SCAR FORMING',maturation:'RECOVERY WINDOW',arrhythmia:'CONDUCTION CRISIS'};
    const explain={ischemia:'Oxygen-starved tissue is spreading.',inflammation:'Inflammatory pressure is building across the field.',fibrosis:'Damaged tissue is beginning to lock into scar.',maturation:'Some tissue can still recover—but the window is closing.',arrhythmia:'Electrical instability is threatening viable tissue.'};
    els.threat.textContent=names[type];els.explain.textContent=explain[type];els.moves.textContent=Math.max(0,Math.min(1,g.commandPoints));els.day.textContent=`DAY ${Math.max(1,g.day)}`;els.risk.textContent=(s.arrhythmia>65||s.viability<45||s.oxygen<50||s.inflammation>70)?'RISK CRITICAL':'RISK HIGH';els.objective.textContent=`SAVE ${hot?'REGION '+(hot.cell+1):'THE HEART'}`;
    if(!showChoices||!g.running){els.grid.innerHTML='';return}
    const list=(choices[type]||choices[g.scenario]||choices.ischemia).map(c=>`<button class="rogue-choice" data-agent="${c.id}"><span class="choice-tag">${c.tag}</span><strong>${c.name}</strong><span class="choice-copy">${c.copy}</span><small>${c.risk}</small></button>`).join('');
    els.grid.innerHTML=list;
    els.grid.querySelectorAll('.rogue-choice').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.agent,hot)));
  }
  function choose(agent,hot){
    const app=window.CBApp;if(!app?.state)return;
    if(app.state.commandPoints<=0){window.CB_Audio?.warning?.();return}
    if(hot)app.selectCell(hot.cell);
    const result=app.deploy(agent);
    if(!result?.ok)return;
    els.grid.innerHTML=`<div class="choice-locked"><b>INTERVENTION COMMITTED</b><span>${result.agent.name} is working on the endangered region.</span><button id="rogueResolve">END TURN</button></div>`;
    $('rogueResolve').onclick=()=>{app.advanceDay();render(app.state,true)};
    window.CB_Audio?.decision?.();
  }
  function init(){
    root=window.CBApp;if(!root){requestAnimationFrame(init);return}
    root.subscribe(e=>{
      if(['mounted','new-run','selection','deployment','resolved','load'].includes(e.type))render(root.state,true);
    });
    render(root.state,true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
