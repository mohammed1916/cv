import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = points => buildTrace(points).result
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol

test('1924 worked examples', () => {
  const acute = solve([[0, 0], [4, 0], [2, 3]])
  assert.ok(close(acute.center[0], 2) && close(acute.center[1], 5 / 6))
  assert.ok(close(acute.radius, 13 / 6))
  const obtuse = solve([[0, 0], [6, 0], [1, 1]])
  assert.ok(close(obtuse.center[0], 3) && close(obtuse.center[1], 0))
  assert.ok(close(obtuse.radius, 3))
})

test('1924 edge cases: one point, two points, interior point', () => {
  const one = solve([[7, 7]])
  assert.deepEqual(one.center, [7, 7])
  assert.equal(one.radius, 0)
  const two = solve([[0, 0], [0, 6]])
  assert.ok(close(two.center[0], 0) && close(two.center[1], 3) && close(two.radius, 3))
  const inner = solve([[0, 0], [4, 0], [2, 3], [2, 1]])
  assert.ok(close(inner.radius, 13 / 6))
})

test('1924 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[1,2,3]]'))
  assert.throws(() => parseInput('[[0.5,1]]'))
})

// Independent oracle: the optimal circle has two or three input points on its boundary. Try every
// diameter and every circumcircle and keep the smallest one that encloses all points.
function oracle(points) {
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
  const candidates = []
  for (let a = 0; a < points.length; a++) {
    candidates.push({ c: points[a], r: 0 })
    for (let b = a + 1; b < points.length; b++) {
      candidates.push({ c: [(points[a][0] + points[b][0]) / 2, (points[a][1] + points[b][1]) / 2], r: d(points[a], points[b]) / 2 })
      for (let c = b + 1; c < points.length; c++) {
        const [p, q, s] = [points[a], points[b], points[c]]
        const bx = q[0] - p[0], by = q[1] - p[1], cx = s[0] - p[0], cy = s[1] - p[1]
        const det = 2 * (bx * cy - by * cx)
        if (Math.abs(det) < 1e-12) continue
        const b2 = bx * bx + by * by, c2 = cx * cx + cy * cy
        const ux = (cy * b2 - by * c2) / det, uy = (bx * c2 - cx * b2) / det
        candidates.push({ c: [p[0] + ux, p[1] + uy], r: Math.hypot(ux, uy) })
      }
    }
  }
  let best = Infinity
  for (const cand of candidates) {
    if (points.every(p => d(p, cand.c) <= cand.r + 1e-6) && cand.r < best) best = cand.r
  }
  return best
}

test('1924 random point sets match a candidate-circle oracle', () => {
  let seed = 1924
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(7)
    const points = Array.from({ length: n }, () => [rnd(21) - 10, rnd(21) - 10])
    const got = solve(points)
    const want = oracle(points)
    assert.ok(Math.abs(got.radius - want) <= 1e-6, `${JSON.stringify(points)} got ${got.radius} want ${want}`)
    for (const p of points) assert.ok(Math.hypot(p[0] - got.center[0], p[1] - got.center[1]) <= got.radius + 1e-6)
  }
})

test('1924 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([[0, 0], [4, 0], [2, 3], [2, 1]])
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
