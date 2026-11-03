import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const products = [
  { product_id: 1, product_name: 'Pen', description: 'Blue ink 123 pack' },
  { product_id: 2, product_name: 'Mug', description: 'Holds 12 oz' },
  { product_id: 3, product_name: 'Card', description: 'Code 9876' },
  { product_id: 4, product_name: 'Lamp', description: 'Warm light, 2 bulbs' },
  { product_id: 5, product_name: 'Clip', description: 'Batch 007' },
]

test('3415 keeps products with a run of at least three digits', () => {
  assert.deepEqual(buildTrace({ products }).result, [
    { product_id: 1, product_name: 'Pen' },
    { product_id: 3, product_name: 'Card' },
    { product_id: 5, product_name: 'Clip' },
  ])
})

test('3415 digits separated by letters or spaces do not form a run', () => {
  assert.deepEqual(buildTrace({ products: [{ product_id: 9, product_name: 'X', description: '1 2 3 4' }] }).result, [])
})

test('3415 frame invariants hold', () => {
  const { frames } = buildTrace({ products })
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.length > 0)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})

test('3415 parseInput rejects a description over 60 characters', () => {
  assert.throws(() => parseInput(`{"products":[{"product_id":1,"product_name":"a","description":"${'x'.repeat(61)}"}]}`))
})
