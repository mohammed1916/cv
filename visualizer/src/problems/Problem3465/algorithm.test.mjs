import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function assertFrames(trace) {
  assert.ok(trace.frames.length >= 2)
  for (const frame of trace.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine > 0)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine > 0)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const SAMPLE = JSON.stringify({ products: [
  { product_id: 1, product_name: 'Lamp', description: 'Warm light, serial SN-2024-AB inside' },
  { product_id: 2, product_name: 'Desk', description: 'Old model SN-2024-ABC' },
  { product_id: 3, product_name: 'Chair', description: 'Spare part SN-1234-XY.' },
  { product_id: 4, product_name: 'Shelf', description: 'Reference xSN-1234-XY' },
  { product_id: 5, product_name: 'Stool', description: 'Batch SN-12345-AB' },
  { product_id: 6, product_name: 'Bench', description: 'Two codes: SN-0001-QQ and SN-9999-zz' },
  { product_id: 7, product_name: 'Rug', description: 'No serial here' },
] })

test('3465 sample keeps products with a standalone serial', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { product_id: 1, product_name: 'Lamp' },
    { product_id: 3, product_name: 'Chair' },
    { product_id: 6, product_name: 'Bench' },
  ])
  assertFrames(trace)
})

test('3465 boundary cases on a single row', () => {
  const one = description => solve(JSON.stringify({ products: [{ product_id: 1, product_name: 'X', description }] })).length
  assert.equal(one('SN-0000-AB'), 1)
  assert.equal(one('SN-0000-aa'), 0)
  assert.equal(one('(SN-0000-AB)'), 1)
  assert.equal(one('SN-0000-ABC'), 0)
  assert.equal(one('ASN-0000-AB'), 0)
})

test('3465 empty table is accepted', () => {
  assert.deepEqual(solve('{"products":[]}'), [])
  assert.throws(() => parseInput('{"products":[{"product_id":1,"product_name":"X"}]}'))
})
