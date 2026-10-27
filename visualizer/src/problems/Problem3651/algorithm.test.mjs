import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3651 a teleport to a cell no larger than the start skips the walk', () => {
  // Without teleports the cheaper walk is down then right: 1 + 1 = 2.
  assert.equal(solve([[1, 9], [1, 1]], 0), 2)
  // One teleport from the start (value 1) to (1, 1) (value 1) is free, so the total is 0.
  assert.equal(solve([[1, 9], [1, 1]], 1), 0)
})

test('3651 with no teleports the answer is the cheapest right-and-down route', () => {
  // Down, then right twice: 2 + 2 + 2 = 6, which beats 5 + 1 + 2 = 8 along the top row.
  assert.equal(solve([[0, 5, 1], [2, 2, 2]], 0), 6)
})

test('3651 a single cell costs nothing', () => {
  assert.equal(solve([[7]], 2), 0)
})

test('3651 rejects k above two', () => {
  assert.throws(() => parseInput('{"grid":[[1]],"k":3}'))
})

// Independent oracle: Bellman-Ford style relaxation over (cell, teleports used) states until nothing improves.
function oracle(grid, k) {
  const rows = grid.length, cols = grid[0].length
  const dist = Array.from({ length: rows }, () => Array.from({ length: cols }, () => new Array(k + 1).fill(Infinity)))
  dist[0][0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let t = 0; t <= k; t++) {
      const d = dist[r][c][t]
      if (d === Infinity) continue
      for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
        if (nr < rows && nc < cols && d + grid[nr][nc] < dist[nr][nc][t]) { dist[nr][nc][t] = d + grid[nr][nc]; changed = true }
      }
      if (t < k) {
        for (let x = 0; x < rows; x++) for (let y = 0; y < cols; y++) {
          if (grid[x][y] <= grid[r][c] && d < dist[x][y][t + 1]) { dist[x][y][t + 1] = d; changed = true }
        }
      }
    }
  }
  return Math.min(...dist[rows - 1][cols - 1])
}

test('3651 random grids match a state-relaxation oracle', () => {
  let seed = 3651
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(4), cols = 1 + rnd(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    const k = rnd(3)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
