import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3380 official examples', () => {
  assert.equal(solve('[[1,1],[1,3],[3,1],[3,3]]'), 4)
  assert.equal(solve('[[1,1],[1,3],[3,1],[3,3],[2,2]]'), -1)
  // The full square is blocked by the side points, but the thin rectangle [1,3] x [2,3] has only corners on its border.
  assert.equal(solve('[[1,1],[1,3],[3,1],[3,3],[1,2],[3,2]]'), 2)
})

test('3380 a point on the border blocks the rectangle', () => {
  assert.equal(solve('[[0,0],[0,4],[4,0],[4,4],[2,4]]'), -1)
  assert.equal(solve('[[0,0],[0,4],[4,0],[4,4],[5,2]]'), 16)
})

test('3380 rejects duplicate points', () => {
  assert.throws(() => parseInput('[[1,1],[1,1]]'))
})

// Independent oracle: test every set of four points for being an axis-parallel rectangle, then every other point.
function oracle(points) {
  let best = -1
  const n = points.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    const quad = [points[a], points[b], points[c], points[d]]
    const xs = [...new Set(quad.map(p => p[0]))].sort((u, v) => u - v)
    const ys = [...new Set(quad.map(p => p[1]))].sort((u, v) => u - v)
    if (xs.length !== 2 || ys.length !== 2) continue
    const [x1, x2] = xs, [y1, y2] = ys
    const corners = [[x1, y1], [x1, y2], [x2, y1], [x2, y2]]
    if (!corners.every(([cx, cy]) => quad.some(([qx, qy]) => qx === cx && qy === cy))) continue
    const clear = points.every(([x, y]) => !(x >= x1 && x <= x2 && y >= y1 && y <= y2) || corners.some(([cx, cy]) => cx === x && cy === y))
    if (clear) best = Math.max(best, (x2 - x1) * (y2 - y1))
  }
  return best
}

test('3380 random point sets match a four-point oracle', () => {
  let seed = 3380
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const pts = new Set()
    while (pts.size < count) pts.add(`${rnd(6)},${rnd(6)}`)
    const points = [...pts].map(s => s.split(',').map(Number))
    assert.equal(solve(JSON.stringify(points)), oracle(points), JSON.stringify(points))
  }
})
