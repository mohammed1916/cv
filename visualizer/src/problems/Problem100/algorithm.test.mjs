import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSteps } from './algorithm.js';
test('same-tree trace distinguishes sparse structure, values and empty trees',()=>{
  for(const [p,q,expected] of [[[],[],true],[[1],[],false],[[1,null,2,null,3],[1,null,2,null,3],true],[[1,2],[1,null,2],false],[[1,2,3],[1,2,4],false]]) {
    const frames=generateSteps(p,q);
    assert.equal(frames.at(-1).finalResult,expected);
    assert.equal(frames.at(-1).activeLine,11);
  }
  const frames=generateSteps([1,null,2,null,3],[1,null,2,null,3]);
  assert.equal(frames[0].pNodes.length,3);
  assert.equal(frames[0].pEdges.length,2);
});
test('invalid orphan values are rejected by the shared parser',()=>{
  assert.throws(()=>generateSteps([null,2],[]));
  assert.throws(()=>generateSteps([1,null,null,2],[]));
});
