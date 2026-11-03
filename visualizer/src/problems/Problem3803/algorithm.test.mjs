import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3803 worked cases', () => {
  assert.equal(solve('mmm'), 1)
  assert.equal(solve('a'), 1)
})

test('3803 matches a direct recount of every prefix', () => {
  for (const s of ['aabbcc', 'abcabcab', 'zzzyx', 'qwertyuiop']) {
    let expected = 0
    for (let n = 1; n <= s.length; n++) if (new Set(s.slice(0, n)).size === n % 3) expected++
    assert.equal(solve(s), expected, s)
  }
})

test('3803 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ s: 'abca' }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3803 rejects uppercase input', () => {
  assert.throws(() => parseInput('{"s":"AB"}'))
})
