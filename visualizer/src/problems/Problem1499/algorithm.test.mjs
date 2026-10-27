import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1499 official examples', () => {
  assert.equal(solve({ points: [[1, 3], [2, 0], [5, 10], [6, -10]], k: 1 }), 4)
  assert.equal(solve({ points: [[0, 0], [3, 0], [9, 2]], k: 3 }), 3)
})

test('1499 the window limit excludes far pairs', () => {
  // The pair (-10, 5) and (-1, 5) is too far apart for k = 1, so only (-1, 5) and (0, 1) count: 5 + 1 + 1 = 7.
  assert.equal(solve({ points: [[-10, 5], [-1, 5], [0, 1]], k: 1 }), 7)
  assert.throws(() => parseInput('{"points":[[0,0],[10,0]],"k":9}'))
})

test('1499 rejects unsorted x values', () => {
  assert.throws(() => parseInput('{"points":[[2,1],[1,1]],"k":3}'))
})

// Independent oracle: try every pair within the window directly.
function oracle({ points, k }) {
  let best = -Infinity
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    const dx = points[j][0] - points[i][0]
    if (dx <= k) best = Math.max(best, points[i][1] + points[j][1] + Math.abs(dx))
  }
  return best
}

test('1499 random point sets match a pairwise oracle', () => {
  let seed = 1499
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 2 + rnd(8)
    const xs = new Set()
    while (xs.size < count) xs.add(rnd(21) - 10)
    const points = [...xs].sort((a, b) => a - b).map(x => [x, rnd(21) - 10])
    const k = 1 + rnd(10)
    const input = { points, k }
    const parsed = (() => { try { parseInput(JSON.stringify(input)); return true } catch { return false } })()
    if (!parsed) continue
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
