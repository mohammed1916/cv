import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, mirror } from './algorithm.js'

// Independent oracle: sum the gap over the fixed set of 18 mirror pairs (a-z, b-y, ..., m-n, 0-9, 1-8, 2-7, 3-6, 4-5).
const PAIRS = []
for (let i = 0; i < 13; i++) PAIRS.push([String.fromCharCode(97 + i), String.fromCharCode(122 - i)])
for (const [a, b] of [[0, 9], [1, 8], [2, 7], [3, 6], [4, 5]]) PAIRS.push([String(a), String(b)])
function oracle(s) {
  const count = c => s.split(c).length - 1
  return PAIRS.reduce((total, [c, m]) => total + Math.abs(count(c) - count(m)), 0)
}

test('3889 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"s":"ab1z9"}')).result, 3)
  assert.equal(buildTrace(parseInput('{"s":"4m7n"}')).result, 2)
  assert.equal(buildTrace(parseInput('{"s":"byby"}')).result, 0)
})

test('3889 mirror is an involution on letters and digits', () => {
  for (const c of 'abcdefghijklmnopqrstuvwxyz0123456789') assert.equal(mirror(mirror(c)), c)
  assert.equal(mirror('a'), 'z')
  assert.equal(mirror('0'), '9')
})

test('3889 matches the pair oracle on random strings', () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let trial = 0; trial < 300; trial++) {
    let s = ''
    const len = 1 + (trial % 20)
    for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
    assert.equal(buildTrace({ s }).result, oracle(s), s)
  }
})
