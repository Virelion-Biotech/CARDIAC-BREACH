/* CARDIAC//BREACH — single beginner tutorial for the immersive cockpit */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),KEY='cb-beginner-tutorial-v6';
 let guideOn=localStorage.getItem(KEY+':on')!=='0',seen=localStorage.getItem(KEY+':seen')==='1',step=0,userSelected=false,userArmed=false,userDeployed=false;
 const immersive=()=>!!window.CB_IMMERSIVE_UI||document.body.classList.contains('cb-immersive');
 const state=()=>window.CBApp?.state||{};
 const steps=()=>immersive()?[
  {title:'Welcome — you are inside the heart monitor',text:'The heart in the center is the game board. You are protecting it through a chain of crises. Ignore the technical numbers at first.',target:'#ciHeart',action:'LOOK AT THE HEART IN THE CENTER.'},
  {title:'1 · Start a run',text:'Open SYSTEM. Choose a scenario, then start a fresh run. Your first run should use Ischemic injury.',target:'[data-open="system"]',action:'OPEN SYSTEM → NEW RUN.'},
  {title:'2 · Choose the crisis',text:'Scenario is simply the problem your run is built around. For your first run, keep Ischemic injury.',target:'#ciScenario',action:'LEAVE ISCHEMIC INJURY SELECTED.'},
  {title:'3 · Select a region',text:'Click directly on the anatomical heart. The game maps that click to a simulated tissue region. You should see a selection response and a region readout.',target:'#ciHeart',action:'CLICK THE HEART TO SELECT A REGION.',check:()=>userSelected},
  {title:'4 · Arm your intervention',text:'The bottom action dock contains your available interventions. Pick one to arm it. Do not worry about the deep physiology yet.',target:'#ciDock',action:'CLICK STABILIZER (◇) TO ARM IT.',check:()=>userArmed},
  {title:'5 · Deploy it',text:'Now click the heart again. The intervention is committed to the selected region and the heart gives you immediate visual feedback.',target:'#ciHeart',action:'CLICK THE HEART AGAIN TO DEPLOY.',check:()=>userDeployed},
  {title:'6 · End the turn',text:'END TURN is the moment the hidden simulation resolves the consequence. This is where your decision matters.',target:'#ciEnd',action:'CLICK END TURN ONCE.',check:()=>Number(state().day||0)>=1},
  {title:'7 · Read what happened',text:'Use STATUS to inspect the selected region and HEART STATUS. Then use the crisis panel when it appears: pick ONE response, commit it, and let the next turn resolve.',target:'[data-open="status"]',action:'OPEN STATUS AND LOOK AT THE RESULT.'},
  {title:'You know the loop',text:'SELECT → ARM → DEPLOY → END TURN → READ THE CONSEQUENCE → ANSWER THE NEXT CRISIS. Everything else is optional.',target:null,action:'CLICK FINISH GUIDE AND PLAY.'}
 ]:[
  {title:'Welcome',text:'You are protecting a fictional heart-tissue model.',target:'#newRun',action:'Click NEW RUN.'},
  {title:'Choose the problem',text:'Choose a scenario, then select a tissue cell on the tactical map.',target:'#scenario',action:'Leave the first scenario selected.'},
  {title:'Select tissue',text:'Click a tissue cell.',target:'#tissue',action:'CLICK A CELL.',check:()=>Number.isInteger(userSelected)},
  {title:'Use a tool',text:'Choose an intervention, then deploy it to your selected cell.',target:'#agentList',action:'Choose an intervention.'},
  {title:'End turn',text:'Resolve the consequence.',target:'#nextDay',action:'Click END TURN.',check:()=>Number(state().day||0)>=1}
 ];
 function ensure(){if($('beginnerGuide'))return;const panel=document.createElement('div');panel.id='beginnerGuide';panel.innerHTML='<div class="bg-card" role="dialog" aria-modal="false" aria-labelledby="bgTitle"><div class="bg-top"><span class="bg-kicker">BEGINNER COACH</span><span id="bgCount"></span></div><div class="bg-icon">C//B</div><h2 id="bgTitle"></h2><p id="bgText"></p><div class="bg-action"><b>DO THIS</b><span id="bgAction"></span></div><div class="bg-footer"><button id="bgBack" class="secondary" type="button">BACK</button><button id="bgNext" type="button">NEXT</button><button id="bgSkip" class="secondary" type="button">SKIP GUIDE</button></div></div><div id="bgArrow" aria-hidden="true"></div>';document.body.appendChild(panel);$('bgNext').onclick=next;$('bgBack').onclick=back;$('bgSkip').onclick=close;}
 function clear(){document.querySelectorAll('.bg-pulse').forEach(e=>e.classList.remove('bg-pulse'));$('bgArrow')?.classList.remove('show');}
 function placeCoach(target){const card=document.querySelector('.bg-card');if(!card)return;card.style.left='50%';card.style.top='50%';card.style.transform='translate(-50%,-50%)';if(!target){$('bgArrow')?.classList.remove('show');return}requestAnimationFrame(()=>{const r=target.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,gap=18,cw=card.offsetWidth,ch=card.offsetHeight,candidates=[{left:r.right+gap,top:r.top+r.height/2-ch/2},{left:r.left-cw-gap,top:r.top+r.height/2-ch/2},{left:r.left+r.width/2-cw/2,top:r.bottom+gap},{left:r.left+r.width/2-cw/2,top:r.top-ch-gap}],fits=p=>p.left>=12&&p.top>=12&&p.left+cw<=vw-12&&p.top+ch<=vh-12,p=candidates.find(fits)||{left:12,top:Math.max(12,Math.min(vh-ch-12,vh*.62))};card.style.left=`${p.left}px`;card.style.top=`${p.top}px`;card.style.transform='none';const cr=card.getBoundingClientRect(),dx=(r.left+r.width/2)-(cr.left+cr.width/2),dy=(r.top+r.height/2)-(cr.top+cr.height/2),len=Math.hypot(dx,dy),arrow=$('bgArrow');if(arrow&&len>55){arrow.style.left=`${cr.left+cr.width/2}px`;arrow.style.top=`${cr.top+cr.height/2}px`;arrow.style.width=`${Math.max(65,Math.min(len-8,Math.max(90,vw*.32)))}px`;arrow.style.transform=`translateY(-50%) rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;arrow.classList.add('show');}});}
 function render(){ensure();const s=steps()[step]||steps().at(-1);$('bgCount').textContent=`${step+1} / ${steps().length}`;$('bgTitle').textContent=s.title;$('bgText').textContent=s.text;$('bgAction').textContent=s.action;$('bgBack').disabled=step===0;$('bgNext').textContent=step===steps().length-1?'FINISH GUIDE':'NEXT';clear();const target=s.target?document.querySelector(s.target):null;if(target){target.classList.add('bg-pulse');placeCoach(target)}}
 function guard(){const s=steps()[step];if(s.check&&!s.check()){flash(immersive()?'Follow the highlighted cockpit action first.':'Follow the highlighted action first.');return false}return true;}
 function next(){if(!guard())return;if(step<steps().length-1){step++;render();}else close();}
 function back(){if(step>0){step--;render();}}
 function flash(msg){let t=$('bgToast');if(!t){t=document.createElement('div');t.id='bgToast';document.body.appendChild(t)}t.textContent=msg;clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),1800)}
 function close(){localStorage.setItem(KEY+':seen','1');$('beginnerGuide')?.remove();clear();seen=true;}
 function open(){guideOn=true;localStorage.setItem(KEY+':on','1');step=0;userSelected=false;userArmed=false;userDeployed=false;render();}
 function bindImmersive(){document.addEventListener('cb:immersive-selection',()=>{userSelected=true;if(step===2)render()});document.addEventListener('cb:immersive-intervention-armed',()=>{userArmed=true;if(step===4)render()});document.addEventListener('cb:immersive-deployed',()=>{userDeployed=true;if(step===5)render()});}
 function bindLegacy(){const cv=$('tissue');if(!cv||cv.dataset.cbSelectionBound==='1')return;cv.dataset.cbSelectionBound='1';cv.addEventListener('click',()=>{userSelected=true;render()},true);}
 function addHelp(){const old=$('beginnerHelp');if(old)old.remove();const b=document.createElement('button');b.id='beginnerHelp';b.className='secondary small';b.type='button';b.textContent='HOW TO PLAY';b.onclick=open;(document.querySelector('.controls')||document.querySelector('.ci-tools'))?.appendChild(b);}
 window.addEventListener('resize',()=>{const s=steps()[step];if(s?.target)placeCoach(document.querySelector(s.target));});
 function init(){addHelp();bindImmersive();bindLegacy();if(guideOn&&!seen)open();}
 window.CB_BeginnerGuide={open,flash,notifySelection:()=>{userSelected=true},notifyArmed:()=>{userArmed=true},notifyDeployed:()=>{userDeployed=true}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();