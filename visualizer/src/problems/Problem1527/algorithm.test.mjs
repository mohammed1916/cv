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

test('1527 matches a code that starts with DIAB1 but not one that merely contains it', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Patients: [
    { patient_id: 1, patient_name: 'Daniel', conditions: 'YFEV COUGH' },
    { patient_id: 2, patient_name: 'Alice', conditions: 'DIAB100 MYOP' },
    { patient_id: 3, patient_name: 'Bob', conditions: 'ACNE DIAB100' },
    { patient_id: 4, patient_name: 'Carol', conditions: 'MYOP DIAB1' },
    { patient_id: 5, patient_name: 'Dan', conditions: 'XDIAB1 DIAB2' },
  ] })))
  assert.deepEqual(run.result.map(row => row.patient_id), [2, 3, 4])
  checkFrames(run)
})

test('1527 a code of exactly DIAB1 matches, and DIAB2 does not', () => {
  const run = buildTrace(parseInput('{"Patients":[{"patient_id":7,"patient_name":"Eve","conditions":"DIAB1"},{"patient_id":8,"patient_name":"Finn","conditions":"DIAB2"}]}'))
  assert.deepEqual(run.result, [{ patient_id: 7, patient_name: 'Eve', conditions: 'DIAB1' }])
  checkFrames(run)
})

test('1527 rejects a non-text conditions value', () => {
  assert.throws(() => parseInput('{"Patients":[{"patient_id":1,"patient_name":"A","conditions":["DIAB1"]}]}'))
})
