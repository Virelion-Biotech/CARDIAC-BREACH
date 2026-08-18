/* CARDIAC//BREACH — quarantined legacy compatibility
 * This is intentionally the ONLY place that mirrors game state for older UI modules.
 * New code must use window.CBApp instead.
 */
(()=>{
  'use strict';
  const install=()=>{
    const app=window.CBApp;
    if(!app) throw new Error('CBApp must initialize before legacy compatibility');
    const legacy=Object.create(null);
    const define=(key,getter,setter)=>Object.defineProperty(legacy,key,{enumerable:true,configurable:false,get:getter,set:setter});
    define('cells',()=>app.state?.cells||[]);
    define('selected',()=>app.selectedCell,(v)=>app.selectCell(Number(v)));
    define('day',()=>app.state?.day||0);
    define('energy',()=>app.state?.state?.energy||0);
    define('agents',()=>app.state?.agents||[]);
    define('history',()=>app.state?.history||[]);
    define('running',()=>app.state?.running||false);
    define('state',()=>app.state?.state||{});
    define('CBGameState',()=>app.state);
    legacy.reset=()=>app.newRun(document.getElementById('scenario')?.value||'ischemia');
    legacy.advance=()=>app.advanceDay();
    legacy.deploy=(id,name)=>app.deploy(id,name);
    legacy.save=()=>app.save();
    legacy.load=()=>app.load();
    window.CBCompat=legacy;
    document.documentElement.dataset.compatReady='true';
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
