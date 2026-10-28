import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3795 official examples', () => {
  assert.equal(solve([2, 2, 3, 1], 4), 2)
  assert.equal(solve([3, 2, 3, 4], 5), 2)
  assert.equal(solve([5, 5, 4], 5), 1)
})

test('3795 edge case: no subarray reaches the target', () => {
  assert.equal(solve([1, 1, 1], 10), -1)
})

test('3795 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0,1],"k":1}'))
})

// Independent oracle: check every subarray directly, summing each distinct value once.
function oracle(nums, k) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const distinct = new Set(nums.slice(i, j + 1))
      let sum = 0
      for (const v of distinct) sum += v
      if (sum >= k && (best === -1 || j - i + 1 < best)) best = j - i + 1
    }
  }
  return best
}

test('3795 random arrays match an all-subarrays oracle', () => {
  let seed = 3795
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(20) + 1
    const nums = Array.from({ length: n }, () => rnd(12) + 1)
    const k = rnd(60) + 1
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
