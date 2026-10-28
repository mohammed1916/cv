import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3402 official examples', () => {
  assert.equal(solve([[3, 2], [1, 3], [3, 4], [0, 1]]), 15)
  // Column 0 reads 3 then 0, so the 0 must become 4 (four steps). The other columns already increase.
  assert.equal(solve([[3, 2, 1], [0, 3, 2]]), 4)
})

test('3402 a single row needs no changes', () => {
  assert.equal(solve([[4, 0, 9]]), 0)
})

test('3402 rejects ragged rows', () => {
  assert.throws(() => parseInput('{"grid": [[1, 2], [3]]}'))
})

// Independent oracle: for each column, a dynamic program over the value each cell ends with.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const LIMIT = 9 + rows
  let total = 0
  for (let j = 0; j < cols; j++) {
    // dp[v] = least cost so far with the current cell ending exactly at value v.
    let dp = Array.from({ length: LIMIT + 1 }, (_, v) => (v >= grid[0][j] ? v - grid[0][j] : Infinity))
    for (let i = 1; i < rows; i++) {
      const next = new Array(LIMIT + 1).fill(Infinity)
      let bestBelow = Infinity
      for (let v = 0; v <= LIMIT; v++) {
        if (v >= grid[i][j]) next[v] = Math.min(Infinity, bestBelow + (v - grid[i][j]))
        bestBelow = Math.min(bestBelow, dp[v])
      }
      dp = next
    }
    total += Math.min(...dp)
  }
  return total
}

test('3402 random grids match a column dynamic program', () => {
  let seed = 3402
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
