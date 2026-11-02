import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (d, low, high) => buildTrace({ d, low, high }).result
const pyLines = python.split('\n').length

test('1067 worked examples', () => {
  assert.equal(solve(1, 1, 13), 6)
  assert.equal(solve(0, 1, 10), 1)
  assert.equal(solve(0, 1, 105), 16)
  assert.equal(solve(5, 5, 5), 1)
})

test('1067 edge cases: single values, leading zeros never counted', () => {
  assert.equal(solve(0, 5, 9), 0)
  assert.equal(solve(9, 100, 100), 0)
  assert.equal(solve(1, 1, 1), 1)
  assert.equal(solve(0, 100, 100), 2)
})

test('1067 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ d: 1, low: 1, high: 13 }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1067 rejects bad bounds', () => {
  assert.throws(() => parseInput('{"d":10,"low":1,"high":2}'))
  assert.throws(() => parseInput('{"d":1,"low":0,"high":2}'))
  assert.throws(() => parseInput('{"d":1,"low":5,"high":4}'))
})

test('1067 random ranges match a direct digit-count oracle', () => {
  let seed = 1067
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const d = rnd(10)
    const low = 1 + rnd(3000)
    const high = low + rnd(3000)
    let expected = 0
    for (let x = low; x <= high; x++) for (const ch of String(x)) if (Number(ch) === d) expected++
    assert.equal(solve(d, low, high), expected, JSON.stringify({ d, low, high }))
  }
})
