import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'periods', 'compare', 'skip', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3601 sample: Dee gains 10 and Ana gains 5, Ben and Cleo are excluded', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { driver_id: 4, name: 'Dee', improvement: 10 },
    { driver_id: 1, name: 'Ana', improvement: 5 },
  ])
  checkFrames(run.frames)
})

test('3601 a driver whose efficiency falls is not reported', () => {
  const input = {
    split: '2024-07-01',
    drivers: [{ driver_id: 7, name: 'Fay' }],
    trips: [
      { trip_id: 1, driver_id: 7, trip_date: '2024-06-01', distance_km: 100, fuel_used: 5 },
      { trip_id: 2, driver_id: 7, trip_date: '2024-07-02', distance_km: 100, fuel_used: 8 },
    ],
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3601 rejects a trip with zero fuel', () => {
  assert.throws(() => parseInput('{"split":"2024-07-01","drivers":[],"trips":[{"trip_id":1,"driver_id":1,"trip_date":"2024-06-01","distance_km":10,"fuel_used":0}]}'))
})
