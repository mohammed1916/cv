import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prices, strategy, k) => buildTrace({ prices, strategy, k }).result

test('3652 worked example', () => {
  assert.equal(solve([6, 1, 9], [1, 0, -1], 2), 15)
})

test('3652 keeps the original profit when every window hurts', () => {
  assert.equal(solve([3, 7], [1, 1], 2), 10)
})

test('3652 a window of holds and buys can gain', () => {
  assert.equal(solve([6, 5, 3], [0, 0, 0], 2), 5)
})

test('3652 rejects an odd k', () => {
  assert.throws(() => parseInput('{"prices":[1,2],"strategy":[0,0],"k":1}'))
})
