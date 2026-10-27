import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('1020 official examples', () => {
  assert.equal(solve([[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]), 3)
  assert.equal(solve([[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]), 0)
})

test('1020 edge cases: border land is never an enclave', () => {
  assert.equal(solve([[1]]), 0)
  assert.equal(solve([[1, 1], [1, 1]]), 0)
  assert.equal(solve([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 1)
})

test('1020 rejects ragged rows and values other than 0 or 1', () => {
  assert.throws(() => parseInput('{"grid":[[0,1],[1]]}'))
  assert.throws(() => parseInput('{"grid":[[2]]}'))
})

// Independent oracle: from each land cell, search separately for any path to the border.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue
      const seen = new Set([`${r},${c}`])
      const stack = [[r, c]]
      let escapes = false
      while (stack.length) {
        const [y, x] = stack.pop()
        if (y === 0 || x === 0 || y === rows - 1 || x === cols - 1) escapes = true
        for (const [dy, dx] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const ny = y + dy
          const nx = x + dx
          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols || grid[ny][nx] !== 1 || seen.has(`${ny},${nx}`)) continue
          seen.add(`${ny},${nx}`)
          stack.push([ny, nx])
        }
      }
      if (!escapes) count++
    }
  }
  return count
}

test('1020 random grids match a per-cell search oracle', () => {
  let seed = 1020
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(6)
    const cols = 1 + rnd(6)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(2)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
