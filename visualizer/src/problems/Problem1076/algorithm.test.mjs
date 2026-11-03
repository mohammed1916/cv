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

test('1076 sample keeps both projects tied at three employees', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ project_id: 1 }, { project_id: 4 }])
})

test('1076 a single project with the most employees is returned alone', () => {
  const trace = run('{"Project":[{"project_id":7,"employee_id":1},{"project_id":7,"employee_id":2},{"project_id":8,"employee_id":3}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ project_id: 7 }])
})

test('1076 rejects a row without an employee', () => {
  assert.throws(() => parseInput('{"Project":[{"project_id":1}]}'))
})
