import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '[{"product_id":1,"store1":100,"store2":null,"store3":300},{"product_id":2,"store1":null,"store2":200,"store3":null},{"product_id":3,"store1":150,"store2":160,"store3":170}]'

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

test('sample emits six rows, skipping the NULL prices', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 1, store: 'store1', price: 100 },
    { product_id: 1, store: 'store3', price: 300 },
    { product_id: 2, store: 'store2', price: 200 },
    { product_id: 3, store: 'store1', price: 150 },
    { product_id: 3, store: 'store2', price: 160 },
    { product_id: 3, store: 'store3', price: 170 },
  ])
})

test('a product with every price NULL produces no rows', () => {
  const trace = buildTrace(parseInput('[{"product_id":4,"store1":null,"store2":null,"store3":null}]'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('parseInput rejects a missing store column', () => {
  assert.throws(() => parseInput('[{"product_id":1,"store1":5,"store2":6}]'))
})
