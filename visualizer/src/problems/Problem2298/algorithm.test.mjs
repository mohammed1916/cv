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

test('2298 counts Saturday and Sunday apart from Monday to Friday', () => {
  const trace = run('{"Tasks":[{"task_id":1,"assignee_id":7,"submit_date":"2024-01-06"},{"task_id":2,"assignee_id":7,"submit_date":"2024-01-08"},{"task_id":3,"assignee_id":8,"submit_date":"2024-01-07"},{"task_id":4,"assignee_id":8,"submit_date":"2024-01-12"},{"task_id":5,"assignee_id":9,"submit_date":"2024-01-13"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ weekend_cnt: 3, working_cnt: 2 }])
})

test('2298 reports zero weekend tasks when all dates are weekdays', () => {
  const trace = run('{"Tasks":[{"task_id":1,"assignee_id":1,"submit_date":"2024-01-09"},{"task_id":2,"assignee_id":1,"submit_date":"2024-01-10"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ weekend_cnt: 0, working_cnt: 2 }])
})

test('2298 rejects a task without a submit_date', () => {
  assert.throws(() => parseInput('{"Tasks":[{"task_id":1,"assignee_id":1}]}'))
})
