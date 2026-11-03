import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"Drivers":[{"driver_id":1,"join_date":"2019-12-01"},{"driver_id":2,"join_date":"2020-02-15"},{"driver_id":3,"join_date":"2020-03-31"}],"Rides":[{"ride_id":101,"user_id":7,"requested_at":"2020-01-10"},{"ride_id":102,"user_id":7,"requested_at":"2020-02-14"},{"ride_id":103,"user_id":8,"requested_at":"2020-02-20"},{"ride_id":104,"user_id":8,"requested_at":"2020-03-02"},{"ride_id":105,"user_id":9,"requested_at":"2020-03-31"},{"ride_id":106,"user_id":9,"requested_at":"2019-12-30"}],"AcceptedRides":[{"ride_id":101,"driver_id":1},{"ride_id":102,"driver_id":1},{"ride_id":103,"driver_id":2},{"ride_id":104,"driver_id":3},{"ride_id":106,"driver_id":1}]}'
const EXPECTED = [
  { month: 1, active_drivers: 1, accepted_rides: 1 },
  { month: 2, active_drivers: 2, accepted_rides: 2 },
  { month: 3, active_drivers: 3, accepted_rides: 1 },
  ...Array.from({ length: 9 }, (_, i) => ({ month: i + 4, active_drivers: 3, accepted_rides: 0 })),
]

test('1635 month rows include zeros and early drivers', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1635 frame invariants hold', () => {
  const { frames } = buildTrace(parseInput(SAMPLE))
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.split('\n').length
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.output))
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.deepEqual(frames.at(-1).output, EXPECTED)
})

test('1635 a ride with no accepted row is not counted', () => {
  const { result } = buildTrace(parseInput('{"Drivers":[],"Rides":[{"ride_id":1,"user_id":1,"requested_at":"2020-05-01"}],"AcceptedRides":[]}'))
  assert.equal(result.find(m => m.month === 5).accepted_rides, 0)
})
