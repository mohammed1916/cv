import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3459 a single 1 is a segment of length 1', () => {
  assert.equal(solve([[1]]), 1)
})

test('3459 a straight diagonal of the 1,2,0,2,0 pattern', () => {
  // Down-right diagonal reads 1, 2, 0 (the cell (2,2) holds 0), so the length is 3.
  assert.equal(solve([[1, 0, 0, 0, 0], [0, 2, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]), 3)
  assert.equal(solve([[1, 0], [0, 2]]), 2)
  assert.equal(solve([[1, 2, 0, 2, 0]]), 1)
})

test('3459 rejects values outside 0 to 2', () => {
  assert.throws(() => parseInput('{"grid":[[3]]}'))
})

// Independent oracle: enumerate every start, every pair of directions, every turn point and every length.
// Each candidate path is checked cell by cell against the 1,2,0,2,0 pattern.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const dirs = [[1, 1], [1, -1], [-1, -1], [-1, 1]]
  const pattern = i => (i === 0 ? 1 : i % 2 === 1 ? 2 : 0)
  const maxSteps = Math.max(rows, cols)
  let best = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let d1 = 0; d1 < 4; d1++) {
        for (let turnAt = 0; turnAt <= maxSteps; turnAt++) {
          for (let hasTurn = 0; hasTurn < 2; hasTurn++) {
            if (hasTurn === 0 && turnAt !== 0) continue
            const d2 = (d1 + 1) % 4
            let cr = r
            let cc = c
            const cells = [[r, c]]
            for (let step = 1; step <= 2 * maxSteps; step++) {
              const useSecond = hasTurn === 1 && step > turnAt
              const dir = useSecond ? dirs[d2] : dirs[d1]
              cr += dir[0]
              cc += dir[1]
              if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) break
              cells.push([cr, cc])
            }
            // Check every prefix of this path: the longest valid prefix counts.
            for (let len = 1; len <= cells.length; len++) {
              const valid = cells.slice(0, len).every(([x, y], i) => grid[x][y] === pattern(i))
              if (!valid) break
              best = Math.max(best, len)
            }
          }
        }
      }
    }
  }
  return best
}

test('3459 random grids match an enumerate-every-path oracle', () => {
  let seed = 3459
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(3) === 0 ? 1 : rnd(3))))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
