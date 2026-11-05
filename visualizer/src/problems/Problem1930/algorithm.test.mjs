import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
const brute = s => {
  const found = new Set()
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) for (let k = j + 1; k < s.length; k++) {
    if (s[i] === s[k]) found.add(s[i] + s[j] + s[k])
  }
  return found.size
}

test('1930 invented strings', () => {
  assert.equal(solve('abcaba'), 5)
  assert.equal(solve('aabca'), 3)
  assert.equal(solve('abc'), 0)
})

test('1930 matches subsequence enumeration', () => {
  for (const s of ['aaaa', 'abcbaxyzx', 'mississippi', 'zyxwzyxw', 'qwertyqwe']) assert.equal(solve(s), brute(s), s)
})
