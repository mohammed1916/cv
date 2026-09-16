import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSteps } from './algorithm.js';
test('winning pair matches exhaustive search including zeros and ties',()=>{
  for(let code=0;code<4096;code++) {
    let value=code;const heights=Array.from({length:6},()=>{const h=value%4;value=Math.floor(value/4);return h;});
    let expected=0;
    for(let i=0;i<heights.length;i++)for(let j=i+1;j<heights.length;j++)expected=Math.max(expected,(j-i)*Math.min(heights[i],heights[j]));
    const last=generateSteps(heights).at(-1),[l,r]=last.bestPair;
    assert.equal(last.maxArea,expected);
    assert.equal((r-l)*Math.min(heights[l],heights[r]),expected);
  }
});
