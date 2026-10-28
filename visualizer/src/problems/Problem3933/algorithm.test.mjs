import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify({ matrix }))).result

test('3933 official examples', () => {
  const seven = Array.from({ length: 7 }, () => Array(7).fill(0))
  seven[3][3] = 2
  assert.equal(solve(seven), 1)
  assert.equal(solve([[1, 2], [3, 4]]), 1)
  assert.equal(solve([[1, 0, 1], [0, 1, 0], [1, 0, 1]]), 5)
  assert.equal(solve([[1, 1], [1, 1]]), 4)
})

test('3933 an all-zero matrix has no local maximum', () => {
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('3933 rejects a value above 6', () => {
  assert.throws(() => parseInput('{"matrix":[[7]]}'))
})

// Independent oracle: for each cell, test every cell of the matrix with the distance rule written out.
function oracle(matrix) {
  const n = matrix.length
  const m = matrix[0].length
  let count = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) {
    const x = matrix[r][c]
    if (x === 0) continue
    let isMax = true
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const dr = Math.abs(i - r)
      const dc = Math.abs(j - c)
      const inside = dr <= x && dc <= x && !(dr === x && dc === x)
      if (inside && matrix[i][j] > x) isMax = false
    }
    if (isMax) count++
  }
  return count
}

test('3933 random matrices match a full-scan oracle', () => {
  let seed = 3933
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const m = 1 + rnd(6)
    const matrix = Array.from({ length: n }, () => Array.from({ length: m }, () => rnd(7)))
    assert.equal(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})
