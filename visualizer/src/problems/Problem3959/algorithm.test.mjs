import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

// Independent oracle: compute the same difference with string methods.
function oracle(n) {
  const digits = n.toString().split('')
  const squares = digits.map(c => Number(c) ** 2).reduce((a, b) => a + b, 0)
  const sum = digits.map(Number).reduce((a, b) => a + b, 0)
  return squares - sum >= 50
}

test('3959 authored presets', () => {
  assert.equal(solve(9999), true)
  assert.equal(solve(123), false)
})

test('3959 boundary: difference exactly fifty and just below', () => {
  // 7 gives 49 - 7 = 42; 77 gives 98 - 14 = 84; 33 gives 18 - 6 = 12; 55 gives 50 - 10 = 40.
  assert.equal(solve(77), true)
  assert.equal(solve(7), false)
  assert.equal(solve(1000000000), false)
})

test('3959 parse rejects non-integers and out of range', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1000000001'))
  assert.throws(() => parseInput('12.5'))
  assert.equal(parseInput(' 42 '), 42)
})

test('3959 matches the string oracle on many values', () => {
  for (let n = 1; n <= 3000; n++) assert.equal(solve(n), oracle(n), String(n))
  for (let n = 99990; n <= 100010; n++) assert.equal(solve(n), oracle(n), String(n))
})

test('3959 frames: one per digit plus start and done', () => {
  const run = buildTrace(4096)
  assert.equal(run.frames.length, 1 + 4 + 1)
  assert.equal(run.frames.at(-1).phase, 'done')
})
