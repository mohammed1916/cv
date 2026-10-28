import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3271 official examples', () => {
  assert.equal(solve({ s: 'abcd', k: 2 }), 'bf')
  assert.equal(solve({ s: 'mxz', k: 3 }), 'i')
})

test('3271 the wrap-around letter', () => {
  // 25 + 25 = 50, and 50 mod 26 = 24, which is y.
  assert.equal(solve({ s: 'zz', k: 2 }), 'y')
})

test('3271 rejects a length that is not a multiple of k', () => {
  assert.throws(() => parseInput('{"s":"abc","k":2}'))
})

// Independent oracle: map each letter to its index with indexOf, sum the indices of each block, and look the result up in the alphabet.
function oracle({ s, k }) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  let out = ''
  for (let start = 0; start < s.length; start += k) {
    let total = 0
    for (let i = start; i < start + k; i++) total += alphabet.indexOf(s[i])
    out += alphabet[total % 26]
  }
  return out
}

test('3271 random blocks match an alphabet-lookup oracle', () => {
  let seed = 3271
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(5)
    const blocks = 1 + rnd(5)
    const input = { s: Array.from({ length: k * blocks }, () => 'abcdefxyz'[rnd(9)]).join(''), k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
