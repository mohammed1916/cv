import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (chunks, queries) => buildTrace(parseInput(JSON.stringify({ chunks, queries }))).result

test('3926 official examples', () => {
  assert.deepEqual(solve(['hello wor', 'ld hello'], ['hello', 'world', 'wor']), [2, 1, 0])
  assert.deepEqual(solve(['a-b a--b ', 'a-', 'b'], ['a-b', 'a', 'b']), [2, 1, 1])
  assert.deepEqual(solve(['-cat dog- mouse'], ['cat', 'dog', 'mouse', 'cat-dog']), [1, 1, 1, 0])
})

test('3926 a chunk boundary can join a word and a hyphen can split one', () => {
  // The chunks join into "ab-cd", one word; the lone hyphen in "x--y" splits the word.
  assert.deepEqual(solve(['ab-', 'cd'], ['ab-cd', 'ab']), [1, 0])
  assert.deepEqual(solve(['x--y'], ['x', 'y', 'x-y']), [1, 1, 0])
})

test('3926 rejects a query with a double hyphen', () => {
  assert.throws(() => parseInput('{"chunks":["a"],"queries":["a--b"]}'))
})

// Independent oracle: a regular expression for maximal runs of letters joined by single hyphens.
function oracle(chunks, queries) {
  const words = (chunks.join('').match(/[a-z]+(?:-[a-z]+)*/g)) ?? []
  return queries.map(q => words.filter(w => w === q).length)
}

test('3926 random texts match a regular-expression oracle', () => {
  let seed = 3926
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'ab- '
  for (let t = 0; t < 300; t++) {
    let text = ''
    const len = 1 + rnd(18)
    for (let i = 0; i < len; i++) text += alphabet[rnd(alphabet.length)]
    const chunks = [text]
    const pool = ['a', 'b', 'a-b', 'b-a', 'ab', 'a-b-a']
    const queries = Array.from({ length: 1 + rnd(4) }, () => pool[rnd(pool.length)])
    assert.deepEqual(solve(chunks, queries), oracle(chunks, queries), JSON.stringify({ chunks, queries }))
  }
})
