import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3775 a later word with the same vowel count is reversed', () => {
  assert.equal(solve('cat and mice'), 'cat dna mice')
  assert.equal(solve('book is nice'), 'book is ecin')
})

test('3775 the first word is never reversed', () => {
  assert.equal(solve('aei oo'), 'aei oo')
  assert.equal(solve('a'), 'a')
})

test('3775 rejects capital letters and double spaces', () => {
  assert.throws(() => parseInput('{"s":"Cat dog"}'))
  assert.throws(() => parseInput('{"s":"cat  dog"}'))
})

// Independent oracle: count vowels with a regular expression and reverse words by splitting on the first-word count.
function oracle(s) {
  const [first, ...rest] = s.split(' ')
  const target = (first.match(/[aeiou]/g) || []).length
  const mapped = rest.map(w => ((w.match(/[aeiou]/g) || []).length === target ? w.split('').reverse().join('') : w))
  return [first, ...mapped].join(' ')
}

test('3775 random word lists match a regular expression oracle', () => {
  let seed = 3775
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const words = []
    for (let w = 0; w < count; w++) {
      let word = ''
      const len = 1 + rnd(6)
      for (let i = 0; i < len; i++) word += 'aeiobc'[rnd(6)]
      words.push(word)
    }
    const s = words.join(' ')
    assert.equal(solve(s), oracle(s), s)
  }
})
