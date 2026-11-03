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

test('departments 10 and 30 tie at three staff, so both managers are returned', () => {
  const trace = run('{"Employees":[{"emp_id":1,"emp_name":"Ana","dep_id":10,"position":"Manager"},{"emp_id":2,"emp_name":"Ben","dep_id":10,"position":"Engineer"},{"emp_id":3,"emp_name":"Cy","dep_id":10,"position":"Analyst"},{"emp_id":4,"emp_name":"Dee","dep_id":20,"position":"Manager"},{"emp_id":5,"emp_name":"Eli","dep_id":20,"position":"Engineer"},{"emp_id":6,"emp_name":"Fay","dep_id":30,"position":"Manager"},{"emp_id":7,"emp_name":"Gus","dep_id":30,"position":"Analyst"},{"emp_id":8,"emp_name":"Hal","dep_id":30,"position":"Engineer"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ emp_id: 1, emp_name: 'Ana', dep_id: 10 }, { emp_id: 6, emp_name: 'Fay', dep_id: 30 }])
})

test('a largest department without a manager returns nothing', () => {
  const trace = run('{"Employees":[{"emp_id":1,"emp_name":"Ana","dep_id":10,"position":"Engineer"},{"emp_id":2,"emp_name":"Ben","dep_id":10,"position":"Analyst"},{"emp_id":3,"emp_name":"Cy","dep_id":20,"position":"Manager"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('rejects a table without its columns', () => {
  assert.throws(() => parseInput('{"Employees":[{"emp_id":1,"emp_name":"Ana","dep_id":10}]}'))
})
