/* CARDIAC//BREACH — explicit application lifecycle
 * One owner for game lifecycle, input, state access, and rendering notifications.
 * Deep physiology and Q18 precision run inside the authoritative game core.
 */
(()=>{
  'use strict';
  const CORE=window.CBGameCoreV2;
  const PHYS=window.CBPhysiology;
  const PREC=window.CBPrecisionV4;
  if(!CORE)throw new Error('CBGameCoreV2 must load before app-controller.js');
  if(!PHYS)throw new Error('CBPhysiology must load before app-controller.js');
  if(!PREC)throw new Error('CBPrecisionV4 must load before app-controller.js');
  class CardiacApp{
    constructor({core,physiology,precision,documentRef=document}){this.core=core;this.physiology=physiology;this.precision=precision;this.document=documentRef;this.game=null;this.selectedCell=0;this.started=false;this.listeners=new Set();this.elements={}}
    mount(){if(this.started)return this;this.elements={newRun:this.document.getElementById('newRun'),nextDay:this.document.getElementById('nextDay'),scenario:this.document.getElementById('scenario'),tissue:this.document.getElementById('tissue')};this.#bindControls();this.#createInitialGame();this.started=true;this.#emit('mounted');return this}
    subscribe(listener){if(typeof listener!=='function')return()=>{};this.listeners.add(listener);return()=>this.listeners.delete(listener)}
    get state(){return this.game}
    get cell(){return this.game?.cells?.[this.selectedCell]||null}
    selectCell(index){if(!this.game?.cells?.[index])return false;this.selectedCell=index;this.#emit('selection');return true}
    newRun(scenario=this.elements.scenario?.value||'ischemia',seed=null){const actualSeed=Number.isInteger(seed)?seed>>>0:(Date.now()>>>0);this.game=this.core.createGame(actualSeed,scenario);this.game.agentRules=this.core.agentRules;this.physiology.seed(this.game);this.selectedCell=0;this.#emit('new-run');return this.game}
    deploy(agentId,name=null){if(!this.game)this.newRun();const result=this.core.place(this.game,agentId,this.selectedCell,name);if(result.ok)this.#emit('deployment',result);else this.#emit('rejected',result);return result}
    advanceDay(){if(!this.game)this.newRun();const scenario=this.core.scenarios[this.game.scenario];const hidden=this.physiology.phase(this.game,scenario);this.game.hidden=hidden.hidden;const dominant=this.physiology.classify(this.game);this.game.events.push({day:this.game.day,type:'PHYSIOLOGY',text:`Hidden state: ${dominant}.`,tone:'system'});const result=this.core.resolve(this.game);result.hidden=hidden;result.dominant=dominant;this.#emit('resolved',result);return result}
    save(){if(!this.game)return false;try{localStorage.setItem('cb-app-v4',JSON.stringify({game:this.core.snapshot(this.game),selectedCell:this.selectedCell}));return true}catch{return false}}
    load(){try{const raw=localStorage.getItem('cb-app-v4');if(!raw)return false;const parsed=JSON.parse(raw);this.game=parsed.game;this.selectedCell=parsed.selectedCell||0;this.game.agentRules=this.core.agentRules;this.game.rng=(function(seed){let s=seed||1;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296}})(this.game.seed);const precisionSnapshot=this.game.precision;delete this.game.precision;this.precision.attach(this.game,precisionSnapshot);this.physiology.seed(this.game);this.#emit('load');return true}catch(error){console.error('[CARDIAC//BREACH] load failed',error);return false}}
    #createInitialGame(){const saved=this.load();if(saved)return;this.newRun(this.elements.scenario?.value||'ischemia')}
    #bindControls(){this.elements.newRun?.addEventListener('click',()=>this.newRun(this.elements.scenario?.value||'ischemia'));this.elements.nextDay?.addEventListener('click',()=>this.advanceDay());this.elements.scenario?.addEventListener('change',e=>this.newRun(e.target.value));this.elements.tissue?.addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect();const x=Math.floor(((event.clientX-rect.left)/rect.width)*this.core.W);const y=Math.floor(((event.clientY-rect.top)/rect.height)*this.core.H);this.selectCell(y*this.core.W+x)})}
    #emit(type,payload=null){for(const listener of this.listeners){try{listener({type,payload,app:this})}catch(error){console.error('[CARDIAC//BREACH]',error)}}}
  }
  const mount=()=>{const app=new CardiacApp({core:CORE,physiology:PHYS,precision:PREC});app.mount();window.CBApp=app;document.documentElement.dataset.appReady='true'};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
