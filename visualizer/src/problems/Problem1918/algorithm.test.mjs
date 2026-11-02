import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1918 worked examples', () => {
  assert.equal(solve([3, 1, 2], 1), 1)
  assert.equal(solve([3, 1, 2], 3), 3)
  assert.equal(solve([3, 1, 2], 6), 6)
  assert.equal(solve([2, 2, 2], 4), 4)
  assert.equal(solve([5], 1), 5)
})

test('1918 rejects k out of range and bad values', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":4}'))
  assert.throws(() => parseInput('{"nums":[0,2],"k":1}'))
})

test('1918 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ nums: [3, 1, 2], k: 2 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: list every subarray sum, sort, and take the kth.
function oracle(nums, k) {
  const sums = []
  for (let i = 0; i < nums.length; i++) {
    let s = 0
    for (let j = i; j < nums.length; j++) { s += nums[j]; sums.push(s) }
  }
  sums.sort((a, b) => a - b)
  return sums[k - 1]
}

test('1918 random arrays match a sort-all-sums oracle', () => {
  let seed = 1918
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    const total = nums.length * (nums.length + 1) / 2
    const k = 1 + rnd(total)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
