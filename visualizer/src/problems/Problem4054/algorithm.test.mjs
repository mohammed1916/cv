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

// Independent oracle: check every pair and every value between them directly.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (!(nums[i] < nums[j])) continue
      let clear = true
      for (let k = i + 1; k < j; k++) if (nums[k] < nums[i]) clear = false
      if (clear) count++
    }
  }
  return count
}

test('4054 a smaller value between two elements blocks their pair', () => {
  assert.equal(solve([1, 3, 2]), 2) // (1,3) and (1,2) both count; nothing before 2 is smaller than 1
  assert.equal(solve([2, 1, 3]), 1) // the 1 blocks (2,3), but (1,3) still counts
})

test('4054 equal values between a pair do not block it', () => {
  assert.equal(solve([4, 4, 6]), 2)
  assert.equal(solve([3, 5, 3, 7]), 3) // (1,3) is blocked by the 3 between them
})

test('4054 an equal endpoint is never a pair', () => {
  assert.equal(solve([5, 5, 5]), 0)
})

test('4054 rejects short arrays and bad values', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,0,3]'))
  assert.throws(() => parseInput('"abc"'))
})

test('4054 random arrays match the direct pair oracle and frames stay valid', () => {
  let seed = 4054
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => 1 + rnd(6))
    const run = buildTrace(nums)
    assert.equal(run.result, oracle(nums), JSON.stringify(nums))
    checkFrames(run)
  }
})
