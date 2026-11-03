import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  product_info: [
    { product_id: 1, category: 'books', price: 10 },
    { product_id: 2, category: 'books', price: 12 },
    { product_id: 3, category: 'toys', price: 5 },
    { product_id: 4, category: 'books', price: 8 },
  ],
  product_purchases: [
    { user_id: 1, product_id: 1, quantity: 2 },
    { user_id: 1, product_id: 2, quantity: 1 },
    { user_id: 2, product_id: 1, quantity: 1 },
    { user_id: 2, product_id: 2, quantity: 3 },
    { user_id: 3, product_id: 1, quantity: 1 },
    { user_id: 3, product_id: 3, quantity: 1 },
    { user_id: 4, product_id: 2, quantity: 1 },
    { user_id: 4, product_id: 4, quantity: 2 },
    { user_id: 5, product_id: 2, quantity: 1 },
    { user_id: 5, product_id: 4, quantity: 1 },
    { user_id: 6, product_id: 4, quantity: 0 },
  ],
})

const PHASES = ['load', 'filter', 'group', 'pair', 'output']

function checkFrames(run) {
  const pythonCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.result))
  }
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.result.length >= previous, 'result never shrinks')
    previous = frame.result.length
  }
  assert.deepEqual(run.frames.at(-1).result, run.result)
}

test('3521 sample recommends books 1 with 2 and books 2 with 4', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { product1_id: 1, product2_id: 2, customer_count: 2 },
    { product1_id: 2, product2_id: 4, customer_count: 2 },
  ])
  checkFrames(run)
})

test('3521 pairs across different categories are excluded', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    product_info: [{ product_id: 7, category: 'a', price: 1 }, { product_id: 8, category: 'b', price: 1 }],
    product_purchases: [
      { user_id: 1, product_id: 7, quantity: 1 }, { user_id: 1, product_id: 8, quantity: 1 },
      { user_id: 2, product_id: 7, quantity: 1 }, { user_id: 2, product_id: 8, quantity: 1 },
    ],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3521 rejects negative quantities', () => {
  assert.throws(() => parseInput('{"product_info":[],"product_purchases":[{"user_id":1,"product_id":1,"quantity":-1}]}'))
})
