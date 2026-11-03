import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Oracle: direct double loop from the definition.
function oracle(nums) {
  return nums.map((v, i) => {
    let count = 0
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[j] < v && Math.abs(nums[j]) % 2 !== Math.abs(v) % 2) count += 1
    }
    return count
  })
}

test('3907 hand-checked preset', () => {
  assert.deepEqual(solve([4, 3, 2, 7, 1]), [2, 1, 1, 0, 0])
})

test('3907 negative parities are handled', () => {
  assert.deepEqual(solve([-3, -2, 5, 0, -7, 8]), oracle([-3, -2, 5, 0, -7, 8]))
})

test('3907 a single element has no later values', () => {
  assert.deepEqual(solve([6]), [0])
})

test('3907 same-parity values are never counted', () => {
  assert.deepEqual(solve([4, 4, 3]), [1, 1, 0])
})

test('3907 parser rejects non-integers', () => {
  assert.throws(() => parseInput('{"nums":[1.5]}'))
})

test('3907 matches the double-loop oracle on random arrays', () => {
  let seed = 3907
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(19) - 9)
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
