import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

test('3121 official examples', () => {
  assert.equal(solve('aaAbcBC'), 3)
  assert.equal(solve('abc'), 0)
  assert.equal(solve('AbCabc'), 0)
})

test('3121 edge cases: an uppercase letter before a lowercase one disqualifies it', () => {
  assert.equal(solve('aA'), 1)
  assert.equal(solve('Aa'), 0)
  assert.equal(solve('aAa'), 0)
})

test('3121 rejects digits and empty words', () => {
  assert.throws(() => parseInput('{"word":"a1"}'))
  assert.throws(() => parseInput('{"word":""}'))
})

// Independent oracle: a letter is special when it has both cases and no uppercase copy appears
// before any lowercase copy. Detect a violation with a regular expression: uppercase, anything, lowercase.
function oracle(word) {
  let count = 0
  for (let code = 97; code <= 122; code++) {
    const lower = String.fromCharCode(code)
    const upper = lower.toUpperCase()
    const hasBoth = word.includes(lower) && word.includes(upper)
    const violated = new RegExp(`${upper}[\\s\\S]*${lower}`).test(word)
    if (hasBoth && !violated) count += 1
  }
  return count
}

test('3121 random words match a regular-expression oracle', () => {
  let seed = 3121
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(15) }, () => 'aAbBcCd'[rnd(7)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
