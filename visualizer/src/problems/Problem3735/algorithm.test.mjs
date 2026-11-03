import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(s) {
  return buildTrace(parseInput(JSON.stringify(s))).result
}

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PY_COUNT)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: enumerate every substring; keep those touching the start or the end, reversed in place.
function oracle(s) {
  const n = s.length
  let best = s
  for (let i = 0; i < n; i += 1) {
    for (let j = i; j < n; j += 1) {
      if (i !== 0 && j !== n - 1) continue
      const reversed = s.slice(i, j + 1).split('').reverse().join('')
      const candidate = s.slice(0, i) + reversed + s.slice(j + 1)
      if (candidate < best) best = candidate
    }
  }
  return best
}

test('3735 presets', () => {
  assert.equal(solve('dcba'), oracle('dcba'))
  assert.equal(solve('bacd'), 'abcd')
  assert.equal(solve('zyxw'), 'wxyz')
})

test('3735 length one is unchanged', () => {
  assert.equal(solve('q'), 'q')
})

test('3735 random inputs match the substring oracle', () => {
  let seed = 3735
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('3735 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('"dcba"')))
})

test('3735 rejects malformed input', () => {
  assert.throws(() => parseInput('"AB"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('["a"]'))
})
