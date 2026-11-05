import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Direct probability recursion: P(x) = average of P over the previous maxPts scores (only scores below k continue).
function brute({ n, k, maxPts }) {
  const p = new Array(n + 1).fill(0)
  p[0] = 1
  for (let x = 1; x <= n; x++) {
    let sum = 0
    for (let d = 1; d <= maxPts; d++) { const prev = x - d; if (prev >= 0 && prev < k) sum += p[prev] }
    p[x] = sum / maxPts
  }
  let win = 0
  for (let x = k; x <= n; x++) win += p[x]
  if (k === 0) return 1
  return win
}

test('837 known values', () => {
  assert.ok(Math.abs(buildTrace({ n: 10, k: 1, maxPts: 10 }).result - 1) < 1e-9)
  assert.ok(Math.abs(buildTrace({ n: 6, k: 1, maxPts: 10 }).result - 0.6) < 1e-9)
  assert.ok(Math.abs(buildTrace({ n: 21, k: 17, maxPts: 10 }).result - 0.73278) < 1e-5)
})

test('837 small parameters match a direct probability recursion', () => {
  for (let n = 0; n <= 14; n++) for (let k = 0; k <= 8; k++) for (let m = 1; m <= 5; m++) {
    const got = buildTrace({ n, k, maxPts: m }).result
    const want = brute({ n, k, maxPts: m })
    assert.ok(Math.abs(got - want) < 1e-9, JSON.stringify({ n, k, m, got, want }))
  }
})

test('837 rejects maxPts of zero', () => {
  assert.throws(() => parseInput('{"n":1,"k":1,"maxPts":0}'))
})
