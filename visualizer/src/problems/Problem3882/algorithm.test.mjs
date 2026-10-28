import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

// Independent oracle: enumerate every right/down path from the top-left to the bottom-right and XOR its cells.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  let best = Infinity
  const walk = (i, j, acc) => {
    const value = acc ^ grid[i][j]
    if (i === m - 1 && j === n - 1) { best = Math.min(best, value); return }
    if (i + 1 < m) walk(i + 1, j, value)
    if (j + 1 < n) walk(i, j + 1, value)
  }
  walk(0, 0, 0)
  return best
}

test('3882 official examples', () => {
  assert.equal(solve([[1, 2], [3, 4]]), 6)
  assert.equal(solve([[6, 7], [5, 8]]), 9)
  assert.equal(solve([[2, 7, 5]]), 0)
})

test('3882 rejects a value above 1023', () => {
  assert.throws(() => parseInput('{"grid":[[1024]]}'))
})

test('3882 random grids match the path-enumeration oracle', () => {
  let seed = 3882
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(64)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
