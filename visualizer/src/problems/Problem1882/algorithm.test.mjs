import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import examples from '../../config/examples/collection--1882.js';

test('1882 releases simultaneous completions before choosing and retains FIFO at the same time', () => {
  const {frames,result}=definitions[1882].build({servers:[3,1],tasks:[4,3,1,2]});
  assert.deepEqual(result,[1,0,1,0]);
  const states=frames.flatMap(f=>f.scheduling ? [f.scheduling] : []);
  const wait=states.find(s=>s.event==='Wait');
  assert.equal(wait.time,2); assert.equal(wait.jumpTo,4);
  const choices=states.filter(s=>s.event==='Choose' && s.time===4);
  assert.deepEqual(choices.map(s=>s.nextTask),[2,3]);
  assert.deepEqual(choices[0].eligible,[1,0]);
  assert.equal(states[0].assignments.length,0,'early snapshots must not mutate');
});
test('1882 ties use index; duration is independent of weight',()=>{
  const {frames,result}=definitions[1882].build({servers:[9,9],tasks:[4,3,2]});
  assert.deepEqual(result,[0,1,0]);
  const choice=frames.find(f=>f.scheduling?.event==='Choose' && f.scheduling.nextTask===2);
  assert.deepEqual(choice.scheduling.eligible,[0,1]);
  assert.match(choice.message,/index 0 is smallest/);
  assert.deepEqual(frames.at(-1).scheduling.assignments[0],{task:0,server:0,start:0,end:4});
});
test('1882 authored presets have scheduling frames and valid code highlights',()=>{
  for(const example of examples){
    const run=definitions[1882].build(definitions[1882].parse(example.input));
    assert.equal(run.result.length,JSON.parse(example.input).tasks.length);
    for(const f of run.frames.filter(f=>f.scheduling)) assert.ok(f.activeLine>=1 && f.activeLine<=5);
  }
});
