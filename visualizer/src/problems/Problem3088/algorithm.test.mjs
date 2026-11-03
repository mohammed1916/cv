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

test('3088 authored examples', () => {
  assert.equal(solve('aabb'), 'aabb')
  assert.equal(solve('bcaa'), 'aabc')
  assert.equal(solve('zzzz'), '-1')
})

test('3088 odd length has no anti-palindrome', () => {
  assert.equal(solve('cabac'), '-1')
  assert.equal(solve('a'), '-1')
})

test('3088 rejects non-letter input', () => {
  assert.throws(() => parseInput('ab1'))
  assert.throws(() => parseInput(''))
})

// Oracle: the lexicographically smallest arrangement of the multiset, found by trying all sorted permutations.
function oracle(s) {
  if (s.length % 2 === 1) return '-1'
  const letters = s.split('').sort()
  const seen = new Set()
  const perms = []
  const build = (cur, used) => {
    if (cur.length === letters.length) { perms.push(cur.join('')); return }
    for (let i = 0; i < letters.length; i++) {
      if (used[i]) continue
      if (i > 0 && letters[i] === letters[i - 1] && !used[i - 1]) continue
      used[i] = true
      build([...cur, letters[i]], used)
      used[i] = false
    }
  }
  build([], Array(letters.length).fill(false))
  for (const p of perms) {
    if (seen.has(p)) continue
    seen.add(p)
  }
  const n = s.length
  const ok = p => p.split('').every((ch, i) => ch !== p[n - 1 - i])
  const valid = [...seen].filter(ok).sort()
  return valid.length ? valid[0] : '-1'
}

test('3088 random strings match a permutation oracle', () => {
  let seed = 3088
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(7) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
    assertFrames(buildTrace(s))
  }
})
