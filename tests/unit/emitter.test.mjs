import test from 'node:test';
import assert from 'node:assert/strict';
import {Emitter} from '../../src/runtime/emitter.mjs';

test('Emitter registers, emits and unsubscribes listeners',()=>{
  const emitter=new Emitter();let calls=0;let payload=null;
  const off=emitter.on('turn',value=>{calls++;payload=value});
  emitter.emit('turn',{day:3});
  assert.equal(calls,1);assert.deepEqual(payload,{day:3});
  off();emitter.emit('turn',{day:4});
  assert.equal(calls,1);
});
