import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3950 official examples', () => {
  assert.equal(solve(6), true)
  assert.equal(solve(5), false)
})

test('3950 small cases: 3 is one pair, 7 has two, 0 has none', () => {
  assert.equal(solve(3), true)
  assert.equal(solve(7), false)
  assert.equal(solve(0), false)
})

test('3950 rejects a negative n', () => {
  assert.throws(() => parseInput('{"n":-1}'))
})

// Independent oracle: count overlapping "11" pairs in the binary string with a lookahead regex.
function oracle(n) {
  const matches = n.toString(2).match(/(?=11)/g) ?? []
  return matches.length === 1
}

test('3950 random values match a regular-expression oracle', () => {
  let seed = 3950
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(100001)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
