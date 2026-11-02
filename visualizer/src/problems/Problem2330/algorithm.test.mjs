import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result

test('2330 worked examples', () => {
  assert.equal(solve('abcdba'), true)
  assert.equal(solve('abcdef'), false)
  assert.equal(solve('a'), true)
  assert.equal(solve('abcba'), true)
  assert.equal(solve('abcdeba'), true)
})

test('2330 rejects invalid input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('AbC'))
  assert.throws(() => parseInput('a'.repeat(21)))
})

// Oracle: choose up to two positions to change; the unchanged mirror pairs must already agree.
function oracle(s) {
  const n = s.length
  const ok = changed => {
    for (let i = 0; i < n; i++) {
      const j = n - 1 - i
      if (i >= j) break
      if (changed.has(i) || changed.has(j)) continue
      if (s[i] !== s[j]) return false
    }
    return true
  }
  for (let a = -1; a < n; a++) {
    for (let b = a; b < n; b++) {
      const changed = new Set([a, b].filter(x => x >= 0))
      if (ok(changed)) return true
    }
  }
  return false
}

test('2330 random strings match a changed-position oracle', () => {
  let seed = 2330
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('2330 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('abcdef')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
