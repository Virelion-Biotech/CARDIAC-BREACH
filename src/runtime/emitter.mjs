export class Emitter{
  #listeners=new Map();
  on(type,listener){
    if(typeof listener!=='function') return ()=>{};
    const set=this.#listeners.get(type)||new Set();
    set.add(listener);this.#listeners.set(type,set);
    return ()=>set.delete(listener);
  }
  emit(type,payload){
    const set=this.#listeners.get(type);if(!set)return;
    for(const listener of [...set]){try{listener(payload)}catch(error){queueMicrotask(()=>{throw error})}}
  }
  clear(){this.#listeners.clear()}
}
