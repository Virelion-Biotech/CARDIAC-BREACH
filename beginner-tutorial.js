/* CARDIAC//BREACH — single beginner tutorial
 * Zero science / CS assumptions. One coach at a time; never duplicates the director.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),KEY='cb-beginner-tutorial-v4';
 let guideOn=localStorage.getItem(KEY+':on')!=='0',seen=localStorage.getItem(KEY+':seen')==='1',step=0;
 const steps=[
  {title:'Welcome — what is this game?',text:'You are protecting a completely fictional heart-tissue model. The colored squares are pieces of tissue. Your job is to keep the tissue alive while problems develop.',target:null,action:'Read this, then click NEXT.'},
  {title:'1 · Start the game',text:'NEW RUN creates a fresh run. Nothing advances until you choose to move the game forward.',target:'#newRun',action:'Click NEW RUN.',must:()=>true},
  {title:'2 · Choose the problem',text:'SCENARIO is simply the problem you are managing. For your first run, leave it on Ischemic injury.',target:'#scenario',action:'Choose Ischemic injury.',check:()=>($('scenario')?.value==='ischemia')},
  {title:'3 · Meet the tissue map',text:'The large grid is your board. Every square is one small piece of fictional tissue. Click a square to select it.',target:'#tissue',action:'Click one square on the tissue map.',check:()=>typeof window.CBApp?.selectedCell==='number'},
  {title:'4 · What is a region?',text:'A region is simply a location on the board. The inspector tells you what is happening there. You do not need scientific knowledge.',target:'#inspector',action:'Look at the selected-region panel.'},
  {title:'5 · What do the numbers mean?',text:'VIABILITY = how much tissue is alive. FUNCTION = how well it works. OXYGEN = supply. INFLAMMATION, FIBROSIS and ARRHYTHMIA are problems, so lower is better. ENERGY is your spending budget.',target:'#viability',action:'Look at the heart-status numbers.'},
  {title:'6 · What is an agent?',text:'An agent is simply a tool you can use to help the tissue. Each has a different job and cost. Start with STABILIZER.',target:'#agentList',action:'Find STABILIZER in the interventions panel.'},
  {title:'7 · Put an agent on a cell',text:'First select the cell you want to help. Then use DEPLOY on the agent. An active ring appears on that cell. The local tissue response resolves when you end the turn.',target:'#agentList',action:'Click a cell → STABILIZER → DEPLOY.',check:()=>Array.isArray(window.CBApp?.state?.agents)&&window.CBApp.state.agents.length>0},
  {title:'8 · Advance the game',text:'END TURN moves the simulation forward. The intervention now affects its target and the rest of the tissue responds.',target:'#nextDay',action:'Click END TURN once.',check:()=>Number(window.CBApp?.state?.day||0)>=1},
  {title:'9 · Check what changed',text:'Look at the selected region and then the main heart-status bars. You are looking for what improved and what got worse.',target:'#inspector',action:'Compare the region before and after the turn.'},
  {title:'10 · React',text:'You do not need to fix everything. Find the most urgent problem, choose one useful intervention, and continue.',target:'#agentList',action:'Make one thoughtful next move.'},
  {title:'You know the loop',text:'START → CHOOSE → SELECT A CELL → DEPLOY → END TURN → CHECK → REACT. Everything else is optional advanced information.',target:null,action:'Click FINISH GUIDE and play.'}
 ];
 function ensure(){
  if($('beginnerGuide'))return;
  const panel=document.createElement('div');panel.id='beginnerGuide';
  panel.innerHTML='<div class="bg-card" role="dialog" aria-modal="false" aria-labelledby="bgTitle"><div class="bg-top"><span class="bg-kicker">BEGINNER COACH</span><span id="bgCount"></span></div><div class="bg-icon">C//B</div><h2 id="bgTitle"></h2><p id="bgText"></p><div class="bg-action"><b>DO THIS</b><span id="bgAction"></span></div><div class="bg-footer"><button id="bgBack" class="secondary" type="button">BACK</button><button id="bgNext" type="button">NEXT</button><button id="bgSkip" class="secondary" type="button">SKIP GUIDE</button></div></div><div id="bgArrow" aria-hidden="true"></div>';
  document.body.appendChild(panel);$('bgNext').onclick=next;$('bgBack').onclick=back;$('bgSkip').onclick=close;
 }
 function clear(){document.querySelectorAll('.bg-pulse').forEach(e=>e.classList.remove('bg-pulse'));$('bgArrow')?.classList.remove('show')}
 function placeCoach(target){
  const card=document.querySelector('.bg-card');if(!card)return;
  card.style.left='50%';card.style.top='50%';card.style.transform='translate(-50%,-50%)';
  if(!target){$('bgArrow')?.classList.remove('show');return}
  requestAnimationFrame(()=>{
    const r=target.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,gap=22;
    const cw=card.offsetWidth,ch=card.offsetHeight;
    const candidates=[
      {left:r.right+gap,top:r.top+r.height/2-ch/2},
      {left:r.left-cw-gap,top:r.top+r.height/2-ch/2},
      {left:r.left+r.width/2-cw/2,top:r.bottom+gap},
      {left:r.left+r.width/2-cw/2,top:r.top-ch-gap}
    ];
    const fits=p=>p.left>=12&&p.top>=12&&p.left+cw<=vw-12&&p.top+ch<=vh-12;
    const p=candidates.find(fits)||{left:(vw-cw)/2,top:Math.max(12,Math.min(vh-ch-12,r.top>vh/2?12:vh-ch-12))};
    card.style.left=`${p.left}px`;card.style.top=`${p.top}px`;card.style.transform='none';
    const cr=card.getBoundingClientRect(),ax=r.left+r.width/2,ay=r.top+r.height/2,cx=cr.left+cr.width/2,cy=cr.top+cr.height/2,dx=ax-cx,dy=ay-cy,len=Math.hypot(dx,dy),arrow=$('bgArrow');
    if(arrow&&len>55){arrow.style.left=`${cx}px`;arrow.style.top=`${cy}px`;arrow.style.width=`${Math.max(65,Math.min(len-10,Math.max(90,vw*.35)))}px`;arrow.style.transform=`translateY(-50%) rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;arrow.classList.add('show')}
  });
 }
 function render(){ensure();const s=steps[step];$('bgCount').textContent=`${step+1} / ${steps.length}`;$('bgTitle').textContent=s.title;$('bgText').textContent=s.text;$('bgAction').textContent=s.action;$('bgBack').disabled=step===0;$('bgNext').textContent=step===steps.length-1?'FINISH GUIDE':'NEXT';clear();const target=s.target?document.querySelector(s.target):null;if(target){target.classList.add('bg-pulse');target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});placeCoach(target)} }
 function guard(){const s=steps[step];if(s.check&&!s.check()){flash('Follow the highlighted action first.');return false}return true}
 function next(){if(!guard())return;if(step<steps.length-1){step++;render()}else close()}
 function back(){if(step>0){step--;render()}}
 function flash(msg){let t=$('bgToast');if(!t){t=document.createElement('div');t.id='bgToast';document.body.appendChild(t)}t.textContent=msg;clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),1800)}
 function close(){localStorage.setItem(KEY+':seen','1');$('beginnerGuide')?.remove();clear();seen=true}
 function open(){guideOn=true;localStorage.setItem(KEY+':on','1');step=0;render()}
 function addHelp(){const old=$('beginnerHelp');if(old)old.remove();const b=document.createElement('button');b.id='beginnerHelp';b.className='secondary small';b.type='button';b.textContent='HOW TO PLAY';b.onclick=open;document.querySelector('.controls')?.appendChild(b)}
 window.addEventListener('resize',()=>{const s=steps[step];if(s?.target)placeCoach(document.querySelector(s.target))});
 function init(){addHelp();if(guideOn&&!seen)open()}
 window.CB_BeginnerGuide={open,flash};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
