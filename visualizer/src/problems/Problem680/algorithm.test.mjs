import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('680 official examples', () => {
  assert.equal(buildTrace('aba').result, true)
  assert.equal(buildTrace('abca').result, true)
  assert.equal(buildTrace('abc').result, false)
})

test('680 every string up to length 7 over {a,b,c} matches deleting each single character', () => {
  const isPal = s => s === [...s].reverse().join('')
  function visit(s) {
    if (s.length) {
      const expected = isPal(s) || [...s].some((_, i) => isPal(s.slice(0, i) + s.slice(i + 1)))
      assert.equal(buildTrace(s).result, expected, s)
    }
    if (s.length < 7) for (const c of 'abc') visit(s + c)
  }
  visit('')
})

test('680 rejects uppercase input', () => {
  assert.throws(() => parseInput('"Aba"'))
})
