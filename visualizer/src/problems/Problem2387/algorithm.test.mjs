import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('2387 worked examples', () => {
  assert.equal(solve([[1, 3, 5], [2, 6, 9], [3, 6, 9]]), 5)
  assert.equal(solve([[1, 1, 2], [1, 1, 2], [3, 3, 3]]), 2)
  assert.equal(solve([[7]]), 7)
})

test('2387 rows that do not share a range still work', () => {
  assert.equal(solve([[1, 2, 3], [50, 60, 70], [4, 5, 6]]), 5)
})

test('2387 rejects an even total or unsorted row', () => {
  assert.throws(() => parseInput('[[1,2],[3,4]]'))
  assert.throws(() => parseInput('[[3,1,2]]'))
})

// Oracle: flatten, sort, and take the middle element.
test('2387 random matrices match a flatten-and-sort oracle', () => {
  let seed = 2387
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    if ((m * n) % 2 === 0) continue
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(20)).sort((a, b) => a - b))
    const flat = grid.flat().sort((a, b) => a - b)
    assert.equal(solve(grid), flat[(flat.length - 1) / 2], JSON.stringify(grid))
  }
})
