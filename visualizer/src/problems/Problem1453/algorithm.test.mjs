import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const EPS = 1e-7
const solve = (points, r) => buildTrace(parseInput(JSON.stringify({ points, r }))).result

test('1453 official examples', () => {
  assert.equal(solve([[-2, 0], [2, 0], [0, 2], [0, -2]], 2), 4)
  assert.equal(solve([[-3, 0], [3, 0], [2, 6], [5, 4], [0, 9], [7, 8]], 5), 5)
})

test('1453 a lone dart and two darts out of reach', () => {
  assert.equal(solve([[0, 0]], 1), 1)
  assert.equal(solve([[0, 0], [4, 0]], 1), 1)
  assert.equal(solve([[0, 0], [2, 0]], 1), 2)
})

test('1453 rejects bad input', () => {
  assert.throws(() => parseInput('{"points":[[0,0],[0,0]],"r":1}'))
  assert.throws(() => parseInput('{"points":[[11,0]],"r":1}'))
  assert.throws(() => parseInput('{"points":[[0,0]],"r":0}'))
})

// Independent oracle: the same circle-through-two-darts idea, but the two centres are written as
// rotations of the chord and every circle is checked against every dart in a separate loop.
function oracle(points, r) {
  const candidates = points.map(p => [p[0], p[1]])
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue
      const chord = [points[j][0] - points[i][0], points[j][1] - points[i][1]]
      const length = Math.hypot(chord[0], chord[1])
      if (length === 0 || length > 2 * r) continue
      const along = Math.sqrt(r * r - (length * length) / 4) / length
      const mid = [(points[i][0] + points[j][0]) / 2, (points[i][1] + points[j][1]) / 2]
      const perp = [-chord[1], chord[0]]
      candidates.push([mid[0] + along * perp[0], mid[1] + along * perp[1]])
    }
  }
  let best = 0
  for (const [cx, cy] of candidates) {
    let count = 0
    for (const [x, y] of points) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + EPS) count++
    best = Math.max(best, count)
  }
  return best
}

// Lower-bound check: a grid of centres gives achievable counts, so the algorithm must never fall below them.
function gridBest(points, r) {
  let best = 0
  for (let cx = -6; cx <= 6; cx += 0.1) {
    for (let cy = -6; cy <= 6; cy += 0.1) {
      let count = 0
      for (const [x, y] of points) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) count++
      best = Math.max(best, count)
    }
  }
  return best
}

test('1453 random boards match the candidate oracle and dominate a grid search', () => {
  let seed = 1453
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const seen = new Set()
    const points = []
    const want = 1 + rnd(8)
    while (points.length < want) {
      const p = [rnd(9) - 4, rnd(9) - 4]
      const key = `${p[0]},${p[1]}`
      if (!seen.has(key)) { seen.add(key); points.push(p) }
    }
    const r = 1 + rnd(4)
    const got = solve(points, r)
    assert.equal(got, oracle(points, r), JSON.stringify({ points, r }))
    if (t < 20) assert.ok(gridBest(points, r) <= got, JSON.stringify({ points, r }))
  }
})
