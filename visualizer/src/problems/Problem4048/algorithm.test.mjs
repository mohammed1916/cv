import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('4048 small cases', () => {
  assert.equal(solve([1, 1, 1]), 1)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([4, 7, 4, 9, 4, 7, 7, 7, 1]), 1)
  assert.equal(solve([3, 1, 3, 2, 3, 1, 1, 4, 4, 4]), 2)
})

test('4048 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([2, 2, 2, 5])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4048 rejects bad input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[0,1,2]'))
})

// Independent oracle: scan every triple i < j < k with equal gaps and no other occurrences of the value.
function oracle(nums) {
  const values = new Set(nums)
  let count = 0
  for (const v of values) {
    const pos = nums.flatMap((x, i) => (x === v ? [i] : []))
    if (pos.length === 3 && pos[1] - pos[0] === pos[2] - pos[1]) count += 1
  }
  return count
}

test('4048 random inputs match a direct oracle', () => {
  let seed = 4048
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(12) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
