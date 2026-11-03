import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const sample = {
  employees: [
    { emp_id: 1, name: 'Ana', salary: 900, dept: 'Eng' },
    { emp_id: 2, name: 'Bo', salary: 700, dept: 'Eng' },
    { emp_id: 3, name: 'Cy', salary: 700, dept: 'Eng' },
    { emp_id: 4, name: 'Di', salary: 500, dept: 'Ops' },
    { emp_id: 5, name: 'Ed', salary: 800, dept: 'Ops' },
    { emp_id: 6, name: 'Fay', salary: 900, dept: 'Eng' },
    { emp_id: 7, name: 'Gil', salary: 400, dept: 'Solo' },
  ],
}

test('3338 keeps the tied second-highest distinct salaries and drops single-salary departments', () => {
  const { result } = buildTrace(sample)
  assert.deepEqual(result, [
    { emp_id: 2, name: 'Bo', salary: 700, dept: 'Eng' },
    { emp_id: 3, name: 'Cy', salary: 700, dept: 'Eng' },
    { emp_id: 4, name: 'Di', salary: 500, dept: 'Ops' },
  ])
})

test('3338 a department with two employees on the top salary has no second distinct salary', () => {
  const { result } = buildTrace({ employees: [
    { emp_id: 1, name: 'A', salary: 5, dept: 'X' },
    { emp_id: 2, name: 'B', salary: 5, dept: 'X' },
  ] })
  assert.deepEqual(result, [])
})

test('3338 frame invariants hold', () => {
  const { frames } = buildTrace(sample)
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.length > 0)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})

test('3338 parseInput rejects duplicate ids and non-integer salaries', () => {
  assert.throws(() => parseInput('{"employees":[{"emp_id":1,"name":"a","salary":1,"dept":"d"},{"emp_id":1,"name":"b","salary":2,"dept":"d"}]}'))
  assert.throws(() => parseInput('{"employees":[{"emp_id":1,"name":"a","salary":1.5,"dept":"d"}]}'))
})
