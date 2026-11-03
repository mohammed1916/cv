import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '[{"employee_id":1,"department_id":10,"primary_flag":"N"},{"employee_id":2,"department_id":20,"primary_flag":"Y"},{"employee_id":2,"department_id":30,"primary_flag":"N"},{"employee_id":3,"department_id":40,"primary_flag":"N"},{"employee_id":3,"department_id":50,"primary_flag":"Y"},{"employee_id":4,"department_id":60,"primary_flag":"Y"}]'

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

test('sample keeps the single department of 1, the Y rows of 2 and 3, and 4', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { employee_id: 1, department_id: 10 },
    { employee_id: 2, department_id: 20 },
    { employee_id: 3, department_id: 50 },
    { employee_id: 4, department_id: 60 },
  ])
})

test('an employee with several departments and no Y is rejected', () => {
  assert.throws(() => parseInput('[{"employee_id":5,"department_id":1,"primary_flag":"N"},{"employee_id":5,"department_id":2,"primary_flag":"N"}]'))
})

test('a lone N department is kept', () => {
  const trace = buildTrace(parseInput('[{"employee_id":8,"department_id":3,"primary_flag":"N"}]'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ employee_id: 8, department_id: 3 }])
})
