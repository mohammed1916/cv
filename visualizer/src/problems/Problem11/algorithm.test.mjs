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

import { buildTrace, parseInput } from './algorithm.js'

const solve = h => buildTrace(parseInput(JSON.stringify(h))).result

test('11 official examples', () => {
  assert.equal(solve([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49)
  assert.equal(solve([1, 1]), 1)
  assert.equal(solve([4, 3, 2, 1, 4]), 16)
  assert.equal(solve([1, 2, 1]), 2)
})

test('11 rejects too few heights and out-of-range heights', () => {
  assert.throws(() => parseInput('[5]'))
  assert.throws(() => parseInput('[1,-1]'))
  assert.throws(() => parseInput('[1,10001]'))
})

// Independent oracle: examine every pair of lines.
const brute = h => {
  let best = 0
  for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, (j - i) * Math.min(h[i], h[j]))
  return best
}

test('11 seeded random heights match a brute-force oracle', () => {
  let seed = 11
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const h = Array.from({ length: 2 + rnd(20) }, () => rnd(12))
    assert.equal(solve(h), brute(h), JSON.stringify(h))
  }
})
