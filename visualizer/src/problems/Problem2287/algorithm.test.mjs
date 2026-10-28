import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2287 examples', () => {
  // s has three a's and the target needs two per copy, so one copy is the limit.
  assert.equal(solve({ s: 'ababcbarc', target: 'baca' }), 1)
  assert.equal(solve({ s: 'abbaccaddaeea', target: 'aaaaa' }), 1)
  assert.equal(solve({ s: 'abcba', target: 'abc' }), 1)
})

test('2287 a target letter missing from s gives zero copies', () => {
  assert.equal(solve({ s: 'aaa', target: 'ab' }), 0)
})

test('2287 rejects a non-letter and an empty target', () => {
  assert.throws(() => parseInput('{"s":"ab1","target":"a"}'))
  assert.throws(() => parseInput('{"s":"ab","target":""}'))
})

// Independent oracle: repeatedly take one copy of the target out of a bag of letters until it cannot.
function oracle({ s, target }) {
  let bag = [...s]
  let copies = 0
  for (;;) {
    const trial = [...bag]
    let ok = true
    for (const ch of target) {
      const at = trial.indexOf(ch)
      if (at < 0) { ok = false; break }
      trial.splice(at, 1)
    }
    if (!ok) return copies
    bag = trial
    copies++
  }
}

test('2287 random strings match a bag-removal oracle', () => {
  let seed = 2287
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcde'
  const word = len => Array.from({ length: len }, () => letters[rnd(letters.length)]).join('')
  for (let t = 0; t < 300; t++) {
    const input = { s: word(1 + rnd(16)), target: word(1 + rnd(3)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
