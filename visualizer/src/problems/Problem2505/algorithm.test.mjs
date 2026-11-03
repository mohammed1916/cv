import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.reach.length, frame.total + 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, run.result)
}

// Brute force: enumerate every subsequence (2^n index subsets) and OR the sums.
function oracle(nums) {
  let or = 0
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let sum = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i]
    or |= sum
  }
  return or
}

test('2505 local presets match hand-checked sums', () => {
  // [1,2,3] reaches 0..6, whose OR is 7; [4,4,1] reaches 0,1,4,5,8,9; [5,6] reaches 0,5,6,11.
  assert.equal(solve([1, 2, 3]), 7)
  assert.equal(solve([4, 4, 1]), 13)
  assert.equal(solve([5, 6]), 15)
})

test('2505 zeros and a single number', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([0, 0]), 0)
  assert.equal(solve([6]), 6)
})

test('2505 duplicated values are independent choices', () => {
  assert.equal(solve([2, 2]), 6)
  assert.equal(solve([3, 3, 3]), oracle([3, 3, 3]))
})

test('2505 random inputs match the subset oracle', () => {
  let seed = 2505
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2505 frame invariants hold', () => {
  checkFrames(buildTrace({ nums: [4, 4, 1] }))
  checkFrames(buildTrace({ nums: [0] }))
})

test('2505 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"nums":[10]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})
