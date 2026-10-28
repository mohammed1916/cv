import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3122 official examples', () => {
  assert.equal(solve([[1, 0, 2], [1, 0, 2]]), 0)
  assert.equal(solve([[1, 1, 1], [0, 0, 0]]), 3)
  assert.equal(solve([[1], [2], [3]]), 2)
})

test('3122 a single cell needs no change', () => {
  assert.equal(solve([[7]]), 0)
})

test('3122 rejects ragged rows', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: try every colour for every column (10 ^ columns candidate grids), build the
// full final grid, and check the two rules on the grid itself before counting changed cells.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  let best = Infinity
  const choose = (j, colours) => {
    if (j === cols) {
      const final = Array.from({ length: rows }, (_, i) => colours.map(c => c))
      let valid = true
      for (let i = 0; i < rows; i++) for (let k = 0; k + 1 < cols; k++) if (final[i][k] === final[i][k + 1]) valid = false
      if (!valid) return
      let changed = 0
      for (let i = 0; i < rows; i++) for (let k = 0; k < cols; k++) if (grid[i][k] !== final[i][k]) changed++
      best = Math.min(best, changed)
      return
    }
    for (let c = 0; c < 10; c++) choose(j + 1, [...colours, c])
  }
  choose(0, [])
  return best
}

test('3122 random grids match an enumerate-every-colouring oracle', () => {
  let seed = 3122
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const rows = 1 + rnd(3)
    const cols = 1 + rnd(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(4)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
