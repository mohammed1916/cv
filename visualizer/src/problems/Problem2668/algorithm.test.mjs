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

const row = (employee_id, name, salary) => ({ employee_id, name, salary })

test('2668 keeps the highest salary record for each employee', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ Salary: [
    row(3, 'Cara', 2000), row(2, 'Bob', 800), row(3, 'Cara', 2600), row(1, 'Alice', 1000), row(1, 'Alice', 1500),
  ] })))
  assert.deepEqual(trace.result, [
    { employee_id: 1, name: 'Alice', salary: 1500 },
    { employee_id: 2, name: 'Bob', salary: 800 },
    { employee_id: 3, name: 'Cara', salary: 2600 },
  ])
  assertFrames(trace)
})

test('2668 a tie for the top salary keeps every row that carries it', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ Salary: [row(4, 'Dev', 900), row(4, 'Dev', 900)] })))
  assert.deepEqual(trace.result, [
    { employee_id: 4, name: 'Dev', salary: 900 },
    { employee_id: 4, name: 'Dev', salary: 900 },
  ])
  assertFrames(trace)
})

test('2668 rejects a salary that is not a positive whole number', () => {
  assert.throws(() => parseInput(JSON.stringify({ Salary: [row(1, 'Ana', -5)] })))
})
