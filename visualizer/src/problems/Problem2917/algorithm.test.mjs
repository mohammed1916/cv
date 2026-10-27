import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2917 official examples', () => {
  assert.equal(solve([7, 12, 9, 8, 9, 15], 4), 9)
  assert.equal(solve([10, 8, 5, 9, 11, 6, 8], 1), 15)
  assert.equal(solve([2, 12, 1, 11, 4, 5], 6), 0)
})

test('2917 with k equal to the length, the answer is the AND', () => {
  assert.equal(solve([7, 13], 2), 5)
})

test('2917 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: the k-or is the OR, over every group of k numbers, of the AND of that group.
function oracle(nums, k) {
  let result = 0
  const pick = (start, chosen) => {
    if (chosen.length === k) {
      let and = 31
      for (const i of chosen) and &= nums[i]
      result |= and
      return
    }
    for (let i = start; i < nums.length; i++) pick(i + 1, [...chosen, i])
  }
  pick(0, [])
  return result
}

test('2917 random inputs match a k-subset oracle', () => {
  let seed = 2917
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(8)
    const nums = Array.from({ length }, () => rnd(32))
    const input = { nums, k: 1 + rnd(length) }
    assert.equal(solve(input.nums, input.k), oracle(input.nums, input.k), JSON.stringify(input))
  }
})
