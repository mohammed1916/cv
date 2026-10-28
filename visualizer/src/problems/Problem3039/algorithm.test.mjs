import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3039 official examples', () => {
  assert.equal(solve('aabcbbca'), 'ba')
  assert.equal(solve('abcd'), 'abcd')
})

test('3039 only the letters with the largest count survive', () => {
  assert.equal(solve('aaa'), 'a')
  assert.equal(solve('aab'), 'a')
})

test('3039 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"aB"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('[1]'))
})

// Independent oracle: literally run the rounds. Each round removes the first remaining
// copy of every letter from a to z; the answer is the string at the start of the last round.
function oracle(s) {
  let cur = s.split('')
  let before = s
  while (cur.length > 0) {
    before = cur.join('')
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const idx = cur.indexOf(letter)
      if (idx >= 0) cur.splice(idx, 1)
    }
  }
  return before
}

test('3039 random strings match a round-by-round simulation', () => {
  let seed = 3039
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(16)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcd'[rnd(4)]
    assert.equal(solve(s), oracle(s), s)
  }
})
