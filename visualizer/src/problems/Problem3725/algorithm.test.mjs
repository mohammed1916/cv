import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = mat => buildTrace(parseInput(JSON.stringify({ mat }))).result

test('3725 official examples', () => {
  assert.equal(solve([[1, 2], [3, 4]]), 3)
  assert.equal(solve([[2, 2], [2, 2]]), 0)
})

test('3725 a single row counts only the entries equal to 1', () => {
  assert.equal(solve([[1, 5, 6]]), 1)
})

test('3725 rejects ragged rows', () => {
  assert.throws(() => parseInput('{"mat":[[1,2],[3]]}'))
})

// Independent oracle: enumerate every pick, one entry from each row, and test the gcd directly.
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function oracle(mat) {
  let count = 0
  const walk = (row, g) => {
    if (row === mat.length) { if (g === 1) count++; return }
    for (const v of mat[row]) walk(row + 1, gcd(g, v))
  }
  walk(0, 0)
  return count
}

let seed = 3725
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3725 seeded random against enumeration oracle', () => {
  for (let t = 0; t < 150; t++) {
    const rows = 1 + rnd(3), cols = 1 + rnd(3)
    const mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(12)))
    assert.equal(solve(mat), oracle(mat), JSON.stringify(mat))
  }
})
