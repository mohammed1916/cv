import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const run = text => buildTrace(parseInput(text))
const pythonLineCount = python.split('\n').length

function checkFrames(result) {
  const phaseIds = new Set(phases.map(phase => phase.id))
  assert.ok(result.frames.length > 0)
  for (const frame of result.frames) {
    assert.ok(phaseIds.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLineCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.deepEqual(result.frames.at(-1).rows, result.result)
}

const sample = '{"employees":[{"employee_id":1,"manager_id":null},{"employee_id":2,"manager_id":1},{"employee_id":3,"manager_id":2},{"employee_id":4,"manager_id":1},{"employee_id":5,"manager_id":3},{"employee_id":6,"manager_id":4},{"employee_id":7,"manager_id":null},{"employee_id":8,"manager_id":7}]}'

test('1270 sample reports match the hand computation', () => {
  const result = run(sample)
  assert.deepEqual(result.result, [
    { employee_id: 2 }, { employee_id: 3 }, { employee_id: 4 }, { employee_id: 5 }, { employee_id: 6 },
  ])
  checkFrames(result)
})

test('1270 employees under another manager are excluded', () => {
  const result = run(sample)
  assert.ok(!result.result.some(row => row.employee_id === 7 || row.employee_id === 8))
})

test('1270 employee 1 never appears in its own report list', () => {
  const result = run('{"employees":[{"employee_id":1,"manager_id":null},{"employee_id":2,"manager_id":null}]}')
  assert.deepEqual(result.result, [])
  checkFrames(result)
})

test('1270 rejects a manager cycle and a self-manager', () => {
  assert.throws(() => parseInput('{"employees":[{"employee_id":1,"manager_id":2},{"employee_id":2,"manager_id":1}]}'))
  assert.throws(() => parseInput('{"employees":[{"employee_id":1,"manager_id":1}]}'))
})
