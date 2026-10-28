import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word1, word2, target) => buildTrace(parseInput(JSON.stringify({ word1, word2, target }))).result

test('3981 official examples', () => {
  assert.equal(solve('abc', 'bac', 'abc'), 5)
  assert.equal(solve('cd', 'cd', 'ccd'), 4)
  assert.equal(solve('xy', 'xy', 'xyxy'), 2)
  assert.equal(solve('ab', 'cde', 'ace'), 1)
})

test('3981 one target character cannot use both words, two can', () => {
  assert.equal(solve('a', 'a', 'a'), 0)
  assert.equal(solve('a', 'a', 'aa'), 2)
})

test('3981 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"word1":"aB","word2":"a","target":"a"}'))
})

// Independent oracle: enumerate every sequence of (word, index) choices, checking the increasing rule directly.
function oracle(word1, word2, target) {
  let count = 0
  const walk = (p, last1, last2, used1, used2) => {
    if (p === target.length) {
      if (used1 && used2) count++
      return
    }
    for (let x = last1 + 1; x < word1.length; x++) {
      if (word1[x] === target[p]) walk(p + 1, x, last2, true, used2)
    }
    for (let y = last2 + 1; y < word2.length; y++) {
      if (word2[y] === target[p]) walk(p + 1, last1, y, used1, true)
    }
  }
  walk(0, -1, -1, false, false)
  return count % 1000000007
}

test('3981 random small strings match an enumerate-every-choice oracle', () => {
  let seed = 3981
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const word1 = word(1 + rnd(5))
    const word2 = word(1 + rnd(5))
    const target = word(1 + rnd(4))
    assert.equal(solve(word1, word2, target), oracle(word1, word2, target), JSON.stringify({ word1, word2, target }))
  }
})
