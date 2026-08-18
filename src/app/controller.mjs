import {Emitter} from '../runtime/emitter.mjs';
import {RenderScheduler} from '../runtime/render-scheduler.mjs';

export class CardiacAppController{
  #engine;#physiology;#document;#game=null;#selectedCell=0;#started=false;#emitter=new Emitter();#render;
  constructor({engine,physiology,documentRef=document}){
    if(!engine)throw new Error('engine required');
    if(!physiology)throw new Error('physiology required');
    this.#engine=engine;this.#physiology=physiology;this.#document=documentRef;this.#render=new RenderScheduler();
  }
  mount(){
    if(this.#started)return this;
    this.#bindControls();this.#loadOrCreate();this.#started=true;
    this.#emit('mounted');return this;
  }
  get state(){return this.#game}
  get selectedCell(){return this.#selectedCell}
  get selectedRegion(){return this.#game?.cells?.[this.#selectedCell]||null}
  get engine(){return this.#engine}
  on(type,listener){return this.#emitter.on(type,listener)}
  selectCell(index){if(!Number.isInteger(index)||!this.#game?.cells?.[index])return false;this.#selectedCell=index;this.#emit('selection');return true}
  newRun(scenario=this.#scenario(),seed=null){const actualSeed=Number.isInteger(seed)?seed>>>0:(Date.now()>>>0);this.#game=this.#engine.create(actualSeed,scenario);this.#physiology.seed?.(this.#game);this.#selectedCell=0;this.#emit('new-run');this.#render.schedule(()=>this.#requestLegacyRefresh());return this.#game}
  deploy(agentId,name=null){if(!this.#game)this.newRun();const result=this.#engine.place(this.#game,agentId,this.#selectedCell,name);this.#emit(result.ok?'deployment':'rejected',result);this.#render.schedule(()=>this.#requestLegacyRefresh());return result}
  advanceDay(){if(!this.#game)this.newRun();const scenario=this.#engine.scenarios[this.#game.scenario];const physiologyResult=this.#physiology.phase?.(this.#game,scenario);if(physiologyResult?.hidden)this.#game.hidden=physiologyResult.hidden;const result=this.#engine.resolve(this.#game);this.#emit('resolved',{...result,physiology:physiologyResult});this.#render.schedule(()=>this.#requestLegacyRefresh());return result}
  save(){if(!this.#game)return false;try{localStorage.setItem('cb-app-v5',JSON.stringify({game:this.#engine.snapshot(this.#game),selectedCell:this.#selectedCell}));return true}catch(error){console.warn('[CARDIAC//BREACH] save failed',error);return false}}
  load(){try{const raw=localStorage.getItem('cb-app-v5');if(!raw)return false;const parsed=JSON.parse(raw);this.#game=this.#engine.rehydrate(parsed.game);this.#selectedCell=Number.isInteger(parsed.selectedCell)?parsed.selectedCell:0;this.#physiology.seed?.(this.#game);this.#emit('load');return true}catch(error){console.warn('[CARDIAC//BREACH] load failed',error);return false}}
  dispose(){this.#emitter.clear();this.#render.dispose();}
  #loadOrCreate(){if(!this.load())this.newRun(this.#scenario())}
  #scenario(){return this.#document.getElementById('scenario')?.value||'ischemia'}
  #bindControls(){
    this.#document.getElementById('newRun')?.addEventListener('click',()=>this.newRun(this.#scenario()));
    this.#document.getElementById('nextDay')?.addEventListener('click',()=>this.advanceDay());
    this.#document.getElementById('scenario')?.addEventListener('change',e=>this.newRun(e.target.value));
    const tissue=this.#document.getElementById('tissue');
    tissue?.addEventListener('click',event=>{const rect=tissue.getBoundingClientRect();const x=Math.floor(((event.clientX-rect.left)/rect.width)*this.#engine.W);const y=Math.floor(((event.clientY-rect.top)/rect.height)*this.#engine.H);this.selectCell(y*this.#engine.W+x)});
    this.#document.addEventListener('keydown',event=>{
      if(event.target instanceof HTMLElement && ['INPUT','SELECT','TEXTAREA','BUTTON'].includes(event.target.tagName))return;
      const cell=this.#selectedCell,x=cell%this.#engine.W,y=Math.floor(cell/this.#engine.W);const delta=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='ArrowUp'?-this.#engine.W:event.key==='ArrowDown'?this.#engine.W:null;
      if(delta!==null){event.preventDefault();this.selectCell(Math.max(0,Math.min(this.#engine.W*this.#engine.H-1,cell+delta)))}
    });
  }
  #emit(type,payload){this.#emitter.emit(type,{type,payload,app:this})}
  #requestLegacyRefresh(){
    document.documentElement.dispatchEvent(new CustomEvent('cardiac:state-change',{detail:{app:this}}));
  }
}
