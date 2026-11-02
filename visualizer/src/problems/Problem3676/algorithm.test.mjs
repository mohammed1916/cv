import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3676 worked examples', () => {
  assert.equal(solve([3, 1, 4]), 1)
  assert.equal(solve([5, 1, 2, 6]), 2)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([2, 1, 2]), 1)
})

test('3676 edge cases: short arrays and ties', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([7, 9]), 0)
  assert.equal(solve([4, 4, 4]), 0)
  assert.equal(solve([0, 0, 0, 0]), 0)
})

test('3676 final frame reports the result', () => {
  const trace = buildTrace({ nums: [5, 1, 2, 6] })
  assert.equal(trace.frames.at(-1).total, 2)
  assert.equal(trace.frames.at(-1).pythonLine, 11)
})

test('3676 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[1.5,2,3]}'))
})

// Independent oracle: test every subarray of length at least 3 directly.
function oracle(nums) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l + 2; r < nums.length; r++) {
      const inner = Math.max(...nums.slice(l + 1, r))
      if (Math.min(nums[l], nums[r]) > inner) count++
    }
  }
  return count
}

test('3676 random inputs match a brute-force oracle', () => {
  let seed = 3676
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
