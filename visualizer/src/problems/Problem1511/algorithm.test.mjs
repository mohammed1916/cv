import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'total', 'decide', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1511 keeps only customers at 100 or more in both June and July', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Customers: [{ customer_id: 1, name: 'Winston' }, { customer_id: 2, name: 'Jonathan' }, { customer_id: 3, name: 'Annabelle' }],
    Product: [{ product_id: 1, price: 50 }, { product_id: 2, price: 20 }],
    Orders: [
      { order_id: 1, customer_id: 1, product_id: 1, order_date: '2020-06-10', quantity: 2 },
      { order_id: 2, customer_id: 1, product_id: 1, order_date: '2020-07-05', quantity: 3 },
      { order_id: 3, customer_id: 2, product_id: 1, order_date: '2020-06-01', quantity: 5 },
      { order_id: 4, customer_id: 2, product_id: 1, order_date: '2020-07-20', quantity: 1 },
      { order_id: 5, customer_id: 3, product_id: 1, order_date: '2020-06-15', quantity: 1 },
      { order_id: 6, customer_id: 3, product_id: 2, order_date: '2020-06-15', quantity: 1 },
      { order_id: 7, customer_id: 3, product_id: 1, order_date: '2020-07-01', quantity: 4 },
      { order_id: 8, customer_id: 2, product_id: 1, order_date: '2020-08-01', quantity: 1 },
    ],
  })))
  assert.deepEqual(run.result, [{ customer_id: 1, name: 'Winston' }])
  checkFrames(run)
})

test('1511 exactly 100 in each month qualifies', () => {
  const run = buildTrace(parseInput('{"Customers":[{"customer_id":4,"name":"Ada"}],"Product":[{"product_id":1,"price":50}],"Orders":[{"order_id":1,"customer_id":4,"product_id":1,"order_date":"2020-06-02","quantity":2},{"order_id":2,"customer_id":4,"product_id":1,"order_date":"2020-07-02","quantity":2}]}'))
  assert.deepEqual(run.result, [{ customer_id: 4, name: 'Ada' }])
  checkFrames(run)
})

test('1511 an unknown product is rejected', () => {
  assert.throws(() => buildTrace(parseInput('{"Customers":[{"customer_id":1,"name":"A"}],"Product":[],"Orders":[{"order_id":1,"customer_id":1,"product_id":9,"order_date":"2020-06-02","quantity":1}]}')))
})
