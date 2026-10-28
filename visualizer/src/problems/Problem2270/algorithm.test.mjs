import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2270 official examples', () => {
  assert.equal(solve([10, 4, -8, 7]), 2)
  assert.equal(solve([2, 3, 1, 0]), 2)
  assert.equal(solve([1, 1]), 1)
})

test('2270 a split must keep the left side at least as large', () => {
  // Left -2 is smaller than right 1, so no split qualifies.
  assert.equal(solve([-2, 1]), 0)
  // Equal sides count: left -1 and right -1.
  assert.equal(solve([-1, -1]), 1)
})

test('2270 rejects a single entry', () => {
  assert.throws(() => parseInput('{"nums":[5]}'))
})

// Independent oracle: for each split, add the left part and the right part with slices.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length - 1; i++) {
    const left = nums.slice(0, i + 1).reduce((a, b) => a + b, 0)
    const right = nums.slice(i + 1).reduce((a, b) => a + b, 0)
    if (left >= right) count++
  }
  return count
}

test('2270 seeded random arrays match the slice-based oracle', () => {
  let seed = 2270
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(11)
    const nums = Array.from({ length: len }, () => rnd(201) - 100)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
