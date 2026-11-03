import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Independent oracle: every subarray value, sorted, top k summed.
function oracle(nums, k) {
  const values = []
  for (let l = 0; l < nums.length; l++) for (let r = l; r < nums.length; r++) {
    const window = nums.slice(l, r + 1)
    values.push(Math.max(...window) - Math.min(...window))
  }
  return values.sort((a, b) => b - a).slice(0, k).reduce((sum, v) => sum + v, 0)
}

test('3691 worked examples', () => {
  assert.equal(solve([1, 3, 2], 2), 4)
  assert.equal(solve([4, 2, 5, 1], 3), 12)
})

test('3691 random inputs match a sort-all oracle', () => {
  let seed = 3691
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(7)
    const nums = Array.from({ length: len }, () => rnd(20))
    const limit = Math.min(20, len * (len + 1) / 2)
    const k = 1 + rnd(limit)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('3691 rejects a k above the number of subarrays', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":4}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
  assert.deepEqual(parseInput('{"nums":[1,2],"k":3}'), { nums: [1, 2], k: 3 })
})
