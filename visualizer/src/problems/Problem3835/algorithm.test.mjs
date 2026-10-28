import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Independent oracle: sort every subarray and take the cost from its smallest and largest sorted values.
function oracle(nums, k) {
  let total = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const sorted = nums.slice(l, r + 1).sort((a, b) => a - b)
      const cost = (sorted[sorted.length - 1] - sorted[0]) * sorted.length
      if (cost <= k) total++
    }
  }
  return total
}

test('3835 official examples', () => {
  assert.equal(solve([1, 3, 2], 4), 5)
  assert.equal(solve([5, 5, 5, 5], 0), 10)
  assert.equal(solve([1, 2, 3], 0), 3)
})

test('3835 rejects a negative k', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":-1}'))
})

test('3835 random arrays match the sort-based oracle', () => {
  let seed = 3835
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(10))
    const k = rnd(40)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
