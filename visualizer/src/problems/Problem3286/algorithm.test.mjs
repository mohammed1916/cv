import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, health) => buildTrace({ grid, health }).result

test('3286 worked examples', () => {
  assert.equal(solve([[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0]], 1), true)
  assert.equal(solve([[1, 1, 1], [1, 0, 1], [1, 1, 1]], 3), false)
  assert.equal(solve([[1, 1, 1], [1, 0, 1], [1, 1, 1]], 5), true)
})

test('3286 edge cases: one cell and one row', () => {
  assert.equal(solve([[0]], 1), true)
  assert.equal(solve([[1]], 1), false)
  assert.equal(solve([[1]], 2), true)
  assert.equal(solve([[0, 1, 1, 0]], 3), true)
  assert.equal(solve([[0, 1, 1, 0]], 2), false)
})

test('3286 rejects bad grids', () => {
  assert.throws(() => parseInput('{"grid":[[0,2]],"health":1}'))
  assert.throws(() => parseInput('{"grid":[[0,1],[0]],"health":1}'))
})

// Oracle: Bellman-Ford style relaxation until nothing changes, on the same cost model.
function oracle(grid, health) {
  const m = grid.length, n = grid[0].length
  const best = Array.from({ length: m }, () => Array(n).fill(Infinity))
  best[0][0] = grid[0][0]
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const pr = r + dr, pc = c + dc
        if (pr < 0 || pc < 0 || pr >= m || pc >= n) continue
        if (best[pr][pc] + grid[r][c] < best[r][c]) { best[r][c] = best[pr][pc] + grid[r][c]; changed = true }
      }
    }
  }
  return best[m - 1][n - 1] < health
}

test('3286 random grids match a relaxation oracle', () => {
  let seed = 3286
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    const health = 1 + rnd(6)
    assert.equal(solve(grid, health), oracle(grid, health), JSON.stringify({ grid, health }))
  }
})
