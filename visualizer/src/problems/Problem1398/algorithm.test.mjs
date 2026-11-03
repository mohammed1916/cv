import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = JSON.stringify({
  Customers: [
    { customer_id: 1, customer_name: 'Ivy' },
    { customer_id: 2, customer_name: 'Joss' },
    { customer_id: 3, customer_name: 'Kai' },
    { customer_id: 4, customer_name: 'Lou' },
    { customer_id: 5, customer_name: 'Mo' },
  ],
  Orders: [
    { order_id: 1, customer_id: 1, product_name: 'A' },
    { order_id: 2, customer_id: 2, product_name: 'A' },
    { order_id: 3, customer_id: 1, product_name: 'B' },
    { order_id: 4, customer_id: 2, product_name: 'B' },
    { order_id: 5, customer_id: 2, product_name: 'C' },
    { order_id: 6, customer_id: 1, product_name: 'A' },
    { order_id: 7, customer_id: 4, product_name: 'B' },
    { order_id: 8, customer_id: 4, product_name: 'A' },
    { order_id: 9, customer_id: 3, product_name: 'A' },
    { order_id: 10, customer_id: 4, product_name: 'D' },
  ],
})

function checkFrames(run) {
  const phaseIds = phases.map(p => p.id)
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(phaseIds.includes(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length)
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('1398 sample keeps customers with A and B but no C', () => {
  const run = buildTrace(parseInput(sample))
  assert.deepEqual(run.result, [
    { customer_id: 1, customer_name: 'Ivy' },
    { customer_id: 4, customer_name: 'Lou' },
  ])
  checkFrames(run)
})

test('1398 repeated purchases and extra products do not change qualification', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Customers: [{ customer_id: 9, customer_name: 'Zoe' }],
    Orders: [
      { order_id: 1, customer_id: 9, product_name: 'B' },
      { order_id: 2, customer_id: 9, product_name: 'B' },
      { order_id: 3, customer_id: 9, product_name: 'D' },
      { order_id: 4, customer_id: 9, product_name: 'A' },
    ],
  })))
  assert.deepEqual(run.result, [{ customer_id: 9, customer_name: 'Zoe' }])
  checkFrames(run)
})

test('1398 rejects an order for an unknown customer', () => {
  assert.throws(() => parseInput(JSON.stringify({
    Customers: [{ customer_id: 1, customer_name: 'Ivy' }],
    Orders: [{ order_id: 1, customer_id: 7, product_name: 'A' }],
  })))
})
