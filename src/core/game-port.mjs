/* CARDIAC//BREACH — typed-ish boundary around the authoritative engine.
 * The simulation engine remains a legacy browser asset for now; all new application code consumes this port.
 */
export function createGamePort(engine){
  if(!engine) throw new Error('Game engine is required');
  const required=['create','place','resolve','score','snapshot','rehydrate'];
  for(const method of required){
    if(typeof engine[method]!=='function') throw new TypeError(`Engine missing ${method}()`);
  }
  return Object.freeze({
    create:(seed,scenario)=>engine.create(seed,scenario),
    place:(game,id,target,name)=>engine.place(game,id,target,name),
    resolve:(game)=>engine.resolve(game),
    score:(game)=>engine.score(game),
    snapshot:(game)=>engine.snapshot(game),
    rehydrate:(snapshot)=>engine.rehydrate(snapshot),
    neighbors:(cells,index)=>engine.neighbours(cells,index),
    distance:engine.dist,
    scenarios:engine.SCENARIOS,
    agents:engine.AGENTS,
    phases:engine.PHASES,
    version:engine.VERSION||3,
  });
}
