import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1803 official examples', () => {
  assert.equal(solve({ nums: [1, 4, 2, 7], low: 2, high: 6 }), 6)
  assert.equal(solve({ nums: [9, 8, 4, 2, 1], low: 5, high: 14 }), 8)
})

test('1803 a single range bound is respected inclusively', () => {
  assert.equal(solve({ nums: [3, 3], low: 1, high: 1 }), 0)
  assert.equal(solve({ nums: [1, 2], low: 3, high: 3 }), 1)
})

test('1803 rejects low above high', () => {
  assert.throws(() => parseInput('{"nums":[1],"low":5,"high":2}'))
})

// Independent oracle: test every pair directly.
function oracle({ nums, low, high }) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const v = nums[i] ^ nums[j]
      if (v >= low && v <= high) count++
    }
  }
  return count
}

test('1803 random inputs match an all-pairs oracle', () => {
  let seed = 1803
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(50))
    const low = 1 + rnd(60)
    const high = low + rnd(61 - low)
    const input = { nums, low, high }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
