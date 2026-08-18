/* CARDIAC//BREACH — true beginner tutorial
 * Assumes zero science or programming knowledge.
 * Teaches the interface one action at a time with a center coach, visual target pulse and arrow guidance.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);const KEY='cb-beginner-tutorial-v3';
 let guideOn=localStorage.getItem(KEY+':on')!=='0',seen=localStorage.getItem(KEY+':seen')==='1',step=0;
 const steps=[
  {title:'Welcome — what is this game?',text:'You are protecting a completely fictional heart-tissue model. Think of the colored squares as tiny pieces of tissue. Your job is to keep the tissue healthy while a problem develops.',target:null,action:'Read this once, then click NEXT.'},
  {title:'1 · Start the game',text:'NEW RUN creates a fresh game. Nothing moves until you start. Each run lasts 24 game-days.',target:'#newRun',action:'Click NEW RUN.'},
  {title:'2 · Choose the problem',text:'SCENARIO is simply the problem you are trying to manage. Start with Ischemic injury. You can explore the others later.',target:'#scenario',action:'Choose Ischemic injury.'},
  {title:'3 · Meet the tissue map',text:'The large grid is your game board. Each square is one small piece of fictional tissue. Click a square to select it. The bright outline shows your selection.',target:'#tissue',action:'Click one square on the tissue map.'},
  {title:'4 · What is a region?',text:'A REGION is just a location on the board. The inspector tells you what is happening in the selected area. You do not need biology knowledge.',target:'#inspector',action:'Look at the REGION INSPECTOR.'},
  {title:'5 · What do the numbers mean?',text:'VIABILITY = how much tissue is alive. FUNCTION = how well it works. OXYGEN = how well supplied it is. INFLAMMATION, FIBROSIS and ARRHYTHMIA are problems, so lower is better. ENERGY is your spending budget.',target:'#viability',action:'Look at the numbers on the right.'},
  {title:'6 · What is an agent?',text:'An AGENT is simply a tool you can use to help the tissue. Each one has a name, a job, and an energy cost. For your first run, use STABILIZER.',target:'#agentList',action:'Find STABILIZER in the Agent Foundry.'},
  {title:'7 · Put an agent on a cell',text:'This is the key idea: first click the cell you want to help. Then click DEPLOY on the agent. The agent is assigned to that selected cell. An ACTIVE ring appears immediately. Its actual tissue effect is applied when you advance the day.',target:'#agentList',action:'Click a cell → click STABILIZER → click DEPLOY.'},
  {title:'8 · Advance the game',text:'ADVANCE DAY moves the simulation forward by one day. Your placed agent now affects its target cell and the rest of the tissue responds.',target:'#nextDay',action:'Click ADVANCE DAY once.'},
  {title:'9 · Check what changed',text:'Look at the selected cell again. You should see its local numbers change after the day advances. Then compare the big system numbers on the right.',target:'#inspector',action:'Compare the cell before and after advancing.'},
  {title:'10 · React',text:'If another problem is getting worse, select another cell and deploy a helpful agent there. You can use up to five agents. Do not try to fix everything at once.',target:'#agentList',action:'Add one more agent only if you need it.'},
  {title:'11 · You know the whole loop',text:'START → CHOOSE A PROBLEM → CLICK A CELL → DEPLOY AN AGENT → ADVANCE A DAY → CHECK WHAT CHANGED → REACT. The other panels are optional advanced information.',target:null,action:'Click FINISH GUIDE and play normally.'}
 ];
 function ensurePanel(){if($('beginnerGuide'))return;const panel=document.createElement('div');panel.id='beginnerGuide';panel.innerHTML=`<div class="bg-card"><div class="bg-top"><span class="bg-kicker">BEGINNER COACH</span><span id="bgCount">1 / ${steps.length}</span></div><div class="bg-icon" id="bgIcon">C//B</div><h2 id="bgTitle"></h2><p id="bgText"></p><div class="bg-action"><b>DO THIS</b><span id="bgAction"></span></div><div class="bg-footer"><button id="bgBack" class="secondary">BACK</button><button id="bgNext">NEXT</button><button id="bgSkip" class="secondary">SKIP GUIDE</button></div></div><div id="bgArrow" aria-hidden="true"></div>`;document.body.appendChild(panel);$('bgNext').onclick=next;$('bgBack').onclick=back;$('bgSkip').onclick=close;}
 function clearPulse(){document.querySelectorAll('.bg-pulse').forEach(e=>e.classList.remove('bg-pulse'));$('bgArrow')?.classList.remove('show');}
 function pointToTarget(target){const arrow=$('bgArrow'),card=document.querySelector('.bg-card');if(!arrow||!card||!target)return;const a=target.getBoundingClientRect(),c=card.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,cx=c.left+c.width/2,cy=c.top+c.height/2,dx=ax-cx,dy=ay-cy,len=Math.max(50,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx)*180/Math.PI;arrow.style.left=`${cx}px`;arrow.style.top=`${cy}px`;arrow.style.width=`${Math.min(len,Math.max(90,innerWidth*.42))}px`;arrow.style.transform=`translateY(-50%) rotate(${angle}deg)`;arrow.classList.add('show');}
 function render(){ensurePanel();const s=steps[step];$('bgCount').textContent=`${step+1} / ${steps.length}`;$('bgTitle').textContent=s.title;$('bgText').textContent=s.text;$('bgAction').textContent=s.action;$('bgBack').disabled=step===0;$('bgNext').textContent=step===steps.length-1?'FINISH GUIDE':'NEXT';clearPulse();if(s.target){const el=document.querySelector(s.target);if(el){el.classList.add('bg-pulse');setTimeout(()=>pointToTarget(el),60)}}}
 function next(){if(step===1&&!window.running){flash('Press NEW RUN first.');return}if(step===2&&$('scenario')?.value!=='ischemia'){flash('For the tutorial, choose Ischemic injury.');return}if(step===3&&typeof window.selected==='undefined'){flash('Click one square on the tissue map first.');return}if(step===7&&!(window.agents||[]).some(a=>a.targetCell!==undefined)){flash('Select a cell and deploy the STABILIZER.');return}if(step===8&&(window.day||0)<1){flash('Click ADVANCE DAY once.');return}if(step<steps.length-1){step++;render()}else close();}
 function back(){if(step>0){step--;render()}}
 function flash(msg){let t=$('bgToast');if(!t){t=document.createElement('div');t.id='bgToast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),2300)}
 function close(){localStorage.setItem(KEY+':seen','1');$('beginnerGuide')?.remove();clearPulse();seen=true}
 function open(){step=0;render()}
 function addHelpButton(){if($('beginnerHelp'))return;const b=document.createElement('button');b.id='beginnerHelp';b.className='secondary small';b.textContent='HOW TO PLAY';b.onclick=open;document.querySelector('.controls')?.appendChild(b)}
 window.addEventListener('resize',()=>{const s=steps[step];if(s?.target){const el=document.querySelector(s.target);if(el)pointToTarget(el)}});
 function init(){addHelpButton();if(guideOn&&!seen)open()}
 window.CB_BeginnerGuide={open,flash};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();
