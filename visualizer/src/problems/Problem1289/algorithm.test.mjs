import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1289 official examples', () => {
  assert.equal(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 13)
  assert.equal(solve([[7]]), 7)
})

test('1289 a path may not reuse a column in the next row', () => {
  // Column 0 is cheapest in row 0, but row 1 cannot use column 0 after it.
  assert.equal(solve([[1, 5], [1, 9]]), 6)
})

test('1289 rejects a grid that is not square', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[1, 2], [3]] })))
})

// Independent oracle: try every column sequence and keep the valid ones.
function oracle(grid) {
  const n = grid.length
  let best = Infinity
  const walk = (r, cols, sum) => {
    if (r === n) { best = Math.min(best, sum); return }
    for (let c = 0; c < n; c++) {
      if (r > 0 && cols[r - 1] === c) continue
      walk(r + 1, [...cols, c], sum + grid[r][c])
    }
  }
  walk(0, [], 0)
  return best
}

test('1289 random grids match an enumeration of column sequences', () => {
  let seed = 1289
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(19) - 9))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
