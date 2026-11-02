import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, l, r) => buildTrace({ nums, l, r }).result

test('3364 worked examples', () => {
  assert.equal(solve([3, -2, 1, 4], 2, 3), 1)
  assert.equal(solve([-2, 2, -3, 1], 2, 3), -1)
  assert.equal(solve([1, 2, 3, 4], 2, 4), 3)
})

test('3364 edge cases', () => {
  assert.equal(solve([0, -1, 5], 1, 1), 5)
  assert.equal(solve([-1, -2], 1, 2), -1)
  assert.equal(solve([7], 1, 1), 7)
  assert.equal(solve([0, 0, 0], 1, 3), -1)
})

test('3364 rejects bad bounds', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"l":0,"r":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"l":2,"r":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"l":1,"r":3}'))
})

// Oracle: enumerate every subarray (i, j) and filter by length, then take the minimum positive sum.
function oracle(nums, l, r) {
  let best = null
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const len = j - i + 1
      if (len < l || len > r) continue
      const sum = nums.slice(i, j + 1).reduce((a, b) => a + b, 0)
      if (sum > 0 && (best === null || sum < best)) best = sum
    }
  }
  return best === null ? -1 : best
}

test('3364 random inputs match an enumeration oracle', () => {
  let seed = 3364
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(21) - 10)
    const l = 1 + rnd(nums.length)
    const r = l + rnd(nums.length - l + 1)
    assert.equal(solve(nums, l, r), oracle(nums, l, r), JSON.stringify({ nums, l, r }))
  }
})
