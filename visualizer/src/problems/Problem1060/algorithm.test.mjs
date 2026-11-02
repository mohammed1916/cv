import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const pyLines = python.split('\n').length

test('1060 worked examples', () => {
  assert.equal(solve([4, 7, 9, 10], 1), 5)
  assert.equal(solve([4, 7, 9, 10], 3), 8)
  assert.equal(solve([4, 7, 9, 10], 4), 11)
  assert.equal(solve([4, 7, 9, 10], 5), 12)
})

test('1060 missing values before the first element are not counted', () => {
  assert.equal(solve([1, 2, 3], 1), 4)
  assert.equal(solve([5], 3), 8)
  assert.equal(solve([0, 1, 2], 2), 4)
})

test('1060 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ nums: [4, 7, 9, 10], k: 3 }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1060 rejects unsorted input and bad k', () => {
  assert.throws(() => parseInput('{"nums":[3,3],"k":1}'))
  assert.throws(() => parseInput('{"nums":[5,2],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Oracle: list the integers after nums[0] that are not in nums, and take the kth one.
function oracle(nums, k) {
  const present = new Set(nums)
  let count = 0
  for (let v = nums[0] + 1; ; v++) {
    if (!present.has(v)) {
      count++
      if (count === k) return v
    }
  }
}

test('1060 random arrays match a linear-scan oracle', () => {
  let seed = 1060
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 500; t++) {
    const size = 1 + rnd(8)
    const set = new Set()
    while (set.size < size) set.add(rnd(40))
    const nums = [...set].sort((a, b) => a - b)
    const k = 1 + rnd(20)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
