import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2373 official examples', () => {
  assert.deepEqual(solve([[9, 9, 8, 1], [5, 6, 2, 6], [8, 2, 6, 4], [6, 2, 2, 2]]), [[9, 9], [8, 6]])
  assert.deepEqual(solve([[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 2, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]]), [[2, 2, 2], [2, 2, 2], [2, 2, 2]])
})

test('2373 the smallest allowed grid has a single window', () => {
  assert.deepEqual(solve([[4, 1, 2], [3, 7, 5], [6, 8, 9]]), [[9]])
})

test('2373 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2,3],[4,5,6]]}'))
})

// Independent oracle: gather each 3 by 3 window's nine values, sort them, and take the first.
function oracle(grid) {
  const size = grid.length - 2
  const out = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      const window = []
      for (let a = i; a < i + 3; a++) for (let b = j; b < j + 3; b++) window.push(grid[a][b])
      row.push(window.sort((x, y) => y - x)[0])
    }
    out.push(row)
  }
  return out
}

test('2373 seeded random grids match the sorted-window oracle', () => {
  let seed = 2373
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(5)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => 1 + rnd(100)))
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
