import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = prices => buildTrace({ prices }).result
const pyLines = python.trim().split('\n').length

test('2898 teaching examples', () => {
  assert.equal(solve([4, 7, 2, 9, 5, 11]), 27)
  assert.equal(solve([3, 3, 3]), 3)
  assert.equal(solve([5]), 5)
  assert.equal(solve([7, 7, 7, 7]), 7)
})

test('2898 parser rejects bad prices', () => {
  assert.throws(() => parseInput('{"prices":[]}'))
  assert.throws(() => parseInput('{"prices":[0]}'))
  assert.throws(() => parseInput('{"prices":[1.5]}'))
})

// Brute oracle: try every subset of days and keep the best one whose price-minus-index values agree.
function oracle(prices) {
  const n = prices.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let key = null
    let ok = true
    let sum = 0
    for (let i = 0; i < n && ok; i++) {
      if (!(mask & (1 << i))) continue
      const k = prices[i] - i
      if (key === null) key = k
      else if (k !== key) ok = false
      sum += prices[i]
    }
    if (ok) best = Math.max(best, sum)
  }
  return best
}

test('2898 random inputs match the subset oracle', () => {
  let seed = 2898
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(12))
    assert.equal(solve(prices), oracle(prices), JSON.stringify(prices))
  }
})

test('2898 frames keep valid lines and a non-decreasing best', () => {
  const run = buildTrace({ prices: [4, 7, 2, 9, 5, 11] })
  let previous = 0
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.best >= previous)
    previous = f.best
  }
})
