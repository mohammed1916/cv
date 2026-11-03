import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(s).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3104 authored examples', () => {
  assert.equal(solve('abcabc'), -1)
  assert.equal(solve('abcd'), 3)
  assert.equal(solve('aabbaaab'), -1)
})

test('3104 rejects non-letter or empty input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('ab1'))
})

// Oracle: test every proper substring for the all-occurrences-inside property.
function oracle(s) {
  const n = s.length
  let best = -1
  for (let l = 0; l < n; l++)
    for (let r = l; r < n; r++) {
      if (l === 0 && r === n - 1) continue
      const inside = new Set(s.slice(l, r + 1))
      let ok = true
      for (let i = 0; i < n && ok; i++) {
        if (inside.has(s[i]) && (i < l || i > r)) ok = false
      }
      if (ok) best = Math.max(best, r - l + 1)
    }
  return best
}

test('3104 random strings match a substring oracle', () => {
  let seed = 3104
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
    assertFrames(buildTrace(s))
  }
})
