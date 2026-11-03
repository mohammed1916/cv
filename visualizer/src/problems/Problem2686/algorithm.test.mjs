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

const SAMPLE = '{"Delivery":[{"delivery_id":1,"customer_id":1,"order_date":"2025-01-01","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":2,"customer_id":2,"order_date":"2025-01-01","customer_pref_delivery_date":"2025-01-01"},{"delivery_id":3,"customer_id":3,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":4,"customer_id":4,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-05"},{"delivery_id":5,"customer_id":5,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":6,"customer_id":6,"order_date":"2025-01-03","customer_pref_delivery_date":"2025-01-03"}]}'

test('2686 sample gives 50, 66.67 and 100 percent by date', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { order_date: '2025-01-01', immediate_percentage: 50 },
    { order_date: '2025-01-02', immediate_percentage: 66.67 },
    { order_date: '2025-01-03', immediate_percentage: 100 },
  ])
})

test('2686 a single scheduled order gives 0 percent', () => {
  const trace = run('{"Delivery":[{"delivery_id":1,"customer_id":1,"order_date":"2025-02-01","customer_pref_delivery_date":"2025-02-04"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ order_date: '2025-02-01', immediate_percentage: 0 }])
})

test('2686 rejects a date that is not YYYY-MM-DD', () => {
  assert.throws(() => parseInput('{"Delivery":[{"delivery_id":1,"customer_id":1,"order_date":"1/2/2025","customer_pref_delivery_date":"2025-01-02"}]}'))
})
