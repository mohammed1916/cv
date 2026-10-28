import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3083 official examples', () => {
  assert.equal(solve('leetcode'), true)
  assert.equal(solve('abcba'), true)
  assert.equal(solve('abcd'), false)
})

test('3083 edge cases: one letter, and a palindromic pair', () => {
  assert.equal(solve('a'), false)
  assert.equal(solve('aa'), true)
})

test('3083 rejects uppercase letters and empty strings', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: reverse the whole string, then look for any two-letter substring of s in it.
function oracle(s) {
  const reversedWhole = [...s].reverse().join('')
  for (let i = 0; i + 2 <= s.length; i++) {
    if (reversedWhole.includes(s.slice(i, i + 2))) return true
  }
  return false
}

test('3083 random strings match a reversed-string oracle', () => {
  let seed = 3083
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
