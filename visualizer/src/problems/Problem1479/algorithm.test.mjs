import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'weekday', 'pivot', 'done'])

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

const zeros = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 }

test('1479 pivots quantities into weekday columns per category', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Items: [
      { item_id: 1, item_name: 'Laptop', item_category: 'Electronics' },
      { item_id: 2, item_name: 'Pen', item_category: 'Stationery' },
      { item_id: 3, item_name: 'Desk', item_category: 'Furniture' },
      { item_id: 4, item_name: 'Phone', item_category: 'Electronics' },
    ],
    Orders: [
      { order_id: 1, customer_id: 1, order_date: '2020-06-29', item_id: 1, quantity: 2 },
      { order_id: 2, customer_id: 2, order_date: '2020-06-29', item_id: 2, quantity: 5 },
      { order_id: 3, customer_id: 1, order_date: '2020-07-04', item_id: 1, quantity: 1 },
      { order_id: 4, customer_id: 3, order_date: '2020-07-05', item_id: 3, quantity: 3 },
      { order_id: 5, customer_id: 2, order_date: '2020-06-30', item_id: 2, quantity: 4 },
    ],
  })))
  assert.deepEqual(run.result, [
    { category: 'Electronics', ...zeros, Monday: 2, Saturday: 1 },
    { category: 'Furniture', ...zeros, Sunday: 3 },
    { category: 'Stationery', ...zeros, Monday: 5, Tuesday: 4 },
  ])
  checkFrames(run)
})

test('1479 an item with no orders still yields a category row of zeros', () => {
  const run = buildTrace(parseInput('{"Items":[{"item_id":1,"item_name":"Mug","item_category":"Kitchen"}],"Orders":[]}'))
  assert.deepEqual(run.result, [{ category: 'Kitchen', ...zeros }])
  checkFrames(run)
})

test('1479 rejects an order for an unknown item', () => {
  assert.throws(() => buildTrace(parseInput('{"Items":[],"Orders":[{"order_id":1,"order_date":"2020-06-29","item_id":9,"quantity":1}]}')))
})
