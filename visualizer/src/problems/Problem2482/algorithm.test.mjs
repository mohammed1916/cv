import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2482 official examples', () => {
  assert.deepEqual(solve([[0, 1, 1], [1, 0, 1], [0, 0, 1]]), [[0, 0, 4], [0, 0, 4], [-2, -2, 2]])
  assert.deepEqual(solve([[1, 1, 1], [1, 1, 1]]), [[5, 5, 5], [5, 5, 5]])
})

test('2482 a single zero cell', () => {
  assert.deepEqual(solve([[0]]), [[-2]])
})

test('2482 rejects values other than 0 and 1', () => {
  assert.throws(() => parseInput('{"grid":[[2]]}'))
})

// Independent oracle: for each cell, scan its whole row and column and count ones and zeros directly.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const out = []
  for (let r = 0; r < rows; r++) {
    const line = []
    for (let c = 0; c < cols; c++) {
      let diff = 0
      for (let k = 0; k < cols; k++) diff += grid[r][k] === 1 ? 1 : -1
      for (let k = 0; k < rows; k++) diff += grid[k][c] === 1 ? 1 : -1
      line.push(diff)
    }
    out.push(line)
  }
  return out
}

test('2482 seeded random grids match the direct-count oracle', () => {
  let seed = 2482
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
