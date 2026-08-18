/* CARDIAC//BREACH — true beginner tutorial
 * Assumes zero science or programming knowledge.
 * Teaches the interface one action at a time and explains what every major panel means.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const KEY='cb-beginner-tutorial-v2';
 let guideOn=localStorage.getItem(KEY+':on')!=='0';
 let seen=localStorage.getItem(KEY+':seen')==='1';
 let step=0;
 const steps=[
  {title:'Welcome — what is this game?',text:'You are protecting a completely fictional heart-tissue model. Think of the colored squares as tiny pieces of tissue. Your job is to keep the tissue healthy while a problem develops.',target:null,action:'Read this once, then click NEXT.'},
  {title:'1 · Start the game',text:'The NEW RUN button creates a fresh game. You must press it before anything happens. Each run lasts 24 game-days.',target:'#newRun',action:'Click NEW RUN.'},
  {title:'2 · Choose the problem',text:'SCENARIO is the problem the tissue is facing. Start with Ischemic injury. For your first game, do not worry about the other scenarios.',target:'#scenario',action:'Choose Ischemic injury.'},
  {title:'3 · Understand the map',text:'The large grid is the tissue. Each square is one small piece of fictional tissue. Click any square to select it. The white outline shows which square you selected.',target:'#tissue',action:'Click one square on the tissue map.'},
  {title:'4 · What is a region?',text:'A REGION is simply a group or location in the tissue. You do not need biology knowledge: treat it like an area on a game board. The selected square is where you are looking or placing an agent.',target:'#inspector',action:'Look at the REGION INSPECTOR on the right.'},
  {title:'5 · What do the numbers mean?',text:'VIABILITY = how much tissue is still alive. FUNCTION = how well the tissue is working. OXYGEN = how well the tissue is supplied. INFLAMMATION, FIBROSIS and ARRHYTHMIA are problems: lower is better. ENERGY is your spending budget.',target:'#viability',action:'Read the numbers on the right. You do not need to memorize them.'},
  {title:'6 · Pick an agent',text:'An AGENT is a tool you can use to help the tissue. Each card has a name, a one-line description, and an energy cost. For this first game, use STABILIZER.',target:'#agentList',action:'Find STABILIZER in the Agent Foundry.'},
  {title:'7 · Put an agent on a cell',text:'First select the tissue square you want to help. Then click DEPLOY on the agent you want. The selected square becomes the agent\'s target. A marker will remain on the map so you can see where you placed it.',target:'#agentList',action:'Select a cell, then click STABILIZER → DEPLOY.'},
  {title:'8 · Advance the game',text:'ADVANCE DAY moves the simulation forward by one day. After you click it, look at the numbers again. Ask one simple question: “What got worse?”',target:'#nextDay',action:'Click ADVANCE DAY once.'},
  {title:'9 · React, do not panic',text:'If something gets worse, you can select another cell and deploy another helpful agent. You can use up to five agents in a run. You do not need to fix everything at once.',target:'#agentList',action:'Try adding one more agent only if you need it.'},
  {title:'10 · You now know the whole loop',text:'The basic game is: START → CHOOSE A PROBLEM → CLICK A CELL → DEPLOY AN AGENT → ADVANCE A DAY → CHECK THE NUMBERS → RESPOND. Everything else on screen is optional advanced information.',target:null,action:'Click FINISH GUIDE and play normally.'}
 ];
 function ensurePanel(){
  if($('beginnerGuide'))return;
  const panel=document.createElement('div');panel.id='beginnerGuide';panel.innerHTML=`<div class="bg-card"><div class="bg-top"><span class="bg-kicker">BEGINNER MODE</span><span id="bgCount">1 / ${steps.length}</span></div><div class="bg-icon" id="bgIcon">C//B</div><h2 id="bgTitle"></h2><p id="bgText"></p><div class="bg-action"><b>DO THIS</b><span id="bgAction"></span></div><div class="bg-footer"><button id="bgBack" class="secondary">BACK</button><button id="bgNext">NEXT</button><button id="bgSkip" class="secondary">SKIP GUIDE</button></div></div>`;document.body.appendChild(panel);
  $('bgNext').onclick=next;$('bgBack').onclick=back;$('bgSkip').onclick=close;
 }
 function clearPulse(){document.querySelectorAll('.bg-pulse').forEach(e=>e.classList.remove('bg-pulse'));}
 function render(){ensurePanel();const s=steps[step];$('bgCount').textContent=`${step+1} / ${steps.length}`;$('bgTitle').textContent=s.title;$('bgText').textContent=s.text;$('bgAction').textContent=s.action;$('bgBack').disabled=step===0;$('bgNext').textContent=step===steps.length-1?'FINISH GUIDE':'NEXT';clearPulse();if(s.target){const el=document.querySelector(s.target);if(el){el.classList.add('bg-pulse');el.scrollIntoView({behavior:'smooth',block:'center'})}}}
 function next(){
  if(step===1&&!window.running){flash('Press NEW RUN first.');return}
  if(step===2&&$('scenario')?.value!=='ischemia'){flash('For this tutorial, choose Ischemic injury. You can explore the other scenarios later.');return}
  if(step===3&&typeof window.selected==='undefined'){flash('Click one square on the tissue map first.');return}
  if(step===7&&!(window.agents||[]).some(a=>a.targetCell!==undefined)){flash('Select a cell and deploy the STABILIZER.');return}
  if(step===8&&(window.day||0)<1){flash('Click ADVANCE DAY once.');return}
  if(step<steps.length-1){step++;render()}else close();
 }
 function back(){if(step>0){step--;render()}}
 function flash(msg){let t=$('bgToast');if(!t){t=document.createElement('div');t.id='bgToast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
 function close(){localStorage.setItem(KEY+':seen','1');$('beginnerGuide')?.remove();clearPulse();seen=true}
 function open(){step=0;render()}
 function addHelpButton(){if($('beginnerHelp'))return;const b=document.createElement('button');b.id='beginnerHelp';b.className='secondary small';b.textContent='HOW TO PLAY';b.onclick=open;document.querySelector('.controls')?.appendChild(b)}
 function init(){addHelpButton();if(guideOn&&!seen)open()}
 window.CB_BeginnerGuide={open,flash};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();
