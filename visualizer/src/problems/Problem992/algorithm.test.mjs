import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: examine every subarray and count its distinct values.
function bruteCount(nums, k) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set()
    for (let j = i; j < nums.length; j++) {
      seen.add(nums[j])
      if (seen.size === k) total++
    }
  }
  return total
}

test('992 subarrays with exactly k distinct values match the brute-force oracle', () => {
  const cases = [
    { nums: [1, 2, 1, 2, 3], k: 2 },
    { nums: [1, 2, 1, 3, 4], k: 3 },
    { nums: [1, 1, 1, 1], k: 1 },
    { nums: [1, 2, 3, 4, 5], k: 5 },
    { nums: [2, 2, 3, 1, 2, 3, 3, 1], k: 2 },
    { nums: [4, 4, 5, 6, 4, 5, 7, 4, 1, 1], k: 3 },
    { nums: [9, 8, 7, 8, 9, 7, 8, 9, 9, 1, 2, 3], k: 4 },
    { nums: [3], k: 1 },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(run.result, bruteCount(input.nums, input.k), JSON.stringify(input))
  }
})

test('992 rejects values outside the displayed range', () => {
  assert.throws(() => parseInput('{"nums":[10],"k":1}'))
})
