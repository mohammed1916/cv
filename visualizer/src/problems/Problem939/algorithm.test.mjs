import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = p => buildTrace(parseInput(JSON.stringify(p))).result
// Oracle: every 4-subset, test the axis-parallel rectangle structure.
function oracle(p) {
  let best = 0
  const n = p.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    const q = [p[a], p[b], p[c], p[d]]
    const xs = [...new Set(q.map(v => v[0]))], ys = [...new Set(q.map(v => v[1]))]
    if (xs.length !== 2 || ys.length !== 2) continue
    if (new Set(q.map(v => v.join(','))).size !== 4) continue
    const area = Math.abs(xs[0] - xs[1]) * Math.abs(ys[0] - ys[1])
    if (!best || area < best) best = area
  }
  return best
}
test('official examples', () => {
  assert.equal(solve([[1, 1], [1, 3], [3, 1], [3, 3], [2, 2]]), 4)
  assert.equal(solve([[1, 1], [1, 3], [3, 1], [3, 3], [4, 1], [4, 3]]), 2)
  assert.equal(solve([[0, 0], [1, 1], [2, 0]]), 0)
})
test('random point sets vs 4-subset oracle', () => {
  let seed = 5; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  for (let t = 0; t < 300; t++) {
    const set = new Map()
    for (let k = 0, m = 1 + rnd(10); k < m; k++) { const p = [rnd(5), rnd(5)]; set.set(p.join(','), p) }
    const pts = [...set.values()]
    assert.equal(solve(pts), oracle(pts), JSON.stringify(pts))
  }
})
test('rejects bad input', () => {
  for (const bad of ['[]', '[[1,1],[1,1]]', '[[1]]', '[[1,-1]]', '3']) assert.throws(() => parseInput(bad))
})
