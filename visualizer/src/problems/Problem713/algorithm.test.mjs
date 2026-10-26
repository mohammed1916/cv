import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('713 official examples', () => {
  assert.equal(buildTrace({ nums: [10, 5, 2, 6], k: 100 }).result, 8)
  assert.equal(buildTrace({ nums: [1, 2, 3], k: 0 }).result, 0)
})

test('713 random arrays match counting every subarray', () => {
  let state = 163
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(10) }, () => 1 + rand(9))
    const k = rand(60)
    let expected = 0
    for (let i = 0; i < nums.length; i++) {
      let p = 1
      for (let j = i; j < nums.length; j++) { p *= nums[j]; if (p < k) expected++ }
    }
    assert.equal(buildTrace({ nums, k }).result, expected, JSON.stringify({ nums, k }))
  }
})

test('713 rejects zero values', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
})
