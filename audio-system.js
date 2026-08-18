/* CARDIAC//BREACH — original procedural audio
 * No external audio files. Uses Web Audio for lightweight, responsive feedback.
 */
(()=>{
 'use strict';
 const KEY='cb-audio-v1';
 const cfg={enabled:true,volume:.32};
 try{Object.assign(cfg,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{}
 let ctx=null,master=null,ambient=null;
 const $=id=>document.getElementById(id);
 function init(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  ctx=new AC();master=ctx.createGain();master.gain.value=cfg.volume;master.connect(ctx.destination);
  return ctx;
 }
 function ensure(){const c=init();if(c&&c.state==='suspended')c.resume();return c}
 function tone(freq,dur,type='sine',gain=.06,when=0,slide=0){const c=ensure();if(!c||!cfg.enabled)return;const t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)}
 function noise(dur=.12,gain=.035,when=0){const c=ensure();if(!c||!cfg.enabled)return;const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+when;f.type='bandpass';f.frequency.value=900;f.Q.value=.7;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.buffer=b;s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur)}
 const S={
  click:()=>tone(420,.055,'triangle',.035),
  confirm:()=>{tone(520,.07,'sine',.045);tone(780,.1,'sine',.04,'',.0)},
  deploy:()=>{tone(220,.12,'sawtooth',.03,0,150);tone(560,.16,'sine',.045,.08,80);noise(.07,.018,.02)},
  day:()=>{tone(155,.12,'sine',.035);tone(233,.16,'sine',.03,.1);tone(349,.2,'sine',.035,.2)},
  heal:()=>{tone(330,.12,'sine',.03);tone(495,.16,'sine',.035,.1);tone(660,.22,'sine',.04,.2)},
  warning:()=>{tone(180,.12,'square',.045);tone(140,.16,'square',.04,.15);noise(.08,.02,.02)},
  critical:()=>{tone(130,.16,'sawtooth',.055);tone(95,.2,'sawtooth',.045,.18);tone(75,.28,'sawtooth',.04,.4)},
  decision:()=>{tone(300,.1,'triangle',.03);tone(450,.13,'triangle',.03,.12)},
  resolve:()=>{tone(420,.1,'sine',.035);tone(630,.14,'sine',.035,.1);tone(840,.2,'sine',.04,.24)},
  fail:()=>{tone(180,.2,'sawtooth',.05,0,-80);tone(110,.35,'triangle',.045,.18,-50)},
  win:()=>{tone(392,.14,'sine',.04);tone(523,.14,'sine',.04,.12);tone(659,.18,'sine',.045,.24);tone(784,.28,'sine',.05,.42)},
  hover:()=>tone(680,.035,'sine',.018)
 };
 function ambientStart(){if(!cfg.enabled)return;const c=ensure();if(!c||ambient)return;ambient=c.createOscillator();const g=c.createGain();ambient.type='sine';ambient.frequency.value=58;g.gain.value=.006;ambient.connect(g);g.connect(master);ambient.start()}
 function ambientStop(){try{ambient?.stop()}catch{}ambient=null}
 function setEnabled(v){cfg.enabled=!!v;try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch{}if(!cfg.enabled)ambientStop()}
 function setVolume(v){cfg.volume=Math.max(0,Math.min(1,Number(v)||0));if(master)master.gain.value=cfg.volume;try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch{}}
 function bind(){
  document.addEventListener('pointerdown',e=>{if(e.target.closest('button,select'))S.click()},true);
  document.addEventListener('pointerover',e=>{if(e.target.closest('button'))S.hover()},true);
  const run=()=>{const b=$('newRun');b&&b.addEventListener('click',()=>{S.confirm();ambientStart()})};run();
  const adv=$('nextDay');if(adv)adv.addEventListener('click',()=>S.day());
  const map=$('tissue');if(map)map.addEventListener('click',()=>S.click());
  const observer=new MutationObserver(()=>{const ov=$('finalOverlay');const card=ov?.querySelector('.decision-card,.debrief-card');if(!card)return;if(card.classList.contains('decision-card'))S.decision();else if(card.classList.contains('debrief-card'))S.win()});
  const ov=$('finalOverlay');if(ov)observer.observe(ov,{childList:true,subtree:true});
  const log=$('log');if(log){const mo=new MutationObserver(()=>{const txt=(log.textContent||'').toLowerCase();if(txt.includes('critical'))S.warning();});mo.observe(log,{childList:true,subtree:true})}
 }
 window.CB_Audio={...S,init:ensure,setEnabled,setVolume,ambientStart,ambientStop};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,300));else setTimeout(bind,300);
})();
