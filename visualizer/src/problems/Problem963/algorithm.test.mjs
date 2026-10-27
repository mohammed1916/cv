import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace(points).result

test('963 official examples', () => {
  assert.ok(Math.abs(solve([[1, 2], [2, 1], [1, 0], [0, 1]]) - 2) < 1e-5)
  assert.ok(Math.abs(solve([[0, 1], [2, 1], [1, 1], [1, 0], [2, 0]]) - 1) < 1e-5)
  assert.equal(solve([[0, 0], [1, 1], [2, 0]]), 0)
})

test('963 rejects duplicate points', () => {
  assert.throws(() => parseInput('[[0,0],[0,0]]'))
})

// Independent oracle: every 4-point set whose diagonals share a midpoint and have equal length is a rectangle.
function oracle(points) {
  const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
  let best = Infinity
  const n = points.length
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) {
    const quad = [points[i], points[j], points[k], points[l]]
    // Three ways to pair the points into diagonals.
    const pairings = [[0, 1, 2, 3], [0, 2, 1, 3], [0, 3, 1, 2]]
    for (const [a, b, c, d] of pairings) {
      const P = quad[a], Q = quad[b], R = quad[c], S = quad[d]
      const sameMid = P[0] + Q[0] === R[0] + S[0] && P[1] + Q[1] === R[1] + S[1]
      if (sameMid && dist2(P, Q) === dist2(R, S) && dist2(P, Q) > 0) {
        const side1 = Math.sqrt(dist2(P, R)), side2 = Math.sqrt(dist2(P, S))
        best = Math.min(best, side1 * side2)
      }
    }
  }
  return best === Infinity ? 0 : best
}

test('963 random point sets match an oracle', () => {
  let seed = 31
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const seen = new Set()
    const points = []
    const target = 4 + rnd(5)
    while (points.length < target) {
      const p = [rnd(7) - 3, rnd(7) - 3]
      if (seen.has(p.join())) continue
      seen.add(p.join())
      points.push(p)
    }
    assert.ok(Math.abs(solve(points) - oracle(points)) < 1e-5, JSON.stringify(points))
  }
})
