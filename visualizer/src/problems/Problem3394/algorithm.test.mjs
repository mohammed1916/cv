import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, rectangles) => buildTrace(parseInput(JSON.stringify({ n, rectangles }))).result

test('3394 examples', () => {
  assert.equal(solve(5, [[1, 0, 5, 2], [0, 2, 2, 4], [3, 2, 5, 3], [0, 4, 4, 5]]), true)
  assert.equal(solve(4, [[0, 0, 1, 1], [2, 0, 3, 4], [0, 2, 2, 3], [3, 0, 4, 3]]), true)
  assert.equal(solve(4, [[0, 2, 2, 4], [1, 0, 3, 2], [2, 2, 3, 4], [3, 0, 4, 2], [3, 2, 4, 4]]), false)
})

test('3394 rectangles that touch at an edge do not join', () => {
  // Two cuts along x at 1 and 2 separate three columns, each holding one rectangle.
  assert.equal(solve(3, [[0, 0, 1, 3], [1, 0, 2, 3], [2, 0, 3, 3]]), true)
})

test('3394 rejects an empty rectangle', () => {
  assert.throws(() => parseInput('{"n":3,"rectangles":[[1,0,1,2]]}'))
})

// Independent oracle: try every pair of cut positions on each axis and check that each rectangle lies
// wholly inside one section and that every section holds at least one rectangle.
function oracle(n, rectangles) {
  for (let axis = 0; axis < 2; axis++) {
    for (let a = 1; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        const sections = [[0, a], [a, b], [b, n]]
        const counts = [0, 0, 0]
        let valid = true
        for (const r of rectangles) {
          const s = r[axis]
          const e = r[axis + 2]
          const index = sections.findIndex(([lo, hi]) => s >= lo && e <= hi)
          if (index < 0) {
            valid = false
            break
          }
          counts[index]++
        }
        if (valid && counts.every(c => c > 0)) return true
      }
    }
  }
  return false
}

test('3394 seeded random grids match a cut enumeration', () => {
  let seed = 3394
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const count = 1 + rnd(8)
    const rectangles = Array.from({ length: count }, () => {
      const x1 = rnd(n)
      const x2 = x1 + 1 + rnd(n - x1)
      const y1 = rnd(n)
      const y2 = y1 + 1 + rnd(n - y1)
      return [x1, y1, x2, y2]
    })
    assert.equal(solve(n, rectangles), oracle(n, rectangles), JSON.stringify({ n, rectangles }))
  }
})
