import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const EXAMPLE_WEIGHTS = [5, 3, 12, 14, 1, 2, 3, 2, 10, 6, 6, 9, 7, 8, 7, 10, 8, 9, 6, 9, 9, 8, 3, 7, 7, 2]
const solve = (words, weights) => buildTrace({ words, weights }).result

test('3838 worked example', () => {
  assert.equal(solve(['abcd', 'def', 'xyz'], EXAMPLE_WEIGHTS), 'rij')
})

test('3838 edge cases', () => {
  const ones = Array(26).fill(1)
  assert.equal(solve(['a'], ones), 'y')
  assert.equal(solve(['abcdefghijklmnopqrstuvwxyz'], ones), String.fromCharCode(122 - (26 % 26)))
  const heavyZ = Array(26).fill(1); heavyZ[25] = 100
  assert.equal(solve(['z'], heavyZ), String.fromCharCode(122 - (100 % 26)))
})

test('3838 rejects malformed input', () => {
  assert.throws(() => parseInput('{"words":["ab"],"weights":[1]}'))
  assert.throws(() => parseInput('{"words":["aB"],"weights":' + JSON.stringify(Array(26).fill(1)) + '}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: letter index as a char-code offset from 'a', reduced by hand.
function oracle(words, weights) {
  let out = ''
  for (const word of words) {
    let sum = 0
    for (const ch of word) sum += weights[ch.charCodeAt(0) - 'a'.charCodeAt(0)]
    out += String.fromCharCode('z'.charCodeAt(0) - (sum % 26))
  }
  return out
}

test('3838 random inputs match a brute-force oracle', () => {
  let seed = 3838
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const weights = Array.from({ length: 26 }, () => 1 + rnd(100))
    const words = Array.from({ length: 1 + rnd(5) }, () => Array.from({ length: 1 + rnd(8) }, () => letters[rnd(26)]).join(''))
    assert.equal(solve(words, weights), oracle(words, weights), JSON.stringify({ words, weights }))
  }
})
