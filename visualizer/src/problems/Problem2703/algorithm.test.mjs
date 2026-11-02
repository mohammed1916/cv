import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

test('2703 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"args":[1,null,"x"]}')).result, 3)
  assert.equal(buildTrace(parseInput('{"args":[]}')).result, 0)
})

test('2703 explicit undefined (null here) still counts', () => {
  assert.equal(buildTrace({ args: [null, null] }).result, 2)
})

test('2703 brute force agrees on small inputs', () => {
  for (let n = 0; n <= 10; n++) {
    const args = Array.from({ length: n }, (_, i) => (i % 3 === 0 ? null : i))
    assert.equal(buildTrace({ args }).result, args.length)
  }
})

test('2703 rejects a non-list input', () => {
  assert.throws(() => parseInput('{"args":"abc"}'))
})

test('2703 frames name real pseudocode and python lines', () => {
  const trace = buildTrace({ args: [1, 2] })
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
