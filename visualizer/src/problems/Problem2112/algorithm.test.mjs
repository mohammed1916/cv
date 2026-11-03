import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sampleText } from './algorithm.js'

const ids = phases.map(phase => phase.id)

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

test('2112 sample returns the airport with the greatest combined traffic', () => {
  const trace = buildTrace(parseInput(sampleText))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ airport_id: 1 }])
})

test('2112 every airport tied for the greatest total is returned', () => {
  const trace = buildTrace(parseInput('{"Flights":[{"departure_airport":5,"arrival_airport":6,"flights_count":3},{"departure_airport":6,"arrival_airport":5,"flights_count":3}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ airport_id: 5 }, { airport_id: 6 }])
})

test('2112 rejects a flight row without a departure airport', () => {
  assert.throws(() => parseInput('{"Flights":[{"arrival_airport":6,"flights_count":3}]}'))
})
