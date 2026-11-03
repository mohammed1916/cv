import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: list every subarray with the target sum, then take the most intervals that do not overlap (earliest end first).
function oracle(nums, target) {
  const spans = []
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (sum === target) spans.push([i, j])
    }
  }
  spans.sort((a, b) => a[1] - b[1])
  let last = -1, count = 0
  for (const [s, e] of spans) if (s > last) { count++; last = e }
  return count
}

test('a hand-checked example takes four disjoint subarrays', () => {
  assert.equal(buildTrace({ nums: [1, -1, 2, 2, -2, 2, 2], target: 2 }).result, 4)
})

test('small cases agree with the interval oracle', () => {
  assert.equal(buildTrace({ nums: [1, 1, 1, 1], target: 2 }).result, 2)
  assert.equal(buildTrace({ nums: [5], target: 2 }).result, 0)
  assert.equal(buildTrace({ nums: [0, 0, 0], target: 0 }).result, 3)
})

test('random arrays agree with the oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(12) }, () => rand(7) - 3)
    const target = rand(9) - 4
    assert.equal(buildTrace({ nums, target }).result, oracle(nums, target), JSON.stringify({ nums, target }))
  }
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace({ nums: [1, -1, 2, 2], target: 2 }).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"nums":[],"target":1}'), /nums/)
  assert.throws(() => parseInput('{"nums":[10],"target":1}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1],"target":21}'), /target/)
})
