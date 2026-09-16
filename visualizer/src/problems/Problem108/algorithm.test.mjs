import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSortedArrayStory} from './algorithm.js';
test('sorted-array story uses direct intervals without list-copy frames',()=>{
  const story=buildSortedArrayStory('[-10,-3,0,5,9]');
  assert.equal(story.root.val,0);
  assert.equal(story.frames.some(f=>f.activeLine===12),false);
  assert.equal(story.frames.at(-1).activeLine,9);
  assert.equal(story.nodes.length,5);
});
test('input is validated rather than silently sorted or replaced',()=>{
  for(const input of ['[3,1,2]','[1,1]','[null]'])assert.throws(()=>buildSortedArrayStory(input));
  assert.equal(buildSortedArrayStory('[]').root,null);
});
