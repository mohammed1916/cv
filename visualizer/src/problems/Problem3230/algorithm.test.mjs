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

const products = '"Products":[{"product_id":10,"category":"books","price":15},{"product_id":20,"category":"games","price":40},{"product_id":30,"category":"music","price":9}]'
const tx = (id, customer, product, amount) => `{"transaction_id":${id},"customer_id":${customer},"product_id":${product},"amount":${amount}}`
const run = text => buildTrace(parseInput(text))

test('3230 totals, distinct categories and favourite category per customer', () => {
  const sample = `{${products},"Transactions":[${[
    tx(1, 1, 10, 15), tx(2, 1, 10, 15), tx(3, 1, 20, 40),
    tx(4, 2, 30, 9), tx(5, 2, 20, 40), tx(6, 2, 20, 40),
    tx(7, 3, 30, 9), tx(8, 4, 10, 15), tx(9, 4, 30, 9),
  ].join(',')}]}`
  const trace = run(sample)
  assert.deepEqual(trace.result, [
    { customer_id: 1, total_spent: 70, purchase_count: 3, distinct_categories: 2, favorite_category: 'books' },
    { customer_id: 2, total_spent: 89, purchase_count: 3, distinct_categories: 2, favorite_category: 'games' },
    { customer_id: 3, total_spent: 9, purchase_count: 1, distinct_categories: 1, favorite_category: 'music' },
    { customer_id: 4, total_spent: 24, purchase_count: 2, distinct_categories: 2, favorite_category: 'books' },
  ])
  assertFrames(trace)
})

test('3230 rejects a purchase whose product is not listed', () => {
  assert.throws(() => parseInput(`{${products},"Transactions":[${tx(1, 1, 99, 5)}]}`))
})
