import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, queries) => buildTrace(parseInput(JSON.stringify({ words, queries }))).result

test('2559 official examples', () => {
  assert.deepEqual(solve(['aba', 'bcb', 'ece', 'aa', 'e'], [[0, 2], [1, 4], [1, 1]]), [2, 3, 0])
  assert.deepEqual(solve(['a', 'e', 'i'], [[0, 2], [0, 1], [2, 2]]), [3, 2, 1])
})

test('2559 a single vowel word counts once', () => {
  assert.deepEqual(solve(['o'], [[0, 0]]), [1])
})

test('2559 rejects a range that is reversed', () => {
  assert.throws(() => parseInput('{"words":["a","b"],"queries":[[1,0]]}'))
})

// Independent oracle: for each query, scan the range and count directly.
function oracle(words, queries) {
  return queries.map(([l, r]) => {
    let count = 0
    for (let k = l; k <= r; k++) {
      const w = words[k]
      if ('aeiou'.includes(w[0]) && 'aeiou'.includes(w[w.length - 1])) count++
    }
    return count
  })
}

test('2559 seeded random inputs match the direct-scan oracle', () => {
  let seed = 2559
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(12) }, () => Array.from({ length: 1 + rnd(4) }, () => letters[rnd(26)]).join(''))
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      const l = rnd(words.length)
      return [l, l + rnd(words.length - l)]
    })
    assert.deepEqual(solve(words, queries), oracle(words, queries), JSON.stringify({ words, queries }))
  }
})
