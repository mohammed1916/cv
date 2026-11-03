import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('2793 result matches the hand-computed sample', () => {
  assert.deepEqual(run.result, [
    { passenger_id: 1, status: 'Waitlist' },
    { passenger_id: 2, status: 'Confirmed' },
    { passenger_id: 3, status: 'Confirmed' },
    { passenger_id: 4, status: 'Confirmed' },
    { passenger_id: 5, status: 'Waitlist' },
  ])
})

test('2793 rejects malformed input', () => {
  assert.throws(() => parseInput(JSON.stringify({ flights: [{ flight_id: 1, capacity: 1 }], passengers: [{ passenger_id: 9, flight_id: 1, booking_time: 'late' }] })))
})

test('2793 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})
