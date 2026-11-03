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

test('3172 sample keeps next-day Verified actions and dedupes user 1', () => {
  const trace = run('{"Emails":[{"email_id":1,"user_id":1,"signup_date":"2024-01-01"},{"email_id":2,"user_id":2,"signup_date":"2024-01-05"},{"email_id":3,"user_id":3,"signup_date":"2024-02-10"}],"Texts":[{"text_id":1,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"},{"text_id":2,"email_id":1,"signup_action":"Not Verified","action_date":"2024-01-02"},{"text_id":3,"email_id":2,"signup_action":"Verified","action_date":"2024-01-07"},{"text_id":4,"email_id":3,"signup_action":"Verified","action_date":"2024-02-11"},{"text_id":5,"email_id":3,"signup_action":"Verified","action_date":"2024-02-12"},{"text_id":6,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1 }, { user_id: 3 }])
})

test('3172 month boundary counts as the next calendar day', () => {
  const trace = run('{"Emails":[{"email_id":4,"user_id":4,"signup_date":"2024-01-31"}],"Texts":[{"text_id":7,"email_id":4,"signup_action":"Verified","action_date":"2024-02-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 4 }])
})

test('3172 a text on the signup day or two days later is dropped', () => {
  const trace = run('{"Emails":[{"email_id":5,"user_id":5,"signup_date":"2024-03-01"}],"Texts":[{"text_id":8,"email_id":5,"signup_action":"Verified","action_date":"2024-03-01"},{"text_id":9,"email_id":5,"signup_action":"Verified","action_date":"2024-03-03"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})
