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

test('3156 sample merges overlaps and counts touching tasks once', () => {
  const trace = run('{"Tasks":[{"task_id":1,"employee_id":1,"start_time":3600,"end_time":18000},{"task_id":2,"employee_id":1,"start_time":10800,"end_time":28800},{"task_id":3,"employee_id":1,"start_time":28800,"end_time":36000},{"task_id":4,"employee_id":2,"start_time":7200,"end_time":14400},{"task_id":5,"employee_id":2,"start_time":14400,"end_time":21600}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { employee_id: 1, total_task_hours: 9, max_concurrent_tasks: 2 },
    { employee_id: 2, total_task_hours: 4, max_concurrent_tasks: 1 },
  ])
})

test('3156 partial hours round down; three identical tasks cover 10 hours with three running at once', () => {
  const trace = run('{"Tasks":[{"task_id":1,"employee_id":7,"start_time":0,"end_time":36000},{"task_id":2,"employee_id":7,"start_time":0,"end_time":36000},{"task_id":3,"employee_id":7,"start_time":0,"end_time":36000}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ employee_id: 7, total_task_hours: 10, max_concurrent_tasks: 3 }])
})

test('3156 rejects a task that does not end after it starts', () => {
  assert.throws(() => parseInput('{"Tasks":[{"task_id":1,"employee_id":1,"start_time":18000,"end_time":18000}]}'))
})
