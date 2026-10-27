import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3209 official examples', () => {
  assert.equal(solve([1, 1, 1], 1), 6)
  assert.equal(solve([1, 1, 2], 1), 3)
  assert.equal(solve([1, 2, 3], 2), 2)
})

test('3209 edge cases', () => {
  assert.equal(solve([0, 0], 0), 3)
  assert.equal(solve([5], 3), 0)
})

test('3209 rejects values above 63', () => {
  assert.throws(() => parseInput('{"nums":[64],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
})

// Independent oracle: test every subarray directly with a running AND.
function oracle(nums, k) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let and = nums[i]
    for (let j = i; j < nums.length; j++) {
      and = j === i ? nums[i] : and & nums[j]
      if (and === k) count++
    }
  }
  return count
}

test('3209 random arrays match a direct subarray scan', () => {
  let seed = 3209
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(16) }, () => rnd(64))
    const k = rnd(64)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
