import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2255 official examples', () => {
  assert.equal(solve({ words: ['a', 'b', 'c', 'ab', 'bc', 'abc'], s: 'abc' }), 3)
  assert.equal(solve({ words: ['a', 'a'], s: 'aa' }), 2)
})

test('2255 edge case: no word is a prefix', () => {
  assert.equal(solve({ words: ['x', 'abcd'], s: 'abc' }), 0)
})

test('2255 rejects an uppercase word and a missing key', () => {
  assert.throws(() => parseInput('{"words":["Ab"],"s":"ab"}'))
  assert.throws(() => parseInput('{"words":["a"]}'))
})

// Independent oracle: collect every prefix of s into a set, then count the words found in it.
function oracle({ words, s }) {
  const prefixes = new Set()
  for (let k = 1; k <= s.length; k++) prefixes.add(s.slice(0, k))
  return words.filter(w => prefixes.has(w)).length
}

test('2255 random inputs match a prefix-set oracle', () => {
  let seed = 2255
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = (max) => Array.from({ length: 1 + rnd(max) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const input = { words: Array.from({ length: 1 + rnd(6) }, () => word(3)), s: word(6) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
