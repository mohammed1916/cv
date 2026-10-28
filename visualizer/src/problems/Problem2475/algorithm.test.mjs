import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2475 official examples', () => {
  assert.equal(solve([4, 4, 2, 4, 3]), 3)
  assert.equal(solve([1, 1, 1, 1, 1]), 0)
})

test('2475 three distinct values give exactly one triplet', () => {
  assert.equal(solve([1, 2, 3]), 1)
  assert.equal(solve([1, 1, 2, 3]), 2)
})

test('2475 rejects out-of-range values and short arrays', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[0,1,2]'))
  assert.throws(() => parseInput('[1,2,11]'))
  assert.throws(() => parseInput('"abc"'))
})

// Independent oracle: check every index triple directly.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] !== nums[j] && nums[j] !== nums[k] && nums[i] !== nums[k]) count++
      }
    }
  }
  return count
}

test('2475 random arrays match an index-triple oracle', () => {
  let seed = 2475
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 3 + rnd(10) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
