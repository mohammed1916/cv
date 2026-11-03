import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  product_info: [
    { product_id: 1, category: 'food' },
    { product_id: 2, category: 'toys' },
    { product_id: 3, category: 'books' },
    { product_id: 4, category: 'food' },
  ],
  product_purchases: [
    { user_id: 1, product_id: 1, quantity: 1 },
    { user_id: 1, product_id: 2, quantity: 1 },
    { user_id: 2, product_id: 1, quantity: 2 },
    { user_id: 2, product_id: 3, quantity: 1 },
    { user_id: 3, product_id: 2, quantity: 1 },
    { user_id: 3, product_id: 3, quantity: 1 },
    { user_id: 4, product_id: 4, quantity: 1 },
    { user_id: 4, product_id: 2, quantity: 3 },
    { user_id: 5, product_id: 3, quantity: 1 },
    { user_id: 5, product_id: 4, quantity: 2 },
  ],
})

const PHASES = ['load', 'join', 'user', 'pair', 'output']

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

test('3554 sample pairs books with food and food with toys', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { category1: 'books', category2: 'food', shared_users: 2 },
    { category1: 'food', category2: 'toys', shared_users: 2 },
  ])
  checkFrames(run)
})

test('3554 a category pair with one shared user is excluded', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    product_info: [{ product_id: 1, category: 'a' }, { product_id: 2, category: 'b' }],
    product_purchases: [{ user_id: 1, product_id: 1, quantity: 1 }, { user_id: 1, product_id: 2, quantity: 1 }],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3554 rejects purchases that reference an unknown product', () => {
  assert.throws(() => parseInput('{"product_info":[{"product_id":1,"category":"a"}],"product_purchases":[{"user_id":1,"product_id":9,"quantity":1}]}'))
})
