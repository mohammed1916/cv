import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (points, k) => buildTrace({ points, k }).result

test('1956 spreads on a Manhattan diamond', () => {
  assert.equal(solve([[0, 0], [4, 1], [1, 3], [2, 2]], 3), 2)
  assert.equal(solve([[1, 1], [3, 8], [9, 2], [4, 4], [0, 7]], 3), 4)
  assert.equal(solve([[0, 0], [6, 0], [0, 6], [6, 6]], 4), 6)
})

test('1956 variants that start together count separately', () => {
  assert.equal(solve([[2, 2], [2, 2], [5, 0]], 2), 0)
  assert.equal(solve([[3, 3]], 1), 0)
})

test('1956 frames are well formed and the final frame reports the answer', () => {
  const run = buildTrace({ points: [[0, 0], [6, 0], [0, 6], [6, 6]], k: 4 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.trim().split('\n').length)
    assert.ok(frame.low <= frame.high)
    if (frame.cell) {
      assert.ok(frame.cell[0] >= frame.box.x0 && frame.cell[0] <= frame.box.x1)
      assert.ok(frame.cell[1] >= frame.box.y0 && frame.cell[1] <= frame.box.y1)
    }
  }
  assert.equal(run.frames.at(-1).day, run.result)
})

test('1956 rejects malformed input', () => {
  assert.throws(() => parseInput('{"points":[[0,0]],"k":2}'))
  assert.throws(() => parseInput('{"points":[[0,0,1]],"k":1}'))
})

// Oracle: no bounding-box shortcut. Scan every day and every cell in a wide window.
function oracle(points, k) {
  for (let t = 0; ; t += 1) {
    for (let cx = -12; cx <= 12; cx += 1) {
      for (let cy = -12; cy <= 12; cy += 1) {
        let count = 0
        for (const [px, py] of points) if (Math.abs(cx - px) + Math.abs(cy - py) <= t) count += 1
        if (count >= k) return t
      }
    }
  }
}

test('1956 random inputs agree with a day-by-day scan', () => {
  let seed = 1956
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const points = Array.from({ length: n }, () => [rnd(7), rnd(7)])
    const k = 1 + rnd(n)
    assert.equal(solve(points, k), oracle(points, k), JSON.stringify({ points, k }))
  }
})
