import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = JSON.stringify({
  Project: [
    { project_id: 1, employee_id: 1, workload: 40 }, { project_id: 1, employee_id: 2, workload: 20 },
    { project_id: 1, employee_id: 3, workload: 30 }, { project_id: 2, employee_id: 1, workload: 50 },
    { project_id: 2, employee_id: 4, workload: 10 }, { project_id: 2, employee_id: 5, workload: 30 },
    { project_id: 3, employee_id: 4, workload: 40 },
  ],
  Employees: [
    { employee_id: 1, name: 'Ana', team: 'core' }, { employee_id: 2, name: 'Ben', team: 'core' },
    { employee_id: 3, name: 'Cy', team: 'core' }, { employee_id: 4, name: 'Dee', team: 'web' },
    { employee_id: 5, name: 'Eli', team: 'web' },
  ],
})

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

test('3057 keeps assignments above their team average', () => {
  // core average (40+20+30+50)/4 = 35; web average (10+30+40)/3 = 26.67.
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { employee_id: 1, name: 'Ana', project_id: 1, workload: 40 },
    { employee_id: 1, name: 'Ana', project_id: 2, workload: 50 },
    { employee_id: 4, name: 'Dee', project_id: 3, workload: 40 },
    { employee_id: 5, name: 'Eli', project_id: 2, workload: 30 },
  ])
  assertFrames(trace)
})

test('3057 equal workloads in a team give no rows', () => {
  const trace = buildTrace(parseInput('{"Project":[{"project_id":1,"employee_id":1,"workload":10},{"project_id":1,"employee_id":2,"workload":10}],"Employees":[{"employee_id":1,"name":"A","team":"x"},{"employee_id":2,"name":"B","team":"x"}]}'))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})

test('3057 rejects a negative workload', () => {
  assert.throws(() => parseInput('{"Project":[{"project_id":1,"employee_id":1,"workload":-1}],"Employees":[]}'), /workload/)
})
