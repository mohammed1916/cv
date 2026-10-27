import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1895 examples', () => {
  assert.equal(solve([[7, 1, 4, 5, 6], [2, 5, 1, 6, 4], [1, 5, 4, 3, 2], [1, 2, 7, 3, 4]]), 3)
  assert.equal(solve([[5, 1, 3, 1], [9, 3, 3, 2], [1, 3, 3, 8]]), 2)
  assert.equal(solve([[1, 2], [3, 4]]), 1)
})

test('1895 a single cell is always magic', () => {
  assert.equal(solve([[0]]), 1)
})

test('1895 rejects an empty row list and a value out of range', () => {
  assert.throws(() => parseInput('{"grid":[]}'))
  assert.throws(() => parseInput('{"grid":[[10]]}'))
})

// Independent oracle: enumerate every square and every line by hand, without the early return.
function oracle(grid) {
  const rows = grid.length, cols = grid[0].length
  let best = 1
  for (let top = 0; top < rows; top++) for (let left = 0; left < cols; left++) for (let side = 2; top + side <= rows && left + side <= cols; side++) {
    const lineSums = []
    for (let i = 0; i < side; i++) { let s = 0; for (let c = left; c < left + side; c++) s += grid[top + i][c]; lineSums.push(s) }
    for (let c = left; c < left + side; c++) { let s = 0; for (let i = 0; i < side; i++) s += grid[top + i][c]; lineSums.push(s) }
    let diagonal = 0, anti = 0
    for (let k = 0; k < side; k++) { diagonal += grid[top + k][left + k]; anti += grid[top + k][left + side - 1 - k] }
    lineSums.push(diagonal, anti)
    if (new Set(lineSums).size === 1) best = Math.max(best, side)
  }
  return best
}

test('1895 random grids match an exhaustive oracle', () => {
  let seed = 1895
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(5), cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(4)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
