import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'positive', 'check', 'pair', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3586 sample pairs each patient and sorts by gap', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { patient_id: 1, patient_name: 'Ana', recovery_days: 4 },
    { patient_id: 2, patient_name: 'Ben', recovery_days: 7 },
  ])
  checkFrames(run.frames)
})

test('3586 a negative before the first positive does not count', () => {
  const input = {
    patients: [{ patient_id: 9, patient_name: 'Eli' }],
    covid_tests: [
      { test_id: 1, patient_id: 9, test_date: '2024-01-01', result: 'Negative' },
      { test_id: 2, patient_id: 9, test_date: '2024-01-03', result: 'Positive' },
    ],
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3586 rejects a test with an unknown result', () => {
  assert.throws(() => parseInput('{"patients":[],"covid_tests":[{"test_id":1,"patient_id":1,"test_date":"2024-01-01","result":"Maybe"}]}'))
})
