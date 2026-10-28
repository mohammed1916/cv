import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3210 official examples', () => {
  assert.equal(solve({ s: 'dart', k: 3 }), 'tdar')
  assert.equal(solve({ s: 'aaa', k: 1 }), 'aaa')
})

test('3210 a shift equal to the length returns the same string', () => {
  assert.equal(solve({ s: 'abc', k: 3 }), 'abc')
})

test('3210 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Abc","k":1}'))
})

// Independent oracle: move one position at a time k times for each index, instead of using modular arithmetic.
function oracle({ s, k }) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    let pos = i
    for (let step = 0; step < k; step++) pos = (pos + 1) % s.length
    out += s[pos]
  }
  return out
}

test('3210 random strings match a step-by-step oracle', () => {
  let seed = 3210
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(8)
    const input = { s: Array.from({ length }, () => 'abcxyz'[rnd(6)]).join(''), k: 1 + rnd(20) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
