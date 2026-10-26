import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('698 official examples', () => {
  assert.equal(buildTrace({ nums: [4, 3, 2, 3, 5, 2, 1], k: 4 }).result, true)
  assert.equal(buildTrace({ nums: [1, 2, 3, 4], k: 3 }).result, false)
})

// Oracle: try every assignment of the numbers to k labelled buckets.
test('698 small arrays match exhaustive bucket assignment', () => {
  let state = 2
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(6)
    const nums = Array.from({ length: n }, () => 1 + rand(6))
    const k = 1 + rand(n)
    let expected = false
    const sums = Array(k).fill(0)
    const assign = i => {
      if (expected) return
      // Equal bucket sums at the leaf are exactly the valid partitions (the total is fixed, so each bucket must hit total ÷ k).
      if (i === n) { if (sums.every(s => s === sums[0])) expected = true; return }
      for (let b = 0; b < k; b++) { sums[b] += nums[i]; assign(i + 1); sums[b] -= nums[i] }
    }
    assign(0)
    assert.equal(buildTrace({ nums, k }).result, expected, JSON.stringify({ nums, k }))
  }
})

test('698 rejects arrays longer than 16', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(17).fill(1), k: 1 })))
})
