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

test('1972 sample keeps users 2, 3, 7 and 8 and drops user 1 and the 4-5-6 triangle', () => {
  // User 1 on 2020-08-21: first call with 2, last call with 3, so no match that day.
  const trace = run('{"Calls":[{"caller_id":1,"recipient_id":2,"call_time":"2020-08-21 09:00:00"},{"caller_id":2,"recipient_id":1,"call_time":"2020-08-21 12:30:00"},{"caller_id":1,"recipient_id":3,"call_time":"2020-08-21 15:00:00"},{"caller_id":4,"recipient_id":5,"call_time":"2020-08-22 10:00:00"},{"caller_id":5,"recipient_id":6,"call_time":"2020-08-22 11:00:00"},{"caller_id":4,"recipient_id":6,"call_time":"2020-08-22 18:00:00"},{"caller_id":7,"recipient_id":8,"call_time":"2020-08-23 08:00:00"},{"caller_id":8,"recipient_id":7,"call_time":"2020-08-23 20:00:00"},{"caller_id":7,"recipient_id":8,"call_time":"2020-08-24 09:00:00"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 2 }, { user_id: 3 }, { user_id: 7 }, { user_id: 8 }])
})

test('1972 counts a user once even when several days qualify', () => {
  const trace = run('{"Calls":[{"caller_id":1,"recipient_id":2,"call_time":"2021-01-05 09:00:00"},{"caller_id":2,"recipient_id":3,"call_time":"2021-01-05 10:00:00"},{"caller_id":1,"recipient_id":2,"call_time":"2021-01-05 11:00:00"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }])
})

test('1972 rejects a row without call_time', () => {
  assert.throws(() => parseInput('{"Calls":[{"caller_id":1,"recipient_id":2}]}'))
})
