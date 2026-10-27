import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2328 official examples', () => {
  assert.equal(solve([[1, 1], [3, 4]]), 8)
  assert.equal(solve([[1], [2]]), 3)
})

test('2328 equal neighbours never join a path', () => {
  // Two equal values cannot be in the same path, so each cell is its own path.
  assert.equal(solve([[5, 5]]), 2)
})

test('2328 rejects a ragged grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: enumerate every strictly increasing path explicitly, from every start cell.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0
  const walk = (r, c) => {
    count++
    const neighbours = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]
    for (const [nr, nc] of neighbours) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] > grid[r][c]) walk(nr, nc)
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) walk(r, c)
  return count
}

test('2328 random grids match an explicit path enumeration', () => {
  let seed = 2328
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(4)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
