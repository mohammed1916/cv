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

const SAMPLE = '{"Sessions":[{"session_id":1,"user_id":1,"start_time":0,"end_time":10},{"session_id":2,"user_id":1,"start_time":20,"end_time":22},{"session_id":3,"user_id":1,"start_time":30,"end_time":50},{"session_id":4,"user_id":2,"start_time":0,"end_time":90},{"session_id":5,"user_id":2,"start_time":100,"end_time":130},{"session_id":6,"user_id":3,"start_time":5,"end_time":65},{"session_id":7,"user_id":3,"start_time":70,"end_time":75},{"session_id":8,"user_id":4,"start_time":0,"end_time":5}]}'

test('3060 sample keeps users with two sessions inside the 5 to 60 minute window', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1 }, { user_id: 3 }])
})

test('3060 a user with one long and one short session is dropped', () => {
  const trace = run('{"Sessions":[{"session_id":9,"user_id":9,"start_time":0,"end_time":4},{"session_id":10,"user_id":9,"start_time":10,"end_time":71}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('3060 rejects a session without its end time', () => {
  assert.throws(() => parseInput('{"Sessions":[{"session_id":1,"user_id":1,"start_time":0}]}'))
})
