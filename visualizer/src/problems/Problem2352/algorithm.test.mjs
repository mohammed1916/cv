import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2352 official examples', () => {
  assert.equal(solve([[3, 2, 1], [1, 7, 6], [2, 7, 7]]), 1)
  assert.equal(solve([[3, 1, 2, 2], [1, 4, 4, 5], [2, 4, 2, 2], [2, 4, 2, 2]]), 3)
})

test('2352 a single cell pairs with itself', () => {
  assert.equal(solve([[9]]), 1)
})

test('2352 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2]]}'))
})

// Independent oracle: compare every row with every column element by element.
function oracle(grid) {
  const n = grid.length
  let count = 0
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let same = true
      for (let k = 0; k < n; k++) if (grid[r][k] !== grid[k][c]) { same = false; break }
      if (same) count++
    }
  }
  return count
}

test('2352 seeded random grids match the pairwise oracle', () => {
  let seed = 2352
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    // A small value range makes equal rows and columns common.
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => 1 + rnd(3)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
