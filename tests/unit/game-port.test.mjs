import test from 'node:test';
import assert from 'node:assert/strict';
import {createGamePort} from '../../src/core/game-port.mjs';

test('game port exposes only the engine contract',()=>{
  const calls=[];
  const engine={
    create:(seed,scenario)=>({seed,scenario}),
    place:(game,id,target,name)=>{calls.push(['place',id,target,name]);return{ok:true}},
    resolve:game=>{calls.push(['resolve',game.seed]);return{day:1}},
    score:()=>77,
    snapshot:game=>({seed:game.seed}),
    rehydrate:snapshot=>snapshot,
    neighbours:()=>[],
    dist:()=>0,
    SCENARIOS:{ischemia:{name:'Ventricular Crisis',focus:'oxygen'}},
    AGENTS:{vascular:{cost:19,range:3}},
    PHASES:['insult','delivery'],
    VERSION:4
  };
  const port=createGamePort(engine);
  const game=port.create(7,'ischemia');
  assert.equal(game.seed,7);assert.equal(port.score(game),77);assert.equal(port.version,4);
  port.place(game,'vascular',3,'SUPPLY');port.resolve(game);
  assert.deepEqual(calls,[['place','vascular',3,'SUPPLY'],['resolve',7]]);
  assert.equal(typeof port.hiddenMethod,'undefined');
});
