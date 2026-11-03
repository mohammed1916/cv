import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const run = text => buildTrace(parseInput(text))
const pythonLineCount = python.split('\n').length

function checkFrames(result) {
  const phaseIds = new Set(phases.map(phase => phase.id))
  assert.ok(result.frames.length > 0)
  for (const frame of result.frames) {
    assert.ok(phaseIds.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLineCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.deepEqual(result.frames.at(-1).rows, result.result)
}

const sample = '{"prices":[{"product_id":1,"start_date":"2020-04-01","end_date":"2020-04-10","price":8},{"product_id":1,"start_date":"2020-04-11","end_date":"2020-04-30","price":12},{"product_id":2,"start_date":"2020-04-01","end_date":"2020-04-20","price":4},{"product_id":3,"start_date":"2020-01-01","end_date":"2020-12-31","price":99}],"units_sold":[{"product_id":1,"purchase_date":"2020-04-03","units":6},{"product_id":1,"purchase_date":"2020-04-15","units":2},{"product_id":2,"purchase_date":"2020-04-09","units":5}]}'

test('1251 sample averages match the hand computation', () => {
  const result = run(sample)
  // Product 1: (6*8 + 2*12) / 8 = 9. Product 2: 5*4 / 5 = 4. Product 3 has no sales.
  assert.deepEqual(result.result, [
    { product_id: 1, average_price: 9 },
    { product_id: 2, average_price: 4 },
    { product_id: 3, average_price: 0 },
  ])
  checkFrames(result)
})

test('1251 an inclusive boundary date uses the range that contains it', () => {
  const result = run('{"prices":[{"product_id":4,"start_date":"2020-01-01","end_date":"2020-01-01","price":7}],"units_sold":[{"product_id":4,"purchase_date":"2020-01-01","units":3}]}')
  assert.deepEqual(result.result, [{ product_id: 4, average_price: 7 }])
  checkFrames(result)
})

test('1251 weighted average is not the plain mean of prices', () => {
  const result = run('{"prices":[{"product_id":5,"start_date":"2020-01-01","end_date":"2020-01-10","price":10},{"product_id":5,"start_date":"2020-01-11","end_date":"2020-01-31","price":40}],"units_sold":[{"product_id":5,"purchase_date":"2020-01-02","units":9},{"product_id":5,"purchase_date":"2020-01-20","units":1}]}')
  // (9*10 + 1*40) / 10 = 13.00, not (10 + 40) / 2 = 25.
  assert.deepEqual(result.result, [{ product_id: 5, average_price: 13 }])
})

test('1251 rejects a sale outside every price range', () => {
  assert.throws(() => parseInput('{"prices":[{"product_id":1,"start_date":"2019-01-01","end_date":"2019-01-02","price":5}],"units_sold":[{"product_id":1,"purchase_date":"2019-02-01","units":1}]}'))
})
