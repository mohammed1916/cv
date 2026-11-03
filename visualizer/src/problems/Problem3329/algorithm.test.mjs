import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3329 worked examples', () => {
  assert.equal(solve('abacbab', 2), 12)
  assert.equal(solve('aaabb', 3), 3)
})

test('3329 k of 1 counts every substring', () => {
  assert.equal(solve('xyz', 1), 6)
  assert.equal(solve('a', 1), 1)
})

test('3329 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"Ab","k":2}'))
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
})

function oracle(s, k) {
  let count = 0
  for (let i = 0; i < s.length; i += 1) {
    for (let j = i; j < s.length; j += 1) {
      const freq = new Map()
      for (const ch of s.slice(i, j + 1)) freq.set(ch, (freq.get(ch) || 0) + 1)
      if ([...freq.values()].some(v => v >= k)) count += 1
    }
  }
  return count
}

test('3329 random inputs match a substring-by-substring oracle', () => {
  let seed = 3329
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  for (let t = 0; t < 300; t += 1) {
    const s = Array.from({ length: 1 + rnd(12) }, () => letters[rnd(3)]).join('')
    const k = 1 + rnd(4)
    assert.equal(solve(s, k), oracle(s, k), JSON.stringify({ s, k }))
  }
})

test('3329 frames have valid line numbers and a final result', () => {
  const run = buildTrace(parseInput('{"s":"abacbab","k":2}'))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 13)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 13)
    assert.ok(frame.bad <= frame.total)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
