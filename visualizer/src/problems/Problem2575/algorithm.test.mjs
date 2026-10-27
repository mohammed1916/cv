import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, m) => buildTrace(parseInput(JSON.stringify({ word, m }))).result

test('2575 examples', () => {
  assert.deepEqual(solve('998244353', 3), [1, 1, 0, 0, 0, 1, 1, 0, 0])
  assert.deepEqual(solve('1010', 10), [0, 1, 0, 1])
})

test('2575 rejects bad input', () => {
  assert.throws(() => parseInput('{"word":"12a","m":3}'))
  assert.throws(() => parseInput('{"word":"12","m":0}'))
})

// Independent oracle: convert each prefix to a BigInt and test its divisibility directly.
function oracle(word, m) {
  return [...word].map((_, i) => (BigInt(word.slice(0, i + 1)) % BigInt(m) === 0n ? 1 : 0))
}

test('2575 random strings match BigInt prefix oracle', () => {
  let seed = 2575
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    let word = ''
    for (let c = 0; c < 1 + rnd(14); c++) word += String(rnd(10))
    const m = 1 + rnd(60)
    assert.deepEqual(solve(word, m), oracle(word, m), JSON.stringify({ word, m }))
  }
})
