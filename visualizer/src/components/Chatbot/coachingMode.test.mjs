import test from 'node:test';
import assert from 'node:assert/strict';
import {readCoachingMode,coachingInstructions} from './coachingMode.js';
test('coaching is opt-in and blocked storage falls back to normal',()=>{
  for(const value of [null,'off','bad']) assert.equal(readCoachingMode({getItem:()=>value}),false);
  assert.equal(readCoachingMode({getItem:()=> 'on'}),true);
  assert.equal(readCoachingMode({getItem:()=>{throw Error('blocked');}}),false);
});
test('on mode is context-sensitive and off mode overrides historical coaching style',()=>{
  const on=coachingInstructions(true),off=coachingInstructions(false);
  assert.match(on,/actual code/);assert.match(on,/explicitly asks for the complete solution/);
  assert.match(on,/Do not automatically claim/);assert.match(on,/current values/);
  assert.match(off,/Answer the current question directly/);
  assert.doesNotMatch(off,/progressive hint/);
});
