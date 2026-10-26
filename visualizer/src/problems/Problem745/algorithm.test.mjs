import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, queries) => buildTrace(parseInput(JSON.stringify({ words, queries }))).result
// Oracle: scan words from the largest index down with startsWith/endsWith.
function brute(words, [p, s]) {
  for (let i = words.length - 1; i >= 0; i--) if (words[i].startsWith(p) && words[i].endsWith(s)) return i
  return -1
}
test('official example', () => { assert.deepEqual(solve(['apple'], [['a', 'e'], ['b', '']]), [0, -1]) })
test('random vs brute force scan', () => {
  let seed = 17
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  const str = max => Array.from({ length: rnd(max + 1) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(8) }, () => 'ab'[rnd(2)] + str(5))
    const queries = Array.from({ length: 1 + rnd(10) }, () => [str(3), str(3)])
    assert.deepEqual(solve(words, queries), queries.map(q => brute(words, q)))
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"words": [], "queries": [["a","b"]]}'), /words/)
  assert.throws(() => parseInput('{"words": ["a"], "queries": [["A","b"]]}'), /queries/)
  assert.throws(() => parseInput('{"words": ["a"]}'), /Enter/)
})
