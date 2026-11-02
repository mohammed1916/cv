import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('3148 worked examples', () => {
  assert.equal(solve([[9, 5, 7, 3], [8, 9, 6, 1], [6, 7, 14, 3], [2, 5, 3, 1]]), 9)
  assert.equal(solve([[4, 3, 2], [3, 2, 1]]), -1)
})

test('3148 edge cases', () => {
  assert.equal(solve([[1, 2]]), 1)
  assert.equal(solve([[1], [5]]), 4)
  assert.equal(solve([[5, 5], [5, 5]]), 0)
  assert.throws(() => parseInput('[[1]]'))
})

// Independent oracle: enumerate every right-or-down path with at least one move and sum its step differences.
function oracle(grid) {
  const m = grid.length, n = grid[0].length
  let best = -Infinity
  const walk = (i, j, score, moved) => {
    if (moved) best = Math.max(best, score)
    if (i + 1 < m) walk(i + 1, j, score + (grid[i + 1][j] - grid[i][j]), true)
    if (j + 1 < n) walk(i, j + 1, score + (grid[i][j + 1] - grid[i][j]), true)
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) walk(i, j, 0, false)
  return best
}

test('3148 random grids match the path enumeration oracle', () => {
  let seed = 3148
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    if (m * n < 2) continue
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(20)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
