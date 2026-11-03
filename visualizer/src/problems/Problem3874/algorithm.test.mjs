import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Oracle: test every inclusive subarray directly against the definition.
function oracle(nums, k) {
  const n = nums.length
  const marked = i => i >= 1 && i <= n - 2 && nums[i] > nums[i - 1] && nums[i] > nums[i + 1]
  let total = 0
  for (let l = 0; l < n; l += 1) {
    for (let r = l; r < n; r += 1) {
      const inside = []
      for (let i = l; i <= r; i += 1) if (marked(i)) inside.push(i)
      if (inside.length === 1 && inside[0] - l <= k && r - inside[0] <= k) total += 1
    }
  }
  return total
}

test('3874 a flat array has no peaks', () => {
  assert.equal(solve([2, 2, 2, 2], 3), 0)
})

test('3874 a single interior peak counts every window it can reach', () => {
  assert.equal(solve([1, 3, 1], 1), oracle([1, 3, 1], 1))
  assert.equal(solve([1, 3, 1], 0), 1)
})

test('3874 peaks at endpoints count as peaks', () => {
  assert.equal(solve([1, 5, 0, 4, 1], 2), oracle([1, 5, 0, 4, 1], 2))
})

test('3874 frames track the running total', () => {
  const run = buildTrace({ nums: [1, 3, 2, 4, 1, 5, 0], k: 1 })
  assert.equal(run.frames.at(-1).total, run.result)
})

test('3874 rejects digits outside 0 to 9', () => {
  assert.throws(() => parseInput('{"nums":[1,10,2],"k":1}'))
})

test('3874 matches the direct oracle on random arrays', () => {
  let seed = 3874
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(5))
    const k = rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
