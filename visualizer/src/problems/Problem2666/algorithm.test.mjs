import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: the first call with any arguments runs the function; every later call returns undefined.
function oracle(calls) {
  const runs = calls.length > 0 ? 1 : 0
  const values = calls.map((args, i) => (i === 0 ? args.reduce((t, v) => t + v, 0) : null))
  return { runs, values }
}

test('2666 worked examples', () => {
  const trace = buildTrace({ calls: [[1, 2], [3], []] })
  assert.deepEqual(trace.result.map((r) => r.value), [3, null, null])
  assert.deepEqual(trace.result.map((r) => r.returned), [true, false, false])
})

test('2666 a call with no arguments still counts as the first call', () => {
  const trace = buildTrace({ calls: [[], [7]] })
  assert.equal(trace.result[0].returned, true)
  assert.equal(trace.result[0].value, 0)
  assert.equal(trace.result[1].returned, false)
})

test('2666 brute force agrees on small inputs', () => {
  const cases = [[[1]], [[1, 2], [2]], [[], [], [5, 5]], [[-3, 4], [0], [1], [2, 2, 2]]]
  for (const calls of cases) {
    const trace = buildTrace({ calls })
    const expected = oracle(calls)
    assert.equal(trace.result.filter((r) => r.returned).length, expected.runs)
    assert.deepEqual(trace.result.map((r) => (r.returned ? r.value : null)), expected.values)
  }
})

test('2666 rejects malformed calls', () => {
  assert.throws(() => parseInput('{"calls":[]}'))
  assert.throws(() => parseInput('{"calls":[[1.5]]}'))
  assert.throws(() => parseInput('{"calls":[[1,2,3,4,5]]}'))
})

test('2666 frames name real pseudocode and python lines', () => {
  const trace = buildTrace({ calls: [[1, 2], [3]] })
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines.length)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
