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

const row = (user_id, session_start, session_end, session_id, session_type) => ({ user_id, session_start, session_end, session_id, session_type })
const SAMPLE = JSON.stringify({ Sessions: [
  row(101, '2023-11-01 08:00:00', '2023-11-01 09:00:00', 1, 'Viewer'),
  row(101, '2023-11-01 10:00:00', '2023-11-01 11:00:00', 2, 'Streamer'),
  row(102, '2023-11-01 13:00:00', '2023-11-01 14:00:00', 3, 'Viewer'),
  row(102, '2023-11-01 15:00:00', '2023-11-01 16:00:00', 4, 'Viewer'),
  row(101, '2023-11-02 09:00:00', '2023-11-02 10:00:00', 5, 'Viewer'),
  row(102, '2023-11-02 12:00:00', '2023-11-02 13:00:00', 6, 'Streamer'),
  row(101, '2023-11-02 13:00:00', '2023-11-02 14:00:00', 7, 'Streamer'),
  row(102, '2023-11-02 16:00:00', '2023-11-02 17:00:00', 8, 'Viewer'),
  row(103, '2023-11-01 08:00:00', '2023-11-01 09:00:00', 9, 'Viewer'),
  row(103, '2023-11-02 20:00:00', '2023-11-02 23:00:00', 10, 'Viewer'),
  row(103, '2023-11-03 09:00:00', '2023-11-03 10:00:00', 11, 'Viewer'),
] })

test('3060 sample: users 102 and 103 qualify, 101 has no close pair of one type', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 102 }, { user_id: 103 }])
})

test('3060 a gap of exactly 12 hours qualifies, 12 hours and one minute does not', () => {
  const ok = run(JSON.stringify({ Sessions: [row(1, '2023-01-01 00:00:00', '2023-01-01 01:00:00', 1, 'Viewer'), row(1, '2023-01-01 13:00:00', '2023-01-01 14:00:00', 2, 'Viewer')] }))
  assert.deepEqual(ok.result, [{ user_id: 1 }])
  const late = run(JSON.stringify({ Sessions: [row(2, '2023-01-01 00:00:00', '2023-01-01 01:00:00', 1, 'Viewer'), row(2, '2023-01-01 13:01:00', '2023-01-01 14:00:00', 2, 'Viewer')] }))
  assert.deepEqual(late.result, [])
  checkFrames(late)
})

test('3060 rejects an unknown session type', () => {
  assert.throws(() => parseInput(JSON.stringify({ Sessions: [row(1, '2023-01-01 00:00:00', '2023-01-01 01:00:00', 1, 'Host')] })))
})
