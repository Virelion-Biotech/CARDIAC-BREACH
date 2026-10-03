/* Final interaction bridge: makes the final game layer authoritative without rewriting the simulator core. */
(()=>{
 const $=id=>document.getElementById(id);
 const recommendations={ischemia:['stabilizer','vascular'],inflammation:['stabilizer','immune'],fibrosis:['stabilizer','regenerator'],maturation:['stabilizer','maturation'],arrhythmia:['vascular','electrical']};
 function markRecommendations(){
  const ids=recommendations[$('scenario')?.value]||[];
  document.querySelectorAll('#agentList .agent').forEach(row=>{const b=row.querySelector('button[onclick]');const match=b?.getAttribute('onclick')?.match(/deploy\('([^']+)'/);row.classList.toggle('recommended',!!match&&ids.includes(match[1]));});
 }
 document.addEventListener('click',e=>{
  const t=e.target.closest?.('#newRun,#nextDay');if(!t)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(t.id==='newRun'){window.reset?.();markRecommendations()}else{window.advance?.()}
 },true);
 $('scenario')?.addEventListener('change',markRecommendations);
 new MutationObserver(markRecommendations).observe($('agentList')||document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{if(e.target.matches?.('input,textarea,select'))return;if(e.key==='Enter'&&document.activeElement?.id==='nextDay')$('nextDay')?.click()});
 setTimeout(markRecommendations,250);
})();
