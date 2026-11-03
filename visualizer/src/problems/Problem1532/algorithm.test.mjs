import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'rank', 'sort', 'done'])

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

test('1532 keeps the three newest orders per customer, sorted by name and date', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Customers: [{ customer_id: 1, name: 'Alice' }, { customer_id: 2, name: 'Bob' }],
    Orders: [
      { order_id: 1, order_date: '2020-07-01', customer_id: 1, cost: 30 },
      { order_id: 2, order_date: '2020-07-10', customer_id: 1, cost: 45 },
      { order_id: 3, order_date: '2020-07-05', customer_id: 1, cost: 20 },
      { order_id: 4, order_date: '2020-06-30', customer_id: 1, cost: 15 },
      { order_id: 5, order_date: '2020-07-03', customer_id: 2, cost: 10 },
      { order_id: 6, order_date: '2020-07-03', customer_id: 2, cost: 25 },
      { order_id: 7, order_date: '2020-07-20', customer_id: 2, cost: 60 },
      { order_id: 8, order_date: '2020-07-15', customer_id: 2, cost: 35 },
    ],
  })))
  assert.deepEqual(run.result, [
    { customer_name: 'Alice', customer_id: 1, order_id: 2, order_date: '2020-07-10' },
    { customer_name: 'Alice', customer_id: 1, order_id: 3, order_date: '2020-07-05' },
    { customer_name: 'Alice', customer_id: 1, order_id: 1, order_date: '2020-07-01' },
    { customer_name: 'Bob', customer_id: 2, order_id: 7, order_date: '2020-07-20' },
    { customer_name: 'Bob', customer_id: 2, order_id: 8, order_date: '2020-07-15' },
    { customer_name: 'Bob', customer_id: 2, order_id: 6, order_date: '2020-07-03' },
  ])
  checkFrames(run)
})

test('1532 a customer with fewer than three orders keeps all of them', () => {
  const run = buildTrace(parseInput('{"Customers":[{"customer_id":3,"name":"Cy"}],"Orders":[{"order_id":9,"order_date":"2021-01-02","customer_id":3,"cost":5}]}'))
  assert.deepEqual(run.result, [{ customer_name: 'Cy', customer_id: 3, order_id: 9, order_date: '2021-01-02' }])
  checkFrames(run)
})

test('1532 rejects a malformed order date', () => {
  assert.throws(() => parseInput('{"Customers":[],"Orders":[{"order_id":1,"order_date":"07/01/2020","customer_id":1,"cost":1}]}'))
})
