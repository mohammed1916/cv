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

const order = (order_id, customer_id, order_date, price) => ({ order_id, customer_id, order_date, price })

test('2474 keeps only the customer whose yearly totals rise with no gap', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ orders: [
    order(1, 1, '2019-03-01', 40), order(2, 1, '2019-07-01', 60), order(3, 1, '2020-02-01', 150), order(4, 1, '2021-05-01', 120),
    order(5, 2, '2019-01-15', 50), order(6, 2, '2020-06-01', 80), order(7, 2, '2021-09-01', 90),
    order(8, 3, '2019-04-01', 70), order(9, 3, '2021-04-01', 200), order(10, 4, '2020-08-01', 30),
  ] })))
  assert.deepEqual(trace.result, [{ customer_id: 2 }])
  assertFrames(trace)
})

test('2474 a gap year breaks the chain even when the totals rise', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ orders: [
    order(1, 5, '2019-01-01', 10), order(2, 5, '2021-01-01', 30),
  ] })))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})

test('2474 two years that rise by one step qualify', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ orders: [
    order(1, 6, '2020-01-01', 5), order(2, 6, '2021-01-01', 9),
    order(3, 7, '2020-01-01', 9), order(4, 7, '2021-01-01', 9),
  ] })))
  assert.deepEqual(trace.result, [{ customer_id: 6 }])
  assertFrames(trace)
})
