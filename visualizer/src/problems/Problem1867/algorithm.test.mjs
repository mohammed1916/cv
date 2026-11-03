import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const solve = input => buildTrace(parseInput(JSON.stringify(input)))
const line = (order_id, product_id, quantity) => ({ order_id, product_id, quantity })

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1867 sample: order 3 is the only maximum above the best average (7)', () => {
  const trace = solve({ OrdersDetails: [line(1, 101, 5), line(1, 102, 7), line(2, 101, 3), line(2, 103, 3), line(3, 104, 4), line(3, 105, 10)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ order_id: 3 }])
})

test('1867 a single order with uneven items is compared to its own average', () => {
  const trace = solve({ OrdersDetails: [line(4, 1, 2), line(4, 2, 8)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ order_id: 4 }])
})

test('1867 uniform orders never exceed the best average', () => {
  const trace = solve({ OrdersDetails: [line(8, 1, 6), line(8, 2, 6), line(9, 1, 6), line(9, 2, 6)] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})
