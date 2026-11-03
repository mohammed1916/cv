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

const sample = '{"Sessions":[{"user_id":1,"session_start":"2024-01-01 10:00:00","session_end":"2024-01-01 11:00:00","session_id":101,"session_type":"Viewer"},{"user_id":1,"session_start":"2024-01-02 09:00:00","session_end":"2024-01-02 10:00:00","session_id":102,"session_type":"Streamer"},{"user_id":1,"session_start":"2024-01-03 09:00:00","session_end":"2024-01-03 10:00:00","session_id":103,"session_type":"Streamer"},{"user_id":2,"session_start":"2024-01-01 08:00:00","session_end":"2024-01-01 09:00:00","session_id":201,"session_type":"Streamer"},{"user_id":2,"session_start":"2024-01-04 08:00:00","session_end":"2024-01-04 09:00:00","session_id":202,"session_type":"Viewer"},{"user_id":3,"session_start":"2024-01-05 12:00:00","session_end":"2024-01-05 13:00:00","session_id":301,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-01 12:00:00","session_end":"2024-01-01 13:00:00","session_id":401,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-04 12:00:00","session_end":"2024-01-04 13:00:00","session_id":402,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-06 15:00:00","session_end":"2024-01-06 16:00:00","session_id":403,"session_type":"Streamer"},{"user_id":5,"session_start":"2024-01-02 07:00:00","session_end":"2024-01-02 08:00:00","session_id":501,"session_type":"Streamer"},{"user_id":5,"session_start":"2024-01-03 07:00:00","session_end":"2024-01-03 08:00:00","session_id":502,"session_type":"Streamer"}]}'

test('2995 sample keeps viewer-first users with later streams', () => {
  const trace = run(sample)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1, sessions_count: 2 }, { user_id: 4, sessions_count: 1 }])
})

test('2995 a viewer with only later viewer sessions is dropped', () => {
  const trace = run('{"Sessions":[{"user_id":9,"session_start":"2024-02-01 10:00:00","session_end":"2024-02-01 11:00:00","session_id":901,"session_type":"Viewer"},{"user_id":9,"session_start":"2024-02-02 10:00:00","session_end":"2024-02-02 11:00:00","session_id":902,"session_type":"Viewer"},{"user_id":8,"session_start":"2024-02-01 09:00:00","session_end":"2024-02-01 10:00:00","session_id":801,"session_type":"Viewer"},{"user_id":8,"session_start":"2024-02-03 09:00:00","session_end":"2024-02-03 10:00:00","session_id":802,"session_type":"Streamer"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 8, sessions_count: 1 }])
})

test('2995 rejects an unknown session type', () => {
  assert.throws(() => parseInput('{"Sessions":[{"user_id":1,"session_start":"2024-01-01 10:00:00","session_end":"2024-01-01 11:00:00","session_id":1,"session_type":"Host"}]}'))
})
