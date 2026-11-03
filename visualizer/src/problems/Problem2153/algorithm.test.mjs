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

test('2153 sample lets each bus take waiting passengers up to its capacity', () => {
  const trace = run('{"Buses":[{"bus_id":1,"arrival_time":2,"capacity":2},{"bus_id":2,"arrival_time":4,"capacity":1},{"bus_id":3,"arrival_time":6,"capacity":3}],"Passengers":[{"passenger_id":11,"arrival_time":1},{"passenger_id":12,"arrival_time":2},{"passenger_id":13,"arrival_time":3},{"passenger_id":14,"arrival_time":5},{"passenger_id":15,"arrival_time":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ bus_id: 1, passengers_cnt: 2 }, { bus_id: 2, passengers_cnt: 1 }, { bus_id: 3, passengers_cnt: 2 }])
})

test('2153 leftover passengers board later buses and simultaneous buses share the same arrivals', () => {
  const trace = run('{"Buses":[{"bus_id":10,"arrival_time":5,"capacity":1},{"bus_id":20,"arrival_time":6,"capacity":1}],"Passengers":[{"passenger_id":1,"arrival_time":1},{"passenger_id":2,"arrival_time":2},{"passenger_id":3,"arrival_time":9}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ bus_id: 10, passengers_cnt: 1 }, { bus_id: 20, passengers_cnt: 1 }])
  const tie = run('{"Buses":[{"bus_id":3,"arrival_time":4,"capacity":0},{"bus_id":1,"arrival_time":4,"capacity":2}],"Passengers":[{"passenger_id":1,"arrival_time":1},{"passenger_id":2,"arrival_time":4},{"passenger_id":3,"arrival_time":4}]}')
  checkFrames(tie)
  assert.deepEqual(tie.result, [{ bus_id: 1, passengers_cnt: 2 }, { bus_id: 3, passengers_cnt: 0 }])
})

test('2153 rejects a passenger without an arrival time', () => {
  assert.throws(() => parseInput('{"Buses":[{"bus_id":1,"arrival_time":2,"capacity":1}],"Passengers":[{"passenger_id":1}]}'))
})
