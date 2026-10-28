import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1091 official examples', () => {
  assert.equal(solve([[0, 1], [1, 0]]), 2)
  assert.equal(solve([[0, 0, 0], [1, 1, 0], [1, 1, 0]]), 4)
  assert.equal(solve([[1, 0, 0], [1, 1, 0], [1, 1, 0]]), -1)
})

test('1091 a single open cell has length one', () => {
  assert.equal(solve([[0]]), 1)
})

test('1091 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[0,0]]}'))
})

// Independent oracle: Bellman-Ford style relaxation over all open cells until no distance changes.
function oracle(grid) {
  const n = grid.length
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1
  const dist = grid.map(row => row.map(() => Infinity))
  dist[0][0] = 1
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] === 1 || dist[r][c] === Infinity) continue
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] === 1) continue
            if (dist[r][c] + 1 < dist[nr][nc]) {
              dist[nr][nc] = dist[r][c] + 1
              changed = true
            }
          }
        }
      }
    }
  }
  return dist[n - 1][n - 1] === Infinity ? -1 : dist[n - 1][n - 1]
}

test('1091 random grids match a relaxation oracle', () => {
  let seed = 1091
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 1 : 0)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
