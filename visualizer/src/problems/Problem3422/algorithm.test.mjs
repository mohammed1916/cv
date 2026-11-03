import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3422 worked presets', () => {
  assert.equal(solve([1, 3, 6, 2, 8, 5], 3), 4)
  assert.equal(solve([4, 4, 4, 4], 2), 0)
  assert.equal(solve([9, 1, 5, 2], 4), 11)
})

test('3422 window of one and whole-array window', () => {
  assert.equal(solve([7, 0, 9], 1), 0)
  assert.equal(solve([2], 1), 0)
  assert.equal(solve([1, 2, 3], 3), 2)
})

test('3422 parser rejects bad shapes and values', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"nums":[10],"k":1}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: try every target value from 0 to 9 for every window.
function oracle(nums, k) {
  let best = Infinity
  for (let s = 0; s + k <= nums.length; s++) {
    for (let target = 0; target <= 9; target++) {
      let cost = 0
      for (let i = s; i < s + k; i++) cost += Math.abs(nums[i] - target)
      best = Math.min(best, cost)
    }
  }
  return best
}

test('3422 random inputs match a brute-force target oracle', () => {
  let seed = 3422
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(10))
    const k = 1 + rnd(n)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('3422 frames keep the state the view needs', () => {
  const run = buildTrace({ nums: [5, 1, 4], k: 2 })
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.sorted.length === 0 || frame.sorted.length === 2)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).cost, run.result)
})
