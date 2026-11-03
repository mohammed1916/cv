import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Drivers: [{ driver_id: 1, name: 'Ana' }, { driver_id: 2, name: 'Ben' }, { driver_id: 3, name: 'Cy' }],
  Trips: [
    { trip_id: 1, driver_id: 1, distance: 10, rating: 5 },
    { trip_id: 2, driver_id: 1, distance: 5, rating: 4 },
    { trip_id: 3, driver_id: 2, distance: 15, rating: 3 },
    { trip_id: 4, driver_id: 2, distance: 15, rating: 4 },
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

test('3308 ranks drivers by total distance with averages', () => {
  const trace = buildTrace(sample)
  assert.deepEqual(trace.result, [
    { rank: 1, driver_id: 2, name: 'Ben', total_distance: 30, avg_rating: 3.5 },
    { rank: 2, driver_id: 1, name: 'Ana', total_distance: 15, avg_rating: 4.5 },
  ])
  checkFrames(trace)
})

test('3308 equal distances are broken by the lower driver id', () => {
  const trace = buildTrace({
    Drivers: [{ driver_id: 5, name: 'Dee' }, { driver_id: 6, name: 'Eli' }],
    Trips: [{ trip_id: 1, driver_id: 6, distance: 8, rating: 2 }, { trip_id: 2, driver_id: 5, distance: 8, rating: 5 }],
  })
  assert.deepEqual(trace.result.map(r => [r.rank, r.driver_id]), [[1, 5], [2, 6]])
  checkFrames(trace)
})

test('3308 drivers without trips are not listed', () => {
  const trace = buildTrace({ Drivers: [{ driver_id: 9, name: 'Fay' }], Trips: [] })
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('3308 rejects a rating outside 1 to 5', () => {
  assert.throws(() => parseInput('{"Drivers":[],"Trips":[{"trip_id":1,"driver_id":1,"distance":1,"rating":0}]}'))
})
