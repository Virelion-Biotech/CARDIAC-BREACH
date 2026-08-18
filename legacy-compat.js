/* CARDIAC//BREACH — quarantined legacy compatibility boundary.
 * This is the only bridge for old IIFE modules. New code uses CBApp directly.
 * Lifecycle is event-driven; no timeout/race-based initialization.
 */
(()=>{
  'use strict';
  const install=(event)=>{
    const app=event?.detail?.app||window.CBApp;
    if(!app)return;
    const legacy=Object.create(null);
    const define=(key,getter,setter)=>Object.defineProperty(legacy,key,{enumerable:true,configurable:false,get:getter,set:setter});
    define('cells',()=>app.state?.cells||[]);
    define('selected',()=>app.selectedCell,(v)=>app.selectCell(Number(v)));
    define('day',()=>app.state?.day||0);
    define('energy',()=>app.state?.energy ?? app.state?.state?.energy ?? 0);
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
  document.documentElement.addEventListener('cardiac:app-ready',install,{once:true});
  if(window.CBApp)install({detail:{app:window.CBApp}});
})();
