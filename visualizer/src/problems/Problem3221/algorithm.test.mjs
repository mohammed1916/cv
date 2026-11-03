import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3221 presets and edge cases', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([5, 9]), 9)
  assert.equal(solve([0, 0, 0]), 0)
})

test('3221 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('{"a":1}'))
})

// Oracle: the O(n^2) recurrence from Problem 3205.
function oracle(nums) {
  const n = nums.length
  const best = Array(n).fill(-Infinity)
  best[0] = 0
  for (let j = 1; j < n; j++) for (let i = 0; i < j; i++) best[j] = Math.max(best[j], best[i] + (j - i) * nums[j])
  return best[n - 1]
}

test('3221 random arrays match the quadratic recurrence', () => {
  let seed = 3221
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(101))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3221 frames stay inside the pseudocode and Python listings', () => {
  const pyLines = python.split('\n').length
  const run = buildTrace([3, 0, 8, 2, 6])
  assert.equal(run.result, oracle([3, 0, 8, 2, 6]))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.equal(run.frames.at(-1).best.at(-1), run.result)
})
