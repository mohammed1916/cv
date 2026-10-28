import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('4030 official examples', () => {
  assert.equal(solve('ff'), true)
  assert.equal(solve('leet'), false)
})

test('4030 a single letter is palindromic only if its eight bits are', () => {
  // 'z' is 01111010, which is not a palindrome; 'f' is 01100110, which is.
  assert.equal(solve('z'), false)
  assert.equal(solve('f'), true)
})

test('4030 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ff"}'))
})

// Independent oracle: write each code bit by bit with shifts, then compare the bits from both ends.
function oracle(s) {
  const bits = []
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    for (let k = 7; k >= 0; k--) bits.push((code >> k) & 1)
  }
  for (let i = 0, j = bits.length - 1; i < j; i++, j--) {
    if (bits[i] !== bits[j]) return false
  }
  return true
}

test('4030 random strings match a bit-level oracle', () => {
  let seed = 4030
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abfl'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
