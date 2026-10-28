import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3518 official examples', () => {
  assert.equal(solve('abba', 2), 'baab')
  assert.equal(solve('aa', 2), '')
  assert.equal(solve('bacab', 1), 'abcba')
})

test('3518 repeated letters count each palindrome once', () => {
  // "aaaa" has one distinct palindrome, so k = 2 is out of range.
  assert.equal(solve('aaaa', 1), 'aaaa')
  assert.equal(solve('aaaa', 2), '')
})

test('3518 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"abc","k":1}'))
  assert.throws(() => parseInput('{"s":"aa","k":0}'))
})

// Independent oracle: enumerate every permutation of s, keep the palindromes, sort, and index.
function oracle(s, k) {
  const out = new Set()
  const pick = (chars, built) => {
    if (chars.length === 0) { out.add(built); return }
    chars.forEach((ch, i) => pick(chars.filter((_, j) => j !== i), built + ch))
  }
  pick([...s], '')
  const palins = [...out].filter(p => p === [...p].reverse().join('')).sort()
  return palins[k - 1] ?? ''
}

test('3518 random palindromes match a permutation oracle', () => {
  let seed = 3518
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const half = Array.from({ length: 1 + rnd(3) }, () => 'abc'[rnd(3)]).join('')
    const odd = rnd(2) ? 'd' : ''
    const s = half + odd + [...half].reverse().join('')
    const k = 1 + rnd(8)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
