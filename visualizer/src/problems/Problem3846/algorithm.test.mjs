import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: find each key by its string index in the three rows.
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
function locate(ch) {
  for (let r = 0; r < ROWS.length; r++) {
    const c = ROWS[r].indexOf(ch)
    if (c >= 0) return [r, c]
  }
  throw new Error(ch)
}
function oracle(s) {
  let [r, c] = locate('a')
  let total = 0
  for (const ch of s) {
    const [nr, nc] = locate(ch)
    total += Math.abs(nr - r) + Math.abs(nc - c)
    ;[r, c] = [nr, nc]
  }
  return total
}

test('3846 worked cases', () => {
  assert.equal(solve('a'), 0)
  assert.equal(solve('ab'), 5)
  assert.equal(solve('qa'), 2)
})

test('3846 repeated letters cost nothing after the first visit', () => {
  assert.equal(solve('aaaa'), 0)
  assert.equal(solve('zzz'), 1)
})

test('3846 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ s: 'leetcode' }))
})

test('3846 parseInput rejects non-letters', () => {
  assert.throws(() => parseInput('{"s":"A"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

test('3846 random strings match the string-index oracle', () => {
  let seed = 3846
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(30)
    const s = Array.from({ length: len }, () => letters[rnd(26)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
