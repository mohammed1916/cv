import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: Heron's formula from side lengths (a different formula than shoelace).
function heron(a, b, c) {
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1])
  const x = d(a, b), y = d(b, c), z = d(a, c), s = (x + y + z) / 2
  return Math.sqrt(Math.max(0, s * (s - x) * (s - y) * (s - z)))
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('[[0,0],[0,1],[1,0],[0,2],[2,0]]')).result, 2)
  assert.equal(buildTrace(parseInput('[[1,0],[0,0],[0,1]]')).result, 0.5)
})
test('random vs Heron', () => {
  let seed = 8
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const pts = Array.from({ length: 3 + rnd(6) }, () => [rnd(21) - 10, rnd(21) - 10])
    const r = buildTrace(pts)
    let best = 0
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) for (let k = j + 1; k < pts.length; k++) best = Math.max(best, heron(pts[i], pts[j], pts[k]))
    assert.ok(Math.abs(r.result - best) < 1e-6, JSON.stringify(pts))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[[0,0],[1,1]]'))
  assert.throws(() => parseInput('[[0,0],[1,1],[2,"a"]]'))
  assert.throws(() => parseInput('{}'))
})
