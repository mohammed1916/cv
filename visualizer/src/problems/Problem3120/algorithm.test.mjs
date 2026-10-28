import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

test('3120 official examples', () => {
  assert.equal(solve('aaAbcBC'), 3)
  assert.equal(solve('abc'), 0)
  assert.equal(solve('abBCab'), 1)
})

test('3120 edge cases: a single letter and a letter that is only uppercase', () => {
  assert.equal(solve('A'), 0)
  assert.equal(solve('aA'), 1)
})

test('3120 rejects digits and empty words', () => {
  assert.throws(() => parseInput('{"word":"a1"}'))
  assert.throws(() => parseInput('{"word":""}'))
})

// Independent oracle: test each of the 26 letters with a plain substring search for each case.
function oracle(word) {
  let count = 0
  for (let code = 97; code <= 122; code++) {
    const lower = String.fromCharCode(code)
    if (word.includes(lower) && word.includes(lower.toUpperCase())) count += 1
  }
  return count
}

test('3120 random words match a per-letter oracle', () => {
  let seed = 3120
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(15) }, () => 'aAbBcdE'[rnd(7)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
