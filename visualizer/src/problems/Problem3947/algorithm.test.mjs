import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, grantCounts, parseInput } from './algorithm.js'

const solve = (budget, types) => buildTrace({ budget, types }).result

// Oracle: enumerate how many copies of each type are bought, then count grants as min(copies, grant capacity).
function oracle(budget, types) {
  const d = grantCounts(types)
  let best = 0
  const counts = Array(types.length).fill(0)
  const walk = s => {
    if (s === types.length) {
      const cost = counts.reduce((sum, c, i) => sum + c * types[i][0], 0)
      if (cost > budget) return
      const value = counts.reduce((sum, c, i) => sum + c + Math.min(c, d[i]), 0)
      best = Math.max(best, value)
      return
    }
    for (let c = 0; c * types[s][0] <= budget; c += 1) { counts[s] = c; walk(s + 1) }
    counts[s] = 0
  }
  walk(0)
  return best
}

test('3947 hand-checked presets', () => {
  assert.equal(solve(10, [[2, 1], [3, 2], [4, 4], [5, 3]]), 8)
  assert.equal(solve(0, [[1, 1]]), 0)
})

test('3947 a lone type cannot grant to itself', () => {
  assert.equal(solve(6, [[2, 3]]), 3)
})

test('3947 grant counts follow divisibility of factors', () => {
  assert.deepEqual(grantCounts([[1, 1], [1, 2], [1, 4], [1, 3]]), [3, 1, 0, 0])
})

test('3947 parser rejects a price of zero', () => {
  assert.throws(() => parseInput('{"budget":3,"types":[[0,1]]}'))
})

test('3947 matches the copy-count enumeration on small inputs', () => {
  let seed = 3947
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const types = Array.from({ length: 1 + rnd(4) }, () => [1 + rnd(4), 1 + rnd(6)])
    const budget = rnd(12)
    assert.equal(solve(budget, types), oracle(budget, types), JSON.stringify({ budget, types }))
  }
})
