import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Independent oracle: Bellman-Ford style relaxation until nothing changes.
const oracle = grid => {
  const m = grid.length
  const n = grid[0].length
  const d = Array.from({ length: m }, () => Array(n).fill(Infinity))
  d[0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
        if (d[r][c] + grid[nr][nc] < d[nr][nc]) { d[nr][nc] = d[r][c] + grid[nr][nc]; changed = true }
      }
    }
  }
  return d[m - 1][n - 1]
}

const rng = seed => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

test('official examples', () => {
  assert.equal(buildTrace([[0, 1, 1], [1, 1, 0], [1, 1, 0]]).result, 2)
  assert.equal(buildTrace([[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0]]).result, 0)
})

test('matches an independent relaxation on seeded random grids', () => {
  const next = rng(2290)
  for (let t = 0; t < 200; t++) {
    const m = 1 + Math.floor(next() * 5)
    const n = 1 + Math.floor(next() * 5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (next() < 0.4 ? 1 : 0)))
    grid[0][0] = 0
    grid[m - 1][n - 1] = 0
    const run = buildTrace(parseInput(JSON.stringify(grid)))
    assert.equal(run.result, oracle(grid), JSON.stringify(grid))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[0,2]]'))
  assert.throws(() => parseInput('[[1,0]]'))
  assert.throws(() => parseInput('[[0,1],[0]]'))
})
