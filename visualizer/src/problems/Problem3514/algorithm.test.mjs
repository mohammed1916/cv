import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: enumerate every index triple i <= j <= k directly and collect the distinct XOR values.
function oracle(nums) {
  const seen = new Set()
  const n = nums.length
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      for (let k = j; k < n; k++) seen.add(nums[i] ^ nums[j] ^ nums[k])
    }
  }
  return seen.size
}

test('3514 small lists', () => {
  assert.equal(solve({ nums: [5] }), 1)
  assert.equal(solve({ nums: [1, 1, 1] }), 1)
  assert.equal(solve({ nums: [1, 2, 3] }), 4)
})

test('3514 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

test('3514 random lists match a triple-enumeration oracle', () => {
  let seed = 3514
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(31))
    assert.equal(solve({ nums }), oracle(nums), JSON.stringify(nums))
  }
})
