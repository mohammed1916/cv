import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result
const brute = nums => nums.map((_, i) => {
  const size = i + 1
  let best = -Infinity
  for (let s = 0; s + size <= nums.length; s++) best = Math.max(best, Math.min(...nums.slice(s, s + size)))
  return best
})

test('1950 invented arrays', () => {
  assert.deepEqual(solve([3, 1, 2]), [3, 1, 1])
  assert.deepEqual(solve([5]), [5])
})

test('1950 matches sliding minimum over every window size', () => {
  const cases = [[0, 1, 2, 4], [2, 2, 2], [5, 4, 3, 2, 1], [1, 3, 2, 3, 1, 2], [4, 1, 4, 1, 4, 1, 4]]
  for (const c of cases) assert.deepEqual(solve(c), brute(c), JSON.stringify(c))
})
