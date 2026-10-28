import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('1293 official examples', () => {
  assert.equal(solve([[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1), 6)
  assert.equal(solve([[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1), -1)
})

test('1293 a single cell needs no steps', () => {
  assert.equal(solve([[0]], 0), 0)
})

test('1293 rejects an obstacle on the start cell', () => {
  assert.throws(() => parseInput('{"grid":[[1,0],[0,0]],"k":0}'))
})

// Independent oracle: relax distances over every (row, column, removals used) state until nothing improves.
function oracle(grid, k) {
  const m = grid.length
  const n = grid[0].length
  const INF = Infinity
  const dist = Array.from({ length: m }, () => Array.from({ length: n }, () => Array(k + 1).fill(INF)))
  dist[0][0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        for (let u = 0; u <= k; u++) {
          const d = dist[r][c][u]
          if (d === INF) continue
          for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
            if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
            const nu = u + grid[nr][nc]
            if (nu <= k && d + 1 < dist[nr][nc][nu]) {
              dist[nr][nc][nu] = d + 1
              changed = true
            }
          }
        }
      }
    }
  }
  const best = Math.min(...dist[m - 1][n - 1])
  return best === INF ? -1 : best
}

test('1293 random grids match a relaxation oracle', () => {
  let seed = 1293
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 1 : 0)))
    grid[0][0] = 0
    grid[m - 1][n - 1] = 0
    const k = rnd(4)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
