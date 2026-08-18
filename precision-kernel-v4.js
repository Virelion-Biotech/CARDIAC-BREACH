/* CARDIAC//BREACH v4 — Q18 deterministic precision kernel
 * Internal-only numerical infrastructure.
 *
 * Values are represented as integer fixed-point units:
 *   1 internal unit = 1e-18 model units.
 *
 * This is not pretending the browser has NVIDIA tensor hardware. The goal is
 * reproducible, quantized, auditable arithmetic with explicit microsteps,
 * not fake numerical precision. Presentation code should use the float view.
 */
(()=>{
  'use strict';
  const SCALE=1000000000000000000n,ZERO=0n,ONE=SCALE,LIMIT=100n*SCALE;
  const clampI=(v,lo=ZERO,hi=LIMIT)=>v<lo?lo:v>hi?hi:v;
  const fromNumber=(v)=>BigInt(Math.round(Number(v)*1e6))*1000000000000n;
  const toNumber=(v)=>Number(v)/1e18;
  const q=(v)=>typeof v==='bigint'?v:fromNumber(v);
  const mul=(a,b)=>(a*b)/SCALE,div=(a,b)=>b===ZERO?ZERO:(a*SCALE)/b;
  function rng64(seed){let state=(BigInt(seed>>>0)<<32n)|BigInt(seed>>>0);const mask=0xffffffffffffffffn;return()=>{state=(state+0x9e3779b97f4a7c15n)&mask;let z=state;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&mask;z=((z^(z>>27n))*0x94d049bb133111ebn)&mask;z=(z^(z>>31n))&mask;return z%SCALE}}
  class FixedLedger{
    constructor(seed){this.seed=seed>>>0;this.random=rng64(this.seed);this.tick=0;this.microstep=0;this.accounts=new Map();this.signed=new Map();this.audit=[]}
    set(name,value){this.accounts.set(name,clampI(q(value)));return this}
    get(name){return this.accounts.get(name)||ZERO}
    delta(name,value){const before=this.get(name),after=clampI(before+q(value));this.accounts.set(name,after);return after-before}
    setSigned(name,value){this.signed.set(name,q(value));return this}
    getSigned(name){return this.signed.get(name)||ZERO}
    deltaSigned(name,value){const after=this.getSigned(name)+q(value);this.signed.set(name,after);return q(value)}
    beginPhase(name){this.audit.push({tick:this.tick,microstep:this.microstep,phase:name,before:this.digest()})}
    endPhase(){const last=this.audit[this.audit.length-1];if(last)last.after=this.digest()}
    step(){this.microstep++;if(this.microstep%1024===0)this.tick++}
    noise(amplitude){return mul(q(amplitude),this.random())}
    digest(){const bounded={},signed={};for(const[k,v]of this.accounts)bounded[k]=v.toString();for(const[k,v]of this.signed)signed[k]=v.toString();return{bounded,signed}}
    snapshot(){return{seed:this.seed,tick:this.tick,microstep:this.microstep,accounts:this.digest().bounded,signed:this.digest().signed,audit:this.audit.slice(-64)}}
    restore(snapshot){if(!snapshot)return;this.tick=Number(snapshot.tick)||0;this.microstep=Number(snapshot.microstep)||0;this.accounts=new Map(Object.entries(snapshot.accounts||{}).map(([k,v])=>[k,BigInt(v)]));this.signed=new Map(Object.entries(snapshot.signed||{}).map(([k,v])=>[k,BigInt(v)]));this.audit=Array.isArray(snapshot.audit)?snapshot.audit.slice(-64):[]}
  }
  function flatten(obj,prefix='',out={}){for(const[k,v]of Object.entries(obj||{})){const key=prefix?`${prefix}.${k}`:k;if(typeof v==='number')out[key]=v;else if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,out)}return out}
  function mirrorFloatState(game){const p=game.precision;if(!p)return;for(const[k,v]of Object.entries(game.state||{}))if(typeof v==='number')p.ledger.set(`organ.${k}`,v);for(const[k,v]of Object.entries(game.hidden||{}))if(typeof v==='number')p.ledger.set(`hidden.${k}`,v);for(const c of game.cells||[])for(const[k,v]of Object.entries(flatten(c)))p.ledger.set(`cell.${c.id}.${k}`,v)}
  function attach(game,snapshot=null){
    if(game.precision){if(snapshot)game.precision.ledger.restore(snapshot);return game.precision}
    const ledger=new FixedLedger(game.seed);
    const precision={version:4,scale:'1e-18',unit:'Q18',ledger,microstepsPerTurn:4096,sync(){mirrorFloatState(game)},phase(name,fn){ledger.beginPhase(name);const out=fn();ledger.endPhase();return out},microstep(fn){for(let i=0;i<ledger.microstepsPerPhase;i++){ledger.step();fn(i)}},random(){return toNumber(ledger.random())},quantize(v){return toNumber(q(v))},exact(name){return ledger.get(name)},exactSigned(name){return ledger.getSigned(name)},snapshot(){return ledger.snapshot()}};
    ledger.microstepsPerPhase=4096;game.precision=precision;if(snapshot)ledger.restore(snapshot);else precision.sync();return precision;
  }
  window.CBPrecisionV4={SCALE,ONE,q,toNumber,mul,div,rng64,FixedLedger,attach};
})();
