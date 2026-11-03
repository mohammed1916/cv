import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: test every subarray directly; its first value must not exceed any value in it.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      if (nums.slice(i, j + 1).every(v => v >= nums[i])) count += 1
    }
  }
  return count
}

test('authored samples', () => {
  assert.equal(solve([3, 6, 4, 7, 2, 5, 5, 1]), oracle([3, 6, 4, 7, 2, 5, 5, 1]))
  assert.equal(solve([8, 8, 8, 8]), 10)
  assert.equal(solve([9, 7, 5, 3]), 4)
  assert.equal(solve([1, 4, 6, 10]), 10)
})

test('single value and small hand-checked cases', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([2, 1]), 2)
  assert.equal(solve([1, 2, 1]), 5)
})

test('random arrays agree with the subarray oracle', () => {
  let state = 29
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 800; t++) {
    const n = 1 + rand(14)
    const nums = Array.from({ length: n }, () => rand(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[]}'), /1 to 40/)
  assert.throws(() => parseInput('{"nums":[-1]}'), /0 to 1000/)
  assert.throws(() => parseInput('[1,2]'), /nums array/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ nums: [3, 6, 4, 7, 2, 5, 5, 1] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(code.length, python.split('\n').length)
})
