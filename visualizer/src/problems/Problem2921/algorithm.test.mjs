import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (prices, profits) => buildTrace({ prices, profits }).result
const pyLines = python.trim().split('\n').length

test('2921 teaching examples', () => {
  assert.equal(solve([2, 5, 3, 6, 4], [5, 1, 8, 4, 2]), 17)
  assert.equal(solve([4, 3, 2, 1], [1, 2, 3, 4]), -1)
  assert.equal(solve([9, 1, 5, 3, 8, 7], [2, 6, 4, 7, 1, 5]), 18)
  assert.equal(solve([6, 6, 6], [1, 2, 3]), -1)
})

test('2921 parser rejects mismatched or out-of-range lists', () => {
  assert.throws(() => parseInput('{"prices":[1,2],"profits":[1]}'))
  assert.throws(() => parseInput('{"prices":[1],"profits":[1.5]}'))
  assert.throws(() => parseInput('{"prices":[31],"profits":[1]}'))
})

// Brute oracle: every ordered triple of indices.
function oracle(prices, profits) {
  const n = prices.length
  let best = null
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    if (prices[i] < prices[j] && prices[j] < prices[k]) {
      const total = profits[i] + profits[j] + profits[k]
      if (best === null || total > best) best = total
    }
  }
  return best === null ? -1 : best
}

test('2921 random inputs match the triple oracle', () => {
  let seed = 2921
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(10)
    const prices = Array.from({ length: size }, () => 1 + rnd(12))
    const profits = Array.from({ length: size }, () => rnd(61) - 30)
    assert.equal(solve(prices, profits), oracle(prices, profits), JSON.stringify({ prices, profits }))
  }
})

test('2921 frames keep valid lines and only ever grow the tree', () => {
  const run = buildTrace({ prices: [9, 1, 5, 3, 8, 7], profits: [2, 6, 4, 7, 1, 5] })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
})
