import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (quality, wage, k) => buildTrace(parseInput(JSON.stringify({ quality, wage, k }))).result

// Oracle: enumerate all subsets of size k.
function oracle(quality, wage, k) {
  const n = quality.length; let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let c = 0, sq = 0, r = 0
    for (let i = 0; i < n; i++) if (mask >> i & 1) { c++; sq += quality[i]; r = Math.max(r, wage[i] / quality[i]) }
    if (c === k) best = Math.min(best, sq * r)
  }
  return best
}

test('official examples', () => {
  assert.ok(Math.abs(solve([10, 20, 5], [70, 50, 30], 2) - 105) < 1e-5)
  assert.ok(Math.abs(solve([3, 1, 10, 10, 1], [4, 8, 2, 2, 7], 3) - 30.66667) < 1e-4)
})

test('matches subset enumeration', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 9)
    const q = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20))
    const w = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 40))
    const k = 1 + Math.floor(Math.random() * n)
    assert.ok(Math.abs(solve(q, w, k) - oracle(q, w, k)) < 1e-6)
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('{"quality":[1,2],"wage":[3,4],"k":2}'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"quality":[1],"wage":[1,2],"k":1}'))
  assert.throws(() => parseInput('{"quality":[1],"wage":[1],"k":2}'))
  assert.throws(() => parseInput('{"quality":[0],"wage":[1],"k":1}'))
  assert.throws(() => parseInput('[]'))
})
