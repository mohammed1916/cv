import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1878 official examples', () => {
  // Radius-1 diamonds centered at (1,1) sum to 4+3+4+1 = 12 and at (1,3) to 1+4+3+3 = 11; the single cell 20 is largest.
  assert.deepEqual(solve([[3, 4, 5, 1, 3], [3, 3, 4, 2, 3], [20, 1, 0, 3, 4]]), [20, 12, 11])
  assert.deepEqual(solve([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [20, 9, 8])
  assert.deepEqual(solve([[7, 7, 7]]), [7])
})

test('1878 equal rhombus sums are reported once', () => {
  assert.deepEqual(solve([[2, 2], [2, 2]]), [2])
})

test('1878 rejects negative values', () => {
  assert.throws(() => parseInput('{"grid":[[-1]]}'))
})

// Independent oracle: for each center and radius, add every cell whose Manhattan distance from the center is exactly r.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const sums = new Set()
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let r = 0; i - r >= 0 && i + r < rows && j - r >= 0 && j + r < cols; r++) {
        let total = 0
        for (let di = -r; di <= r; di++) {
          for (let dj = -r; dj <= r; dj++) {
            if (Math.abs(di) + Math.abs(dj) === r) total += grid[i + di][j + dj]
          }
        }
        sums.add(total)
      }
    }
  }
  return [...sums].sort((a, b) => b - a).slice(0, 3)
}

test('1878 seeded random grids match the distance-ring oracle', () => {
  let seed = 1878
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(100)))
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
