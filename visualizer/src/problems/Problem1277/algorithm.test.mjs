import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace({ matrix }).result

test('1277 sample grids give the expected counts', () => {
  assert.equal(solve([[1]]), 1)
  assert.equal(solve([[0, 1], [1, 1]]), 3)
  assert.equal(solve([[1, 1, 1], [1, 1, 1]]), 8)
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('1277 a single all-ones block counts every size', () => {
  assert.equal(solve([[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]), 12 + 6 + 2)
})

test('1277 rejects malformed input', () => {
  assert.throws(() => parseInput('{"matrix":[[1,2]]}'), /0 or 1/)
  assert.throws(() => parseInput('{"matrix":[[1,1],[1]]}'), /same length/)
  assert.throws(() => parseInput('{"matrix":[]}'), /rows/)
  assert.throws(() => parseInput('[[1]]'), /object/)
})

// Independent oracle: enumerate every top-left corner and side length and test each square directly.
test('1277 random grids match a brute-force square enumeration', () => {
  let seed = 19
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(6)
    const cols = 1 + rnd(6)
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(4) === 0 ? 0 : 1))
    const input = JSON.stringify({ matrix })
    parseInput(input)
    let expected = 0
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) for (let k = 1; i + k <= rows && j + k <= cols; k++) {
      let ok = true
      for (let a = i; a < i + k && ok; a++) for (let b = j; b < j + k && ok; b++) if (matrix[a][b] !== 1) ok = false
      if (ok) expected++
    }
    assert.equal(solve(matrix), expected, input)
  }
})
