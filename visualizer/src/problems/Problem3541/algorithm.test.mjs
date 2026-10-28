import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3541 examples', () => {
  // successes: s occurs 4 times (consonant) and e occurs 2 times (vowel).
  assert.equal(solve('successes'), 6)
  // Each vowel occurs once, so the best vowel count is 1 and there are no consonants.
  assert.equal(solve('aeiou'), 1)
})

test('3541 a string with only consonants counts zero for the vowel', () => {
  assert.equal(solve('ccc'), 3)
})

test('3541 rejects uppercase letters and an empty string', () => {
  assert.throws(() => parseInput('"AB"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: for each letter of the alphabet, count it by scanning the string.
function oracle(s) {
  const occ = ch => [...s].filter(x => x === ch).length
  let vowel = 0
  let consonant = 0
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
    const k = occ(ch)
    if ('aeiou'.includes(ch)) vowel = Math.max(vowel, k)
    else consonant = Math.max(consonant, k)
  }
  return vowel + consonant
}

test('3541 random strings match an alphabet-scan oracle', () => {
  let seed = 3541
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(30) }, () => letters[rnd(26)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
