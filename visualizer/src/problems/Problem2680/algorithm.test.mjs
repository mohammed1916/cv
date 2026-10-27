import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2680 official examples', () => {
  assert.equal(solve([12, 9], 1), 30)
  assert.equal(solve([8, 1, 2], 2), 35)
})

test('2680 edge cases', () => {
  assert.equal(solve([5], 0), 5)
  assert.equal(solve([1, 1], 0), 1)
})

test('2680 rejects values out of range', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":7}'))
})

// Independent oracle: try every way to split the k doublings among the elements and keep the best OR.
function oracle(nums, k) {
  let best = 0
  const go = (i, left, or, values) => {
    if (i === nums.length) { best = Math.max(best, or); return }
    for (let t = 0; t <= left; t++) go(i + 1, left - t, or | (nums[i] * 2 ** t), values)
  }
  go(0, k, 0, nums)
  return best
}

test('2680 random arrays match an exhaustive split of the doublings', () => {
  let seed = 2680
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(60))
    const k = rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
