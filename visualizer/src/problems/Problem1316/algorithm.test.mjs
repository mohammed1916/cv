import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('1316 examples', () => {
  assert.equal(solve('abcabcabc'), 3)
  assert.equal(solve('leetcodeleetcode'), 2)
  assert.equal(solve('aaaa'), 2)
  assert.equal(solve('a'), 0)
})

test('1316 rejects non-letters', () => {
  assert.throws(() => parseInput('"a1"'))
})

// Independent oracle: a substring t is an echo here exactly when t + t appears somewhere in the text.
function oracle(s) {
  const echoes = new Set()
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const t = s.slice(i, j)
      if (s.includes(t + t)) echoes.add(t)
    }
  }
  return echoes.size
}

test('1316 random strings match a substring-search oracle', () => {
  let seed = 1316
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += String.fromCharCode(97 + rnd(3))
    assert.equal(solve(s), oracle(s), s)
  }
})
