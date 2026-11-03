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

test('2346 sample ranks ties together and gives a lone student 0', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { student_id: 1, department_id: 1, percentage: 0 },
    { student_id: 2, department_id: 1, percentage: 33.33 },
    { student_id: 3, department_id: 1, percentage: 33.33 },
    { student_id: 4, department_id: 1, percentage: 100 },
    { student_id: 5, department_id: 2, percentage: 0 },
  ])
})

test('2346 a department where every mark ties gives 0 for all members', () => {
  const trace = run('{"Students":[{"student_id":8,"department_id":3,"mark":60},{"student_id":9,"department_id":3,"mark":60},{"student_id":10,"department_id":3,"mark":60}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.percentage), [0, 0, 0])
})

test('2346 rejects a student row without a mark', () => {
  assert.throws(() => parseInput('{"Students":[{"student_id":1,"department_id":1}]}'))
})
