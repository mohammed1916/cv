import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3662 hand-checked values', () => {
  assert.equal(solve('aabbc', 2), 'c')
  assert.equal(solve('abcabc', 3), 'abcabc')
  assert.equal(solve('aaa', 3), '')
  assert.equal(solve('z', 1), '')
})

test('3662 keeps order and every occurrence of rare letters', () => {
  assert.equal(solve('banana', 3), 'bnn')
  assert.equal(solve('mississippi', 4), 'mpp')
})

test('3662 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"","k":1}'))
  assert.throws(() => parseInput('{"s":"AB","k":1}'))
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
  assert.throws(() => parseInput('{"s":"ab","k":11}'))
})

test('3662 frames carry valid lines and phases', () => {
  const trace = buildTrace({ s: 'aabbc', k: 2 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
  }
})

// Oracle: count each letter with indexOf/split, then filter with a regular expression.
test('3662 matches a split-based oracle on random strings', () => {
  let seed = 3662
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'abcd'[rnd(4)]).join('')
    const k = 1 + rnd(5)
    const expected = s.split('').filter(c => s.split(c).length - 1 < k).join('')
    assert.equal(solve(s, k), expected, JSON.stringify({ s, k }))
  }
})
