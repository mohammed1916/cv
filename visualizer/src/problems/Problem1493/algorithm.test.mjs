import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('1493 sample inputs return the expected lengths', () => {
  assert.equal(solve([1, 1, 0, 1]), 3)
  assert.equal(solve([0, 1, 1, 1, 0, 1, 1]), 5)
  assert.equal(solve([1, 1, 1]), 2)
  assert.equal(solve([0]), 0)
})

test('1493 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ nums: [1, 0, 0, 1, 1] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('1493 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,0]'), /object/)
  assert.throws(() => parseInput('{"nums":[1,2]}'), /nums/)
  assert.throws(() => parseInput('{"nums":[]}'), /nums/)
})

test('1493 random binary arrays match a delete-one brute force', () => {
  let seed = 41
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(2))
    let expected = 0
    for (let del = 0; del < nums.length; del++) {
      const rest = nums.filter((_, i) => i !== del)
      let run = 0
      let longest = 0
      for (const v of rest) { run = v === 1 ? run + 1 : 0; longest = Math.max(longest, run) }
      expected = Math.max(expected, longest)
    }
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})
