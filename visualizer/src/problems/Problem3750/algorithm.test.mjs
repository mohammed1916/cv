import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

test('3750 worked examples', () => {
  assert.equal(solve(7), 0)
  assert.equal(solve(10), 4)
})

// Brute force: every bit position that differs from its counterpart in the reversed string must flip once.
function brute(n) {
  const s = n.toString(2)
  const target = [...s].reverse().join('')
  let flips = 0
  for (let k = 0; k < s.length; k++) if (s[k] !== target[k]) flips++
  return flips
}

test('3750 matches a direct comparison for every n in range', () => {
  for (let n = 1; n <= 1023; n++) assert.equal(solve(n), brute(n), String(n))
})

test('3750 rejects non-positive input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('abc'))
})
