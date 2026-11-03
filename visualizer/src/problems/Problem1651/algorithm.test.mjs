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

test('1651 sample averages each three-month window', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.equal(trace.result.length, 10)
  assert.deepEqual(trace.result.map(row => row.average_ride_distance), [35.67, 22.33, 44.33, 26, 26, 0, 11, 11, 11, 0])
  assert.deepEqual(trace.result.map(row => row.average_ride_duration), [19.67, 13, 26.33, 16.33, 16.33, 0, 6, 6, 6, 0])
})

test('1651 excludes rides that were requested but not accepted', () => {
  const trace = run('{"Drivers":[{"driver_id":1,"join_date":"2020-01-01"}],"Rides":[{"ride_id":1,"user_id":2,"requested_at":"2020-01-05"},{"ride_id":2,"user_id":2,"requested_at":"2020-01-06"}],"AcceptedRides":[{"ride_id":1,"driver_id":1,"ride_distance":30,"ride_duration":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result[0], { month: 1, average_ride_distance: 10, average_ride_duration: 2 })
})

test('1651 rejects an accepted ride that is not in Rides', () => {
  assert.throws(() => parseInput('{"Drivers":[{"driver_id":1,"join_date":"2020-01-01"}],"Rides":[{"ride_id":1,"user_id":2,"requested_at":"2020-01-05"}],"AcceptedRides":[{"ride_id":9,"driver_id":1,"ride_distance":1,"ride_duration":1}]}'))
})
