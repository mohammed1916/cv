import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, rowShift, colShift) => buildTrace({ grid, rowShift, colShift }).result

test('4052 official examples', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]], [1, 0], [0, 1]), [[2, 4], [3, 1]])
  assert.deepEqual(
    solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 2, 0], [2, 2, 1]),
    [[7, 8, 5], [2, 3, 9], [6, 4, 1]],
  )
})

test('4052 zero shifts return the grid unchanged', () => {
  assert.deepEqual(solve([[5]], [0], [0]), [[5]])
})

test('4052 rejects a shift equal to n', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"rowShift":[2,0],"colShift":[0,0]}'))
})

// Independent oracle: rotate rows and columns with slice-based rotations, then transpose back.
function oracle(grid, rowShift, colShift) {
  const n = grid.length
  const rot = (arr, s) => arr.slice(s).concat(arr.slice(0, s))
  const rows = grid.map((row, i) => rot(row, rowShift[i]))
  const cols = Array.from({ length: n }, (_, j) => rot(rows.map(r => r[j]), colShift[j]))
  return Array.from({ length: n }, (_, i) => cols.map(col => col[i]))
}

test('4052 random grids match a slice-rotation oracle', () => {
  let seed = 4052
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => 1 + rnd(9)))
    const rowShift = Array.from({ length: n }, () => rnd(n))
    const colShift = Array.from({ length: n }, () => rnd(n))
    assert.deepEqual(solve(grid, rowShift, colShift), oracle(grid, rowShift, colShift), JSON.stringify({ grid, rowShift, colShift }))
  }
})
