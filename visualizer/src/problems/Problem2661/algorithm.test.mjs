import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, mat) => buildTrace(parseInput(JSON.stringify({ arr, mat }))).result

test('2661 official examples', () => {
  assert.equal(solve([1, 3, 4, 2], [[1, 4], [2, 3]]), 2)
  assert.equal(solve([2, 8, 7, 4, 1, 3, 5, 6, 9], [[3, 2, 5], [1, 4, 6], [8, 7, 9]]), 3)
})

test('2661 a single cell is painted completely at once', () => {
  assert.equal(solve([1], [[1]]), 0)
})

test('2661 rejects arr that is not a permutation of mat values', () => {
  assert.throws(() => parseInput('{"arr":[1,1,3,4],"mat":[[1,2],[3,4]]}'))
})

// Independent oracle: after each prefix of arr, test every row and every column for being fully painted.
function oracle(arr, mat) {
  const rows = mat.length
  const cols = mat[0].length
  for (let i = 0; i < arr.length; i++) {
    const painted = new Set(arr.slice(0, i + 1))
    for (let r = 0; r < rows; r++) {
      if (mat[r].every(v => painted.has(v))) return i
    }
    for (let c = 0; c < cols; c++) {
      if (mat.every(row => painted.has(row[c]))) return i
    }
  }
  return -1
}

test('2661 seeded random permutations match the prefix-scan oracle', () => {
  let seed = 2661
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    const values = Array.from({ length: m * n }, (_, i) => i + 1)
    for (let i = values.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[values[i], values[j]] = [values[j], values[i]]
    }
    const mat = Array.from({ length: m }, (_, r) => values.slice(r * n, r * n + n))
    const arr = [...values]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    assert.equal(solve(arr, mat), oracle(arr, mat), JSON.stringify({ arr, mat }))
  }
})
