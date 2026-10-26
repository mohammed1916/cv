import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('maximum depth returns a real root-to-leaf witness for sparse, tied and empty trees',()=>{
  for(const [text,depth] of [['[]',0],['[3,9,20,null,null,15,7]',3],['[1,null,2,null,3]',3],['[1,2,2]',2]]){
    const story=generateSteps(text),last=story.steps.at(-1);
    assert.equal(last.total,depth);assert.equal(last.path.length,depth);
    for(let i=1;i<last.path.length;i++)assert.ok(story.edges.some(e=>e.fromId===last.path[i-1]&&e.toId===last.path[i]));
    assert.equal(story.steps[0].returnValues.size,0);
  }
});
