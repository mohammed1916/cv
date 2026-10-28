import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2428 official examples', () => {
  assert.equal(solve([[6, 2, 1, 3], [4, 2, 1, 5], [9, 2, 8, 7], [4, 1, 2, 9]]), 30)
  assert.equal(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 35)
  assert.equal(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 35)
})

test('2428 the middle-row corners are not counted', () => {
  // Only one hourglass fits. Its top row (1+100+1), center 5, and bottom row (1+100+1) sum to 209.
  assert.equal(solve([[1, 100, 1], [100, 5, 100], [1, 100, 1]]), 209)
})

test('2428 rejects a grid smaller than 3 by 3', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]]}'))
})

// Independent oracle: take each 3 by 3 block in full and subtract its two middle-row corners.
function oracle(grid) {
  let best = -Infinity
  for (let top = 0; top + 3 <= grid.length; top++) {
    for (let left = 0; left + 3 <= grid[0].length; left++) {
      let block = 0
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) block += grid[top + a][left + b]
      const sum = block - grid[top + 1][left] - grid[top + 1][left + 2]
      best = Math.max(best, sum)
    }
  }
  return best
}

test('2428 seeded random grids match the block-minus-corners oracle', () => {
  let seed = 2428
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 3 + rnd(5)
    const n = 3 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(101)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
