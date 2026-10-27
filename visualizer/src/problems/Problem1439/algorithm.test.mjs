import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1439 official examples', () => {
  assert.equal(solve({ mat: [[1, 3, 11], [2, 4, 6]], k: 5 }), 7)
  assert.equal(solve({ mat: [[1, 3, 11], [2, 4, 6]], k: 9 }), 17)
  assert.equal(solve({ mat: [[1, 10, 10], [1, 4, 5], [2, 3, 6]], k: 7 }), 9)
})

test('1439 a single row returns its k-th value', () => {
  assert.equal(solve({ mat: [[2, 5, 9]], k: 3 }), 9)
})

test('1439 rejects an unsorted row', () => {
  assert.throws(() => parseInput('{"mat":[[3,1]],"k":1}'))
})

// Independent oracle: enumerate every choice of one value per row, sort the sums, and take the k-th.
function oracle({ mat, k }) {
  let sums = [0]
  for (const row of mat) {
    const next = []
    for (const s of sums) for (const v of row) next.push(s + v)
    sums = next
  }
  sums.sort((a, b) => a - b)
  return sums[k - 1]
}

test('1439 random matrices match an enumeration of all choices', () => {
  let seed = 1439
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const cols = 1 + rnd(4)
    const mat = Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: cols }, () => 1 + rnd(20)).sort((a, b) => a - b))
    const total = cols ** mat.length
    const input = { mat, k: 1 + rnd(total) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
