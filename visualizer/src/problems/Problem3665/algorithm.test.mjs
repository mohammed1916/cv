import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, resolve } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3665 invented example', () => {
  // Four valid paths: the mirror at the centre sends two robot moves around it.
  assert.equal(solve([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 4)
})

test('3665 a reflection that leaves the grid is invalid', () => {
  // Down into the mirror at (1,0) turns right to the finish, so both moves count.
  assert.equal(solve([[0, 0], [1, 0]]), 2)
  assert.equal(resolve([[0, 0], [1, 0]], 0, 0, 'D').dest[1], 1)
  // Right into the mirror at (0,1) turns down into the mirror at (1,1), which turns right off the grid.
  assert.equal(resolve([[0, 1], [1, 1], [0, 0]], 0, 0, 'R').status, 'out')
  assert.equal(resolve([[0, 0], [1, 0]], 1, 1, 'R').status, 'edge')
})

// Oracle: explicit recursion over moves, following the same reflection rule without the DP table.
function recurse(grid, i, j) {
  const m = grid.length, n = grid[0].length
  if (i === m - 1 && j === n - 1) return 1
  let total = 0
  for (const dir of ['R', 'D']) {
    const res = resolve(grid, i, j, dir)
    if (res.dest) total += recurse(grid, res.dest[0], res.dest[1])
  }
  return total
}

test('3665 random grids match the recursive oracle', () => {
  let seed = 3665
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const m = 2 + rand(4), n = 2 + rand(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rand(10) < 3 ? 1 : 0)))
    grid[0][0] = 0
    grid[m - 1][n - 1] = 0
    assert.equal(solve(grid), recurse(grid, 0, 0) % 1000000007, JSON.stringify(grid))
  }
})

test('3665 rejects a mirror on the start cell', () => {
  assert.throws(() => parseInput('{"grid":[[1,0],[0,0]]}'))
})
