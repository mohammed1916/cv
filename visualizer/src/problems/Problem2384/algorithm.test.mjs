import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('2384 worked examples', () => {
  assert.equal(solve('444947137'), '7449447')
  assert.equal(solve('00009'), '9')
  assert.equal(solve('00'), '0')
})

test('2384 a leading zero is never allowed in the answer', () => {
  // Digits 0, 0, 1, 2 have no pair except zeros, so the best palindrome is the single digit 2.
  assert.equal(solve('0120'), '2')
  assert.equal(solve('000'), '0')
})

test('2384 rejects non-digit text', () => {
  assert.throws(() => parseInput('{"num":"12a"}'))
  assert.throws(() => parseInput('{"num":""}'))
})

// Independent oracle: try every non-empty subset of positions and every ordering of the chosen digits,
// keep the palindromes without a leading zero (or the single digit 0), and take the longest, then largest.
function oracle(num) {
  const n = num.length
  let best = null
  const better = (a, b) => b === null || a.length > b.length || (a.length === b.length && a > b)
  const permute = (chars, prefix, used, out) => {
    if (prefix.length === chars.length) { out.push(prefix); return }
    const seen = new Set()
    for (let i = 0; i < chars.length; i++) {
      if (used[i] || seen.has(chars[i])) continue
      seen.add(chars[i])
      used[i] = true
      permute(chars, prefix + chars[i], used, out)
      used[i] = false
    }
  }
  for (let mask = 1; mask < 1 << n; mask++) {
    const chars = [...num].filter((_, i) => mask & (1 << i))
    const out = []
    permute(chars, '', Array(chars.length).fill(false), out)
    for (const s of out) {
      if (s === s.split('').reverse().join('') && (s[0] !== '0' || s === '0') && better(s, best)) best = s
    }
  }
  return best
}

test('2384 short digit strings match an enumeration oracle', () => {
  let seed = 2384
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(6)
    const num = Array.from({ length: len }, () => String(rnd(4) === 0 ? 0 : rnd(10))).join('')
    assert.equal(solve(num), oracle(num), num)
  }
})
