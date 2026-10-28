import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word1, word2) => buildTrace(parseInput(JSON.stringify({ word1, word2 }))).result

test('2531 worked examples', () => {
  // Swapping the c in "abcc" with the a in "aab" gives "abac" and "cab", each with 3 distinct letters.
  assert.equal(solve('abcc', 'aab'), true)
  assert.equal(solve('ab', 'abcc'), false)
  assert.equal(solve('a', 'a'), true)
})

test('2531 rejects empty words and uppercase letters', () => {
  assert.throws(() => parseInput('{"word1":"","word2":"a"}'))
  assert.throws(() => parseInput('{"word1":"aB","word2":"a"}'))
})

// Independent oracle: literally perform every index swap and count distinct letters afterwards.
function oracle(w1, w2) {
  const distinct = s => new Set(s).size
  for (let i = 0; i < w1.length; i++) {
    for (let j = 0; j < w2.length; j++) {
      const a = w1.slice(0, i) + w2[j] + w1.slice(i + 1)
      const b = w2.slice(0, j) + w1[i] + w2.slice(j + 1)
      if (distinct(a) === distinct(b)) return true
    }
  }
  return false
}

test('2531 random word pairs match an index-swap oracle', () => {
  let seed = 2531
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => {
    const alphabet = 'abcdefg'.slice(0, 1 + rnd(7))
    return Array.from({ length: 1 + rnd(8) }, () => alphabet[rnd(alphabet.length)]).join('')
  }
  for (let t = 0; t < 300; t++) {
    const w1 = word(), w2 = word()
    assert.equal(solve(w1, w2), oracle(w1, w2), `${w1} ${w2}`)
  }
})
