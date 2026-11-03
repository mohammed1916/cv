import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3073 authored examples', () => {
  assert.equal(solve([5, 2, 8, 1, 6, 9]), 8)
  assert.equal(solve([9, 8, 7]), -1)
})

test('3073 rejects arrays shorter than three values', () => {
  assert.throws(() => parseInput('[1, 2]'))
  assert.throws(() => parseInput('[1, 2, 101]'))
})

test('3073 smallest triplet and frame invariants', () => {
  assert.equal(solve([1, 2, 3]), 1 - 2 + 3)
  assertFrames(buildTrace([5, 2, 8, 1, 6, 9]))
})

// Oracle: enumerate every index triple.
test('3073 random arrays match a triple enumeration', () => {
  let seed = 3073
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 3 + rnd(7) }, () => rnd(12))
    let best = -1
    for (let i = 0; i < nums.length; i++)
      for (let j = i + 1; j < nums.length; j++)
        for (let k = j + 1; k < nums.length; k++)
          if (nums[i] < nums[j] && nums[j] < nums[k]) best = Math.max(best, nums[i] - nums[j] + nums[k])
    assert.equal(solve(nums), best, JSON.stringify(nums))
    assertFrames(buildTrace(nums))
  }
})
