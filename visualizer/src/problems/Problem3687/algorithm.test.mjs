import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(days) {
  return buildTrace(parseInput(JSON.stringify(days))).result
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

// Independent oracle: the three rules written as a lookup on the late-day count.
function oracle(days) {
  const fee = d => ({ 1: 1 }[d] ?? (d <= 5 ? 2 * d : 3 * d))
  return days.reduce((sum, d) => sum + fee(d), 0)
}

test('3687 presets follow the three charge rules', () => {
  assert.equal(solve([1, 4, 9]), 36)
  assert.equal(solve([5, 6, 2, 1]), 33)
  assert.equal(solve([12, 3, 1, 5]), 53)
})

test('3687 empty list and boundary counts', () => {
  assert.equal(solve([]), 0)
  assert.equal(solve([1]), 1)
  assert.equal(solve([2]), 4)
  assert.equal(solve([5]), 10)
  assert.equal(solve([6]), 18)
})

test('3687 random inputs match the oracle', () => {
  let seed = 3687
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const days = Array.from({ length: rnd(9) }, () => 1 + rnd(12))
    assert.equal(solve(days), oracle(days), JSON.stringify(days))
  }
})

test('3687 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('[1,4,9]')))
})

test('3687 rejects malformed input', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[2.5]'))
  assert.throws(() => parseInput('{"days":[1]}'))
})
