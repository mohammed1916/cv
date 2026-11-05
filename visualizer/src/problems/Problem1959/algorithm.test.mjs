import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result
// Exhaustive search over every size sequence with at most k changes.
const brute = (nums, k) => {
  const maxV = Math.max(...nums)
  let best = Infinity
  const rec = (t, prev, changes, waste) => {
    if (waste >= best) return
    if (t === nums.length) { best = waste; return }
    for (let size = nums[t]; size <= maxV; size++) {
      const change = t > 0 && size !== prev ? 1 : 0
      if (changes + change > k) continue
      rec(t + 1, size, changes + change, waste + size - nums[t])
    }
  }
  rec(0, -1, 0, 0)
  return best
}

test('1959 invented arrays', () => {
  assert.equal(solve([10, 20], 0), 10)
  assert.equal(solve([10, 20, 5], 1), 10)
  assert.equal(solve([10, 20, 5], 2), 0)
})

test('1959 matches exhaustive size search', () => {
  const cases = [[[2, 3, 5], 0], [[2, 3, 5], 1], [[4, 1, 4, 1], 1], [[5, 1, 5, 1, 4], 2], [[3, 3, 3, 9], 1], [[1, 6, 2, 6, 1], 3]]
  for (const [nums, k] of cases) assert.equal(solve(nums, k), brute(nums, k), JSON.stringify([nums, k]))
})
