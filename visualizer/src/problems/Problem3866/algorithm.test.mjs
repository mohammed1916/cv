import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: for each position in order, count the matches with filter and test evenness directly.
function oracle(nums) {
  for (const v of nums) {
    if (v % 2 === 0 && nums.filter(w => w === v).length === 1) return v
  }
  return -1
}

test('3866 official examples', () => {
  assert.equal(solve([3, 4, 2, 5, 4, 6]), 2)
  assert.equal(solve([4, 4]), -1)
})

test('3866 an odd unique value does not count', () => {
  assert.equal(solve([5, 7, 6, 6]), -1)
})

test('3866 rejects a value above 100', () => {
  assert.throws(() => parseInput('{"nums":[101]}'))
})

test('3866 random arrays match the filter oracle', () => {
  let seed = 3866
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
