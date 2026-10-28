import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2716 official examples', () => {
  assert.equal(solve('aaabc'), 3)
  assert.equal(solve('cbbd'), 3)
  assert.equal(solve('dddaaa'), 2)
})

test('2716 edge cases: a single letter and a string with no repeats', () => {
  assert.equal(solve('z'), 1)
  assert.equal(solve('abc'), 3)
})

test('2716 rejects uppercase letters and empty strings', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: perform the operation literally. Pick a position that has a repeat, delete the
// nearest equal character on its left and on its right, and repeat until no letter appears twice.
function oracle(s) {
  let chars = [...s]
  for (;;) {
    const i = chars.findIndex((c, k) => chars.indexOf(c) !== k || chars.lastIndexOf(c) !== k)
    if (i < 0) return chars.length
    const c = chars[i]
    const left = i > 0 ? chars.lastIndexOf(c, i - 1) : -1
    const right = chars.indexOf(c, i + 1)
    chars = chars.filter((_, k) => k !== left && k !== right)
  }
}

test('2716 random strings match a literal pair-removal oracle', () => {
  let seed = 2716
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
