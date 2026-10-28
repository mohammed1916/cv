import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3142 official examples', () => {
  assert.equal(solve([[1, 0, 2], [1, 0, 2], [1, 0, 2]]), true)
  assert.equal(solve([[1, 1, 1], [0, 0, 0], [0, 0, 0]]), false)
  assert.equal(solve([[1, 2, 3], [3, 4, 4], [5, 6, 7]]), false)
})

test('3142 a single cell satisfies the conditions', () => {
  assert.equal(solve([[7]]), true)
})

test('3142 rejects digits outside 0 to 9', () => {
  assert.throws(() => parseInput('{"grid":[[10]]}'))
})

// Independent oracle: every column must be constant, and neighbouring columns must differ in every row.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  for (let c = 0; c < cols; c++) {
    for (let r = 1; r < rows; r++) if (grid[r][c] !== grid[0][c]) return false
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c + 1 < cols; c++) if (grid[r][c] === grid[r][c + 1]) return false
  }
  return true
}

test('3142 seeded random grids match the column-based oracle', () => {
  let seed = 3142
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let trues = 0
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(3)))
    if (t % 3 === 0) {
      // Build a grid that satisfies the rules more often, so both outcomes are exercised.
      const pattern = Array.from({ length: n }, (_, c) => (c === 0 ? rnd(10) : (grid[0][c - 1] + 1 + rnd(8)) % 10))
      for (let r = 0; r < m; r++) grid[r] = [...pattern]
    }
    const expected = oracle(grid)
    if (expected) trues++
    assert.equal(solve(grid), expected, JSON.stringify(grid))
  }
  assert.ok(trues > 0)
})
