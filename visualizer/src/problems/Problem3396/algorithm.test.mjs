import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3396 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4, 2, 3, 3, 5, 7]), 2)
  assert.equal(solve([4, 5, 6, 4, 4]), 2)
  assert.equal(solve([6, 7, 8, 9]), 0)
})

test('3396 edge cases', () => {
  assert.equal(solve([1]), 0)
  assert.equal(solve([2, 2]), 1)
  assert.equal(solve([1, 1, 1, 1]), 1)
  assert.equal(solve([1, 1, 1, 1, 1, 1, 1]), 2)
  assert.equal(solve([1, 2, 3, 1, 2, 3]), 1)
})

test('3396 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[6]}'))
})

// Oracle: simulate the operations literally and test each remaining suffix for duplicates.
function oracle(nums) {
  let ops = 0
  for (;;) {
    const rest = nums.slice(3 * ops)
    if (new Set(rest).size === rest.length) return ops
    ops++
  }
}

test('3396 random arrays match a simulation oracle', () => {
  let seed = 3396
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
