import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
test('3895 examples and zero handling', () => {
  for (const [nums, digit, expected] of [[[12, 54, 32, 22], 2, 4], [[1, 34, 7], 9, 0], [[1000000, 10, 101], 0, 8], [[777777, 7], 7, 7]]) {
    const run = buildTrace(parseInput(JSON.stringify({ nums, digit })))
    assert.equal(run.result, expected)
    assert.equal(run.counts.reduce((a, b) => a + b, 0), expected)
  }
})
test('3895 arithmetic traces agree with independent string counting', () => {
  for (let n = 1; n <= 10000; n++) for (let digit = 0; digit <= 9; digit++) {
    const run = buildTrace({ nums: [n], digit }), chars = String(n)
    assert.equal(run.result, [...chars].filter(c => c === String(digit)).length)
    const extracts = run.frames.filter(f => f.phase === 'extract')
    assert.equal(extracts.length, chars.length)
    extracts.forEach((frame, i) => {
      assert.equal(frame.extracted, Number(chars[chars.length - 1 - i]))
      assert.equal(frame.before, frame.remaining * 10 + frame.extracted)
      assert.equal(frame.local, [...chars.slice(chars.length - 1 - i)].filter(c => c === String(digit)).length)
    })
  }
})
test('3895 full input and invalid bounds', () => {
  const nums = Array(1000).fill(1000000), run = buildTrace({ nums, digit: 0 })
  assert.equal(run.result, 6000)
  assert.equal(run.frames.length, 9002)
  for (const data of [null, {}, { nums: [], digit: 0 }, { nums: [0], digit: 0 }, { nums: [1000001], digit: 0 }, { nums: [1.1], digit: 0 }, { nums: [1], digit: 10 }, { nums: [1], digit: -1 }, { nums: [1], digit: 0.5 }, { nums: Array(1001).fill(1), digit: 1 }]) assert.throws(() => parseInput(JSON.stringify(data)))
})
