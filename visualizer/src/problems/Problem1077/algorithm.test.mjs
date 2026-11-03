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

test('1077 sample keeps every employee tied for the top experience', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { project_id: 1, employee_id: 2 },
    { project_id: 1, employee_id: 3 },
    { project_id: 2, employee_id: 2 },
  ])
})

test('1077 a project with one member keeps that member', () => {
  const trace = run('{"Project":[{"project_id":5,"employee_id":9}],"Employee":[{"employee_id":9,"experience_years":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ project_id: 5, employee_id: 9 }])
})

test('1077 rejects an employee row without experience', () => {
  assert.throws(() => parseInput('{"Project":[{"project_id":1,"employee_id":1}],"Employee":[{"employee_id":1}]}'))
})
