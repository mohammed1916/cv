import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3097 official examples', () => {
  assert.equal(solve([1, 2, 3], 2), 1)
  assert.equal(solve([2, 1, 8], 10), 3)
  assert.equal(solve([1, 2], 4), -1)
})

test('3097 edge cases', () => {
  assert.equal(solve([5], 5), 1)
  assert.equal(solve([1, 1, 1, 2], 3), 2)
})

test('3097 rejects out of range values', () => {
  assert.throws(() => parseInput('{"nums":[256],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: examine every subarray directly and keep the shortest whose OR reaches k.
function oracle(nums, k) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    let or = 0
    for (let j = i; j < nums.length; j++) {
      or |= nums[j]
      const len = j - i + 1
      if (or >= k && (best === -1 || len < best)) best = len
    }
  }
  return best
}

test('3097 random arrays match a direct subarray scan', () => {
  let seed = 3097
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(14) }, () => 1 + rnd(255))
    const k = 1 + rnd(255)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
