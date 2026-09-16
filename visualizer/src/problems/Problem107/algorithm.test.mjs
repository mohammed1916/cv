import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('reverse only the level order, at the final return',()=>{
  const frames=generateSteps('[3,9,20,null,null,15,7]');
  assert.deepEqual(frames.at(-1).reversedLevels,[[15,7],[9,20],[3]]);
  assert.ok(frames.slice(0,-1).every(f=>f.reversedLevels.length===0));
  assert.deepEqual(generateSteps('[]').at(-1).reversedLevels,[]);
});
