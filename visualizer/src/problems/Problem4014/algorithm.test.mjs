import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prices, discounts) => buildTrace({ prices, discounts }).result

test('4014 official examples', () => {
  assert.equal(solve([10, 30, 21], [50, 60]), 32.5)
  assert.equal(solve([100, 70], [10, 40, 50]), 92)
  assert.equal(solve([7, 3, 9], [100, 100]), 3)
})

test('4014 an unused discount is never forced onto an item', () => {
  assert.equal(solve([5], [10, 20]), 4)
})

test('4014 rejects a discount above 100', () => {
  assert.throws(() => parseInput('{"prices":[5],"discounts":[101]}'))
})

// Independent oracle: try every way to give each item either no discount or a distinct unused discount.
function oracle(prices, discounts) {
  let best = Infinity
  const used = discounts.map(() => false)
  const go = (i, acc) => {
    if (i === prices.length) {
      best = Math.min(best, acc)
      return
    }
    go(i + 1, acc + prices[i] * 100)
    for (let k = 0; k < discounts.length; k++) {
      if (used[k]) continue
      used[k] = true
      go(i + 1, acc + prices[i] * (100 - discounts[k]))
      used[k] = false
    }
  }
  go(0, 0)
  return best / 100
}

test('4014 random cases match an exhaustive assignment oracle', () => {
  let seed = 4014
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(50))
    const discounts = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(100))
    assert.equal(solve(prices, discounts), oracle(prices, discounts), JSON.stringify({ prices, discounts }))
  }
})
