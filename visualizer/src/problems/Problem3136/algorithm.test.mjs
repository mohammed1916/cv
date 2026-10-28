import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3136 official examples', () => {
  assert.equal(solve({ word: '234Adas' }), true)
  assert.equal(solve({ word: 'b3' }), false)
  assert.equal(solve({ word: 'a3$e' }), false)
})

test('3136 a word with only vowels or only consonants is invalid', () => {
  assert.equal(solve({ word: 'aei' }), false)
  assert.equal(solve({ word: 'bcd' }), false)
})

test('3136 rejects characters outside the allowed set', () => {
  assert.throws(() => parseInput('{"word":"ab_c"}'))
})

// Independent oracle: a regular-expression check of the same three rules.
function oracle({ word }) {
  return word.length >= 3
    && /^[A-Za-z0-9]+$/.test(word)
    && /[aeiouAEIOU]/.test(word)
    && /[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/.test(word)
}

test('3136 random words match a regular-expression oracle', () => {
  let seed = 3136
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aeBz3@#$x9Q'
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(6)
    const word = Array.from({ length }, () => alphabet[rnd(alphabet.length)]).join('')
    const input = { word }
    if (word.length === 0) continue
    assert.equal(solve(input), oracle(input), word)
  }
})
