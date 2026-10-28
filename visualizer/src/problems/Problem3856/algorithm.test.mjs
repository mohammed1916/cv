import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3856 trailing vowels are removed', () => {
  assert.equal(solve({ s: 'idea' }), 'id')
  assert.equal(solve({ s: 'bcd' }), 'bcd')
})

test('3856 a string of only vowels trims to empty', () => {
  assert.equal(solve({ s: 'aei' }), '')
})

test('3856 vowels in the middle are kept', () => {
  assert.equal(solve({ s: 'aeb' }), 'aeb')
})

test('3856 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ai"}'))
})

// Independent oracle: a regular-expression replacement of the trailing vowel run.
function oracle({ s }) {
  return s.replace(/[aeiou]+$/, '')
}

test('3856 random strings match a regular-expression oracle', () => {
  let seed = 3856
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aeioubcdxy'
  for (let t = 0; t < 300; t++) {
    const input = { s: Array.from({ length: 1 + rnd(12) }, () => alphabet[rnd(alphabet.length)]).join('') }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
