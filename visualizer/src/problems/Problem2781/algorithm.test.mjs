import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2781 official examples', () => {
  assert.equal(solve({ word: 'cbaaaabc', forbidden: ['aaa', 'cb'] }), 4)
  assert.equal(solve({ word: 'leetcode', forbidden: ['de', 'le', 'e'] }), 4)
})

test('2781 edge cases: nothing forbidden, and every letter forbidden', () => {
  assert.equal(solve({ word: 'abca', forbidden: ['zz'] }), 4)
  assert.equal(solve({ word: 'abc', forbidden: ['a', 'b', 'c'] }), 0)
})

test('2781 rejects an empty forbidden list and uppercase letters', () => {
  assert.throws(() => parseInput('{"word":"abc","forbidden":[]}'))
  assert.throws(() => parseInput('{"word":"ABC","forbidden":["a"]}'))
})

// Independent oracle: try every substring and keep the longest one that contains no forbidden string.
function oracle({ word, forbidden }) {
  let best = 0
  for (let i = 0; i < word.length; i++) {
    for (let j = i; j < word.length; j++) {
      const sub = word.slice(i, j + 1)
      if (!forbidden.some(f => sub.includes(f))) best = Math.max(best, sub.length)
    }
  }
  return best
}

test('2781 random inputs match an all-substrings oracle', () => {
  let seed = 2781
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = (min, max) => Array.from({ length: min + rnd(max - min + 1) }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const input = { word: letters(1, 12), forbidden: Array.from({ length: 1 + rnd(4) }, () => letters(1, 3)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
