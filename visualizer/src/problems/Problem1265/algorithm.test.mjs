import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

test('three nodes print 3, 2, 1', () => {
  const run = buildTrace(parseInput('[1,2,3]'))
  assert.deepEqual(run.result, [3, 2, 1])
  assertFrameInvariants(run)
})

test('a single node prints once', () => {
  assert.deepEqual(buildTrace(parseInput('[9]')).result, [9])
})

test('five nodes print every value exactly once in reverse', () => {
  const run = buildTrace(parseInput('[4,7,1,8,2]'))
  assert.deepEqual(run.result, [2, 8, 1, 7, 4])
  assertFrameInvariants(run)
})

test('the trace prints each node once and in reverse order for many lists', () => {
  for (let length = 1; length <= 12; length += 1) {
    const values = Array.from({ length }, (_, k) => (k * 37) % 101 - 50)
    const run = buildTrace(parseInput(JSON.stringify(values)))
    assert.deepEqual(run.result, values.slice().reverse(), JSON.stringify(values))
    assert.equal(run.result.length, values.length)
    assertFrameInvariants(run)
  }
})

test('parseInput rejects empty, long or non-integer lists', () => {
  assert.throws(() => parseInput('[]'), /1 to 12/)
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'), /1 to 12/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
})
