import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (matrix, num_select) => buildTrace(parseInput(JSON.stringify({ matrix, num_select }))).result

test('2397 official examples', () => {
  assert.equal(solve([[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 0, 1]], 2), 3)
  assert.equal(solve([[1], [0]], 1), 2)
})

test('2397 an all-zero row is covered by any choice', () => {
  assert.equal(solve([[0, 0], [1, 1]], 1), 1)
})

test('2397 rejects num_select larger than the column count', () => {
  assert.throws(() => parseInput(JSON.stringify({ matrix: [[1]], num_select: 2 })))
})

// Independent oracle: build every combination of columns by recursion, then count covered rows.
function oracle(matrix, k) {
  const n = matrix[0].length
  let best = 0
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      const covered = matrix.filter(row => row.every((v, c) => v === 0 || chosen.includes(c))).length
      best = Math.max(best, covered)
      return
    }
    for (let c = start; c < n; c++) choose(c + 1, [...chosen, c])
  }
  choose(0, [])
  return best
}

test('2397 random matrices match a recursive combination oracle', () => {
  let seed = 2397
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const n = 1 + rnd(5)
    const matrix = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    const k = 1 + rnd(n)
    assert.equal(solve(matrix, k), oracle(matrix, k), JSON.stringify({ matrix, k }))
  }
})
