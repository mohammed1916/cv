import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'scan', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1731 counts direct reports and rounds the average age half up', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Employees: [
    { employee_id: 1, name: 'Ava', reports_to: null, age: 40 },
    { employee_id: 2, name: 'Ben', reports_to: 1, age: 20 },
    { employee_id: 3, name: 'Cy', reports_to: 1, age: 21 },
    { employee_id: 4, name: 'Dee', reports_to: 2, age: 30 },
    { employee_id: 5, name: 'Eli', reports_to: 2, age: 33 },
    { employee_id: 6, name: 'Fay', reports_to: null, age: 25 },
  ] })))
  // Ava: ages 20 and 21 average 20.5, which rounds to 21. Ben: 30 and 33 average 31.5, which rounds to 32.
  assert.deepEqual(run.result, [
    { employee_id: 1, name: 'Ava', reports_count: 2, average_age: 21 },
    { employee_id: 2, name: 'Ben', reports_count: 2, average_age: 32 },
  ])
  checkFrames(run)
})

test('1731 employees without direct reports are left out', () => {
  const run = buildTrace(parseInput('{"Employees":[{"employee_id":7,"name":"Gus","reports_to":null,"age":50}]}'))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1731 rejects a non-integer age', () => {
  assert.throws(() => parseInput('{"Employees":[{"employee_id":1,"name":"A","reports_to":null,"age":"30"}]}'))
})
