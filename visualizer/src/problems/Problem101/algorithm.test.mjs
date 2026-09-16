import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSteps } from './algorithm.js';
test('mirror comparison checks opposite children and sparse structure',()=>{
  for(const [tree,expected] of [[[],true],[[1,2,2,3,4,4,3],true],[[1,2,2,null,3,null,3],false],[[1,2,2,null,3,3,null],true]])assert.equal(generateSteps(tree).at(-1).finalResult,expected);
});
test('failed outer pair skips inner comparison and maps final return correctly',()=>{
  const frames=generateSteps([1,2,2,3,8,8,4]);
  assert.equal(frames.at(-1).finalResult,false);
  assert.equal(frames.at(-1).activeLine,12);
  assert.equal(frames.some(f=>f.activeLeftId==='n-4'||f.activeRightId==='n-5'),false);
  assert.ok(frames.some(f=>f.message.includes('Short-circuit')));
});
