export class RenderScheduler{
  #scheduled=false;
  #frame=0;
  #jobs=new Set();
  #disposed=false;
  schedule(job){
    if(this.#disposed||typeof job!=='function')return;
    this.#jobs.add(job);
    if(this.#scheduled)return;
    this.#scheduled=true;
    this.#frame=requestAnimationFrame(()=>{
      this.#scheduled=false;
      const jobs=[...this.#jobs];
      this.#jobs.clear();
      for(const fn of jobs){try{fn()}catch(error){console.error('[CARDIAC//BREACH render]',error)}}
    });
  }
  dispose(){this.#disposed=true;this.#jobs.clear();if(this.#frame)cancelAnimationFrame(this.#frame)}
}
