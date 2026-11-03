import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const ev = (hall_id, start_day, end_day) => ({ hall_id, start_day, end_day })

test('2494 merges shared days within a hall and keeps touching ranges apart', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ HallEvents: [
    ev(1, 1, 4), ev(1, 2, 3), ev(1, 6, 8), ev(1, 8, 10),
    ev(2, 1, 2), ev(2, 3, 5),
    ev(3, 7, 7),
  ] })))
  assert.deepEqual(trace.result, [
    { hall_id: 1, start_day: 1, end_day: 4 },
    { hall_id: 1, start_day: 6, end_day: 10 },
    { hall_id: 2, start_day: 1, end_day: 2 },
    { hall_id: 2, start_day: 3, end_day: 5 },
    { hall_id: 3, start_day: 7, end_day: 7 },
  ])
  assertFrames(trace)
})

test('2494 a range inside another range does not extend it', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ HallEvents: [ev(4, 2, 9), ev(4, 4, 5)] })))
  assert.deepEqual(trace.result, [{ hall_id: 4, start_day: 2, end_day: 9 }])
  assertFrames(trace)
})

test('2494 rejects a range that ends before it starts', () => {
  assert.throws(() => parseInput(JSON.stringify({ HallEvents: [ev(1, 5, 3)] })))
})
