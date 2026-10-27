import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2980 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5]), true)
  assert.equal(solve([2, 4, 8, 16]), true)
  assert.equal(solve([1, 3, 5, 7, 9]), false)
})

test('2980 edge cases', () => {
  assert.equal(solve([2, 1]), false)
  assert.equal(solve([6, 6]), true)
  assert.equal(solve([1, 1]), false)
})

test('2980 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[4]}'))
})

// Independent oracle: try every subset of size at least two and test its OR for a trailing zero.
function oracle(nums) {
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let or = 0
    let size = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) { or |= nums[i]; size++ }
    if (size >= 2 && (or & 1) === 0) return true
  }
  return false
}

test('2980 random arrays match a subset-enumeration oracle', () => {
  let seed = 2980
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => 1 + rnd(100))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
