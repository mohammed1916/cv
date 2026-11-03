import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, goal, k) => buildTrace({ nums, goal, k }).result

test('4051 k of zero counts every subarray', () => {
  assert.equal(solve([4, 1, 3], 3, 0), 6)
  assert.equal(solve([5], 0, 0), 1)
})

test('4051 small hand-checked cases', () => {
  assert.equal(solve([5], 5, 1), 0)
  assert.equal(solve([5], 0, 1), 1)
  assert.equal(solve([1, 2], 0, 2), 2)
})

test('4051 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ nums: [1, -1, 2, 3, -2], goal: 2, k: 1 })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4051 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"goal":0,"k":0}'))
  assert.throws(() => parseInput('{"nums":[1],"goal":0,"k":-1}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: enumerate every subarray and test |sum - goal| >= k directly.
function oracle(nums, goal, k) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    let sum = 0
    for (let r = l; r < nums.length; r++) {
      sum += nums[r]
      if (Math.abs(sum - goal) >= k) count += 1
    }
  }
  return count
}

test('4051 random inputs match a subarray enumeration oracle', () => {
  let seed = 4051
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(11) - 5)
    const goal = rnd(11) - 5
    const k = rnd(6)
    assert.equal(solve(nums, goal, k), oracle(nums, goal, k), JSON.stringify({ nums, goal, k }))
  }
})
