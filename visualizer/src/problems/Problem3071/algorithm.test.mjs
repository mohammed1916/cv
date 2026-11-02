import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('3071 hand-checked examples', () => {
  assert.equal(solve([[1, 2, 2], [1, 1, 0], [0, 1, 2]]), 4)
  assert.equal(solve([[1, 1, 1], [1, 1, 1], [1, 1, 1]]), 4)
})

test('3071 edge cases', () => {
  assert.equal(solve([[2, 2, 2], [2, 2, 2], [2, 2, 2]]), 4)
  assert.throws(() => parseInput('[[0,1],[1,0]]'))
  assert.throws(() => parseInput('[[0,1,3],[1,0,1],[1,0,1]]'))
})

// Independent oracle: try every pair of target values and count mismatched cells cell by cell.
function oracle(grid) {
  const n = grid.length
  const mid = (n - 1) / 2
  const isY = (i, j) => {
    const arms = i < mid ? [i, n - 1 - i] : []
    return arms.includes(j) || (i >= mid && j === mid)
  }
  let best = Infinity
  for (let y = 0; y < 3; y++) for (let o = 0; o < 3; o++) {
    if (y === o) continue
    let cost = 0
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const target = isY(i, j) ? y : o
      if (grid[i][j] !== target) cost++
    }
    best = Math.min(best, cost)
  }
  return best
}

test('3071 random grids match the cell-by-cell oracle', () => {
  let seed = 3071
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = [3, 5][rnd(2)]
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(3)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
