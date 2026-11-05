import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
// Minimum deletions by brute force: try every kept subsequence, keep the longest fancy one.
const brute = s => {
  let best = ''
  for (let mask = 0; mask < 1 << s.length; mask++) {
    let t = ''
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) t += s[i]
    if (t.length > best.length && !/(.)\1\1/.test(t)) best = t
  }
  return best
}

test('1957 invented strings', () => {
  assert.equal(solve('aaaabbcc'), 'aabbcc')
  assert.equal(solve('xxxyzzzz'), 'xxyzz')
  assert.equal(solve('ab'), 'ab')
})

test('1957 keeps the longest fancy string on small inputs', () => {
  for (const s of ['aaaa', 'aabbaa', 'abbbbcc', 'zzzyzzz', 'aabbbaabb']) assert.equal(solve(s).length, brute(s).length, s)
})
