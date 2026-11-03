import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: a pair counts when no intervening value lies strictly between its endpoints.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (!(nums[i] < nums[j])) continue
      let clear = true
      for (let k = i + 1; k < j; k++) if (nums[k] > nums[i] && nums[k] < nums[j]) clear = false
      if (clear) count++
    }
  }
  return count
}

test('4055 a value strictly between the endpoints blocks the pair', () => {
  assert.equal(solve([1, 2, 3]), 2) // (1,3) is blocked by 2; (1,2) and (2,3) count
  assert.equal(solve([1, 5, 3]), 2) // 5 is above both 1 and 3, so it does not block (1,3)
})

test('4055 values equal to an endpoint do not block', () => {
  assert.equal(solve([1, 3, 3, 4]), 4)
  assert.equal(solve([2, 4, 2, 4]), 3)
})

test('4055 a pair of equal endpoints never counts', () => {
  assert.equal(solve([7, 7, 7]), 0)
})

test('4055 rejects bad input', () => {
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[1,2,-3]'))
})

test('4055 random arrays match the direct oracle and frames stay valid', () => {
  let seed = 4055
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => 1 + rnd(7))
    const run = buildTrace(nums)
    assert.equal(run.result, oracle(nums), JSON.stringify(nums))
    checkFrames(run)
  }
})
