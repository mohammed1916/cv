import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'rate', 'pay', 'done'])

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

test('1468 applies each company rate and rounds half up', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Salaries: [
    { company_id: 1, employee_id: 1, employee_name: 'Alice', salary: 2000 },
    { company_id: 1, employee_id: 2, employee_name: 'Bob', salary: 500 },
    { company_id: 1, employee_id: 3, employee_name: 'Erin', salary: 1001 },
    { company_id: 2, employee_id: 4, employee_name: 'Carl', salary: 15000 },
    { company_id: 3, employee_id: 5, employee_name: 'Dan', salary: 900 },
  ] })))
  assert.deepEqual(run.result, [
    { company_id: 1, employee_id: 1, employee_name: 'Alice', salary: 1520 },
    { company_id: 1, employee_id: 2, employee_name: 'Bob', salary: 380 },
    { company_id: 1, employee_id: 3, employee_name: 'Erin', salary: 761 },
    { company_id: 2, employee_id: 4, employee_name: 'Carl', salary: 7650 },
    { company_id: 3, employee_id: 5, employee_name: 'Dan', salary: 900 },
  ])
  checkFrames(run)
})

test('1468 the threshold 1000 and 10000 are inclusive for the 24 percent band', () => {
  const run = buildTrace(parseInput('{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"A","salary":1000},{"company_id":2,"employee_id":2,"employee_name":"B","salary":10000},{"company_id":3,"employee_id":3,"employee_name":"C","salary":999}]}'))
  assert.deepEqual(run.result.map(row => row.salary), [760, 7600, 999])
  checkFrames(run)
})

test('1468 rejects a negative salary', () => {
  assert.throws(() => parseInput('{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"A","salary":-1}]}'))
})
