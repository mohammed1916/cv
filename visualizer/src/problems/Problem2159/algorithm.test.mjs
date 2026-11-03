import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('2159 sample sorts the first column up and the second down, then pairs by position', () => {
  const trace = run('{"Data":[{"first_col":4,"second_col":1},{"first_col":2,"second_col":8},{"first_col":9,"second_col":3},{"first_col":2,"second_col":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { first_col: 2, second_col: 8 }, { first_col: 2, second_col: 6 },
    { first_col: 4, second_col: 3 }, { first_col: 9, second_col: 1 },
  ])
})

test('2159 keeps repeated second values in descending order', () => {
  const trace = run('{"Data":[{"first_col":3,"second_col":3},{"first_col":1,"second_col":3},{"first_col":2,"second_col":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ first_col: 1, second_col: 3 }, { first_col: 2, second_col: 3 }, { first_col: 3, second_col: 1 }])
})

test('2159 rejects a row without second_col', () => {
  assert.throws(() => parseInput('{"Data":[{"first_col":1}]}'))
})
