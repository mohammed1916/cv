import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('1645 sample gives a percentage for every month of 2020', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.working_percentage), [100, 50, 50, 0, 25, 0, 0, 0, 25, 0, 0, 0])
  assert.equal(trace.result.length, 12)
})

test('1645 reports 0 when no driver was available', () => {
  const trace = run('{"Drivers":[{"driver_id":1,"join_date":"2021-01-04"}],"Rides":[{"ride_id":1,"user_id":2,"requested_at":"2020-03-04"}],"AcceptedRides":[{"ride_id":1,"driver_id":1,"ride_distance":5,"ride_duration":4}]}')
  checkFrames(trace)
  assert.ok(trace.result.every(row => row.working_percentage === 0))
})

test('1645 counts a driver once even with several accepted rides in a month', () => {
  const trace = run('{"Drivers":[{"driver_id":4,"join_date":"2020-01-02"},{"driver_id":5,"join_date":"2020-01-02"}],"Rides":[{"ride_id":1,"user_id":1,"requested_at":"2020-06-01"},{"ride_id":2,"user_id":1,"requested_at":"2020-06-09"}],"AcceptedRides":[{"ride_id":1,"driver_id":4,"ride_distance":1,"ride_duration":1},{"ride_id":2,"driver_id":4,"ride_distance":1,"ride_duration":1}]}')
  checkFrames(trace)
  assert.equal(trace.result[5].working_percentage, 50)
})

test('1645 rejects a table without its columns', () => {
  assert.throws(() => parseInput('{"Drivers":[{"driver_id":1}],"Rides":[{"ride_id":1,"user_id":1,"requested_at":"2020-01-01"}],"AcceptedRides":[]}'))
})
