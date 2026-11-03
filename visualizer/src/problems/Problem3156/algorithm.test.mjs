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
  const trace = run('{"Tasks":[{"task_id":1,"employee_id":1,"start_time":1,"end_time":5},{"task_id":2,"employee_id":1,"start_time":3,"end_time":8},{"task_id":3,"employee_id":1,"start_time":8,"end_time":10},{"task_id":4,"employee_id":2,"start_time":2,"end_time":4},{"task_id":5,"employee_id":2,"start_time":4,"end_time":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { employee_id: 1, total_task_duration: 9, max_concurrent_tasks: 2 },
    { employee_id: 2, total_task_duration: 4, max_concurrent_tasks: 1 },
  ])
})

test('3156 three identical tasks cover 10 units with three running at once', () => {
  const trace = run('{"Tasks":[{"task_id":1,"employee_id":7,"start_time":0,"end_time":10},{"task_id":2,"employee_id":7,"start_time":0,"end_time":10},{"task_id":3,"employee_id":7,"start_time":0,"end_time":10}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ employee_id: 7, total_task_duration: 10, max_concurrent_tasks: 3 }])
})

test('3156 rejects a task that does not end after it starts', () => {
  assert.throws(() => parseInput('{"Tasks":[{"task_id":1,"employee_id":1,"start_time":5,"end_time":5}]}'))
})
