import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, first_len, second_len) => buildTrace(parseInput(JSON.stringify({ nums, first_len, second_len }))).result

test('1031 official examples', () => {
  assert.equal(solve([0, 6, 5, 2, 2, 5, 1, 9, 4], 1, 2), 20)
  assert.equal(solve([3, 8, 1, 3, 2, 1, 8, 9, 0], 3, 2), 29)
  assert.equal(solve([2, 1, 5, 6, 0, 9, 5, 0, 3, 8], 4, 3), 31)
})

test('1031 the second window may come first in the array', () => {
  assert.equal(solve([9, 9, 1, 1], 2, 1), 19)
  assert.equal(solve([1, 1, 9, 9], 1, 2), 19)
})

test('1031 rejects windows that cannot both fit', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"first_len":2,"second_len":2}'))
})

// Independent oracle: try every pair of start positions and keep the best pair that does not overlap.
function oracle(nums, a, b) {
  let best = -Infinity
  for (let i = 0; i + a <= nums.length; i++) {
    for (let j = 0; j + b <= nums.length; j++) {
      const overlap = i < j + b && j < i + a
      if (overlap) continue
      let total = 0
      for (let k = i; k < i + a; k++) total += nums[k]
      for (let k = j; k < j + b; k++) total += nums[k]
      best = Math.max(best, total)
    }
  }
  return best
}

test('1031 seeded random arrays match the all-pairs oracle', () => {
  let seed = 1031
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(11)
    const nums = Array.from({ length: len }, () => rnd(101))
    const a = 1 + rnd(len - 1)
    const b = 1 + rnd(len - a)
    assert.equal(solve(nums, a, b), oracle(nums, a, b), JSON.stringify({ nums, a, b }))
  }
})
