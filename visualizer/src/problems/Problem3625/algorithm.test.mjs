import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = points => buildTrace({ points }).result

test('3625 hand-computed shapes', () => {
  assert.equal(solve([[0, 0], [5, 0], [1, 3], [2, 3]]), 1) // one flat pair of sides
  assert.equal(solve([[0, 0], [3, 0], [4, 2], [1, 2]]), 1) // parallelogram counted once
  assert.equal(solve([[0, 0], [2, 0], [2, 2], [0, 2]]), 1) // square counted once
  // Two rows of three: 3 bottom pairs x 3 top pairs = 9; subsets with three collinear points are not shapes.
  assert.equal(solve([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]), 9)
})

test('3625 shapes with no answer', () => {
  assert.equal(solve([[0, 0], [1, 1], [2, 2], [3, 3]]), 0) // collinear
  assert.equal(solve([[0, 0], [5, 1], [7, 9], [1, 7]]), 0) // no two sides parallel
  assert.equal(solve([[0, 0], [6, 0], [3, 6], [3, 2]]), 0) // one point inside a triangle
})

test('3625 opposite orderings of a segment land in the same group', () => {
  assert.equal(solve([[2, 3], [0, 0], [4, 5], [6, 8]]), 1)
  assert.equal(solve([[0, 5], [0, 0], [3, 1], [3, 4]]), 1) // vertical rails with opposite point order
})

test('3625 parseInput rejects invalid input', () => {
  assert.doesNotThrow(() => parseInput('{"points":[[0,0],[1,0],[0,1],[1,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[1,0],[0,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[0,0],[0,1],[1,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[1,0],[0,1],[1001,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0],[1,0],[0,1],[1]]}'))
})

// Oracle from the definition: some cyclic order of the four points is strictly convex with a parallel opposite pair.
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
function isTrapezoid(q) {
  for (const [a, b, c, d] of [[q[0], q[1], q[2], q[3]], [q[0], q[1], q[3], q[2]], [q[0], q[2], q[1], q[3]]]) {
    const turns = [cross(a, b, c), cross(b, c, d), cross(c, d, a), cross(d, a, b)]
    if (!(turns.every(v => v > 0) || turns.every(v => v < 0))) continue
    const parallel = (p, r, s, t) => (r[0] - p[0]) * (t[1] - s[1]) === (r[1] - p[1]) * (t[0] - s[0])
    if (parallel(a, b, c, d) || parallel(b, c, d, a)) return true
  }
  return false
}
function oracle(points) {
  let total = 0
  const n = points.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    if (isTrapezoid([points[a], points[b], points[c], points[d]])) total++
  }
  return total
}

test('3625 matches checking every four points', () => {
  let seed = 53
  const rnd = limit => (seed = (seed * 1103515245 + 12345) % 2147483648) % limit
  for (let t = 0; t < 500; t++) {
    const range = 3 + rnd(6)
    const used = new Map()
    const size = 4 + rnd(6)
    for (let tries = 0; used.size < size && tries < 80; tries++) {
      const p = [rnd(range) - 2, rnd(range) - 2]
      used.set(p.join(','), p)
    }
    const points = [...used.values()]
    if (points.length < 4) continue
    assert.equal(solve(points), oracle(points), JSON.stringify(points))
  }
})

test('3625 frames are well formed', () => {
  const run = buildTrace({ points: [[0, 0], [3, 0], [4, 2], [1, 2]] })
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines.length && lines[f.pythonLine - 1].trim())
    assert.ok(f.message)
  }
  assert.deepEqual([...new Set(run.frames.map(f => f.phase))], phases.map(p => p.id))
  assert.equal(run.segments.length, 6)
  // Two parallel pairs then one subtraction, drawn as one shape.
  const totals = run.frames.map(f => f.total)
  assert.equal(Math.max(...totals), 2)
  assert.equal(run.frames.at(-1).total, 1)
  const shaped = run.frames.filter(f => f.shapes.length)
  assert.equal(shaped.length, 1)
  assert.equal(shaped[0].shapes[0].length, 4)
})
