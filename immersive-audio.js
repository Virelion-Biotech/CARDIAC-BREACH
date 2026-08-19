/* CARDIAC//BREACH — immersive game audio bridge
 * Event-driven cockpit audio. Synthesizes interface/mechanical cues with Web Audio.
 */
(()=>{
'use strict';
let ctx=null,master=null,lastPanel='';
const gain=0.16;
function ensure(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=gain;master.connect(ctx.destination)}
 if(ctx.state==='suspended')ctx.resume();return ctx;
}
function osc(freq,dur,type='sine',vol=.05,delay=0,slide=0){
 const c=ensure();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,freq+slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)
}
function click(){osc(280,.045,'triangle',.025);osc(470,.055,'sine',.018,.025)}
function panelOpen(){osc(110,.10,'sine',.018);osc(310,.12,'triangle',.028,.045,90);osc(620,.07,'sine',.018,.09,80)}
function panelClose(){osc(330,.08,'triangle',.022);osc(180,.12,'sine',.018,.035,-50)}
function arm(){osc(220,.11,'square',.018);osc(440,.12,'triangle',.038,.06,70);osc(660,.08,'sine',.022,.13)}
function select(){osc(360,.06,'sine',.024);osc(540,.10,'triangle',.028,.04)}
function deploy(){osc(120,.16,'sawtooth',.025,0,120);osc(300,.15,'triangle',.038,.07,120);osc(760,.12,'sine',.025,.15,-60)}
function turn(){osc(84,.16,'sine',.016);osc(168,.14,'sine',.022,.10);osc(252,.18,'triangle',.03,.19,100)}
function crisis(){osc(82,.18,'sawtooth',.04);osc(118,.18,'square',.025,.16);osc(72,.26,'sawtooth',.03,.32,-18)}
function resolve(){osc(392,.08,'sine',.025);osc(523,.10,'sine',.028,.08);osc(659,.16,'sine',.032,.17)}
function fail(){osc(170,.18,'sawtooth',.035,0,-70);osc(95,.28,'triangle',.03,.15,-40)}
function win(){[392,523,659,784].forEach((f,i)=>osc(f,.12+(i*.03),'sine',.03,i*.09))}
function bind(){
 document.addEventListener('pointerdown',e=>{
  const t=e.target;if(t.closest('#ciPanel [data-close]')){panelClose();return}
  if(t.closest('.ci-tools button')){click();return}
  if(t.closest('.ci-ability')){arm();return}
  if(t.closest('.ci-end')){turn();return}
  if(t.closest('.ci-crisis-inner [data-agent]')){deploy();return}
  if(t.closest('#ciHeart')){select();return}
 },true);
 const panel=document.getElementById('ciPanel');if(panel)new MutationObserver(()=>{const open=panel.classList.contains('open');if(open&&!lastPanel)panelOpen();if(!open&&lastPanel)panelClose();lastPanel=open?'1':''}).observe(panel,{attributes:true,attributeFilter:['class']});
 document.addEventListener('cb:immersive-crisis',crisis);
 document.addEventListener('cb:immersive-selection',select);
 document.addEventListener('cb:immersive-deployed',deploy);
 document.addEventListener('cb:immersive-turn-ended',turn);
 window.CBImmersiveAudio={click,panelOpen,panelClose,arm,select,deploy,turn,crisis,resolve,fail,win,enable:()=>{ensure()}};
}
function boot(){document.addEventListener('pointerdown',()=>ensure(),{once:true,passive:true});bind()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
