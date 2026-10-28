import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, queries) => buildTrace(parseInput(JSON.stringify({ words, queries }))).result

test('2586 official examples', () => {
  assert.deepEqual(solve(['aba', 'bcb', 'ece', 'aa', 'e'], [[0, 2], [1, 4], [1, 1]]), [2, 3, 0])
  assert.deepEqual(solve(['a', 'e', 'i'], [[0, 2], [0, 1], [2, 2]]), [3, 2, 1])
})

test('2586 a single-letter vowel counts and a consonant does not', () => {
  assert.deepEqual(solve(['b', 'a'], [[0, 0], [1, 1]]), [0, 1])
})

test('2586 rejects an uppercase word', () => {
  assert.throws(() => parseInput('{"words":["Ab"],"queries":[[0,0]]}'))
})

// Independent oracle: a regular expression check on each word inside each range.
const pattern = /^[aeiou]([a-z]*[aeiou])?$/
function oracle(words, queries) {
  return queries.map(([l, r]) => {
    let count = 0
    for (let i = l; i <= r; i++) if (pattern.test(words[i])) count++
    return count
  })
}

test('2586 seeded random inputs match a direct-scan oracle', () => {
  let seed = 2586
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdeiouxyz'
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(10) }, () => Array.from({ length: 1 + rnd(6) }, () => letters[rnd(letters.length)]).join(''))
    const queries = Array.from({ length: 1 + rnd(10) }, () => { const a = rnd(words.length); const b = rnd(words.length); return [Math.min(a, b), Math.max(a, b)] })
    assert.deepEqual(solve(words, queries), oracle(words, queries), JSON.stringify({ words, queries }))
  }
})
