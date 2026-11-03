import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = flowers => buildTrace({ flowers }).result

test('1788 keeps the best endpoint pair and its positive middle', () => {
  assert.equal(solve([1, 2, 1]), 4)
  assert.equal(solve([3, -5, 3, 4, 3]), 13)
  assert.equal(solve([-2, -3, -2]), -4)
})

test('1788 skips negative middle flowers', () => {
  assert.equal(solve([5, -9, 5]), 10)
  assert.equal(solve([5, 1, -9, 6, 5]), 17)
})

test('1788 requires a repeated value as endpoints', () => {
  assert.throws(() => parseInput('{"flowers":[1,2,3]}'))
  assert.throws(() => parseInput('{"flowers":[1]}'))
})

test('1788 frames reference real pseudocode and python lines', () => {
  const run = buildTrace({ flowers: [2, 2] })
  const pyCount = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
  }
})

// Oracle: try every subset of flowers, keep those of size at least two whose endpoints match.
function oracle(flowers) {
  const n = flowers.length
  let best = null
  for (let mask = 1; mask < (1 << n); mask++) {
    const idx = []
    for (let k = 0; k < n; k++) if (mask & (1 << k)) idx.push(k)
    if (idx.length < 2) continue
    if (flowers[idx[0]] !== flowers[idx[idx.length - 1]]) continue
    const total = idx.reduce((s, k) => s + flowers[k], 0)
    if (best === null || total > best) best = total
  }
  return best
}

test('1788 random inputs match a subset oracle', () => {
  let seed = 1788
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const flowers = Array.from({ length: 2 + rnd(7) }, () => rnd(9) - 4)
    if (new Set(flowers).size === flowers.length) continue
    assert.equal(solve(flowers), oracle(flowers), JSON.stringify(flowers))
  }
})
