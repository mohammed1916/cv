import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3813 hand-checked examples', () => {
  // Five vowels and four consonants give floor(5 / 4) = 1.
  assert.equal(solve({ s: 'education' }), 1)
  // Two vowels and one consonant give 2; the space is ignored.
  assert.equal(solve({ s: 'aa b' }), 2)
  // No consonants at all scores 0.
  assert.equal(solve({ s: 'aeiou' }), 0)
})

test('3813 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

// Independent oracle: count with regular expressions.
function oracle({ s }) {
  const vowels = (s.match(/[aeiou]/g) ?? []).length
  const consonants = (s.match(/[b-df-hj-np-tv-z]/g) ?? []).length
  return consonants === 0 ? 0 : Math.floor(vowels / consonants)
}

test('3813 random strings match a regular-expression oracle', () => {
  let seed = 3813
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aeioubcdx  '
  for (let t = 0; t < 300; t++) {
    const input = { s: Array.from({ length: 1 + rnd(20) }, () => alphabet[rnd(alphabet.length)]).join('') }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
