import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3517 official examples', () => {
  assert.equal(solve('z'), 'z')
  assert.equal(solve('babab'), 'abbba')
  assert.equal(solve('daccad'), 'acddca')
})

test('3517 an even-length palindrome has no middle letter', () => {
  assert.equal(solve('abba'), 'abba')
})

test('3517 rejects a string that is not a palindrome or has bad letters', () => {
  assert.throws(() => parseInput('{"s":"abc"}'))
  assert.throws(() => parseInput('{"s":"AA"}'))
})

// Independent oracle: enumerate every distinct permutation, keep the palindromes, take the smallest.
function oracle(s) {
  const perms = new Set()
  const pick = (chars, built) => {
    if (chars.length === 0) { perms.add(built); return }
    chars.forEach((ch, i) => pick(chars.filter((_, k) => k !== i), built + ch))
  }
  pick([...s], '')
  return [...perms].filter(p => p === [...p].reverse().join('')).sort()[0]
}

test('3517 random palindromes match a permutation oracle', () => {
  let seed = 3517
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const half = Array.from({ length: 1 + rnd(3) }, () => 'abc'[rnd(3)]).join('')
    const odd = rnd(2) ? 'b' : ''
    const s = half + odd + [...half].reverse().join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
