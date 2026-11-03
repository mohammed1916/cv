import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result

test('1794 counts the pairs at the smallest gap', () => {
  assert.equal(solve('abcd', 'bcde'), 3)
  assert.equal(solve('ab', 'ba'), 2)
  assert.equal(solve('xyz', 'abc'), 0)
})

test('1794 a shared position gives gap zero and a single pair', () => {
  assert.equal(solve('ab', 'ab'), 2)
  assert.equal(solve('a', 'a'), 1)
})

test('1794 rejects an empty string', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
})

test('1794 frames reference real pseudocode and python lines', () => {
  const run = buildTrace({ s: 'ab', t: 'ba' })
  const pyCount = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
  }
})

// Oracle: consider every pair of starts and every substring length, as the statement describes.
function oracle(s, t) {
  let best = null
  const pairs = []
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < t.length; j++) {
      let ok = false
      for (let len = 1; i + len <= s.length && j + len <= t.length && !ok; len++) {
        ok = s.slice(i, i + len) === t.slice(j, j + len)
      }
      if (ok) pairs.push(Math.abs(i - j))
    }
  }
  if (!pairs.length) return 0
  best = Math.min(...pairs)
  return pairs.filter(g => g === best).length
}

test('1794 random inputs match a substring oracle', () => {
  let seed = 1794
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(1 + rnd(7))
    const tt = word(1 + rnd(7))
    assert.equal(solve(s, tt), oracle(s, tt), JSON.stringify({ s, t: tt }))
  }
})
