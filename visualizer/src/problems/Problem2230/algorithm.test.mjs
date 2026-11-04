import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (purchases, start, end, minAmount) => buildTrace({ purchases, start, end, minAmount }).result

test('2230 sample interval: users 7 and 9 have a purchase at or above the amount inside the interval', () => {
  const purchases = [[7, 10, 30], [3, 12, 15], [7, 15, 25], [3, 40, 90], [9, 11, 20], [7, 33, 5], [9, 18, 40], [3, 22, 10]]
  assert.deepEqual(solve(purchases, 10, 25, 30), [7, 9])
})

test('2230 a single purchase below the amount does not qualify', () => {
  assert.deepEqual(solve([[1, 5, 10]], 1, 9, 11), [])
})

test('2230 interval ends are included and the amount threshold is inclusive', () => {
  assert.deepEqual(solve([[4, 5, 10]], 5, 5, 10), [4])
  assert.deepEqual(solve([[4, 6, 10]], 5, 5, 10), [])
})

test('2230 parser rejects an inverted interval', () => {
  assert.throws(() => parseInput('{"purchases":[[1,2,3]],"start":5,"end":1,"minAmount":1}'))
})

test('2230 frame invariants hold', () => {
  const run = buildTrace({ purchases: [[1, 2, 50], [1, 3, 60], [2, 9, 70]], start: 1, end: 5, minAmount: 40 })
  const pyLines = python => python.trim().split('\n').length
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.result, [1])
  assert.ok(run.frames.every(f => f.activeLine >= 1 && f.pythonLine >= 1))
  assert.ok(pyLines(`def eligible_users(purchases, start, end, min_amount):
    eligible = set()
    for user_id, time_stamp, amount in purchases:
        if time_stamp < start or time_stamp > end:
            continue
        if amount >= min_amount:
            eligible.add(user_id)
    return sorted(eligible)`) >= 8)
})
