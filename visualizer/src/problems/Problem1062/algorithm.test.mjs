import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result
const pyLines = python.split('\n').length

test('1062 worked examples', () => {
  assert.equal(solve('abcd'), 0)
  assert.equal(solve('abbaba'), 2)
  assert.equal(solve('aabcaabdaab'), 3)
})

test('1062 overlapping occurrences count', () => {
  assert.equal(solve('aaa'), 2)
  assert.equal(solve('aaaa'), 3)
  assert.equal(solve('a'), 0)
  assert.equal(solve('aa'), 1)
})

test('1062 frames carry valid pseudocode and python lines', () => {
  for (const frame of buildTrace({ s: 'abbaba' }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1062 rejects empty and overlong strings', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput(`{"s":"${'a'.repeat(21)}"}`))
})

// Oracle: try lengths from longest to shortest and look for a substring whose start positions repeat.
function oracle(s) {
  for (let len = s.length - 1; len >= 1; len--) {
    const seen = new Map()
    for (let i = 0; i + len <= s.length; i++) {
      const piece = s.slice(i, i + len)
      seen.set(piece, (seen.get(piece) || 0) + 1)
      if (seen.get(piece) >= 2) return len
    }
  }
  return 0
}

test('1062 random strings match a substring-count oracle', () => {
  let seed = 1062
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rnd(14) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
