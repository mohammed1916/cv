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

test('2142 sample boards passengers on the first bus at or after arrival', () => {
  const trace = run('{"Buses":[{"bus_id":1,"arrival_time":2},{"bus_id":2,"arrival_time":4},{"bus_id":3,"arrival_time":7}],"Passengers":[{"passenger_id":11,"arrival_time":1},{"passenger_id":12,"arrival_time":2},{"passenger_id":13,"arrival_time":3},{"passenger_id":14,"arrival_time":4},{"passenger_id":15,"arrival_time":8}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ bus_id: 1, passengers_cnt: 2 }, { bus_id: 2, passengers_cnt: 2 }, { bus_id: 3, passengers_cnt: 0 }])
})

test('2142 orders the result by bus_id even when buses are given out of time order', () => {
  const trace = run('{"Buses":[{"bus_id":5,"arrival_time":9},{"bus_id":6,"arrival_time":3}],"Passengers":[{"passenger_id":1,"arrival_time":3},{"passenger_id":2,"arrival_time":4},{"passenger_id":3,"arrival_time":9}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ bus_id: 5, passengers_cnt: 2 }, { bus_id: 6, passengers_cnt: 1 }])
})

test('2142 rejects two buses with the same arrival time', () => {
  assert.throws(() => parseInput('{"Buses":[{"bus_id":1,"arrival_time":5},{"bus_id":2,"arrival_time":5}],"Passengers":[{"passenger_id":1,"arrival_time":1}]}'))
})
