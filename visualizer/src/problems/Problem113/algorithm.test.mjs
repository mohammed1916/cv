import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('leaf values count toward the sum and all matching routes survive backtracking',()=>{
  const frames=generateSteps('[5,4,8,11,null,13,4,7,2,null,null,5,1]',22);
  assert.deepEqual(frames.at(-1).completedPaths,[[5,4,11,2],[5,8,4,5]]);
  for(const frame of frames)assert.equal(frame.currentSum,frame.pathStack.reduce((a,b)=>a+b,0));
  assert.deepEqual(frames[0].completedPaths,[]);
});
test('negative values, single leaves, internal matches and sparse input',()=>{
  for(const [tree,target,expected] of [['[1]',1,[[1]]],['[1,2]',1,[]],['[-2,null,-3]',-5,[[-2,-3]]],['[]',0,[]]])assert.deepEqual(generateSteps(tree,target).at(-1).completedPaths,expected);
});
