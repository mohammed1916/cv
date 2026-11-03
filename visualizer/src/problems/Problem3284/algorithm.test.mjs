import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.upCount >= 0 && frame.downCount >= 0)
  }
}

test('3284 authored presets', () => {
  // [1,2,3,2]: singles 8, runs [1,2] 3, [2,3] 5, [1,2,3] 6, [3,2] 5.
  assert.equal(solve([1, 2, 3, 2]), 27)
  // [5,4,9,10]: singles 28, [5,4] 9, [9,10] 19.
  assert.equal(solve([5, 4, 9, 10]), 56)
  assert.equal(solve([7]), 7)
})

test('3284 small hand-checked cases', () => {
  assert.equal(solve([1, 2, 3]), 20)
  assert.equal(solve([3, 2, 1]), 20)
  assert.equal(solve([1, 3, 5]), 9)
})

test('3284 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[101]'))
})

// Independent oracle: enumerate every contiguous subarray and test its steps directly.
function oracle(nums) {
  let total = 0
  for (let a = 0; a < nums.length; a++) {
    for (let b = a; b < nums.length; b++) {
      let up = true
      let down = true
      for (let k = a + 1; k <= b; k++) {
        const d = nums[k] - nums[k - 1]
        if (d !== 1) up = false
        if (d !== -1) down = false
      }
      if (b === a || up || down) {
        for (let k = a; k <= b; k++) total += nums[k]
      }
    }
  }
  return ((total % 1000000007) + 1000000007) % 1000000007
}

test('3284 random arrays match a subarray enumeration oracle', () => {
  let seed = 3284
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(9) - 4)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3284 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace([1, 2, 3, 2, 4]))
})
