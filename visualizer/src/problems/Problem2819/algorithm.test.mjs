import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (prices, queries) => buildTrace({ prices, queries }).result

test('2819 small worked queries', () => {
  assert.deepEqual(solve([2, 5, 9], [[4, 2]]), [1])
  assert.deepEqual(solve([3, 8, 1, 6], [[5, 0], [5, 4]]), [0, 10])
})

test('2819 relative loss can be negative and uses the cheapest values', () => {
  assert.deepEqual(solve([10, 2], [[3, 1]]), [-4])
  assert.deepEqual(solve([10, 2], [[3, 2]]), [-4 + 2])
})

test('2819 rejects malformed input', () => {
  assert.throws(() => parseInput('{"prices":[],"queries":[[1,0]]}'))
  assert.throws(() => parseInput('{"prices":[3],"queries":[[1,2]]}'))
  assert.throws(() => parseInput('{"prices":[3],"queries":[[0,1]]}'))
})

// Oracle: try every subset of m chocolates and keep the smallest Bob minus Alice total.
function oracle(prices, queries) {
  return queries.map(([k, m]) => {
    let best = Infinity
    const n = prices.length
    for (let mask = 0; mask < 1 << n; mask++) {
      let count = 0, sum = 0
      for (let i = 0; i < n; i++) {
        if (!(mask >> i & 1)) continue
        count++
        const bob = Math.min(prices[i], k)
        sum += bob - (prices[i] - bob)
      }
      if (count === m) best = Math.min(best, sum)
    }
    return best
  })
}

test('2819 random inputs match a subset oracle', () => {
  let seed = 2819
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const prices = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(12))
    const queries = Array.from({ length: 1 + rnd(3) }, () => [1 + rnd(12), rnd(prices.length + 1)])
    assert.deepEqual(solve(prices, queries), oracle(prices, queries), JSON.stringify({ prices, queries }))
  }
})

test('2819 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace(parseInput('{"prices":[4,9,2],"queries":[[3,2],[9,1]]}'))
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
})
