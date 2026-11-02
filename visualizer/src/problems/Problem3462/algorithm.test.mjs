import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, limits, k) => buildTrace({ grid, limits, k }).result

test('3462 worked examples', () => {
  assert.equal(solve([[1, 2], [3, 4]], [1, 2], 2), 7)
  assert.equal(solve([[5, 3], [1, 9]], [1, 1], 1), 9)
  assert.equal(solve([[5, 3], [1, 9]], [0, 0], 3), 0)
})

test('3462 edge cases', () => {
  assert.equal(solve([[0]], [1], 1), 0)
  assert.equal(solve([[7, 7], [7, 7]], [2, 2], 4), 28)
  assert.equal(solve([[9, 1], [8, 2]], [1, 0], 2), 9)
})

test('3462 rejects bad input', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"limits":[1,1],"k":1}'))
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"limits":[3,1],"k":1}'))
})

// Oracle: enumerate every subset of cells (grid up to 3 by 3) and keep the best feasible sum.
function oracle(grid, limits, k) {
  const n = grid.length
  const cells = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c])
  let best = 0
  for (let mask = 0; mask < 1 << cells.length; mask++) {
    const perRow = Array(n).fill(0)
    let count = 0, sum = 0
    for (let i = 0; i < cells.length; i++) {
      if (!(mask & (1 << i))) continue
      const [r, c] = cells[i]
      perRow[r]++
      count++
      sum += grid[r][c]
    }
    if (count > k) continue
    if (perRow.some((v, r) => v > limits[r])) continue
    best = Math.max(best, sum)
  }
  return best
}

test('3462 random small grids match a subset oracle', () => {
  let seed = 3462
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(3)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(10)))
    const limits = Array.from({ length: n }, () => rnd(n + 1))
    const k = rnd(n * n + 1)
    assert.equal(solve(grid, limits, k), oracle(grid, limits, k), JSON.stringify({ grid, limits, k }))
  }
})
