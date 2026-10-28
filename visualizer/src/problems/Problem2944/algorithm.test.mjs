import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = prices => buildTrace(parseInput(JSON.stringify({ prices }))).result

test('2944 hand-checked examples', () => {
  // Buy fruit 1 for 3 (fruit 2 free), then buy fruit 2 for 1 (fruit 3 free): 4 coins.
  assert.equal(solve([3, 1, 2]), 4)
  // Buy fruit 1 for 1 (fruit 2 free), then buy fruit 3 for 1 (fruit 4 free) ... total 2.
  assert.equal(solve([1, 10, 1, 1]), 2)
  assert.equal(solve([5]), 5)
})

test('2944 rejects empty or out-of-range prices', () => {
  assert.throws(() => parseInput('{"prices":[]}'))
  assert.throws(() => parseInput('{"prices":[0,1]}'))
})

// Independent oracle: try every purchase set; a fruit is acquired when it is bought or lies in a bought fruit's range i+1..2i.
function oracle(prices) {
  const n = prices.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const got = Array(n + 1).fill(false)
    let cost = 0
    for (let i = 1; i <= n; i++) {
      if (!(mask & (1 << (i - 1)))) continue
      cost += prices[i - 1]
      got[i] = true
      for (let j = i + 1; j <= Math.min(2 * i, n); j++) got[j] = true
    }
    if (got.slice(1).every(Boolean)) best = Math.min(best, cost)
  }
  return best
}

test('2944 random cases match the purchase-set oracle', () => {
  let seed = 2944
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const prices = Array.from({ length: n }, () => rnd(20) + 1)
    assert.equal(solve(prices), oracle(prices), JSON.stringify(prices))
  }
})
