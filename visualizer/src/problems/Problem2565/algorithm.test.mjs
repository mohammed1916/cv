import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result

test('2565 worked examples', () => {
  assert.equal(solve('abacaba', 'bzaa'), 1)
  assert.equal(solve('cde', 'xyz'), 3)
  assert.equal(solve('ace', 'ae'), 0)
})

test('2565 edge cases', () => {
  assert.equal(solve('a', 'a'), 0)
  assert.equal(solve('a', 'b'), 1)
  assert.equal(solve('ab', 'ba'), 1)
  assert.equal(solve('abc', 'cba'), 2)
  assert.equal(solve('a', 'aa'), 1)
})

test('2565 rejects non-letters and empty strings', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"ab","t":"a1"}'))
})

test('2565 frames point at executable python lines', () => {
  const lines = python.split('\n').length
  const { frames } = buildTrace({ s: 'abacaba', t: 'bzaa' })
  for (const frame of frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= lines, JSON.stringify(frame))
  }
})

// Independent oracle: try every set of removed positions in t.
function oracle(s, t) {
  const isSub = u => {
    let k = 0
    for (const c of s) if (k < u.length && c === u[k]) k++
    return k === u.length
  }
  let best = Infinity
  for (let mask = 0; mask < 1 << t.length; mask++) {
    const kept = []
    let left = -1
    let right = -1
    for (let i = 0; i < t.length; i++) {
      if (mask & (1 << i)) {
        if (left < 0) left = i
        right = i
      } else {
        kept.push(t[i])
      }
    }
    if (!isSub(kept.join(''))) continue
    best = Math.min(best, left < 0 ? 0 : right - left + 1)
  }
  return best
}

test('2565 random strings match a removal-subset brute force', () => {
  let seed = 2565
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 400; t++) {
    const s = word(1 + rnd(7))
    const tt = word(1 + rnd(7))
    assert.equal(solve(s, tt), oracle(s, tt), JSON.stringify({ s, t: tt }))
  }
})
