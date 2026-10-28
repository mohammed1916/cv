import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3417 official style examples', () => {
  assert.deepEqual(solve({ grid: [[1, 2], [3, 4]] }), [1, 4])
  assert.deepEqual(solve({ grid: [[2, 1], [2, 1], [2, 1]] }), [2, 1, 2])
})

test('3417 a single cell is kept', () => {
  assert.deepEqual(solve({ grid: [[7]] }), [7])
})

test('3417 rejects a ragged grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: map each position in the zigzag order to a row and column with arithmetic, then keep even positions.
function oracle({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const out = []
  for (let k = 0; k < m * n; k += 2) {
    const row = Math.floor(k / n)
    const offset = k % n
    const col = row % 2 === 0 ? offset : n - 1 - offset
    out.push(grid[row][col])
  }
  return out
}

test('3417 random grids match an arithmetic-position oracle', () => {
  let seed = 3417
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(100)))
    assert.deepEqual(solve({ grid }), oracle({ grid }), JSON.stringify(grid))
  }
})
