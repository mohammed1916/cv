import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('2663 official examples', () => {
  assert.equal(solve('abcz', 26), 'abda')
  assert.equal(solve('dc', 4), '')
})

test('2663 edge cases: a single letter and the largest string', () => {
  assert.equal(solve('a', 4), 'b')
  assert.equal(solve('dcba', 4), 'dcbd')
})

test('2663 rejects a palindrome, a letter beyond k, and a small k', () => {
  assert.throws(() => parseInput('{"s":"aa","k":4}'))
  assert.throws(() => parseInput('{"s":"ez","k":4}'))
  assert.throws(() => parseInput('{"s":"ab","k":3}'))
})

// Independent oracle: count upward in base k over strings of the same length and return the first
// string that has no palindrome of length 2 or more. Palindromes are checked directly on every substring.
function hasPalindrome(t) {
  for (let i = 0; i < t.length; i++) {
    for (let j = i + 1; j < t.length; j++) {
      const sub = t.slice(i, j + 1)
      if (sub === [...sub].reverse().join('')) return true
    }
  }
  return false
}

function oracle(s, k) {
  const n = s.length
  let value = 0
  for (const ch of s) value = value * k + (ch.charCodeAt(0) - 97)
  for (let v = value + 1; v < k ** n; v++) {
    let x = v
    const digits = []
    for (let p = 0; p < n; p++) { digits.unshift(x % k); x = Math.floor(x / k) }
    const cand = digits.map(d => String.fromCharCode(97 + d)).join('')
    if (!hasPalindrome(cand)) return cand
  }
  return ''
}

test('2663 random beautiful strings match a base-k count-up search', () => {
  let seed = 2663
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const k = 4 + rnd(2)
    const len = 1 + rnd(5)
    const a = []
    for (let i = 0; i < len; i++) {
      let c
      do { c = rnd(k) } while ((i >= 1 && c === a[i - 1]) || (i >= 2 && c === a[i - 2]))
      a.push(c)
    }
    const s = a.map(v => String.fromCharCode(97 + v)).join('')
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
