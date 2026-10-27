import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('2416 official examples', () => {
  assert.deepEqual(solve(['abc', 'ab', 'bc', 'b']), [5, 4, 3, 2])
  assert.deepEqual(solve(['abcd']), [4])
})

test('2416 identical words score the same', () => {
  assert.deepEqual(solve(['aa', 'aa']), [4, 4])
})

test('2416 rejects an uppercase word', () => {
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: for each prefix of a word, count the words that start with it.
function oracle(words) {
  return words.map(w => {
    let total = 0
    for (let len = 1; len <= w.length; len++) {
      const p = w.slice(0, len)
      total += words.filter(other => other.startsWith(p)).length
    }
    return total
  })
}

test('2416 random word lists match a startsWith oracle', () => {
  let seed = 2416
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  const word = () => Array.from({ length: 1 + rnd(5) }, () => letters[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, word)
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
