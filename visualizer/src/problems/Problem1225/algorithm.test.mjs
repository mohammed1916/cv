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

const sample = '{"failed":[{"fail_date":"2018-12-31"},{"fail_date":"2019-01-01"},{"fail_date":"2019-01-02"},{"fail_date":"2019-01-05"}],"succeeded":[{"success_date":"2019-01-03"},{"success_date":"2019-01-04"},{"success_date":"2019-01-06"},{"success_date":"2019-02-01"}]}'

test('1225 sample periods match the hand computation', () => {
  const result = run(sample)
  assert.deepEqual(result.result, [
    { period_state: 'failed', start_date: '2019-01-01', end_date: '2019-01-02' },
    { period_state: 'succeeded', start_date: '2019-01-03', end_date: '2019-01-04' },
    { period_state: 'failed', start_date: '2019-01-05', end_date: '2019-01-05' },
    { period_state: 'succeeded', start_date: '2019-01-06', end_date: '2019-01-06' },
    { period_state: 'succeeded', start_date: '2019-02-01', end_date: '2019-02-01' },
  ])
  checkFrames(result)
})

test('1225 periods cover exactly the 2019 dates, each once', () => {
  const result = run(sample)
  const days = result.result.reduce((sum, row) => {
    const span = (Date.parse(`${row.end_date}T00:00:00Z`) - Date.parse(`${row.start_date}T00:00:00Z`)) / 86400000 + 1
    return sum + span
  }, 0)
  assert.equal(days, 7)
})

test('1225 a single missing day separates two runs of the same state', () => {
  const result = run('{"failed":[{"fail_date":"2019-03-01"},{"fail_date":"2019-03-03"}],"succeeded":[]}')
  assert.equal(result.result.length, 2)
  checkFrames(result)
})

test('1225 rejects a date recorded with two outcomes', () => {
  assert.throws(() => parseInput('{"failed":[{"fail_date":"2019-01-01"}],"succeeded":[{"success_date":"2019-01-01"}]}'))
})
