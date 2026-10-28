import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify({ matrix }))).result

test('3033 official examples', () => {
  assert.deepEqual(solve([[1, 2, -1], [4, -1, 6], [7, 8, 9]]), [[1, 2, 9], [4, 8, 6], [7, 8, 9]])
  assert.deepEqual(solve([[3, -1], [5, 2]]), [[3, 2], [5, 2]])
})

test('3033 a matrix without -1 is unchanged', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]]), [[1, 2], [3, 4]])
})

test('3033 rejects a column that is all -1', () => {
  assert.throws(() => parseInput('{"matrix":[[-1,1],[-1,2]]}'))
})

// Independent oracle: transpose, replace each -1 with its column's maximum via Math.max over the column, transpose back.
function oracle(matrix) {
  const t = matrix[0].map((_, c) => matrix.map(row => row[c]))
  const filled = t.map(col => {
    const top = Math.max(...col.filter(v => v !== -1))
    return col.map(v => (v === -1 ? top : v))
  })
  return filled[0].map((_, r) => filled.map(col => col[r]))
}

test('3033 seeded random matrices match the transpose oracle', () => {
  let seed = 3033
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const matrix = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? -1 : rnd(51))))
    const valid = matrix[0].every((_, c) => matrix.some(row => row[c] !== -1))
    if (!valid) continue
    assert.deepEqual(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})
