import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3257 official examples', () => {
  assert.equal(solve([[-3, 1, 1, -3], [-3, 1, -3, 1], [-3, 2, 1, 2]]), 4)
  assert.equal(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 15)
})

test('3257 the best cell of a row can be blocked, so a lower candidate is used', () => {
  // Rows 0 and 1 both want column 0. The best assignment is row 0 at column 0 (9), row 1 at column 2 (1),
  // and row 2 at column 1 (8), for 18. Any assignment that gives row 1 column 0 as well is invalid.
  assert.equal(solve([[9, 1, 0], [9, 0, 1], [0, 8, 7]]), 18)
})

test('3257 rejects a board with fewer than three columns', () => {
  assert.throws(() => parseInput('{"grid": [[1, 2], [3, 4], [5, 6]]}'))
})

// Independent oracle: enumerate every set of three cells, with no candidate pruning, and keep the best valid one.
function oracle(grid) {
  const cells = []
  grid.forEach((row, r) => row.forEach((v, c) => cells.push([r, c, v])))
  let best = -Infinity
  for (let a = 0; a < cells.length; a++) {
    for (let b = a + 1; b < cells.length; b++) {
      for (let c = b + 1; c < cells.length; c++) {
        const picked = [cells[a], cells[b], cells[c]]
        if (new Set(picked.map(p => p[0])).size < 3 || new Set(picked.map(p => p[1])).size < 3) continue
        best = Math.max(best, picked[0][2] + picked[1][2] + picked[2][2])
      }
    }
  }
  return best
}

test('3257 random boards match a cell-triple oracle', () => {
  let seed = 3257
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const m = 3 + rnd(3)
    const n = 3 + rnd(3)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(19) - 9))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
