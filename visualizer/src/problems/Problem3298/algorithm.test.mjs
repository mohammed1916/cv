import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3298 official examples', () => {
  assert.equal(solve({ word1: 'bcca', word2: 'abc' }), 1)
  assert.equal(solve({ word1: 'abcabc', word2: 'abc' }), 10)
  assert.equal(solve({ word1: 'abcabc', word2: 'aaabc' }), 0)
})

test('3298 rejects a word2 longer than the cap', () => {
  assert.throws(() => parseInput('{"word1":"abc","word2":"abcdef"}'))
})

// Independent oracle: enumerate every substring and compare letter counts with word2.
function oracle({ word1, word2 }) {
  const countOf = str => str.split('').reduce((m, c) => m.set(c, (m.get(c) ?? 0) + 1), new Map())
  const need = countOf(word2)
  let count = 0
  for (let i = 0; i < word1.length; i++) {
    for (let j = i; j < word1.length; j++) {
      const have = countOf(word1.slice(i, j + 1))
      if ([...need].every(([c, k]) => (have.get(c) ?? 0) >= k)) count++
    }
  }
  return count
}

test('3298 seeded random cases match substring enumeration', () => {
  let seed = 3298
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'abcd'
  for (let t = 0; t < 300; t++) {
    let word1 = '', word2 = ''
    for (let i = 0; i < 1 + rnd(14); i++) word1 += alphabet[rnd(4)]
    for (let i = 0; i < 1 + rnd(4); i++) word2 += alphabet[rnd(4)]
    const input = { word1, word2 }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
