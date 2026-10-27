import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('644 official examples', () => {
  assert.ok(Math.abs(solve([1, 12, -5, -6, 50, 3], 4) - 12.75) < 1e-4)
  assert.ok(Math.abs(solve([5], 1) - 5) < 1e-4)
})

test('644 rejects k longer than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: try every subarray whose length is at least k.
function oracle(nums, k) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (j - i + 1 >= k) best = Math.max(best, sum / (j - i + 1))
    }
  }
  return best
}

test('644 random arrays match the brute-force average', () => {
  let seed = 23
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(201) - 100)
    const k = 1 + rnd(nums.length)
    assert.ok(Math.abs(solve(nums, k) - oracle(nums, k)) < 1e-4, JSON.stringify({ nums, k }))
  }
})
