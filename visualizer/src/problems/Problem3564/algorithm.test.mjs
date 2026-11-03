import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  products: [
    { product_id: 1, category: 'shoes', price: 50 },
    { product_id: 2, category: 'hats', price: 20 },
    { product_id: 3, category: 'bags', price: 30 },
    { product_id: 4, category: 'socks', price: 15 },
  ],
  sales: [
    { sale_id: 1, product_id: 1, sale_date: '2024-01-15', quantity: 2 },
    { sale_id: 2, product_id: 2, sale_date: '2024-02-10', quantity: 3 },
    { sale_id: 3, product_id: 3, sale_date: '2024-03-05', quantity: 1 },
    { sale_id: 4, product_id: 2, sale_date: '2024-07-20', quantity: 1 },
    { sale_id: 5, product_id: 1, sale_date: '2024-08-01', quantity: 1 },
    { sale_id: 6, product_id: 3, sale_date: '2024-08-30', quantity: 2 },
    { sale_id: 7, product_id: 2, sale_date: '2024-10-02', quantity: 2 },
    { sale_id: 8, product_id: 1, sale_date: '2024-11-11', quantity: 3 },
    { sale_id: 9, product_id: 3, sale_date: '2024-12-24', quantity: 2 },
    { sale_id: 10, product_id: 4, sale_date: '2024-04-09', quantity: 2 },
  ],
})

const PHASES = ['load', 'join', 'season', 'total', 'pick', 'output']

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

test('3564 sample picks the leading category per season, with the spring tie going to bags', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { season: 'Winter', category: 'shoes', revenue: 100 },
    { season: 'Spring', category: 'bags', revenue: 30 },
    { season: 'Summer', category: 'bags', revenue: 60 },
    { season: 'Autumn', category: 'shoes', revenue: 150 },
  ])
  checkFrames(run)
})

test('3564 a single season with one sale reports that sale', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    products: [{ product_id: 1, category: 'mugs', price: 7 }],
    sales: [{ sale_id: 1, product_id: 1, sale_date: '2023-06-01', quantity: 4 }],
  })))
  assert.deepEqual(run.result, [{ season: 'Summer', category: 'mugs', revenue: 28 }])
  checkFrames(run)
})

test('3564 rejects a sale with an unknown product', () => {
  assert.throws(() => parseInput('{"products":[],"sales":[{"sale_id":1,"product_id":5,"sale_date":"2024-01-01","quantity":1}]}'))
})
