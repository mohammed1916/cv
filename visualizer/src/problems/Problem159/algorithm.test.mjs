import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) {
    if (new Set(s.slice(i, j)).size <= 2) best = Math.max(best, j - i)
  }
  return best
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

test('159 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 8)
  assert.ok(python.includes('def longestTwoDistinct'))
  assert.equal(Object.keys(pythonLineMap).length, 8)
})

test('159 matches brute force on random strings', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 400; trial++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcd'[rnd(4)]
    const run = buildTrace(parseInput(s))
    assert.equal(run.result, brute(s), s)
    assert.equal(run.window.length, run.result)
    assert.equal(new Set(run.window).size <= 2, true)
    checkFrames(run)
  }
})

test('159 rejects invalid input', () => {
  for (const bad of ['', 'ABC', 'a1', 'x'.repeat(201)]) assert.throws(() => parseInput(bad))
})
