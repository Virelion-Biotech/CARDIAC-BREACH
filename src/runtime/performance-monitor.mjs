export class PerformanceMonitor{
  #samples=[];#limit=120;
  measure(label,fn){
    const start=performance.now();
    try{return fn()}
    finally{this.record(label,performance.now()-start)}
  }
  record(label,duration){
    this.#samples.push({label,duration,t:performance.now()});
    if(this.#samples.length>this.#limit)this.#samples.shift();
    if(duration>16)this.#warn(label,duration);
  }
  snapshot(){
    const byLabel={};
    for(const sample of this.#samples)(byLabel[sample.label]??=[]).push(sample.duration);
    return Object.fromEntries(Object.entries(byLabel).map(([label,values])=>{
      const sorted=[...values].sort((a,b)=>a-b);
      const p95=sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]||0;
      return [label,{count:values.length,max:Math.max(...values),mean:values.reduce((a,b)=>a+b,0)/values.length,p95}];
    }));
  }
  #warn(label,duration){console.debug(`[CARDIAC//BREACH perf] ${label}: ${duration.toFixed(2)}ms`)}
}
