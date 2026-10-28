import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (mat, k) => buildTrace(parseInput(JSON.stringify({ mat, k }))).result

test('2946 official examples', () => {
  assert.equal(solve([[1, 2, 1, 2], [5, 5, 5, 5], [6, 3, 6, 3]], 2), true)
  assert.equal(solve([[2, 2], [1, 3]], 3), false)
})

test('2946 a shift that is a multiple of the row length changes nothing', () => {
  assert.equal(solve([[1, 2, 3], [4, 5, 6]], 3), true)
})

test('2946 rejects k outside 1 to 20', () => {
  assert.throws(() => parseInput('{"mat":[[1]],"k":0}'))
})

// Independent oracle: rebuild each shifted row by slicing and concatenation, then compare the whole matrix.
function oracle(mat, k) {
  return mat.every((row, r) => {
    const n = row.length
    const s = k % n
    const shifted = r % 2 === 0
      ? row.slice(n - s).concat(row.slice(0, n - s))
      : row.slice(s).concat(row.slice(0, s))
    return shifted.length === row.length && shifted.every((v, j) => v === row[j])
  })
}

test('2946 seeded random matrices match the slice-based oracle', () => {
  let seed = 2946
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let trues = 0
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const k = 1 + rnd(20)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(3)))
    const expected = oracle(mat, k)
    if (expected) trues++
    assert.equal(solve(mat, k), expected, JSON.stringify({ mat, k }))
  }
  assert.ok(trues > 0)
})
