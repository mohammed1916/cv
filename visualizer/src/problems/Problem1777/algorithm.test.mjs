import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '[{"product_id":7,"store":"store1","price":120},{"product_id":7,"store":"store3","price":135},{"product_id":8,"store":"store2","price":64},{"product_id":9,"store":"store1","price":88},{"product_id":9,"store":"store2","price":91},{"product_id":9,"store":"store3","price":97}]'

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('pivot puts one row per product with NULL for missing stores', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 7, store1: 120, store2: null, store3: 135 },
    { product_id: 8, store1: null, store2: 64, store3: null },
    { product_id: 9, store1: 88, store2: 91, store3: 97 },
  ])
})

test('a single price fills only its own store column', () => {
  const trace = buildTrace(parseInput('[{"product_id":9,"store":"store2","price":12}]'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ product_id: 9, store1: null, store2: 12, store3: null }])
})

test('parseInput rejects an unknown store name', () => {
  assert.throws(() => parseInput('[{"product_id":1,"store":"store4","price":3}]'))
})
