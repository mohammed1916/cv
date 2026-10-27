import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace({ matrix }).result

test('1632 official examples', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]]), [[1, 2], [2, 3]])
  assert.deepEqual(solve([[7, 7], [7, 7]]), [[1, 1], [1, 1]])
})

test('1632 edge cases: a single cell and a single row', () => {
  assert.deepEqual(solve([[-5]]), [[1]])
  assert.deepEqual(solve([[3, 1, 2]]), [[3, 1, 2]])
})

test('1632 rejects ragged rows and values outside -100 to 100', () => {
  assert.throws(() => parseInput('{"matrix":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"matrix":[[101]]}'))
})

// Independent oracle: repeatedly raise ranks until every ordering constraint holds (a least fixed point).
function oracle(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  const cells = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ v: matrix[r][c], r, c })
  const rank = cells.map(() => 1)
  let changed = true
  while (changed) {
    changed = false
    for (let x = 0; x < cells.length; x++) {
      for (let y = 0; y < cells.length; y++) {
        if (x === y) continue
        const a = cells[x]
        const b = cells[y]
        if (a.r !== b.r && a.c !== b.c) continue
        if (a.v < b.v && rank[y] < rank[x] + 1) { rank[y] = rank[x] + 1; changed = true }
        if (a.v === b.v && rank[x] < rank[y]) { rank[x] = rank[y]; changed = true }
      }
    }
  }
  const out = Array.from({ length: rows }, () => Array(cols).fill(0))
  cells.forEach((cell, i) => { out[cell.r][cell.c] = rank[i] })
  return out
}

test('1632 random matrices match a fixed-point oracle', () => {
  let seed = 1632
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(11) - 5))
    assert.deepEqual(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})
