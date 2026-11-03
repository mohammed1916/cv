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

test('3140 longest block of three seats is returned', () => {
  const trace = run('{"Cinema":[{"seat_id":1,"free":1},{"seat_id":2,"free":1},{"seat_id":3,"free":0},{"seat_id":4,"free":1},{"seat_id":5,"free":1},{"seat_id":6,"free":1},{"seat_id":7,"free":0},{"seat_id":8,"free":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ seat_id: 4 }, { seat_id: 5 }, { seat_id: 6 }])
})

test('3140 tied longest blocks are all returned', () => {
  const trace = run('{"Cinema":[{"seat_id":1,"free":1},{"seat_id":2,"free":1},{"seat_id":3,"free":0},{"seat_id":4,"free":1},{"seat_id":5,"free":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ seat_id: 1 }, { seat_id: 2 }, { seat_id: 4 }, { seat_id: 5 }])
})

test('3140 no free seats gives an empty result; bad rows are rejected', () => {
  const trace = run('{"Cinema":[{"seat_id":1,"free":0},{"seat_id":2,"free":0}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
  assert.throws(() => parseInput('{"Cinema":[{"seat_id":1,"free":2}]}'))
  assert.throws(() => parseInput('{"Cinema":[{"seat_id":1,"free":1},{"seat_id":1,"free":1}]}'))
})
