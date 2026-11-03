import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Brute force: try every subarray and keep the longest one whose sign product is positive.
function brute(nums) {
  let best = 0
  for (let a = 0; a < nums.length; a++) {
    let sign = 1
    for (let b = a; b < nums.length; b++) {
      sign *= Math.sign(nums[b])
      if (sign > 0) best = Math.max(best, b - a + 1)
    }
  }
  return best
}

test('own sample arrays match a brute-force search over all subarrays', () => {
  for (const nums of [[2, -3, 4, -1, 5], [3, -1, -2, 0, 5, -4], [-4, -2, -7]]) {
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('a zero splits the array and a lone negative gives no positive run', () => {
  assert.equal(buildTrace([5, 0, 3]).result, 1)
  assert.equal(buildTrace([-1, -2]).result, 2)
  assert.equal(buildTrace([-1]).result, 0)
})

test('random arrays agree with brute force', () => {
  let state = 7
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rand(12)
    const nums = Array.from({ length: len }, () => rand(7) - 3)
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('every frame names a real code line, a Python line and a known phase', () => {
  const run = buildTrace([2, -3, 0, 4])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2.5]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10]'), /-9 to 9/)
})
