import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1594 official examples', () => {
  assert.equal(solve([[-1, -2, -3], [-2, -3, -3], [-3, -3, -2]]), -1)
  assert.equal(solve([[1, -2, 1], [1, -2, 1], [3, -4, 1]]), 8)
  assert.equal(solve([[1, 3], [0, -4]]), 0)
})

test('1594 two negatives multiply to a non-negative product', () => {
  // The only path multiplies two negative cells, which gives a positive product.
  assert.equal(solve([[-2, -3]]), 6)
})

test('1594 rejects a value outside -4 to 4', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[5]] })))
})

// Independent oracle: multiply the cells of every right-or-down path and keep the best product.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  let best = null
  const walk = (r, c, product) => {
    const value = product * grid[r][c]
    if (r === m - 1 && c === n - 1) {
      if (best === null || value > best) best = value
      return
    }
    if (r + 1 < m) walk(r + 1, c, value)
    if (c + 1 < n) walk(r, c + 1, value)
  }
  walk(0, 0, 1)
  if (best < 0) return -1
  return (best % 1000000007) + 0
}

test('1594 random grids match an enumeration of every path', () => {
  let seed = 1594
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(9) - 4))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
