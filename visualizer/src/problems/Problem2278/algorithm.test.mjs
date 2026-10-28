import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2278 official examples', () => {
  assert.equal(solve({ s: 'foobar', letter: 'o' }), 33)
  assert.equal(solve({ s: 'jjjj', letter: 'k' }), 0)
})

test('2278 edge cases: a single matching character is 100 percent', () => {
  assert.equal(solve({ s: 'a', letter: 'a' }), 100)
  assert.equal(solve({ s: 'lonely', letter: 'y' }), 16)
})

test('2278 rejects an uppercase letter and an empty string', () => {
  assert.throws(() => parseInput('{"s":"abc","letter":"A"}'))
  assert.throws(() => parseInput('{"s":"","letter":"a"}'))
})

// Independent oracle: count matches with a global regular expression, then floor the percentage.
function oracle({ s, letter }) {
  const matches = s.match(new RegExp(letter, 'g')) || []
  return Math.floor((matches.length / s.length) * 100)
}

test('2278 random inputs match a regular-expression oracle', () => {
  let seed = 2278
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(20) }, () => 'abc'[rnd(3)]).join('')
    const input = { s, letter: 'abc'[rnd(3)] }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
