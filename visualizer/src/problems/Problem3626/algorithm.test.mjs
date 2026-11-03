import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'average', 'split', 'keep', 'skip', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3626 sample: Alpha and Delta are imbalanced, Beta is not, Gamma has one product', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { store_id: 1, store_name: 'Alpha', high_stock: 1, low_stock: 5 },
    { store_id: 4, store_name: 'Delta', high_stock: 2, low_stock: 5 },
  ])
  checkFrames(run.frames)
})

test('3626 a store whose average-priced product carries all the stock is not reported', () => {
  const input = {
    stores: [{ store_id: 6, store_name: 'Zeta' }],
    inventory: [
      { store_id: 6, product_id: 1, price: 10, quantity: 0 },
      { store_id: 6, product_id: 2, price: 20, quantity: 9 },
      { store_id: 6, product_id: 3, price: 30, quantity: 0 },
    ],
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3626 rejects a product with a zero price', () => {
  assert.throws(() => parseInput('{"stores":[],"inventory":[{"store_id":1,"product_id":1,"price":0,"quantity":1}]}'))
})
