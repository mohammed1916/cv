import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('1107 sample counts first logins inside the window only', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { login_date: '2019-04-02', user_count: 1 },
    { login_date: '2019-06-15', user_count: 2 },
    { login_date: '2019-06-30', user_count: 1 },
  ])
})

test('1107 a later login does not make an earlier first login count', () => {
  const trace = run('{"Traffic":[{"user_id":1,"activity":"login","activity_date":"2019-03-01"},{"user_id":1,"activity":"login","activity_date":"2019-05-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1107 rejects a traffic row without an activity', () => {
  assert.throws(() => parseInput('{"Traffic":[{"user_id":1,"activity_date":"2019-03-01"}]}'))
})
