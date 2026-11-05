import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
const isPal = t => t === [...t].reverse().join('')
// Every pair of disjoint odd-length palindromic substrings.
const brute = s => {
  const pals = []
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) if ((j - i) % 2 === 0 && isPal(s.slice(i, j + 1))) pals.push([i, j])
  let best = 0
  for (const [i, j] of pals) for (const [k, l] of pals) if (j < k) best = Math.max(best, (j - i + 1) * (l - k + 1))
  return best
}

test('1960 invented strings', () => {
  assert.equal(solve('abcbaxyzy'), 15)
  assert.equal(solve('aaaa'), 3)
  assert.equal(solve('ab'), 1)
})

test('1960 matches exhaustive search', () => {
  for (const s of ['abacaba', 'xyzyxab', 'aaabaaa', 'bananas', 'qwqwqwq', 'abcdcba']) assert.equal(solve(s), brute(s), s)
})
