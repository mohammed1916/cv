import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(parseInput(JSON.stringify({ words }))).result

test('2273 examples', () => {
  assert.deepEqual(solve(['abba', 'baba', 'bbaa', 'cd', 'cd']), ['abba', 'cd'])
  assert.deepEqual(solve(['a', 'b', 'c', 'd', 'e']), ['a', 'b', 'c', 'd', 'e'])
})

test('2273 a run of anagrams collapses to its first word', () => {
  assert.deepEqual(solve(['ab', 'ba', 'ab', 'ab']), ['ab'])
})

test('2273 rejects uppercase words', () => {
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: literally delete the later word of the first adjacent anagram pair, until none remain.
function oracle(words) {
  const a = [...words]
  let removed = true
  while (removed) {
    removed = false
    for (let i = 1; i < a.length; i++) {
      if ([...a[i - 1]].sort().join('') === [...a[i]].sort().join('')) {
        a.splice(i, 1)
        removed = true
        break
      }
    }
  }
  return a
}

test('2273 random word lists match a delete-until-stable oracle', () => {
  let seed = 2273
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(12)
    const words = []
    for (let w = 0; w < count; w++) {
      let word = ''
      const len = 1 + rnd(3)
      for (let i = 0; i < len; i++) word += 'abc'[rnd(3)]
      words.push(word)
    }
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
