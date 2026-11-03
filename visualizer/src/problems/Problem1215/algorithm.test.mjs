import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function solve(text) {
  return buildTrace(parseInput(text)).result
}

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: test every integer in the range directly.
function oracle(low, high) {
  const out = []
  for (let x = low; x <= high; x += 1) {
    const digits = String(x).split('').map(Number)
    if (digits.every((d, k) => k === 0 || Math.abs(d - digits[k - 1]) === 1)) out.push(x)
  }
  return out
}

test('the first example lists 0 through 9, then 10, 12 and 21', () => {
  assert.deepEqual(solve('{"low":0,"high":21}'), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 21])
  assertFrameInvariants(buildTrace(parseInput('{"low":0,"high":21}')))
})

test('the hundreds example keeps 101, 121 and 123', () => {
  assert.deepEqual(solve('{"low":100,"high":150}'), [101, 121, 123])
})

test('a single value in range is reported only when it is stepping', () => {
  assert.deepEqual(solve('{"low":11,"high":11}'), [])
  assert.deepEqual(solve('{"low":10,"high":10}'), [10])
  assert.deepEqual(solve('{"low":0,"high":0}'), [0])
})

test('parseInput rejects bad ranges', () => {
  assert.throws(() => parseInput('{"low":5,"high":4}'), /must not exceed/)
  assert.throws(() => parseInput('{"low":-1,"high":4}'), /nonnegative/)
  assert.throws(() => parseInput('{"low":1,"high":1001}'), /caps high at 1000/)
})

test('the trace agrees with the brute-force oracle on many ranges', () => {
  for (let low = 0; low <= 130; low += 7) {
    for (const span of [0, 3, 40, 120]) {
      const high = Math.min(low + span, 1000)
      const run = buildTrace({ low, high })
      assert.deepEqual(run.result, oracle(low, high), `${low}..${high}`)
      assertFrameInvariants(run)
    }
  }
})
