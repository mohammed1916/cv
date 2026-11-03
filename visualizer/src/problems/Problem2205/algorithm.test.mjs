import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (purchases, startDate, endDate, minAmount) =>
  buildTrace({ purchases, startDate, endDate, minAmount }).result

test('2205 counts users with a qualifying purchase in the inclusive interval', () => {
  const purchases = [
    { user_id: 1, time_stamp: '2024-01-03', amount: 40 },
    { user_id: 1, time_stamp: '2024-01-05', amount: 10 },
    { user_id: 2, time_stamp: '2024-01-31', amount: 30 },
    { user_id: 3, time_stamp: '2024-02-01', amount: 99 },
    { user_id: 4, time_stamp: '2024-01-01', amount: 29 },
  ]
  // User 1 (Jan 3, 40) and user 2 (Jan 31 is the end day, 30 meets 30) qualify.
  assert.equal(solve(purchases, '2024-01-01', '2024-01-31', 30), 2)
})

test('2205 counts a repeated user once and respects the boundary days', () => {
  const purchases = [
    { user_id: 5, time_stamp: '2024-03-10', amount: 50 },
    { user_id: 5, time_stamp: '2024-03-10', amount: 60 },
    { user_id: 6, time_stamp: '2024-03-09', amount: 80 },
  ]
  assert.equal(solve(purchases, '2024-03-10', '2024-03-10', 50), 1)
  assert.equal(solve(purchases, '2024-03-10', '2024-03-10', 70), 0)
  const last = buildTrace({ purchases, startDate: '2024-03-10', endDate: '2024-03-10', minAmount: 50 }).frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.deepEqual(last.users, [5])
})

test('2205 rejects a reversed interval and an impossible date', () => {
  assert.throws(() => parseInput('{"purchases":[{"user_id":1,"time_stamp":"2024-01-02","amount":5}],"startDate":"2024-01-05","endDate":"2024-01-01","minAmount":1}'))
  assert.throws(() => parseInput('{"purchases":[{"user_id":1,"time_stamp":"2024-02-30","amount":5}],"startDate":"2024-01-01","endDate":"2024-03-01","minAmount":1}'))
})
