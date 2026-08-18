/* CARDIAC//BREACH — lightweight objective helper
 * Beginner onboarding is owned exclusively by beginner-tutorial.js.
 * This module must never create a blocking modal, coach, timer, or wrap gameplay controls.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const scenarioHelp={
  ischemia:'Keep OXYGEN and VIABILITY up. Start with Stabilizer + Vascular support.',
  inflammation:'Keep INFLAMMATION down. Start with Stabilizer + Immune modulator.',
  fibrosis:'Keep FIBROSIS down while protecting FUNCTION. Start with Stabilizer + Regenerator.',
  maturation:'Protect FUNCTION and mature cells. Start with Stabilizer + Maturation.',
  arrhythmia:'Keep ARRHYTHMIA down. Start with Stabilizer + Electrical buffer.'
 };
 const updateObjective=()=>{
  const box=$('cbObjectives');
  if(!box)return;
  const key=$('scenario')?.value||'ischemia';
  box.innerHTML=`<div class="simple-objective"><b>YOUR GOAL</b><span>${scenarioHelp[key]||scenarioHelp.ischemia}</span></div>`;
 };
 const init=()=>{
  if($('cbDirector'))return;
  const host=document.querySelector('.scenario-row');
  if(!host)return;
  const box=document.createElement('div');
  box.id='cbDirector';
  box.innerHTML='<div id="cbObjectives"></div><button class="secondary small" id="cbGuide" type="button">HOW TO PLAY</button>';
  host.after(box);
  $('cbGuide')?.addEventListener('click',()=>window.CB_BeginnerGuide?.open());
  $('scenario')?.addEventListener('change',updateObjective);
  updateObjective();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
