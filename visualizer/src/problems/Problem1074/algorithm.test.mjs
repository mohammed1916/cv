import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (matrix, target) => buildTrace(parseInput(JSON.stringify({ matrix, target }))).result

test('1074 examples', () => {
  assert.equal(solve([[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0), 4)
  assert.equal(solve([[1, -1], [-1, 1]], 0), 5)
  assert.equal(solve([[9]], 0), 0)
})

test('1074 a single cell and a target no submatrix reaches', () => {
  assert.equal(solve([[7]], 7), 1)
  assert.equal(solve([[1, 2], [3, 4]], 20), 0)
})

test('1074 rejects ragged rows and out-of-range values', () => {
  assert.throws(() => parseInput('{"matrix":[[1,2],[3]],"target":0}'))
  assert.throws(() => parseInput('{"matrix":[[10]],"target":0}'))
})

// Independent oracle: sum every rectangle of cells directly, with no prefix sums and no row pairing.
function oracle(matrix, target) {
  let count = 0
  for (let r1 = 0; r1 < matrix.length; r1++) for (let r2 = r1; r2 < matrix.length; r2++)
    for (let c1 = 0; c1 < matrix[0].length; c1++) for (let c2 = c1; c2 < matrix[0].length; c2++) {
      let sum = 0
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) sum += matrix[r][c]
      if (sum === target) count++
    }
  return count
}

test('1074 random matrices match a direct rectangle-sum oracle', () => {
  let seed = 1074
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(5), cols = 1 + rnd(5)
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(19) - 9))
    const target = rnd(41) - 20
    assert.equal(solve(matrix, target), oracle(matrix, target), JSON.stringify({ matrix, target }))
  }
})
