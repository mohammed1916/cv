import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

// Independent oracle: try every subset, keep the largest one whose XOR equals the target.
function oracle(nums, target) {
  let best = -1
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let x = 0
    let size = 0
    for (let i = 0; i < nums.length; i++) if ((mask >> i) & 1) { x ^= nums[i]; size++ }
    if (x === target && size > best) best = size
  }
  return best === -1 ? -1 : nums.length - best
}

test('3877 official examples', () => {
  assert.equal(solve([1, 2, 3], 2), 1)
  assert.equal(solve([2, 4], 1), -1)
  assert.equal(solve([7], 7), 0)
})

test('3877 an empty target-zero case needs no removals', () => {
  assert.equal(solve([5, 5], 0), 0)
})

test('3877 rejects a value above 10000', () => {
  assert.throws(() => parseInput('{"nums":[10001],"target":1}'))
})

test('3877 random arrays match the subset oracle', () => {
  let seed = 3877
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(16))
    const target = rnd(16)
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
