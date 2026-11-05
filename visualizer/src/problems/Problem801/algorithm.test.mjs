import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(a, b) {
  const n = a.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const x = a.map((v, i) => (mask >> i) & 1 ? b[i] : v)
    const y = b.map((v, i) => (mask >> i) & 1 ? a[i] : v)
    const up = s => s.every((v, i) => i === 0 || s[i - 1] < v)
    if (!up(x) || !up(y)) continue
    const swaps = [...Array(n).keys()].filter(i => (mask >> i) & 1).length
    best = Math.min(best, swaps)
  }
  return best
}

test('801 worked examples', () => {
  assert.equal(buildTrace({ a: [1, 3, 5, 4], b: [1, 2, 3, 7] }).result, 1)
  assert.equal(buildTrace({ a: [0, 3, 5, 8, 9], b: [2, 1, 4, 6, 9] }).result, 1)
})

test('801 small arrays match an exhaustive swap-subset search', () => {
  let state = 801
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 600; t++) {
    const n = 2 + rand(5)
    const a = Array.from({ length: n }, () => rand(6)), b = Array.from({ length: n }, () => rand(6))
    assert.equal(buildTrace({ a, b }).result, brute(a, b), JSON.stringify({ a, b }))
  }
})

test('801 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"a":[1,2],"b":[1]}'))
})
