/* CARDIAC//BREACH — single beginner tutorial
 * V5: explicit user-selection state; never infers a click from a default cell index.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),KEY='cb-beginner-tutorial-v5';
 let guideOn=localStorage.getItem(KEY+':on')!=='0',seen=localStorage.getItem(KEY+':seen')==='1',step=0,userSelectedCell=null;
 const selected=()=>Number.isInteger(userSelectedCell)||Number.isInteger(Number($('tissue')?.dataset.cbUserSelectedCell));
 const agents=()=>window.CBCompat?.agents||window.CBApp?.state?.agents||[];
 const day=()=>Number(window.CBCompat?.day??window.CBApp?.state?.day??0);
 const steps=[
  {title:'Welcome — what is this game?',text:'You are protecting a fictional heart-tissue model. The colored squares are pieces of tissue. Keep the heart alive while problems develop.',target:null,action:'Read this, then click NEXT.'},
  {title:'1 · Start the game',text:'NEW RUN creates a fresh run. Nothing advances until you choose to move the game forward.',target:'#newRun',action:'Click NEW RUN.'},
  {title:'2 · Choose the problem',text:'SCENARIO is simply the problem you are managing. For your first run, leave it on Ischemic injury.',target:'#scenario',action:'Leave SCENARIO on Ischemic injury.',check:()=>($('scenario')?.value==='ischemia')},
  {title:'3 · Select tissue',text:'The large grid is your board. Each square is a small piece of tissue. Click any square. It should light up and the region number should change.',target:'#tissue',action:'CLICK ANY SQUARE ON THE TISSUE MAP.',check:()=>selected()},
  {title:'4 · Understand your selection',text:'The selected region is simply the place you clicked. The inspector tells you what is happening there.',target:'#inspector',action:'Look at SELECTED REGION.'},
  {title:'5 · Read the heart',text:'VIABILITY means how much tissue is alive. FUNCTION means how well it works. OXYGEN is supply. INFLAMMATION, FIBROSIS and ARRHYTHMIA are problems, so lower is better. ENERGY is your spending budget.',target:'#viability',action:'Look at HEART STATUS.'},
  {title:'6 · What is an intervention?',text:'An intervention is a tool you can use to help the tissue. Each one has a different job. Start with STABILIZER.',target:'#agentList',action:'Find STABILIZER.'},
  {title:'7 · Put an intervention on tissue',text:'Select a cell first. Then deploy STABILIZER. The selected cell gets an ACTIVE marker. The local response resolves when you end the turn.',target:'#agentList',action:'CLICK A CELL → STABILIZER → DEPLOY.',check:()=>agents().some(a=>a&&a.targetCell!==undefined)},
  {title:'8 · End the turn',text:'END TURN resolves the intervention and lets the tissue respond.',target:'#nextDay',action:'Click END TURN once.',check:()=>day()>=1},
  {title:'9 · Watch the consequence',text:'Now compare the selected region and heart status. Look for what improved and what became worse.',target:'#inspector',action:'Look at the selected region again.'},
  {title:'10 · Make your next decision',text:'Do not try to fix everything. Find the most urgent problem, choose one useful intervention, and continue.',target:'#agentList',action:'Choose your next intervention.'},
  {title:'You know the loop',text:'START → CHOOSE → SELECT A CELL → DEPLOY → END TURN → CHECK → REACT. Everything else is optional.',target:null,action:'Click FINISH GUIDE and play.'}
 ];
 function ensure(){
  if($('beginnerGuide'))return;
  const panel=document.createElement('div');panel.id='beginnerGuide';
  panel.innerHTML='<div class="bg-card" role="dialog" aria-modal="false" aria-labelledby="bgTitle"><div class="bg-top"><span class="bg-kicker">BEGINNER COACH</span><span id="bgCount"></span></div><div class="bg-icon">C//B</div><h2 id="bgTitle"></h2><p id="bgText"></p><div class="bg-action"><b>DO THIS</b><span id="bgAction"></span></div><div class="bg-footer"><button id="bgBack" class="secondary" type="button">BACK</button><button id="bgNext" type="button">NEXT</button><button id="bgSkip" class="secondary" type="button">SKIP GUIDE</button></div></div><div id="bgArrow" aria-hidden="true"></div>';
  document.body.appendChild(panel);$('bgNext').onclick=next;$('bgBack').onclick=back;$('bgSkip').onclick=close;
 }
 function bindSelection(){
  const cv=$('tissue');if(!cv||cv.dataset.cbSelectionBound==='1')return;
  cv.dataset.cbSelectionBound='1';
  cv.addEventListener('click',event=>{
   const r=cv.getBoundingClientRect(),W=18,H=12;
   const x=Math.max(0,Math.min(W-1,Math.floor(((event.clientX-r.left)/r.width)*W)));
   const y=Math.max(0,Math.min(H-1,Math.floor(((event.clientY-r.top)/r.height)*H)));
   const index=y*W+x;
   userSelectedCell=index;cv.dataset.cbUserSelectedCell=String(index);
   try{window.CBApp?.selectCell?.(index);}catch{}
   try{if(window.CBCompat)window.CBCompat.selected=index;}catch{}
   document.dispatchEvent(new CustomEvent('cb:tissue-selected',{detail:{index,x,y}}));
   if(step===3)flash(`REGION ${index+1} SELECTED`);
   if(step===3)render();
  },true);
  $('newRun')?.addEventListener('click',()=>{userSelectedCell=null;delete cv.dataset.cbUserSelectedCell;},true);
 }
 function clear(){document.querySelectorAll('.bg-pulse').forEach(e=>e.classList.remove('bg-pulse'));$('bgArrow')?.classList.remove('show')}
 function placeCoach(target){
  const card=document.querySelector('.bg-card');if(!card)return;
  card.style.left='50%';card.style.top='50%';card.style.transform='translate(-50%,-50%)';
  if(!target){$('bgArrow')?.classList.remove('show');return;}
  requestAnimationFrame(()=>{
   const r=target.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,gap=22,cw=card.offsetWidth,ch=card.offsetHeight;
   const candidates=[{left:r.right+gap,top:r.top+r.height/2-ch/2},{left:r.left-cw-gap,top:r.top+r.height/2-ch/2},{left:r.left+r.width/2-cw/2,top:r.bottom+gap},{left:r.left+r.width/2-cw/2,top:r.top-ch-gap}];
   const fits=p=>p.left>=12&&p.top>=12&&p.left+cw<=vw-12&&p.top+ch<=vh-12;
   const p=candidates.find(fits)||{left:12,top:Math.max(12,Math.min(vh-ch-12,r.top<vh/2?vh-ch-12:12))};
   card.style.left=`${p.left}px`;card.style.top=`${p.top}px`;card.style.transform='none';
   const cr=card.getBoundingClientRect(),dx=(r.left+r.width/2)-(cr.left+cr.width/2),dy=(r.top+r.height/2)-(cr.top+cr.height/2),len=Math.hypot(dx,dy),arrow=$('bgArrow');
   if(arrow&&len>55){arrow.style.left=`${cr.left+cr.width/2}px`;arrow.style.top=`${cr.top+cr.height/2}px`;arrow.style.width=`${Math.max(70,Math.min(len-8,Math.max(90,vw*.34)))}px`;arrow.style.transform=`translateY(-50%) rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;arrow.classList.add('show');}
  });
 }
 function render(){ensure();bindSelection();const s=steps[step];$('bgCount').textContent=`${step+1} / ${steps.length}`;$('bgTitle').textContent=s.title;$('bgText').textContent=s.text;$('bgAction').textContent=s.action;$('bgBack').disabled=step===0;$('bgNext').textContent=step===steps.length-1?'FINISH GUIDE':'NEXT';clear();const target=s.target?document.querySelector(s.target):null;if(target){target.classList.add('bg-pulse');target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});placeCoach(target);}}
 function guard(){const s=steps[step];if(s.check&&!s.check()){flash(step===3?'Click a square on the tissue map first.':'Follow the highlighted action first.');return false;}return true;}
 function next(){if(!guard())return;if(step<steps.length-1){step++;render();}else close();}
 function back(){if(step>0){step--;render();}}
 function flash(msg){let t=$('bgToast');if(!t){t=document.createElement('div');t.id='bgToast';document.body.appendChild(t)}t.textContent=msg;clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),1800)}
 function close(){localStorage.setItem(KEY+':seen','1');$('beginnerGuide')?.remove();clear();seen=true;}
 function open(){guideOn=true;localStorage.setItem(KEY+':on','1');step=0;render();}
 function addHelp(){const old=$('beginnerHelp');if(old)old.remove();const b=document.createElement('button');b.id='beginnerHelp';b.className='secondary small';b.type='button';b.textContent='HOW TO PLAY';b.onclick=open;document.querySelector('.controls')?.appendChild(b)}
 window.addEventListener('resize',()=>{const s=steps[step];if(s?.target)placeCoach(document.querySelector(s.target));});
 document.addEventListener('cb:tissue-selected',()=>{if(step===3)render();});
 function init(){addHelp();bindSelection();if(guideOn&&!seen)open();}
 window.CB_BeginnerGuide={open,flash};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
