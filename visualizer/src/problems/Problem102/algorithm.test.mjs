import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('FIFO retains unprocessed current-level nodes before newly added children',()=>{
  const frames=generateSteps('[3,9,20,null,null,15,7]');
  assert.deepEqual(frames.at(-1).levels,[[3],[9,20],[15,7]]);
  const visit9=frames.find(f=>f.phase==='visit'&&f.activeIds.has(1));
  assert.deepEqual(visit9.queue.map(n=>n.val),[20]);
  const enqueue15=frames.find(f=>f.activeLine===10&&f.activeIds.has(2));
  assert.deepEqual(enqueue15.queue.map(n=>n.val),[15]);
  assert.deepEqual(frames[0].levels,[]);
});
test('sparse chains and empty input keep level boundaries',()=>{
  assert.deepEqual(generateSteps('[1,null,2,null,3]').at(-1).levels,[[1],[2],[3]]);
  assert.deepEqual(generateSteps('[]').at(-1).levels,[]);
  assert.throws(()=>generateSteps('[1,null,null,2]'));
});
