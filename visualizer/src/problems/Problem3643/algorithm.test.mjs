import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, x, y, k) => buildTrace(parseInput(JSON.stringify({ grid, x, y, k }))).result

test('3643 official examples', () => {
  assert.deepEqual(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0, 0, 3), [[7, 8, 9], [4, 5, 6], [1, 2, 3]])
  assert.deepEqual(solve([[3, 4, 2, 3], [2, 3, 4, 2]], 0, 2, 2), [[3, 4, 4, 2], [2, 3, 2, 3]])
})

test('3643 a one by one square changes nothing and only the square moves', () => {
  assert.deepEqual(solve([[5, 6], [7, 8]], 1, 1, 1), [[5, 6], [7, 8]])
  assert.deepEqual(solve([[1, 2, 3], [4, 5, 6]], 0, 1, 2), [[1, 5, 6], [4, 2, 3]])
})

test('3643 rejects a square that leaves the grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"x":1,"y":0,"k":2}'))
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"x":0,"y":0,"k":0}'))
})

// Independent oracle: a closed-form index map. Cell (i, j) inside the square takes the value
// from row 2x + k - 1 - i of the original grid; every other cell keeps its value.
function oracle(grid, x, y, k) {
  return grid.map((row, i) => row.map((value, j) => {
    const inside = i >= x && i < x + k && j >= y && j < y + k
    return inside ? grid[2 * x + k - 1 - i][j] : value
  }))
}

test('3643 seeded random grids match the index-map oracle', () => {
  let seed = 3643
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(100)))
    const k = 1 + rnd(Math.min(m, n))
    const x = rnd(m - k + 1)
    const y = rnd(n - k + 1)
    assert.deepEqual(solve(grid, x, y, k), oracle(grid, x, y, k), JSON.stringify({ grid, x, y, k }))
    checked++
  }
  assert.equal(checked, 400)
})
