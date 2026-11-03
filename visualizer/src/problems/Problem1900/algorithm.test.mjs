import test from 'node:test'
import assert from 'node:assert/strict'
import { earliestAndLatest } from './algorithm.js'

test('1900 two players that open as a pair meet in round 1', () => {
  assert.deepEqual(earliestAndLatest(6, 2, 5), [1, 1])
  assert.deepEqual(earliestAndLatest(4, 2, 3), [1, 1])
})

test('1900 a forced meeting in a later round', () => {
  // Player 1 always wins, so with 2 and 3 in a row of four, 1 meets 2 only in round 2.
  assert.deepEqual(earliestAndLatest(4, 1, 2), [2, 2])
  // Five players: 1 wins round 1. If 2 wins its pair, row [1, 2, 3] meets in round 2;
  // if 4 wins, row [1, 3, 4] pairs 1 with 4 and 3 waits, so the meeting slides to round 3.
  assert.deepEqual(earliestAndLatest(5, 1, 3), [2, 3])
})

test('1900 earliest can be earlier than latest', () => {
  const [early, late] = earliestAndLatest(6, 1, 4)
  assert.ok(early <= late)
  assert.ok(early >= 1 && late <= 3)
})
