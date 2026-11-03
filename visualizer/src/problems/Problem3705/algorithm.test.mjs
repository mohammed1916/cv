import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = orders => buildTrace({ orders }).result

test('3705 sample: only customer 7 has three golden-hour orders', () => {
  const orders = [[1, 7, 18], [2, 3, 19], [3, 7, 9], [4, 7, 19], [5, 3, 20], [6, 7, 18], [7, 5, 18], [8, 3, 18]]
  assert.deepEqual(solve(orders), [7])
})

test('3705 boundary: hour 20 is excluded and hour 18 is included', () => {
  // Customer 4 has 19 and 18 inside the window, 20 and 17 outside: 2 orders, not kept.
  // Customer 9 has 18, 19 and 18 inside the window: 3 orders, kept.
  const orders = [[1, 4, 19], [2, 4, 18], [3, 4, 20], [4, 4, 17], [5, 9, 18], [6, 9, 19], [7, 9, 18]]
  assert.deepEqual(solve(orders), [9])
  assert.deepEqual(solve([]), [])
})

test('3705 rejects an hour outside 0 to 23', () => {
  assert.throws(() => parseInput('{"orders":[[1,2,24]]}'))
  assert.throws(() => parseInput('{"orders":[[1,2]]}'))
})
