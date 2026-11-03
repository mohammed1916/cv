import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '[{"product_id":1,"store":"store1","price":95},{"product_id":1,"store":"store3","price":105},{"product_id":2,"store":"store2","price":70},{"product_id":3,"store":"store1","price":80},{"product_id":3,"store":"store2","price":85},{"product_id":3,"store":"store3","price":90}]'

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
    { product_id: 1, store1: 95, store2: null, store3: 105 },
    { product_id: 2, store1: null, store2: 70, store3: null },
    { product_id: 3, store1: 80, store2: 85, store3: 90 },
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
