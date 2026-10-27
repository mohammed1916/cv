import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3393 official example', () => {
  assert.equal(solve([[2, 1, 5], [7, 10, 0], [12, 6, 4]], 11), 3)
})

test('3393 a single cell is the only path', () => {
  assert.equal(solve([[7]], 7), 1)
  assert.equal(solve([[7]], 0), 0)
})

test('3393 rejects a value above 15', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[16]], k: 0 })))
})

// Independent oracle: enumerate every right-or-down path and XOR its cells.
function oracle(grid, k) {
  const m = grid.length
  const n = grid[0].length
  let count = 0
  const walk = (r, c, x) => {
    const value = x ^ grid[r][c]
    if (r === m - 1 && c === n - 1) {
      if (value === k) count++
      return
    }
    if (r + 1 < m) walk(r + 1, c, value)
    if (c + 1 < n) walk(r, c + 1, value)
  }
  walk(0, 0, 0)
  return count % 1000000007
}

test('3393 random grids match an enumeration of every path', () => {
  let seed = 3393
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(16)))
    const k = rnd(16)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
