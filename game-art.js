/* CARDIAC//BREACH — authored visual system
 * Uses a consistent atlas, 2x-style icon sizing, state-driven illustration,
 * spatial placement markers, scenario cards, and contextual event art.
 * Inspired by open-source game asset discipline: one visual language,
 * predictable lighting, readable silhouettes, and a small number of high-signal accents.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const scenarios=['ischemia','inflammation','fibrosis','maturation','arrhythmia'];
const scenarioLabels={
 ischemia:['ISCHAEMIA','PERFUSION'],inflammation:['INFLAMMATION','SIGNAL CASCADE'],fibrosis:['FIBROSIS','REMODELING'],maturation:['MATURATION','RECOVERY'],arrhythmia:['ARRHYTHMIA','CONDUCTION']
};
const agentIndex={stabilizer:0,regenerator:1,immune:2,vascular:3,maturation:4,electrical:5};
function addScenarioStrip(){
 if($('scenarioArtStrip'))return;const strip=document.createElement('div');strip.id='scenarioArtStrip';strip.className='scenario-art-strip';
 strip.innerHTML=scenarios.map(s=>`<button class="scenario-art-card" data-scenario="${s}" type="button"><span class="sac-noise"></span><b>${scenarioLabels[s][0]}</b><small>${scenarioLabels[s][1]}</small><i></i></button>`).join('');
 const anchor=document.querySelector('.scenario-row');anchor?.after(strip);
 strip.querySelectorAll('.scenario-art-card').forEach(card=>{const pick=()=>{const sel=$('scenario');if(sel){sel.value=card.dataset.scenario;sel.dispatchEvent(new Event('change',{bubbles:true}))}};card.addEventListener('click',pick)});syncScenarioArt();
}
function syncScenarioArt(){const s=$('scenario')?.value||'ischemia';document.querySelectorAll('.scenario-art-card').forEach(c=>c.classList.toggle('active',c.dataset.scenario===s));document.body.dataset.scenario=s}
function addAgentArt(){
 const list=$('agentList');if(!list||list.dataset.atlasReady)return;list.dataset.atlasReady='1';
 const paint=()=>list.querySelectorAll('.agent').forEach(row=>{
  if(row.querySelector('.agent-art'))return;
  const btn=row.querySelector('button[onclick*="deploy("]');const id=btn?.getAttribute('onclick')?.match(/deploy\('([^']+)'/)?.[1];if(id===undefined)return;
  const art=document.createElement('span');art.className='agent-art';art.setAttribute('aria-hidden','true');art.dataset.agent=id;art.style.setProperty('--atlas-x',`${agentIndex[id]*100}%`);
  const content=row.querySelector(':scope > div');if(content){const wrap=document.createElement('div');wrap.className='agent-art-wrap';row.insertBefore(wrap,content);wrap.append(art,content)}
 });
 new MutationObserver(paint).observe(list,{childList:true,subtree:true});paint();
}
function enhanceLegend(){const panel=document.querySelector('.tissue-panel');if(!panel||$('tissueArtKey'))return;const key=document.createElement('div');key.id='tissueArtKey';key.className='tissue-art-key';key.innerHTML='<span><i class="ok"></i>HEALTHY</span><span><i class="stress"></i>STRESSED</span><span><i class="damage"></i>DAMAGED</span><span><i class="scar"></i>FIBROTIC</span><span><i class="recover"></i>RECOVERING</span>';panel.querySelector('.legend')?.after(key)}
function eventArt(){const ov=$('finalOverlay');if(!ov)return;new MutationObserver(()=>{const card=ov.querySelector('.decision-card,.why-card,.debrief-card');if(!card)return;let art=card.querySelector('.event-art');if(!art){art=document.createElement('div');art.className='event-art';card.insertBefore(art,card.querySelector('h2'));}const title=(card.querySelector('h2')?.textContent||'').toLowerCase();art.dataset.type=title.includes('oxygen')||title.includes('perfusion')?'perfusion':title.includes('inflamm')||title.includes('feedback')?'signal':title.includes('stress')?'stress':'default';}).observe(ov,{childList:true,subtree:true})}
function drawTreatment(){
 const cv=$('tissue');if(!cv||!window.cells?.length)return;const c=cv.getContext('2d');const cw=cv.width/18,ch=cv.height/12;const now=performance.now()/1000;
 // subtle tissue-material treatment: shared grain, membrane glints, vascular threads.
 c.save();c.globalCompositeOperation='screen';
 for(let y=0;y<12;y+=2){c.strokeStyle='rgba(142,240,208,.018)';c.lineWidth=1;c.beginPath();c.moveTo(0,y*ch+.5);c.lineTo(cv.width,y*ch+.5);c.stroke()}
 for(let x=0;x<18;x+=3){c.strokeStyle='rgba(127,183,255,.014)';c.beginPath();c.moveTo(x*cw+.5,0);c.lineTo(x*cw+.5,cv.height);c.stroke()}
 // network lines make the tissue read as a living field rather than a spreadsheet grid.
 c.lineWidth=1.25;c.strokeStyle='rgba(127,183,255,.20)';
 const arteries=[[[1,9],[4,7],[8,6],[12,4],[16,3]],[[3,10],[5,8],[7,8],[10,9],[14,8]],[[2,2],[5,3],[8,4],[11,3],[15,5]]];
 arteries.forEach(path=>{c.beginPath();path.forEach((p,i)=>{const x=p[0]*cw+cw/2,y=p[1]*ch+ch/2;i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()});
 // placed agents become physical anchors on the field.
 (window.agents||[]).filter(a=>a.targetCell!==undefined).forEach(a=>{const cell=window.cells[a.targetCell];if(!cell)return;const x=cell.x*cw+cw/2,y=cell.y*ch+ch/2,p=.5+.5*Math.sin(now*4+a.targetCell);c.strokeStyle='rgba(142,240,208,.75)';c.lineWidth=2;c.beginPath();c.arc(x,y,Math.min(cw,ch)*(.19+.03*p),0,Math.PI*2);c.stroke();c.fillStyle='rgba(216,243,106,.9)';c.beginPath();c.arc(x,y,2.8+2*p,0,Math.PI*2);c.fill()});
 // selected region gets a more graphic reticle.
 if(typeof window.selected==='number'){const cell=window.cells[window.selected];if(cell){const x=cell.x*cw+cw/2,y=cell.y*ch+ch/2;c.strokeStyle='rgba(255,255,255,.92)';c.lineWidth=1.5;c.setLineDash([5,4]);c.strokeRect(x-cw*.38,y-ch*.38,cw*.76,ch*.76);c.setLineDash([]);c.strokeStyle='rgba(216,243,106,.35)';c.beginPath();c.arc(x,y,Math.min(cw,ch)*.48,0,Math.PI*2);c.stroke()}}
 // vignette
 const g=c.createRadialGradient(cv.width*.5,cv.height*.5,cv.width*.22,cv.width*.5,cv.height*.5,cv.width*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.30)');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);c.restore();
}
function wrapDraw(){const original=window.draw;if(!original||original.__artWrapped)return;const wrapped=function(){original();drawTreatment()};wrapped.__artWrapped=true;window.draw=wrapped}
function init(){addScenarioStrip();addAgentArt();enhanceLegend();eventArt();wrapDraw();$('scenario')?.addEventListener('change',syncScenarioArt)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,260));else setTimeout(init,260);
})();