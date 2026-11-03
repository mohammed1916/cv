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

const SAMPLE = '{"Steps":[{"user_id":1,"steps_count":100,"steps_date":"2026-01-01"},{"user_id":1,"steps_count":200,"steps_date":"2026-01-02"},{"user_id":1,"steps_count":300,"steps_date":"2026-01-03"},{"user_id":1,"steps_count":400,"steps_date":"2026-01-05"},{"user_id":2,"steps_count":50,"steps_date":"2026-01-02"},{"user_id":2,"steps_count":75,"steps_date":"2026-01-03"},{"user_id":2,"steps_count":101,"steps_date":"2026-01-04"},{"user_id":3,"steps_count":10,"steps_date":"2026-01-10"}]}'
const run = text => buildTrace(parseInput(text))

test('2854 averages each complete three-day window and rounds to two decimals', () => {
  assert.deepEqual(run(SAMPLE).result, [
    { user_id: 1, steps_date: '2026-01-03', average_steps: 200 },
    { user_id: 2, steps_date: '2026-01-04', average_steps: 75.33 },
  ])
  assertFrames(run(SAMPLE))
})

test('2854 returns nothing when every window has a missing day', () => {
  const gaps = '{"Steps":[{"user_id":1,"steps_count":5,"steps_date":"2026-01-01"},{"user_id":1,"steps_count":6,"steps_date":"2026-01-03"},{"user_id":1,"steps_count":7,"steps_date":"2026-01-05"}]}'
  assert.deepEqual(run(gaps).result, [])
  assertFrames(run(gaps))
})

test('2854 rejects a repeated user and date', () => {
  assert.throws(() => parseInput('{"Steps":[{"user_id":1,"steps_count":5,"steps_date":"2026-01-01"},{"user_id":1,"steps_count":6,"steps_date":"2026-01-01"}]}'))
})
