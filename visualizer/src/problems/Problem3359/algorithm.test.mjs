import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace({ grid, k }).result

test('3359 worked examples', () => {
  assert.equal(solve([[3, 2, 1], [5, 2, 2], [1, 1, 4]], 3), 17)
  assert.equal(solve([[9, 8, 7, 2], [3, 3, 1, 1], [2, 4, 2, 0]], 3), 21)
})

test('3359 edge cases', () => {
  assert.equal(solve([[0]], 0), 1)
  assert.equal(solve([[1]], 0), 0)
  assert.equal(solve([[2, 1]], 9), 3)
  assert.equal(solve([[1, 2]], 9), 2)
  assert.equal(solve([[1, 2]], 1), 1)
})

test('3359 rejects malformed input', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"k":1}'))
  assert.throws(() => parseInput('{"grid":[[1,10]],"k":1}'))
})

// Brute oracle: check every submatrix directly.
function oracle(grid, k) {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0
  for (let r1 = 0; r1 < rows; r1 += 1) for (let r2 = r1; r2 < rows; r2 += 1) {
    for (let c1 = 0; c1 < cols; c1 += 1) for (let c2 = c1; c2 < cols; c2 += 1) {
      let ok = true
      for (let r = r1; r <= r2 && ok; r += 1) {
        for (let c = c1; c <= c2 && ok; c += 1) {
          if (grid[r][c] > k) ok = false
          else if (c > c1 && grid[r][c] > grid[r][c - 1]) ok = false
        }
      }
      if (ok) count += 1
    }
  }
  return count
}

test('3359 random grids match a direct submatrix oracle', () => {
  let seed = 3359
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(6)))
    const k = rnd(6)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})

test('3359 frames end with the total and stay on valid lines', () => {
  const run = buildTrace(parseInput('{"grid":[[3,2,1],[5,2,2],[1,1,4]],"k":3}'))
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11)
})
