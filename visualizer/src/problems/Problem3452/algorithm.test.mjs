import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3452 official example', () => {
  assert.equal(solve([1, 3, 2, 1, 5, 4], 2), 12)
})

test('3452 a missing partner does not disqualify an index', () => {
  // Index 0 has no left partner, and index 1 has no right partner, so both need only the existing side.
  assert.equal(solve([5, 1], 1), 5)
})

test('3452 rejects k above half the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2}'))
})

// Independent oracle: mark every index that is beaten by a partner, then sum the unmarked ones.
function oracle(nums, k) {
  const beaten = new Array(nums.length).fill(false)
  for (let i = 0; i + k < nums.length; i++) {
    if (nums[i + k] >= nums[i]) beaten[i] = true
    if (nums[i] >= nums[i + k]) beaten[i + k] = true
  }
  let sum = 0
  for (let i = 0; i < nums.length; i++) if (!beaten[i]) sum += nums[i]
  return sum
}

test('3452 random arrays match a mark-and-sum oracle', () => {
  let seed = 3452
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(12)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    const k = 1 + rnd(Math.floor(len / 2))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
