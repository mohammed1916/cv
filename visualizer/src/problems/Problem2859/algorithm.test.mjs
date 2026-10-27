import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2859 official examples', () => {
  assert.equal(solve([5, 10, 1, 5, 2], 1), 13)
  assert.equal(solve([4, 3, 2, 1], 2), 1)
})

test('2859 k of zero picks only index zero', () => {
  assert.equal(solve([7, 9, 11], 0), 7)
})

test('2859 rejects k above four in this visualization', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":5}'))
})

// Independent oracle: count set bits by repeatedly clearing the lowest set bit (Kernighan), not by string conversion.
function oracle(nums, k) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    let x = i
    let bits = 0
    while (x) { x &= x - 1; bits++ }
    if (bits === k) total += nums[i]
  }
  return total
}

test('2859 random arrays match the Kernighan-count oracle', () => {
  let seed = 2859
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(51))
    const k = rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
