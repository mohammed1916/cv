import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, p) => buildTrace({ s, p }).result

test('3407 worked examples', () => {
  assert.equal(solve('leetcode', 'ee*e'), true)
  assert.equal(solve('abcd', 'ab*'), true)
  assert.equal(solve('xzz', 'x*y'), false)
})

test('3407 the prefix and suffix may not share characters of s', () => {
  // "a" then "a" needs two separate a's in s.
  assert.equal(solve('aba', 'a*a'), true)
  assert.equal(solve('a', 'a*a'), false)
  assert.equal(solve('ab', '*'), true)
})

test('3407 rejects a pattern without exactly one star', () => {
  assert.throws(() => parseInput('{"s":"abc","p":"abc"}'))
  assert.throws(() => parseInput('{"s":"abc","p":"a*b*c"}'))
})

// Independent oracle: test every substring against prefix and suffix directly.
function oracle(s, p) {
  const [prefix, suffix] = p.split('*')
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j <= s.length; j++) {
      const t = s.slice(i, j)
      if (t.startsWith(prefix) && t.endsWith(suffix) && t.length >= prefix.length + suffix.length) return true
    }
  }
  return false
}

test('3407 random inputs match a substring-enumeration oracle', () => {
  let seed = 3407
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(1 + rnd(8))
    const p = `${word(rnd(3))}*${word(rnd(3))}`
    assert.equal(solve(s, p), oracle(s, p), `${s} ${p}`)
  }
})
