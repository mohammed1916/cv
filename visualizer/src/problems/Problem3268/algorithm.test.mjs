import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  EmployeeShifts: [
    { shift_id: 1, employee_id: 7, start_time: 0, end_time: 60 },
    { shift_id: 2, employee_id: 7, start_time: 30, end_time: 90 },
    { shift_id: 3, employee_id: 7, start_time: 90, end_time: 120 },
    { shift_id: 4, employee_id: 9, start_time: 0, end_time: 10 },
    { shift_id: 5, employee_id: 9, start_time: 5, end_time: 15 },
    { shift_id: 6, employee_id: 9, start_time: 10, end_time: 20 },
    { shift_id: 7, employee_id: 3, start_time: 0, end_time: 5 },
  ],
}

function checkFrames(trace) {
  const pyCount = python.trimEnd().split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3268 peak concurrency per employee on a hand-checked sample', () => {
  const trace = buildTrace(sample)
  assert.deepEqual(trace.result, [
    { employee_id: 3, max_concurrent: 1 },
    { employee_id: 7, max_concurrent: 2 },
    { employee_id: 9, max_concurrent: 2 },
  ])
  checkFrames(trace)
})

test('3268 back-to-back shifts never count as concurrent', () => {
  const trace = buildTrace({ EmployeeShifts: [
    { shift_id: 1, employee_id: 4, start_time: 0, end_time: 5 },
    { shift_id: 2, employee_id: 4, start_time: 5, end_time: 10 },
  ] })
  assert.deepEqual(trace.result, [{ employee_id: 4, max_concurrent: 1 }])
  checkFrames(trace)
})

test('3268 rejects an empty or invalid table', () => {
  assert.throws(() => parseInput('{"EmployeeShifts":[]}'))
  assert.throws(() => parseInput('{"EmployeeShifts":[{"shift_id":1,"employee_id":1,"start_time":9,"end_time":3}]}'))
})
