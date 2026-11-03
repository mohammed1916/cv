import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3815 worked sequence with ties and removals', () => {
  const ops = [
    ['addBid', 1, 1, 5], ['addBid', 2, 1, 7], ['addBid', 3, 1, 7], ['getHighestBidder', 1],
    ['updateBid', 1, 1, 9], ['getHighestBidder', 1], ['removeBid', 3, 1], ['getHighestBidder', 1], ['getHighestBidder', 2],
  ]
  assert.deepEqual(solve(ops), [null, null, null, 3, null, 1, null, 1, -1])
})

test('3815 a repeated addBid replaces the earlier amount', () => {
  assert.deepEqual(solve([['addBid', 4, 2, 9], ['addBid', 4, 2, 3], ['addBid', 5, 2, 6], ['getHighestBidder', 2]]), [null, null, null, 5])
})

test('3815 an update of a missing bid is rejected', () => {
  assert.throws(() => buildTrace({ ops: [['updateBid', 1, 1, 4]] }))
})

test('3815 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ ops: [['addBid', 1, 1, 2], ['getHighestBidder', 1]] }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3815 rejects an unknown operation', () => {
  assert.throws(() => parseInput('{"ops":[["bidAll",1,1,2]]}'))
})
