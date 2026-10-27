import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Independent oracle: Dijkstra with a simple O(V^2) scan, where entering a neighbour costs 0 when
// the current cell's arrow points at it and 1 otherwise.
const oracle = grid => {
  const m = grid.length
  const n = grid[0].length
  const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  const d = Array.from({ length: m }, () => Array(n).fill(Infinity))
  const done = Array.from({ length: m }, () => Array(n).fill(false))
  d[0][0] = 0
  for (;;) {
    let best = null
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (!done[r][c] && d[r][c] < Infinity && (!best || d[r][c] < d[best[0]][best[1]])) best = [r, c]
    if (!best) break
    const [r, c] = best
    done[r][c] = true
    DIRS.forEach(([dr, dc], k) => {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n) return
      d[nr][nc] = Math.min(d[nr][nc], d[r][c] + (grid[r][c] === k + 1 ? 0 : 1))
    })
  }
  return d[m - 1][n - 1]
}

// Small deterministic PRNG so failures reproduce.
const rng = seed => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

test('official examples', () => {
  assert.equal(buildTrace([[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]]).result, 3)
  assert.equal(buildTrace([[1, 1, 3], [3, 2, 2], [1, 1, 4]]).result, 0)
  assert.equal(buildTrace([[1, 2], [4, 3]]).result, 1)
})

test('matches an independent Dijkstra on seeded random grids', () => {
  const next = rng(1368)
  for (let t = 0; t < 200; t++) {
    const m = 1 + Math.floor(next() * 5)
    const n = 1 + Math.floor(next() * 5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + Math.floor(next() * 4)))
    const run = buildTrace(parseInput(JSON.stringify(grid)))
    assert.equal(run.result, oracle(grid), JSON.stringify(grid))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[1,5]]'))
  assert.throws(() => parseInput('[[0]]'))
})
