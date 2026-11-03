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

test('2687 sample keeps the latest end time per bike, newest first', () => {
  const trace = run('{"Bikes":[{"ride_id":1,"bike_number":7,"start_time":"2025-03-01 08:00:00","end_time":"2025-03-01 08:20:00"},{"ride_id":2,"bike_number":3,"start_time":"2025-03-01 09:00:00","end_time":"2025-03-01 10:15:00"},{"ride_id":3,"bike_number":7,"start_time":"2025-03-02 07:00:00","end_time":"2025-03-02 07:40:00"},{"ride_id":4,"bike_number":9,"start_time":"2025-02-28 12:00:00","end_time":"2025-02-28 12:30:00"},{"ride_id":5,"bike_number":3,"start_time":"2025-03-01 11:00:00","end_time":"2025-03-01 11:05:00"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { bike_number: 7, last_time: '2025-03-02 07:40:00' },
    { bike_number: 3, last_time: '2025-03-01 11:05:00' },
    { bike_number: 9, last_time: '2025-02-28 12:30:00' },
  ])
})

test('2687 equal last times are ordered by bike number', () => {
  const trace = run('{"Bikes":[{"ride_id":1,"bike_number":5,"start_time":"2025-01-01 09:00:00","end_time":"2025-01-01 10:00:00"},{"ride_id":2,"bike_number":2,"start_time":"2025-01-01 09:30:00","end_time":"2025-01-01 10:00:00"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { bike_number: 2, last_time: '2025-01-01 10:00:00' },
    { bike_number: 5, last_time: '2025-01-01 10:00:00' },
  ])
})

test('2687 rejects a ride that ends before it starts', () => {
  assert.throws(() => parseInput('{"Bikes":[{"ride_id":1,"bike_number":1,"start_time":"2025-01-01 10:00:00","end_time":"2025-01-01 09:00:00"}]}'))
})
