import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (message, banned_words) => buildTrace(parseInput(JSON.stringify({ message, banned_words }))).result

test('3295 examples', () => {
  assert.equal(solve(['hello', 'world', 'leetcode'], ['world', 'hello']), true)
  assert.equal(solve(['hello', 'programming', 'fellow', 'leetcode'], ['world', 'hello']), false)
})

test('3295 edge cases: a repeated banned word counts each time', () => {
  assert.equal(solve(['ab', 'ab'], ['ab']), true)
  assert.equal(solve(['ab'], ['ab', 'cd']), false)
})

test('3295 rejects an empty message and uppercase words', () => {
  assert.throws(() => parseInput('{"message":[],"banned_words":["a"]}'))
  assert.throws(() => parseInput('{"message":["Ab"],"banned_words":["a"]}'))
})

// Independent oracle: count message words by scanning the banned list with indexOf.
function oracle(message, bannedWords) {
  const hits = message.filter(w => bannedWords.indexOf(w) !== -1).length
  return hits >= 2
}

test('3295 random messages match a list-search oracle', () => {
  let seed = 3295
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const vocabulary = ['a', 'ab', 'abc', 'b', 'ba', 'cc']
  for (let t = 0; t < 300; t++) {
    const message = Array.from({ length: 1 + rnd(8) }, () => vocabulary[rnd(vocabulary.length)])
    const banned = Array.from({ length: 1 + rnd(4) }, () => vocabulary[rnd(vocabulary.length)])
    assert.equal(solve(message, banned), oracle(message, banned), JSON.stringify({ message, banned }))
  }
})
