import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3239 official examples', () => {
  assert.equal(solve([[1, 0, 0], [0, 0, 0], [0, 0, 1]]), 2)
  assert.equal(solve([[0, 1], [0, 1], [0, 0]]), 1)
  assert.equal(solve([[1], [0]]), 0)
})

test('3239 a single row has no column mirror pairs, so the column cost is zero', () => {
  assert.equal(solve([[1, 0, 0, 1]]), 0)
  // The row cost is 1, but each column holds one cell, so every column is already a palindrome.
  assert.equal(solve([[1, 0, 0]]), 0)
})

test('3239 rejects values other than 0 and 1', () => {
  assert.throws(() => parseInput('{"grid":[[2]]}'))
})

// Independent oracle: try every subset of cells to flip (small grids only), and keep the smallest subset
// after which all rows are palindromes or all columns are palindromes.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const total = rows * cols
  let best = Infinity
  for (let mask = 0; mask < 1 << total; mask++) {
    const g = grid.map((row, r) => row.map((v, c) => (mask >> (r * cols + c)) & 1 ? 1 - v : v))
    const rowsOk = g.every(row => row.every((v, c) => v === row[cols - 1 - c]))
    const colsOk = g[0].map((_, c) => g.map(row => row[c])).every(col => col.every((v, r) => v === col[rows - 1 - r]))
    if (rowsOk || colsOk) {
      let flips = 0
      for (let b = mask; b; b &= b - 1) flips++
      best = Math.min(best, flips)
    }
  }
  return best
}

test('3239 seeded small grids match the subset-enumeration oracle', () => {
  let seed = 3239
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(3)
    const n = 1 + rnd(3)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
