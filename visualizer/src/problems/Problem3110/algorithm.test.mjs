import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3110 examples', () => {
  assert.equal(solve('hello'), 13)
  assert.equal(solve('zaz'), 50)
})

test('3110 equal neighbors add nothing', () => {
  assert.equal(solve('aa'), 0)
  assert.equal(solve('az'), 25)
})

test('3110 rejects uppercase letters and a single letter', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":"a"}'))
})

// Independent oracle: compare each neighboring pair with max minus min of the two codes.
function oracle(s) {
  const codes = [...s].map(c => c.charCodeAt(0))
  let total = 0
  for (let i = 1; i < codes.length; i++) total += Math.max(codes[i - 1], codes[i]) - Math.min(codes[i - 1], codes[i])
  return total
}

test('3110 random strings match a max-minus-min oracle', () => {
  let seed = 3110
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(29)
    let s = ''
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(26))
    assert.equal(solve(s), oracle(s), s)
  }
})
