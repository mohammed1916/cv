import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = prices => buildTrace({ prices }).result
const pyLines = python.trim().split('\n').length

test('2969 teaching examples', () => {
  assert.equal(solve([5, 1, 3, 2, 4]), 8)
  assert.equal(solve([3, 1, 2]), 4)
  assert.equal(solve([7]), 7)
  assert.equal(solve([1, 1, 1, 1]), 2)
})

test('2969 parser rejects empty lists and bad prices', () => {
  assert.throws(() => parseInput('{"prices":[]}'))
  assert.throws(() => parseInput('{"prices":[0]}'))
  assert.throws(() => parseInput('{"prices":[2.5]}'))
})

// Brute oracle: choose the purchased set S. Fruit x is obtained when x is in S or some i in S has i < x <= 2i.
function oracle(prices) {
  const n = prices.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const bought = fruit => mask & (1 << (fruit - 1))
    let covered = true
    for (let x = 1; x <= n && covered; x++) {
      let ok = bought(x) !== 0
      for (let i = 1; i < x && !ok; i++) if (bought(i) && x <= 2 * i) ok = true
      covered = ok
    }
    if (!covered) continue
    let cost = 0
    for (let i = 1; i <= n; i++) if (bought(i)) cost += prices[i - 1]
    best = Math.min(best, cost)
  }
  return best
}

test('2969 random inputs match the purchase-set oracle', () => {
  let seed = 2969
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rnd(11) }, () => 1 + rnd(20))
    assert.equal(solve(prices), oracle(prices), JSON.stringify(prices))
  }
})

test('2969 frames keep valid lines and the costs stay finite', () => {
  const run = buildTrace({ prices: [5, 1, 3, 2, 4] })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.costs.every(Number.isFinite))
  }
})
