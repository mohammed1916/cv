import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prices, money) => buildTrace({ prices, money }).result

test('2706 worked examples', () => {
  assert.equal(solve([1, 2, 2], 3), 0)
  assert.equal(solve([3, 2, 3], 3), 3)
})

test('2706 edge cases', () => {
  assert.equal(solve([5, 5], 10), 0)
  assert.equal(solve([1, 1], 1), 1)
  assert.equal(solve([100, 100, 1], 1), 1)
  assert.equal(solve([50, 60, 70], 100), 100)
})

test('2706 rejects malformed input', () => {
  assert.throws(() => parseInput('{"prices":[1],"money":3}'))
  assert.throws(() => parseInput('{"prices":[1,2],"money":0}'))
})

// Independent oracle: try every pair of distinct chocolates.
function oracle(prices, money) {
  let best = Infinity
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) best = Math.min(best, prices[i] + prices[j])
  }
  return money - best >= 0 ? money - best : money
}

test('2706 random inputs match a pair-enumeration oracle', () => {
  let seed = 2706
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 2 + rnd(8) }, () => 1 + rnd(20))
    const money = 1 + rnd(40)
    assert.equal(solve(prices, money), oracle(prices, money), JSON.stringify({ prices, money }))
  }
})
