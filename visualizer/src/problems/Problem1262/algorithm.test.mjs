import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: try every subset and keep the largest sum divisible by three.
function oracle(nums) {
  let best = 0
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let sum = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i]
    if (sum % 3 === 0 && sum > best) best = sum
  }
  return best
}

test('hand-checked small cases', () => {
  assert.equal(buildTrace([3, 6, 5, 1, 8]).result, 18)
  assert.equal(buildTrace([4]).result, 0)
  assert.equal(buildTrace([1, 2, 3, 4, 4]).result, 12)
  assert.equal(buildTrace([2, 2, 2]).result, 6)
})

test('random inputs agree with the subset oracle', () => {
  let state = 23
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rand(10) }, () => 1 + rand(99))
    assert.equal(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('every frame points at real pseudocode and Python lines', () => {
  const run = buildTrace([3, 6, 5, 1, 8])
  assert.equal(run.frames.filter(f => f.phase === 'take').length, 5)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[]'), /1 to 12/)
  assert.throws(() => parseInput('[0, 3]'), /1 to 99/)
})
