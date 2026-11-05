import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
// Smallest number of swaps: compare the string against every balanced arrangement of the same counts.
const balanced = t => { let d = 0; for (const c of t) { d += c === '[' ? 1 : -1; if (d < 0) return false } return d === 0 }
const brute = s => {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const t = [...Array(n)].map((_, i) => (mask & (1 << i) ? '[' : ']')).join('')
    if (t.split('[').length - 1 !== s.split('[').length - 1 || !balanced(t)) continue
    let mismatch = 0
    for (let i = 0; i < n; i++) if (s[i] !== t[i] && s[i] === '[') mismatch++
    best = Math.min(best, mismatch)
  }
  return best
}

test('1963 invented strings', () => {
  assert.equal(solve('][]['), 1)
  assert.equal(solve(']]][[['), 2)
  assert.equal(solve('[]'), 0)
})

test('1963 matches exhaustive search', () => {
  for (const s of ['][][', ']][[', '][[]][', ']]][[[', '[]][][', ']][[]][[']) assert.equal(solve(s), brute(s), s)
})
