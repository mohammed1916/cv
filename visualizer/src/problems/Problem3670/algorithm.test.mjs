import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3670 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7]), 12)
  assert.equal(solve([5, 6, 4]), 0)
  assert.equal(solve([64, 8, 32]), 2048)
})

test('3670 two equal values share bits, so no pair qualifies', () => {
  assert.equal(solve([1, 1]), 0)
})

test('3670 rejects a zero value and a single element', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[7]'))
})

// Independent oracle: compare the binary strings digit by digit instead of using the & operator.
function oracle(nums) {
  const bits = v => v.toString(2).padStart(21, '0')
  const disjoint = (a, b) => [...bits(a)].every((c, k) => c === '0' || bits(b)[k] === '0')
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (disjoint(nums[i], nums[j])) best = Math.max(best, nums[i] * nums[j])
    }
  }
  return best
}

test('3670 random arrays match a digit-by-digit oracle', () => {
  let seed = 3670
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(10)
    const nums = Array.from({ length: len }, () => 1 + rnd(rnd(2) ? 31 : 1000000))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
