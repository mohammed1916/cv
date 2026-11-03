import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

// Oracle: try every cut and test each part with an explicit pairwise loop.
function oracle(nums) {
  let best = -1
  for (let i = 1; i < nums.length; i++) {
    const L = nums.slice(0, i); const R = nums.slice(i)
    let up = true; let down = true
    for (let j = 1; j < L.length; j++) if (!(L[j - 1] < L[j])) up = false
    for (let j = 1; j < R.length; j++) if (!(R[j - 1] > R[j])) down = false
    if (up && down) {
      const d = Math.abs(L.reduce((a, b) => a + b, 0) - R.reduce((a, b) => a + b, 0))
      best = best === -1 ? d : Math.min(best, d)
    }
  }
  return best
}

test('3698 invented examples', () => {
  assert.equal(solve([2, 6, 3, 1]), 4)
  assert.equal(solve([5, 1, 0].map(v => v + 1)), oracle([6, 2, 1]))
})

test('3698 matches the oracle and returns -1 when no cut works', () => {
  for (const nums of [[1, 3, 2], [1, 2, 4, 3], [3, 1, 2], [1, 2, 3, 4], [4, 4, 1]]) assert.equal(solve(nums), oracle(nums))
  assert.equal(solve([3, 1, 2]), -1)
})
