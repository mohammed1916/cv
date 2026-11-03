import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (purchases, start, end, minCount, minTotal) => buildTrace({ purchases, start, end, minCount, minTotal }).result

test('2230 sample interval: users 7 and 9 qualify, user 3 has the right count but too small a total', () => {
  const purchases = [[7, 10, 30], [3, 12, 15], [7, 15, 25], [3, 40, 90], [9, 11, 20], [7, 33, 5], [9, 18, 40], [3, 22, 10]]
  assert.deepEqual(solve(purchases, 10, 25, 2, 50), [7, 9])
})

test('2230 nobody qualifies when the single purchase misses the count threshold', () => {
  assert.deepEqual(solve([[1, 5, 10]], 1, 9, 2, 5), [])
})

test('2230 interval ends are included and the total threshold is inclusive', () => {
  assert.deepEqual(solve([[4, 5, 10], [4, 5, 10]], 5, 5, 2, 20), [4])
  assert.deepEqual(solve([[4, 5, 10], [4, 6, 9]], 5, 6, 2, 20), [])
})
