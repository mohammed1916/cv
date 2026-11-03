import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '{"Tasks":[{"task_id":1,"subtasks_count":3},{"task_id":2,"subtasks_count":2},{"task_id":3,"subtasks_count":4}],"Executed":[{"task_id":1,"subtask_id":1},{"task_id":1,"subtask_id":3},{"task_id":2,"subtask_id":1},{"task_id":2,"subtask_id":2}]}'

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('sample lists the four unexecuted pairs of task 3 and the gap in task 1', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { task_id: 1, subtask_id: 2 },
    { task_id: 3, subtask_id: 1 },
    { task_id: 3, subtask_id: 2 },
    { task_id: 3, subtask_id: 3 },
    { task_id: 3, subtask_id: 4 },
  ])
})

test('a fully executed task produces no rows', () => {
  const trace = buildTrace(parseInput('{"Tasks":[{"task_id":5,"subtasks_count":2}],"Executed":[{"task_id":5,"subtask_id":2},{"task_id":5,"subtask_id":1}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('parseInput rejects an execution row without subtask_id', () => {
  assert.throws(() => parseInput('{"Tasks":[{"task_id":1,"subtasks_count":1}],"Executed":[{"task_id":1}]}'))
})
