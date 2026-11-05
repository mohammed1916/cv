import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(nums, left, right) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let max = -1
    for (let j = i; j < nums.length; j++) {
      max = Math.max(max, nums[j])
      if (max >= left && max <= right) count++
    }
  }
  return count
}

test('795 random arrays match an all-subarrays count', () => {
  let state = 795
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 800; t++) {
    const nums = Array.from({ length: 1 + rand(8) }, () => rand(10))
    const left = rand(10), right = left + rand(10 - left)
    assert.equal(buildTrace({ nums, left, right }).result, brute(nums, left, right), JSON.stringify({ nums, left, right }))
  }
})

test('795 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"nums":[1],"left":3,"right":2}'))
})
