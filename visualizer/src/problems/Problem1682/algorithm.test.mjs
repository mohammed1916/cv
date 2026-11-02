import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(s).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1682 worked examples', () => {
  assert.equal(solve('abba'), 4)
  assert.equal(solve('aa'), 2)
  assert.equal(solve('ab'), 0)
  assert.equal(solve('abcba'), 4)
  assert.equal(solve('aabb'), 2)
})

test('1682 rejects strings outside the visualization cap or alphabet', () => {
  assert.throws(() => parseInput('ABBA'))
  assert.throws(() => parseInput('abcdefghi'))
})

test('1682 frames point at real pseudocode and python lines', () => {
  const run = buildTrace('abba')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: try every subsequence (n up to 10) and check the rule directly.
function oracle(s) {
  const n = s.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let t = ''
    for (let k = 0; k < n; k++) if (mask & (1 << k)) t += s[k]
    if (t.length % 2 !== 0) continue
    if (t !== [...t].reverse().join('')) continue
    const mid = t.length / 2 - 1
    let ok = true
    for (let k = 0; k + 1 < t.length && ok; k++) if (t[k] === t[k + 1] && k !== mid) ok = false
    if (ok && t.length > best) best = t.length
  }
  return best
}

test('1682 random strings match a subsequence brute-force oracle', () => {
  let seed = 1682
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const len = 1 + rnd(9)
    let s = ''
    for (let k = 0; k < len; k++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
