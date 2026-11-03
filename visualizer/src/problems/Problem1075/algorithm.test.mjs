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

test('1075 sample averages and rounds each project', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { project_id: 5, average_years: '6.50' },
    { project_id: 6, average_years: '3.33' },
    { project_id: 7, average_years: '7.50' },
  ])
})

test('1075 two-decimal rounding of a repeating average', () => {
  const trace = run('{"Project":[{"project_id":9,"employee_id":1},{"project_id":9,"employee_id":2},{"project_id":9,"employee_id":3}],"Employee":[{"employee_id":1,"experience_years":1},{"employee_id":2,"experience_years":1},{"employee_id":3,"experience_years":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ project_id: 9, average_years: '1.33' }])
})

test('1075 rejects an employee row without experience', () => {
  assert.throws(() => parseInput('{"Project":[{"project_id":1,"employee_id":1}],"Employee":[{"employee_id":1}]}'))
})
