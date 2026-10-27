import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2568 official examples', () => {
  assert.equal(solve([2, 1]), 4)
  assert.equal(solve([5, 3, 2]), 1)
})

test('2568 edge cases', () => {
  assert.equal(solve([1, 2, 4, 8]), 16)
  assert.equal(solve([3]), 1)
  assert.equal(solve([1, 4]), 2)
})

test('2568 rejects zero', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: collect the OR of every non-empty subsequence and return the smallest positive value missing.
function oracle(nums) {
  const ors = new Set()
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let or = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) or |= nums[i]
    ors.add(or)
  }
  let x = 1
  while (ors.has(x)) x++
  return x
}

test('2568 random arrays match a subset-OR enumeration', () => {
  let seed = 2568
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(20))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
