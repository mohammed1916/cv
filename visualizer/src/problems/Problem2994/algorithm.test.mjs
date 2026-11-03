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

test('2994 sample totals each November Friday and keeps empty Fridays at zero', () => {
  const trace = run('{"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":50},{"user_id":2,"purchase_date":"2023-11-03","amount_spend":30},{"user_id":3,"purchase_date":"2023-11-10","amount_spend":20},{"user_id":4,"purchase_date":"2023-11-04","amount_spend":99},{"user_id":5,"purchase_date":"2023-10-27","amount_spend":70},{"user_id":6,"purchase_date":"2023-11-24","amount_spend":15},{"user_id":7,"purchase_date":"2023-11-24","amount_spend":5}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { purchase_date: '2023-11-03', week_of_month: 1, total_amount: 80 },
    { purchase_date: '2023-11-10', week_of_month: 2, total_amount: 20 },
    { purchase_date: '2023-11-17', week_of_month: 3, total_amount: 0 },
    { purchase_date: '2023-11-24', week_of_month: 4, total_amount: 20 },
  ])
})

test('2994 a single purchase on a Thursday leaves every Friday at zero', () => {
  const trace = run('{"Purchases":[{"user_id":9,"purchase_date":"2023-11-30","amount_spend":9}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.total_amount), [0, 0, 0, 0])
})

test('2994 rejects a purchase row without an amount', () => {
  assert.throws(() => parseInput('{"Purchases":[{"user_id":1,"purchase_date":"2023-11-03"}]}'))
})
