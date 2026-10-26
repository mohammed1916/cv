import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('reverse changes output row, not the queue, and saving occurs after reversal',()=>{
  const frames=generateSteps('[3,9,20,null,null,15,7]');
  assert.deepEqual(frames.at(-1).result,[[3],[20,9],[15,7]]);
  const index=frames.findIndex(f=>f.phase==='reverse'&&!f.leftToRight);
  assert.deepEqual(frames[index].level,[20,9]);
  assert.deepEqual(frames[index].result,[[3]]);
  assert.deepEqual(frames[index].queue.map(n=>n.val),[15,7]);
  assert.deepEqual(frames[index+1].result,[[3],[20,9]]);
});
test('empty root and sparse trees are truthful',()=>{
  assert.deepEqual(generateSteps('[null]').at(-1).result,[]);
  assert.deepEqual(generateSteps('[1,null,2,null,3]').at(-1).result,[[1],[2],[3]]);
});
