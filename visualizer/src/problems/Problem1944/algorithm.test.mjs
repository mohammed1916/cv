import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result
const brute = h => h.map((hi, i) => {
  let count = 0
  for (let j = i + 1; j < h.length; j++) {
    const between = h.slice(i + 1, j)
    const mid = between.length ? Math.max(...between) : -Infinity
    if (Math.min(hi, h[j]) > mid) count++
  }
  return count
})

test('1944 invented heights', () => {
  assert.deepEqual(solve([10, 6, 8, 5, 11]), [3, 1, 2, 1, 0])
  assert.deepEqual(solve([3]), [0])
})

test('1944 matches the pairwise definition', () => {
  const cases = [[10, 6, 8, 5, 11, 9], [1, 2, 3, 4], [4, 3, 2, 1], [5, 1, 4, 2, 3], [7, 2, 9, 1, 8, 3]]
  for (const h of cases) assert.deepEqual(solve(h), brute(h), JSON.stringify(h))
})
