import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: the longest match of one character followed by repeats of itself.
const oracle = s => Math.max(1, ...(s.match(/(.)\1*/g) || []).map(run => run.length))
const solve = text => buildTrace(parseInput(text)).result

test('sample strings give 3, 4 and 1', () => {
  assert.equal(solve('mooo'), 3)
  assert.equal(solve('aabbbbcc'), 4)
  assert.equal(solve('abcd'), 1)
})

test('every string over a and b up to length 10 matches the oracle', () => {
  for (let len = 1; len <= 10; len++) {
    for (let mask = 0; mask < 2 ** len; mask++) {
      let s = ''
      for (let k = 0; k < len; k++) s += (mask >> k) & 1 ? 'a' : 'b'
      assert.equal(solve(s), oracle(s), s)
    }
  }
})

test('frames point at real code and Python lines and end with the result', () => {
  const codeLines = code.length
  const pyLines = python.split('\n').length
  const run = buildTrace(parseInput('aaabbc'))
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.result, 3)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput(''), /1 to 200/)
  assert.throws(() => parseInput('ABC'), /lowercase/)
  assert.throws(() => parseInput('a b'), /lowercase/)
})
