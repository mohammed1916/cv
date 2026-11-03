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

test('user 2 qualifies on its chronological third purchase, user 1 does not beat its 20', () => {
  const trace = run('{"Transactions":[{"user_id":1,"spend":10,"transaction_date":"2024-01-01"},{"user_id":1,"spend":20,"transaction_date":"2024-02-01"},{"user_id":1,"spend":15,"transaction_date":"2024-03-01"},{"user_id":2,"spend":5,"transaction_date":"2024-01-05"},{"user_id":2,"spend":8,"transaction_date":"2024-01-09"},{"user_id":2,"spend":30,"transaction_date":"2024-02-02"},{"user_id":2,"spend":12,"transaction_date":"2024-03-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 2, third_transaction_spend: 30, third_transaction_date: '2024-02-02' }])
})

test('a third purchase that only ties the first one is dropped and two purchases never qualify', () => {
  const trace = run('{"Transactions":[{"user_id":5,"spend":6,"transaction_date":"2024-01-01"},{"user_id":5,"spend":1,"transaction_date":"2024-01-02"},{"user_id":5,"spend":6,"transaction_date":"2024-01-03"},{"user_id":6,"spend":4,"transaction_date":"2024-01-01"},{"user_id":6,"spend":9,"transaction_date":"2024-01-02"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('rows given out of date order are numbered by date', () => {
  const trace = run('{"Transactions":[{"user_id":7,"spend":9,"transaction_date":"2024-03-03"},{"user_id":7,"spend":1,"transaction_date":"2024-03-01"},{"user_id":7,"spend":2,"transaction_date":"2024-03-02"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 7, third_transaction_spend: 9, third_transaction_date: '2024-03-03' }])
})
