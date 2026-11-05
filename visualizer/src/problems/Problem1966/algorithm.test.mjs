import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result
// Exhaustive check: a value is guaranteed when every reachable pivot path finds it.
const brute = nums => {
  const guaranteed = (lo, hi, t) => {
    if (lo > hi) return false
    for (let p = lo; p <= hi; p++) {
      if (nums[p] === t) continue
      const next = nums[p] < t ? [p + 1, hi] : [lo, p - 1]
      if (!guaranteed(next[0], next[1], t)) return false
    }
    return true
  }
  return nums.filter(x => guaranteed(0, nums.length - 1, x)).length
}

test('1966 invented arrays', () => {
  assert.equal(solve([1, 2, 3, 4, 5]), 5)
  assert.equal(solve([1, 3, 2]), 1)
  assert.equal(solve([3]), 1)
})

test('1966 matches exhaustive pivot search', () => {
  const cases = [[1, 3, 2], [2, 1, 3], [4, 1, 3, 5, 2], [5, 4, 3, 2, 1], [1, 2, 4, 3, 5]]
  for (const c of cases) assert.equal(solve(c), brute(c), JSON.stringify(c))
})
