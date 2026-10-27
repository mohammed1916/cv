import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3070 examples', () => {
  assert.equal(solve([[1, 1], [1, 1]], 2), 3)
  assert.equal(solve([[0, 0], [0, 0]], 0), 4)
  assert.equal(solve([[5]], 4), 0)
})

test('3070 corners whose rectangle sum exceeds k are excluded', () => {
  // Prefix sums are 0, 9, 9 and 27: the full grid (27) is over k, the other three are not.
  assert.equal(solve([[0, 9], [9, 9]], 9), 3)
})

test('3070 rejects a negative k and an out-of-range cell', () => {
  assert.throws(() => parseInput('{"grid":[[1]],"k":-1}'))
  assert.throws(() => parseInput('{"grid":[[10]],"k":3}'))
})

// Independent oracle: sum each rectangle that starts at (0, 0) directly, cell by cell.
function oracle(grid, k) {
  let count = 0
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
    let sum = 0
    for (let i = 0; i <= r; i++) for (let j = 0; j <= c; j++) sum += grid[i][j]
    if (sum <= k) count++
  }
  return count
}

test('3070 random grids match a direct rectangle-sum oracle', () => {
  let seed = 3070
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(6), cols = 1 + rnd(6)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    const k = rnd(101)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
