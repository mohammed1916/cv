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

const SAMPLE = '{"Employees":[{"employee_id":1,"needed_hours":1},{"employee_id":2,"needed_hours":1},{"employee_id":3,"needed_hours":1}],"Logs":[{"employee_id":1,"in_time":0,"out_time":50},{"employee_id":1,"in_time":100,"out_time":190},{"employee_id":2,"in_time":0,"out_time":3599}]}'

test('2394 sample: rounding up makes employee 2 reach 60 minutes', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  // Employee 1: ceil(50/60)=1 and ceil(90/60)=2, total 3 < 60 kept.
  // Employee 2: ceil(3599/60)=60, not below 60, dropped.
  // Employee 3: no logs, total 0 < 60 kept.
  assert.deepEqual(trace.result, [{ employee_id: 1 }, { employee_id: 3 }])
})

test('2394 two one-second sessions round to two minutes', () => {
  const trace = run('{"Employees":[{"employee_id":5,"needed_hours":1}],"Logs":[{"employee_id":5,"in_time":0,"out_time":1},{"employee_id":5,"in_time":10,"out_time":11}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ employee_id: 5 }])
})

test('2394 zero required hours drops an employee with no logs', () => {
  const trace = run('{"Employees":[{"employee_id":7,"needed_hours":0}],"Logs":[]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})
