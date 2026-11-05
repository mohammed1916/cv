import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = w => buildTrace(parseInput(w)).result
const wonderful = s => {
  const odd = new Set()
  for (const ch of s) { if (odd.has(ch)) odd.delete(ch); else odd.add(ch) }
  return odd.size <= 1
}
const brute = w => {
  let count = 0
  for (let i = 0; i < w.length; i++) for (let j = i; j < w.length; j++) if (wonderful(w.slice(i, j + 1))) count++
  return count
}

test('1915 invented words', () => {
  assert.equal(solve('ab'), 2)
  assert.equal(solve('aaa'), 6)
  assert.equal(solve('abab'), 7)
})

test('1915 matches exhaustive substring check', () => {
  for (const w of ['abcdefghij', 'aabbccdd', 'abaabbab', 'jihgfedcba', 'aabbccddeeff'.slice(0, 12)]) assert.equal(solve(w), brute(w), w)
})
