import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = grid => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(max_trailing_zeros(${JSON.stringify(grid)}))`]).toString().trim())

// Exhaustive: every simple path with at most one turn, from every start cell.
function brute(grid) {
  const m = grid.length, n = grid[0].length
  const f = (x, p) => { let c = 0; while (x % p === 0) { x /= p; c++ } return c }
  let best = 0
  const seen = Array.from({ length: m }, () => Array(n).fill(false))
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  const dfs = (r, c, s2, s5, lastDir, turned) => {
    best = Math.max(best, Math.min(s2, s5))
    for (let d = 0; d < 4; d++) {
      const [dr, dc] = dirs[d]
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc]) continue
      const isTurn = lastDir !== null && (d < 2) !== (lastDir < 2)
      if (isTurn && turned) continue
      seen[nr][nc] = true
      dfs(nr, nc, s2 + f(grid[nr][nc], 2), s5 + f(grid[nr][nc], 5), d, turned || isTurn)
      seen[nr][nc] = false
    }
  }
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    seen[r][c] = true
    dfs(r, c, f(grid[r][c], 2), f(grid[r][c], 5), null, false)
    seen[r][c] = false
  }
  return best
}

test('2245 a straight row or column can be the best path', () => {
  assert.equal(solve([[5, 10, 25, 50]]), 2)
  assert.equal(solve([[5], [5], [2]]), 1)
})

test('2245 a corner path uses one horizontal and one vertical arm', () => {
  assert.equal(solve([[1, 5, 1], [2, 1, 2], [1, 10, 1]]), brute([[1, 5, 1], [2, 1, 2], [1, 10, 1]]))
})

test('2245 frames point at real python lines', () => {
  for (const f of buildTrace({ grid: [[2, 5], [10, 1]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2245 rejects an empty or ragged grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"grid":[]}'))
})

test('2245 random small grids match an exhaustive search and the python mirror', () => {
  let seed = 2245
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 80; t++) {
    const m = 1 + rnd(3), n = 1 + rnd(3)
    const vals = [1, 2, 4, 5, 10, 20, 25, 50]
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => vals[rnd(vals.length)]))
    assert.equal(solve(grid), brute(grid), JSON.stringify(grid))
    if (t < 8) assert.equal(runPy(grid), brute(grid), JSON.stringify(grid))
  }
})
