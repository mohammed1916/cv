import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: check every subarray sum directly.
function bruteCount(nums, k) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (((sum % k) + k) % k === 0) total++
    }
  }
  return total
}

test('974 counts divisible subarrays like the brute-force oracle', () => {
  const cases = [
    { nums: [2, 3, 5, -4, 1], k: 5 },
    { nums: [7], k: 9 },
    { nums: [-1, -1, 2, 2, 2], k: 3 },
    { nums: [0, 0, 0], k: 2 },
    { nums: [-7, 14, 3, -2, 9, 1, -8, 5], k: 6 },
    { nums: [10, -10, 4, 6, -3, 12], k: 4 },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(run.result, bruteCount(input.nums, input.k), JSON.stringify(input))
  }
})

test('974 rejects k outside the displayed range', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1}'))
})
