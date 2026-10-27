import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('2435 official examples', () => {
  assert.equal(solve([[5, 2, 4], [3, 0, 5], [0, 7, 2]], 3), 2)
  assert.equal(solve([[0, 0]], 5), 1)
  assert.equal(solve([[7, 3, 4, 9], [2, 3, 6, 2], [2, 3, 7, 0]], 1), 10)
})

test('2435 remainders are taken before adding, so large sums still count', () => {
  // One path with sum 9 + 9 + 9 = 27, which is divisible by 9.
  assert.equal(solve([[9, 9], [9, 0]], 9), 2)
})

test('2435 rejects k outside 1 to 10', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[1]], k: 11 })))
})

// Independent oracle: enumerate every right-or-down path and add up its cells.
function oracle(grid, k) {
  const m = grid.length
  const n = grid[0].length
  let count = 0
  const walk = (r, c, sum) => {
    const total = sum + grid[r][c]
    if (r === m - 1 && c === n - 1) {
      if (total % k === 0) count++
      return
    }
    if (r + 1 < m) walk(r + 1, c, total)
    if (c + 1 < n) walk(r, c + 1, total)
  }
  walk(0, 0, 0)
  return count % 1000000007
}

test('2435 random grids match an enumeration of every path', () => {
  let seed = 2435
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(10)))
    const k = 1 + rnd(10)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
