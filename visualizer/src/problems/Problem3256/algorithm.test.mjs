import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3256 official examples', () => {
  assert.equal(solve([[-3, 1, 1, -3], [-3, 1, -3, 1], [-3, 2, 1, 2]]), 4)
  assert.equal(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 15)
})

test('3256 the three rooks must use three rows and three columns', () => {
  assert.equal(solve([[9, 9, 0], [0, 9, 9], [9, 0, 9]]), 27)
})

test('3256 rejects a board with fewer than three rows', () => {
  assert.throws(() => parseInput('{"grid": [[1, 2, 3], [4, 5, 6]]}'))
})

// Independent oracle: enumerate every set of three cells and keep the best one with distinct rows and columns.
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

test('3256 random boards match a cell-triple oracle', () => {
  let seed = 3256
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const m = 3 + rnd(2)
    const n = 3 + rnd(2)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(19) - 9))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
