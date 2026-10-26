import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('719 official examples', () => {
  assert.equal(buildTrace({ nums: [1, 3, 1], k: 1 }).result, 0)
  assert.equal(buildTrace({ nums: [1, 6, 1], k: 3 }).result, 5)
})

test('719 random arrays match sorting every pair distance', () => {
  let state = 211
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rand(7) }, () => rand(30))
    const dists = []
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) dists.push(Math.abs(nums[i] - nums[j]))
    dists.sort((x, y) => x - y)
    const k = 1 + rand(dists.length)
    assert.equal(buildTrace({ nums, k }).result, dists[k - 1], JSON.stringify({ nums, k }))
  }
})

test('719 rejects k beyond the number of pairs', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":2}'))
})
