import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const solve = input => buildTrace(parseInput(JSON.stringify(input)))
const emp = (employee_id, name, salary) => ({ employee_id, name, salary })

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1875 sample: salaries 100 and 200 become teams 1 and 2', () => {
  const trace = solve({ Employees: [emp(1, 'Alice', 100), emp(2, 'Bob', 200), emp(3, 'Carol', 100), emp(4, 'Dan', 300), emp(5, 'Eve', 200), emp(6, 'Frank', 400)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { employee_id: 1, name: 'Alice', salary: 100, team_id: 1 },
    { employee_id: 3, name: 'Carol', salary: 100, team_id: 1 },
    { employee_id: 2, name: 'Bob', salary: 200, team_id: 2 },
    { employee_id: 5, name: 'Eve', salary: 200, team_id: 2 },
  ])
})

test('1875 all distinct salaries leave no team', () => {
  const trace = solve({ Employees: [emp(1, 'A', 10), emp(2, 'B', 20), emp(3, 'C', 30)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1875 a single shared salary gives team 1 ordered by id', () => {
  const trace = solve({ Employees: [emp(9, 'Gus', 50), emp(4, 'Hal', 50), emp(7, 'Ivy', 60)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { employee_id: 4, name: 'Hal', salary: 50, team_id: 1 },
    { employee_id: 9, name: 'Gus', salary: 50, team_id: 1 },
  ])
})
