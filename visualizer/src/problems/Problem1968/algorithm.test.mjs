import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result
const valid = (arr, original) => {
  if ([...arr].sort((a, b) => a - b).join() !== [...original].sort((a, b) => a - b).join()) return false
  for (let i = 1; i < arr.length - 1; i++) if ((arr[i - 1] + arr[i + 1]) / 2 === arr[i]) return false
  return true
}

test('1968 result is a permutation with no value equal to its neighbours average', () => {
  const cases = [[1, 2, 3], [6, 2, 0, 9, 7], [1, 2, 3, 4], [5], [9, 1], [10, 3, 7, 1, 8, 4, 6]]
  for (const c of cases) assert.ok(valid(solve(c), c), JSON.stringify(c))
})

test('1968 invented example output', () => {
  assert.deepEqual(solve([1, 2, 3, 4]), [1, 3, 2, 4])
})
