import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2556 a single bottleneck cell cuts the only route', () => {
  assert.equal(solve([[1, 1, 1]]), true)
  assert.equal(solve([[1, 1], [0, 1]]), true)
})

test('2556 two disjoint routes cannot be cut with one flip', () => {
  assert.equal(solve([[1, 1], [1, 1]]), false)
  assert.equal(solve([[1, 1, 1], [1, 0, 1], [1, 1, 1]]), false)
})

test('2556 a route that is already broken needs no flip', () => {
  assert.equal(solve([[1, 0], [0, 1]]), true)
})

test('2556 rejects a single cell and values other than 0 and 1', () => {
  assert.throws(() => parseInput('{"grid":[[1]]}'))
  assert.throws(() => parseInput('{"grid":[[1,2],[1,1]]}'))
})

// Independent oracle: try every flip of a single cell except the two corners and run a depth-first search.
function reachable(grid) {
  const rows = grid.length
  const cols = grid[0].length
  if (grid[0][0] === 0 || grid[rows - 1][cols - 1] === 0) return false
  const seen = new Set()
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === 0 || seen.has(`${r},${c}`)) return false
    if (r === rows - 1 && c === cols - 1) return true
    seen.add(`${r},${c}`)
    return dfs(r + 1, c) || dfs(r, c + 1) || dfs(r - 1, c) || dfs(r, c - 1)
  }
  return dfs(0, 0)
}

function oracle(grid) {
  if (!reachable(grid)) return true
  const rows = grid.length
  const cols = grid[0].length
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isCorner = (r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)
      if (isCorner || grid[r][c] === 0) continue
      const flipped = grid.map(row => [...row])
      flipped[r][c] = 0
      if (!reachable(flipped)) return true
    }
  }
  return false
}

test('2556 seeded random grids match the flip-every-cell oracle', () => {
  let seed = 2556
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    if (m * n < 2) continue
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(10) < 7 ? 1 : 0)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
