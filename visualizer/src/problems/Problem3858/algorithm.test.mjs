import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

// Independent oracle: try every combination of one value per row and take the smallest OR.
function oracle(grid) {
  let best = Infinity
  const walk = (row, acc) => {
    if (row === grid.length) { best = Math.min(best, acc); return }
    for (const v of grid[row]) walk(row + 1, acc | v)
  }
  walk(0, 0)
  return best
}

test('3858 official examples', () => {
  assert.equal(solve([[1, 5], [2, 4]]), 3)
  assert.equal(solve([[3, 5], [6, 4]]), 5)
  assert.equal(solve([[7, 9, 8]]), 7)
})

test('3858 rejects rows of different lengths', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

test('3858 random grids match the choose-one-per-row oracle', () => {
  let seed = 3858
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(3)
    const n = 1 + rnd(3)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(15)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
