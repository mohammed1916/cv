import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const emp = (id, name, manager) => `{"employee_id":${id},"employee_name":"${name}","manager_id":${manager},"salary":100}`
const run = text => buildTrace(parseInput(text))

test('3236 levels and descendant counts for a small tree', () => {
  const sample = `{"Employees":[${[
    emp(1, 'Ana', 'null'), emp(2, 'Ben', 1), emp(3, 'Cy', 1),
    emp(4, 'Di', 2), emp(5, 'Ed', 2), emp(6, 'Fay', 4),
  ].join(',')}]}`
  const trace = run(sample)
  assert.deepEqual(trace.result, [
    { employee_id: 1, employee_name: 'Ana', level: 1, subordinate_count: 5 },
    { employee_id: 2, employee_name: 'Ben', level: 2, subordinate_count: 3 },
    { employee_id: 3, employee_name: 'Cy', level: 2, subordinate_count: 0 },
    { employee_id: 4, employee_name: 'Di', level: 3, subordinate_count: 1 },
    { employee_id: 5, employee_name: 'Ed', level: 3, subordinate_count: 0 },
    { employee_id: 6, employee_name: 'Fay', level: 4, subordinate_count: 0 },
  ])
  assertFrames(trace)
})

test('3236 a lone CEO has no subordinates', () => {
  assert.deepEqual(run(`{"Employees":[${emp(9, 'Solo', 'null')}]}`).result, [
    { employee_id: 9, employee_name: 'Solo', level: 1, subordinate_count: 0 },
  ])
})

test('3236 rejects an employee who cannot reach the CEO', () => {
  assert.throws(() => parseInput(`{"Employees":[${[emp(1, 'Ana', 'null'), emp(2, 'Ben', 3), emp(3, 'Cy', 2)].join(',')}]}`))
})
