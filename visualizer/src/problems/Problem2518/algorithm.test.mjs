import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2518 official examples', () => {
  assert.equal(solve([1, 2, 3, 4], 4), 6)
  assert.equal(solve([3, 3, 3], 4), 0)
  assert.equal(solve([6, 6], 2), 2)
})

test('2518 a total below 2k has no great partition', () => {
  assert.equal(solve([1, 1, 1], 2), 0)
})

test('2518 rejects an out-of-range value', () => {
  assert.throws(() => parseInput('{"nums":[11],"k":1}'))
})

// Independent oracle: try every subset and count those whose sum and complement sum both reach k.
function oracle(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0)
  let count = 0
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let sum = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i]
    if (sum >= k && total - sum >= k) count++
  }
  return count
}

test('2518 random inputs match a subset-enumeration oracle', () => {
  let seed = 2518
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(5))
    const k = 1 + rnd(12)
    assert.equal(solve(nums, k), oracle(nums, k) % 1000000007, JSON.stringify({ nums, k }))
  }
})
