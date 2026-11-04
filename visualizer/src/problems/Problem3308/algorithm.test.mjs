import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Drivers: [
    { driver_id: 11, name: 'Dana', accidents: 2 },
    { driver_id: 12, name: 'Eli', accidents: 0 },
    { driver_id: 13, name: 'Fay', accidents: 1 },
  ],
  Vehicles: [
    { vehicle_id: 300, driver_id: 11, fuel_type: 'Hybrid' },
    { vehicle_id: 301, driver_id: 12, fuel_type: 'Hybrid' },
    { vehicle_id: 302, driver_id: 13, fuel_type: 'Diesel' },
    { vehicle_id: 303, driver_id: 11, fuel_type: 'Diesel' },
  ],
  Trips: [
    { trip_id: 1, vehicle_id: 300, distance: 10, rating: 4 },
    { trip_id: 2, vehicle_id: 300, distance: 20, rating: 5 },
    { trip_id: 3, vehicle_id: 301, distance: 15, rating: 4 },
    { trip_id: 4, vehicle_id: 301, distance: 5, rating: 5 },
    { trip_id: 5, vehicle_id: 302, distance: 40, rating: 3 },
    { trip_id: 6, vehicle_id: 303, distance: 40, rating: 3 },
    { trip_id: 7, vehicle_id: 999, distance: 80, rating: 5 },
  ],
}

function checkFrames(trace) {
  const pyCount = python.trimEnd().split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3308 top driver per fuel type: rating, then distance, then fewest accidents', () => {
  const trace = buildTrace(sample)
  // Hybrid: Dana 4.50 over 30 km and Eli 4.50 over 20 km tie on rating, so the longer distance (Dana) wins.
  // Diesel: Dana and Fay both 3.00 over 40 km; Fay has fewer accidents, so Fay wins.
  assert.deepEqual(trace.result, [
    { fuel_type: 'Diesel', driver_id: 13, rating: 3, distance: 40 },
    { fuel_type: 'Hybrid', driver_id: 11, rating: 4.5, distance: 30 },
  ])
  checkFrames(trace)
})

test('3308 rejects a trip without a vehicle only by dropping it', () => {
  const trace = buildTrace(sample)
  assert.ok(trace.frames.some(f => f.phase === 'join' && f.message.includes('not listed')))
})

test('3308 rejects an invalid rating', () => {
  assert.throws(() => parseInput('{"Drivers":[],"Vehicles":[],"Trips":[{"trip_id":1,"vehicle_id":1,"distance":1,"rating":9}]}'))
})
