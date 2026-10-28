import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: for each element in order, count the distinct values whose occurrence count equals its own.
function oracle(nums) {
  const freqOf = v => nums.filter(w => w === v).length
  for (const v of nums) {
    const f = freqOf(v)
    const others = new Set(nums.filter(w => w !== v && freqOf(w) === f))
    if (others.size === 0) return v
  }
  return -1
}

test('3843 official examples', () => {
  assert.equal(solve([20, 10, 30, 30]), 30)
  assert.equal(solve([20, 20, 10, 30, 30, 30]), 20)
  assert.equal(solve([10, 10, 20, 20]), -1)
})

test('3843 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

test('3843 random arrays match the filter oracle', () => {
  let seed = 3843
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
