import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3829 matches the earliest driver and rider', () => {
  const ops = [['addRider', 1], ['addRider', 2], ['addDriver', 9], ['matchDriverWithRider'], ['addDriver', 8], ['matchDriverWithRider'], ['matchDriverWithRider']]
  assert.deepEqual(solve(ops), [null, null, null, [9, 1], null, [8, 2], [-1, -1]])
})

test('3829 a cancelled rider is skipped by the next match', () => {
  const ops = [['addRider', 1], ['addRider', 2], ['cancelRider', 1], ['addDriver', 5], ['matchDriverWithRider']]
  assert.deepEqual(solve(ops), [null, null, null, null, [5, 2]])
})

test('3829 cancelling a rider who is not waiting changes nothing', () => {
  assert.deepEqual(solve([['addRider', 3], ['cancelRider', 4], ['addDriver', 1], ['matchDriverWithRider']]), [null, null, null, [1, 3]])
})

test('3829 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ ops: [['addRider', 1], ['addDriver', 2], ['matchDriverWithRider'], ['cancelRider', 1]] }).frames) {
    assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
  }
})

test('3829 rejects a match with an argument', () => {
  assert.throws(() => parseInput('{"ops":[["matchDriverWithRider",1]]}'))
})
