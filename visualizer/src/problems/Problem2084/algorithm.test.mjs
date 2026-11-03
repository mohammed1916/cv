import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sampleText } from './algorithm.js'

const ids = phases.map(phase => phase.id)

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

test('2084 sample keeps type-0 orders and type-1 orders only for customers without type 0', () => {
  const trace = buildTrace(parseInput(sampleText))
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.order_id), [1, 3, 4, 5, 6, 7])
})

test('2084 customers with only type-1 orders keep all of them', () => {
  const trace = buildTrace(parseInput('{"Orders":[{"order_id":1,"customer_id":9,"order_type":1},{"order_id":2,"customer_id":9,"order_type":1}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { order_id: 1, customer_id: 9, order_type: 1 },
    { order_id: 2, customer_id: 9, order_type: 1 },
  ])
})

test('2084 rejects an order type other than 0 or 1', () => {
  assert.throws(() => parseInput('{"Orders":[{"order_id":1,"customer_id":9,"order_type":2}]}'))
})
