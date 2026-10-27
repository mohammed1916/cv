import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1745 official example', () => {
  assert.equal(solve('abcbdd'), true)
})

test('1745 a hand-checked split: a | a | aa', () => {
  assert.equal(solve('aaaa'), true)
})

test('1745 single characters are palindromes, so abc splits into three', () => {
  assert.equal(solve('abc'), true)
})

test('1745 a string that cannot be split into three palindromes', () => {
  assert.equal(solve('leetcode'), false)
})

test('1745 rejects a string shorter than three characters', () => {
  assert.throws(() => parseInput('{"s":"ab"}'))
})

// Independent oracle: try every way to cut the string into three pieces and test each piece by reversing it.
function oracle(s) {
  const isPal = t => t === [...t].reverse().join('')
  const n = s.length
  for (let a = 1; a < n - 1; a++) {
    for (let b = a + 1; b < n; b++) {
      if (isPal(s.slice(0, a)) && isPal(s.slice(a, b)) && isPal(s.slice(b))) return true
    }
  }
  return false
}

test('1745 random strings match a reverse-and-compare oracle', () => {
  let seed = 1745
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 3 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
