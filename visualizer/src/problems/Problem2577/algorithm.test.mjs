import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2577 examples', () => {
  assert.equal(solve([[0, 1, 3, 2], [5, 1, 2, 5], [4, 3, 8, 6]]), 7)
  assert.equal(solve([[0, 2, 4], [3, 2, 1], [1, 0, 4]]), -1)
})

test('2577 a 2 by 2 grid waits for the parity of the target cell', () => {
  assert.equal(solve([[0, 1], [1, 2]]), 2)
  assert.equal(solve([[0, 2], [1, 1]]), 2)
  // The bottom-right cell opens at second 5, but it is reached on even seconds only, so the earliest entry is second 6.
  assert.equal(solve([[0, 1], [1, 5]]), 6)
})

test('2577 rejects a nonzero start and a value out of range', () => {
  assert.throws(() => parseInput('{"grid":[[1,1],[1,1]]}'))
  assert.throws(() => parseInput('{"grid":[[0,13],[1,1]]}'))
})

// Independent oracle: a time-expanded search. At every second, track the set of cells you can stand on.
function oracle(grid) {
  const rows = grid.length, cols = grid[0].length
  const horizon = Math.max(...grid.flat()) + 2 * rows * cols + 2
  let reach = new Set(['0,0'])
  for (let t = 0; t <= horizon; t++) {
    if (reach.has(`${rows - 1},${cols - 1}`)) return t
    const next = new Set()
    for (const key of reach) {
      const [r, c] = key.split(',').map(Number)
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && t + 1 >= grid[nr][nc]) next.add(`${nr},${nc}`)
      }
    }
    reach = next
  }
  return -1
}

test('2577 random grids match a time-expanded oracle', () => {
  let seed = 2577
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const rows = 2 + rnd(3), cols = 2 + rnd(3)
    const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (r === 0 && c === 0 ? 0 : rnd(9))))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
