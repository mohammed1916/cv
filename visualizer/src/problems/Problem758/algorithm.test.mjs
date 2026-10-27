import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, s) => buildTrace({ words, s }).result

test('758 official example: overlapping and adjacent words merge', () => {
  assert.equal(solve(['ab', 'bc'], 'aabcd'), 'a<b>abc</b>d')
})

test('758 a word covering the whole string', () => {
  assert.equal(solve(['abc', 'def'], 'abcdef'), '<b>abcdef</b>')
})

test('758 no occurrence means no tags', () => {
  assert.equal(solve(['xy'], 'abc'), 'abc')
})

test('758 rejects uppercase words', () => {
  assert.throws(() => parseInput('{"words":["Ab"],"s":"ab"}'))
})

// Independent oracle: mark a letter bold when some substring that covers it is one of the words.
function oracleBold(words, s) {
  const set = new Set(words)
  const bold = Array(s.length).fill(false)
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      if (!set.has(s.slice(i, j))) continue
      for (let k = i; k < j; k++) bold[k] = true
    }
  }
  return bold
}

test('758 random strings match an oracle', () => {
  let seed = 13
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  const randomWord = len => Array.from({ length: len }, () => letters[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = randomWord(1 + rnd(20))
    const words = Array.from({ length: 1 + rnd(4) }, () => randomWord(1 + rnd(3)))
    assert.deepEqual(buildTrace({ words, s }).bold, oracleBold(words, s), JSON.stringify({ words, s }))
  }
})
