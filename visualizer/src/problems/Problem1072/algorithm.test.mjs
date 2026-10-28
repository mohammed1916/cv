import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify(matrix))).result

test('1072 official examples', () => {
  assert.equal(solve([[0, 1], [1, 1]]), 1)
  assert.equal(solve([[0, 1], [1, 0]]), 2)
  assert.equal(solve([[0, 0, 0], [0, 0, 1], [1, 1, 0]]), 2)
})

test('1072 a single row is always one', () => {
  assert.equal(solve([[1, 0, 1]]), 1)
})

test('1072 rejects ragged rows and values other than 0 or 1', () => {
  assert.throws(() => parseInput('[[0,1],[1]]'))
  assert.throws(() => parseInput('[[0,2]]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"a":1}'))
})

// Independent oracle: try every set of columns to flip, and count the rows that end up all equal.
function oracle(matrix) {
  const cols = matrix[0].length
  let best = 0
  for (let mask = 0; mask < 1 << cols; mask++) {
    let count = 0
    for (const row of matrix) {
      const flipped = row.map((v, c) => v ^ ((mask >> c) & 1))
      if (flipped.every(v => v === flipped[0])) count++
    }
    best = Math.max(best, count)
  }
  return best
}

test('1072 random matrices match a column-flip enumeration oracle', () => {
  let seed = 1072
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cols = 1 + rnd(5)
    const rows = 1 + rnd(5)
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(2)))
    assert.equal(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})
