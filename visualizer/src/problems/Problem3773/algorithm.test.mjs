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

// Independent oracle: regex runs and a tally of lengths.
function oracle(s) {
  const runs = s.match(/(.)\1*/g) || []
  const tally = new Map()
  for (const r of runs) tally.set(r.length, (tally.get(r.length) || 0) + 1)
  return Math.max(0, ...tally.values())
}

test('3773 worked cases', () => {
  assert.equal(solve('aabbbaa'), 2)
  assert.equal(solve('abc'), 3)
  assert.equal(solve('aabbcc'), 3)
  assert.equal(solve('a'), 1)
  assert.equal(solve('aaaa'), 1)
  assert.equal(solve('abab'), 4)
})

test('3773 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ s: 'aabbbaa' }))
})

test('3773 parseInput rejects bad strings', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"AB"}'))
  assert.throws(() => parseInput('[]'))
})

test('3773 random strings match the regex oracle', () => {
  let seed = 3773
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    const s = Array.from({ length: len }, () => 'ab'[rnd(2)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
