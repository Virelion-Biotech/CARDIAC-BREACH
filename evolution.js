/* CARDIAC//BREACH v0.7 — safe synthetic agent evolution layer.
   Evolves abstract game-policy traits only; it does not model real biological procedures. */
const Evolution={
  pool:[],generation:0,
  traits:['stability','recovery','inflammationControl','perfusion','maturation','electricalSafety'],
  make(id){return {id:id||crypto.randomUUID(),name:'PROTO-'+Math.floor(Math.random()*900+100),level:1,fitness:0,experience:0,traits:Object.fromEntries(this.traits.map(t=>[t,Math.random()]))}},
  seed(n=8){this.pool=Array.from({length:n},(_,i)=>this.make('agent-'+(i+1)));this.generation=1;return this.pool},
  evaluate(agent,outcome){const weights={stability:.17,recovery:.20,inflammationControl:.17,perfusion:.16,maturation:.14,electricalSafety:.16};const traitScore=Object.entries(weights).reduce((s,[k,w])=>s+w*agent.traits[k]*100,0);agent.fitness=Math.max(0,Math.min(100,traitScore*.60+outcome*.40));agent.experience++;return agent.fitness},
  mutate(agent){const child=JSON.parse(JSON.stringify(agent));child.id=crypto.randomUUID();child.name=agent.name+'-M';child.level=agent.level+1;this.traits.forEach(t=>{if(Math.random()<.65)child.traits[t]=Math.max(0,Math.min(1,child.traits[t]+(Math.random()-.5)*.16))});return child},
  evolve(outcome=50){this.pool.forEach(a=>this.evaluate(a,outcome));this.pool.sort((a,b)=>b.fitness-a.fitness);const elite=this.pool.slice(0,Math.max(2,Math.ceil(this.pool.length*.25)));this.pool=[...elite,...elite.flatMap(a=>[this.mutate(a),this.mutate(a)])].slice(0,8);this.generation++;return this.pool},
  summary(){return {generation:this.generation,population:this.pool.length,agents:this.pool.map(a=>({name:a.name,level:a.level,fitness:+a.fitness.toFixed(1),experience:a.experience,traits:a.traits}))}}
};
window.Evolution=Evolution;
