import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3567 official examples', () => {
  assert.deepEqual(solve([[1, 8, 3], [5, 2, 7], [4, 6, 9]], 2), [[1, 1], [1, 1]])
  // One 3 by 3 window holds 1..9 with gap 1 everywhere.
  assert.deepEqual(solve([[1, 8, 3], [5, 2, 7], [4, 6, 9]], 3), [[1]])
})

test('3567 a window of equal values has difference zero', () => {
  assert.deepEqual(solve([[4, 4], [4, 4]], 2), [[0]])
})

test('3567 rejects k larger than the grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"k":3}'))
})

// Independent oracle: for each window, compare every pair of distinct values and keep the smallest gap.
function oracle(grid, k) {
  const rows = grid.length
  const cols = grid[0].length
  const out = []
  for (let i = 0; i + k <= rows; i++) {
    const line = []
    for (let j = 0; j + k <= cols; j++) {
      const vals = []
      for (let a = i; a < i + k; a++) for (let b = j; b < j + k; b++) vals.push(grid[a][b])
      let best = Infinity
      for (let x = 0; x < vals.length; x++) {
        for (let y = 0; y < vals.length; y++) {
          if (vals[x] !== vals[y]) best = Math.min(best, Math.abs(vals[x] - vals[y]))
        }
      }
      line.push(best === Infinity ? 0 : best)
    }
    out.push(line)
  }
  return out
}

test('3567 seeded random grids match the pairwise oracle', () => {
  let seed = 3567
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 2 + rnd(5)
    const n = 2 + rnd(5)
    const k = 1 + rnd(Math.min(m, n))
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(50)))
    assert.deepEqual(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
