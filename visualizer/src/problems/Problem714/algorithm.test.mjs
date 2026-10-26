import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('714 official examples', () => {
  assert.equal(buildTrace({ prices: [1, 3, 2, 8, 4, 9], fee: 2 }).result, 8)
  assert.equal(buildTrace({ prices: [1, 3, 7, 5, 10, 3], fee: 3 }).result, 6)
})

// Oracle: enumerate every sequence of day actions (buy, sell, or nothing) with the holding state, which is exact for small arrays.
test('714 small arrays match exhaustive action search', () => {
  let state = 173
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rand(7) }, () => 1 + rand(9))
    const fee = rand(4)
    let best = -Infinity
    const go = (day, holding, profit) => {
      if (day === prices.length) { if (!holding) best = Math.max(best, profit); return }
      go(day + 1, holding, profit)
      if (!holding) go(day + 1, true, profit - prices[day])
      else go(day + 1, false, profit + prices[day] - fee)
    }
    go(0, false, 0)
    assert.equal(buildTrace({ prices, fee }).result, best, JSON.stringify({ prices, fee }))
  }
})

test('714 rejects negative fees', () => {
  assert.throws(() => parseInput('{"prices":[1],"fee":-1}'))
})
