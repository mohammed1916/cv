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

const sample = '{"Rides":[{"ride_id":1,"driver_id":10,"passenger_id":20},{"ride_id":2,"driver_id":10,"passenger_id":30},{"ride_id":3,"driver_id":20,"passenger_id":10},{"ride_id":4,"driver_id":30,"passenger_id":20},{"ride_id":5,"driver_id":40,"passenger_id":10}]}'

test('2238 sample counts passenger rides for every driver', () => {
  const trace = run(sample)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { driver_id: 10, cnt: 2 },
    { driver_id: 20, cnt: 2 },
    { driver_id: 30, cnt: 1 },
    { driver_id: 40, cnt: 0 },
  ])
})

test('2238 a driver with no passenger rides is kept with zero', () => {
  const trace = run('{"Rides":[{"ride_id":1,"driver_id":5,"passenger_id":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ driver_id: 5, cnt: 0 }])
})

test('2238 rejects rides without a passenger_id', () => {
  assert.throws(() => parseInput('{"Rides":[{"ride_id":1,"driver_id":5}]}'))
})
