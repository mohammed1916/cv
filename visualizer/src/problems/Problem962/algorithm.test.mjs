import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every pair of positions.
function bruteWidth(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] <= nums[j]) best = Math.max(best, j - i)
    }
  }
  return best
}

test('962 widest ramp matches the brute-force oracle', () => {
  const samples = [
    [3, 1], [1, 3], [5, 5, 5], [4, 2, 6, 1, 3], [7, 1, 4, 2, 9, 0, 6],
    [9, 8, 2, 7, 1, 8, 3], [2, 2, 1, 0, 2, 5, 1, 4], [10, 0, 9, 8, 7, 1, 11],
  ]
  for (const nums of samples) {
    assert.equal(buildTrace(parseInput(JSON.stringify({ nums }))).result, bruteWidth(nums), JSON.stringify(nums))
  }
})

test('962 returns zero when no ramp exists', () => {
  assert.equal(buildTrace(parseInput('{"nums":[5,4,3,2]}')).result, 0)
})
