import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  user_activity: [
    { user_id: 1, activity_date: '2024-01-01', activity_type: 'trial', activity_duration: 10 },
    { user_id: 1, activity_date: '2024-01-03', activity_type: 'trial', activity_duration: 20 },
    { user_id: 1, activity_date: '2024-01-10', activity_type: 'paid', activity_duration: 30 },
    { user_id: 2, activity_date: '2024-02-01', activity_type: 'trial', activity_duration: 5 },
    { user_id: 3, activity_date: '2024-03-01', activity_type: 'paid', activity_duration: 40 },
    { user_id: 3, activity_date: '2024-03-05', activity_type: 'trial', activity_duration: 8 },
    { user_id: 3, activity_date: '2024-03-09', activity_type: 'paid', activity_duration: 12 },
    { user_id: 4, activity_date: '2024-04-01', activity_type: 'trial', activity_duration: 7 },
    { user_id: 4, activity_date: '2024-04-02', activity_type: 'paid', activity_duration: 9 },
    { user_id: 4, activity_date: '2024-04-06', activity_type: 'paid', activity_duration: 11 },
  ],
})

const PHASES = ['load', 'trial', 'qualify', 'average', 'output']

function checkFrames(run) {
  const pythonCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.result))
  }
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.result.length >= previous, 'result never shrinks')
    previous = frame.result.length
  }
  assert.deepEqual(run.frames.at(-1).result, run.result)
}

test('3497 sample converts users 1, 3 and 4 with hand-computed averages', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { user_id: 1, trial_avg: 15, paid_avg: 30 },
    { user_id: 3, trial_avg: 8, paid_avg: 26 },
    { user_id: 4, trial_avg: 7, paid_avg: 10 },
  ])
  checkFrames(run)
})

test('3497 a user with only trial rows is not converted', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    user_activity: [{ user_id: 9, activity_date: '2024-05-01', activity_type: 'trial', activity_duration: 4 }],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3497 rejects malformed rows', () => {
  assert.throws(() => parseInput('{"user_activity":[{"user_id":1,"activity_date":"2024-01-01","activity_type":"browse","activity_duration":1}]}'))
  assert.throws(() => parseInput('[]'))
})
