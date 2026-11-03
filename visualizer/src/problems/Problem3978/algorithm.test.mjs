import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
    assert.equal(typeof f.phase, 'string')
  }
}

test('3978 authored examples behave as described', () => {
  assert.equal(solve([5, 2, 8, 3, 9]), true)
  assert.equal(solve([6, 6, 6]), false)
  assert.equal(solve([7]), true)
  assert.equal(solve([4, 1, 4, 2, 4]), false)
})

test('3978 edge cases: single value, middle unique among duplicates', () => {
  assert.equal(solve([100]), true)
  assert.equal(solve([1, 9, 1]), true)
  assert.equal(solve([1, 9, 9]), false)
  assert.equal(solve([1, 9, 2, 1, 1]), true)
})

test('3978 rejects even-length and out-of-range input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[101]'))
})

test('3978 random inputs match a counting oracle and frames are well formed', () => {
  let seed = 3978
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 * rnd(7) + 1
    const nums = Array.from({ length: len }, () => 1 + rnd(4))
    const mid = nums[Math.floor(len / 2)]
    const expected = nums.filter(v => v === mid).length === 1
    const run = buildTrace(nums)
    assert.equal(run.result, expected, JSON.stringify(nums))
    checkFrames(run)
    assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  }
})
