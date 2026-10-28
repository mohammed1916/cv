import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2785 official examples', () => {
  assert.equal(solve('lEetcOde'), 'lEOtcede')
  assert.equal(solve('lYmpH'), 'lYmpH')
})

test('2785 uppercase vowels sort before lowercase ones', () => {
  // E (69) sorts before a (97), so the uppercase E moves to the first vowel slot.
  assert.equal(solve('aE'), 'Ea')
})

test('2785 rejects a digit', () => {
  assert.throws(() => parseInput('{"s":"ab1"}'))
})

// Independent oracle: replace each vowel in turn by taking the next letter from a sorted list of all vowels.
function oracle(s) {
  const sortedVowels = [...s].filter(c => 'aeiouAEIOU'.includes(c)).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
  let next = 0
  return s.replace(/[aeiouAEIOU]/g, () => sortedVowels[next++])
}

test('2785 random strings match a replace-based oracle', () => {
  let seed = 2785
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let t = 0; t < 300; t++) {
    let s = ''
    const size = 1 + rnd(30)
    for (let i = 0; i < size; i++) s += letters[rnd(letters.length)]
    assert.equal(solve(s), oracle(s), s)
  }
})
