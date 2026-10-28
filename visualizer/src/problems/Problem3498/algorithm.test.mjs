import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3498 official examples', () => {
  assert.equal(solve('abc'), 148)
  assert.equal(solve('zaza'), 160)
})

test('3498 a single letter scores its rank', () => {
  assert.equal(solve('a'), 26)
  assert.equal(solve('z'), 1)
})

test('3498 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

// Independent oracle: look the letter up in a reversed alphabet string and weight it by its position.
function oracle(s) {
  const reversed = 'zyxwvutsrqponmlkjihgfedcba'
  return [...s].reduce((sum, ch, i) => sum + (reversed.indexOf(ch) + 1) * (i + 1), 0)
}

test('3498 random strings match a reversed-alphabet oracle', () => {
  let seed = 3498
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(50)
    let s = ''
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(26))
    assert.equal(solve(s), oracle(s), s)
  }
})
