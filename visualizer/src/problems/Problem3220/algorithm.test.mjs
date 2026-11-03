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

const run = text => buildTrace(parseInput(text))

test('3220 sums odd and even amounts per date with zero for a missing side', () => {
  const trace = run('{"transactions":[{"transaction_id":1,"amount":3,"transaction_date":"2023-11-01"},{"transaction_id":2,"amount":4,"transaction_date":"2023-11-01"},{"transaction_id":3,"amount":10,"transaction_date":"2023-11-01"},{"transaction_id":4,"amount":7,"transaction_date":"2023-11-02"},{"transaction_id":5,"amount":8,"transaction_date":"2023-11-03"},{"transaction_id":6,"amount":2,"transaction_date":"2023-11-03"}]}')
  assert.deepEqual(trace.result, [
    { transaction_date: '2023-11-01', odd_sum: 3, even_sum: 14 },
    { transaction_date: '2023-11-02', odd_sum: 7, even_sum: 0 },
    { transaction_date: '2023-11-03', odd_sum: 0, even_sum: 10 },
  ])
  assertFrames(trace)
})

test('3220 zero counts as even', () => {
  assert.deepEqual(run('{"transactions":[{"transaction_id":1,"amount":0,"transaction_date":"2024-01-01"}]}').result, [
    { transaction_date: '2024-01-01', odd_sum: 0, even_sum: 0 },
  ])
})

test('3220 rejects a negative amount', () => {
  assert.throws(() => parseInput('{"transactions":[{"transaction_id":1,"amount":-2,"transaction_date":"2024-01-01"}]}'))
})
