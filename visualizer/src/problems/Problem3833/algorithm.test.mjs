import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

function brute(nums) {
  let count = 0
  for (let i = 0; i < nums.length - 1; i++) {
    const rest = nums.slice(i + 1)
    const avg = rest.reduce((a, b) => a + b, 0) / rest.length
    if (nums[i] > avg) count++
  }
  return count
}

test('3833 worked cases', () => {
  assert.equal(solve({ nums: [6, 4, 3] }), 2)
  assert.equal(solve({ nums: [1, 9, 2, 2] }), 1)
  assert.equal(solve({ nums: [7] }), 0)
})

test('3833 matches a direct average check on fixed lists', () => {
  for (const nums of [[3, 3, 3], [10, 1, 1, 1, 1], [2, 8, 4, 9, 1], [6, 5, 4, 3, 2, 1]]) assert.equal(solve({ nums }), brute(nums))
})

test('3833 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ nums: [4, 2, 6] }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3833 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})
