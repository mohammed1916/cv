import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(grid) {
  let count = 0
  for (let r1 = 0; r1 < grid.length; r1++) for (let r2 = r1 + 1; r2 < grid.length; r2++)
    for (let c1 = 0; c1 < grid[0].length; c1++) for (let c2 = c1 + 1; c2 < grid[0].length; c2++)
      if (grid[r1][c1] && grid[r1][c2] && grid[r2][c1] && grid[r2][c2]) count++
  return count
}

test('750 worked examples', () => {
  assert.equal(buildTrace([[1, 0, 0, 1, 0], [0, 0, 1, 0, 1], [0, 0, 0, 1, 0], [1, 0, 1, 0, 1]]).result, 1)
  assert.equal(buildTrace([[1, 1, 1], [1, 1, 1], [1, 1, 1]]).result, 9)
})

test('750 random grids match a four-corner search', () => {
  let state = 750
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rand(5), n = 1 + rand(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rand(2)))
    assert.equal(buildTrace(grid).result, brute(grid), JSON.stringify(grid))
  }
})

test('750 rejects values other than 0 and 1', () => {
  assert.throws(() => parseInput('[[2]]'))
})
