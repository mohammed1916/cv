import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

test('2667 worked examples', () => {
  const trace = buildTrace(parseInput('{"calls":[[1,2],[],["x"]]}'))
  assert.deepEqual(trace.result, ['Hello World', 'Hello World', 'Hello World'])
})

test('2667 a call with no arguments returns the same string', () => {
  assert.deepEqual(buildTrace({ calls: [[]] }).result, ['Hello World'])
})

test('2667 brute force agrees: every call returns the literal string', () => {
  for (const calls of [[[1]], [[], []], [[1, 2, 3, 4], ['a']]]) {
    assert.deepEqual(buildTrace({ calls }).result, calls.map(() => 'Hello World'))
  }
})

test('2667 rejects malformed calls', () => {
  assert.throws(() => parseInput('{"calls":[]}'))
  assert.throws(() => parseInput('{"calls":[[1,2,3,4,5]]}'))
})

test('2667 frames name real pseudocode and python lines', () => {
  const trace = buildTrace({ calls: [[1], []] })
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
