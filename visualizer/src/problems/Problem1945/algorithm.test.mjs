import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('1945 invented strings', () => {
  assert.equal(solve('abc', 1), 6)
  assert.equal(solve('hello', 2), 7)
  assert.equal(solve('a', 6), 1)
})

test('1945 matches a direct digit-by-digit reference', () => {
  const ref = (s, k) => {
    let t = [...s].map(c => String(c.charCodeAt(0) - 96)).join('')
    let v = t.split('').reduce((a, d) => a + Number(d), 0)
    for (let i = 1; i < k; i++) v = String(v).split('').reduce((a, d) => a + Number(d), 0)
    return v
  }
  for (const [s, k] of [['zbax', 2], ['leetcode', 3], ['abcxyz', 4], ['zzzzzzzzzzzz', 6]]) assert.equal(solve(s, k), ref(s, k), `${s} ${k}`)
})
