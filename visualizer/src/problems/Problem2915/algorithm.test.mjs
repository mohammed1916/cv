import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2915 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 3, 4, 5], target: 9 }), 3)
  assert.equal(solve({ nums: [4, 1, 3, 2, 1, 5], target: 7 }), 4)
  assert.equal(solve({ nums: [1, 1, 5, 4, 5], target: 3 }), -1)
})

test('2915 each number is used at most once', () => {
  // A single 3 cannot be used twice to reach 6.
  assert.equal(solve({ nums: [3], target: 6 }), -1)
  assert.equal(solve({ nums: [3, 3], target: 6 }), 2)
})

test('2915 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[],"target":3}'))
  assert.throws(() => parseInput('{"nums":[1,2],"target":0}'))
})

// Independent oracle: try every subset and keep the longest one whose sum is the target.
function oracle({ nums, target }) {
  let best = -1
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let sum = 0
    let count = 0
    for (let i = 0; i < nums.length; i++) {
      if (mask & (1 << i)) { sum += nums[i]; count++ }
    }
    if (sum === target && count > best) best = count
  }
  return best
}

test('2915 random inputs match a subset oracle', () => {
  let seed = 2915
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(12))
    const target = 1 + rnd(30)
    const input = { nums, target }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
