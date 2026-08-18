/* CARDIAC//BREACH — v2 compatibility adapter
 * Application lifecycle is owned by CBApp.
 * This file is compatibility-only; new code consumes CBApp directly.
 */
(()=>{
  'use strict';
  const install=()=>{
    const app=window.CBApp;
    const compat=window.CBCompat;
    if(!app||!compat) throw new Error('CBApp and CBCompat must initialize before the compatibility adapter');

    compat.reset=()=>app.newRun(document.getElementById('scenario')?.value||'ischemia');
    compat.advance=()=>app.advanceDay();
    compat.deploy=(id,name)=>app.deploy(id,name);
    compat.selectCell=(index)=>app.selectCell(index);

    window.CBGameV2={
      get state(){return app.state},
      reset:compat.reset,
      advance:compat.advance,
      deploy:compat.deploy,
      selectCell:compat.selectCell,
      save:()=>app.save(),
      load:()=>app.load()
    };
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
