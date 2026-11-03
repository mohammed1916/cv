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

const sample = '{"prices":[{"product_id":1,"start_date":"2019-02-17","end_date":"2019-02-28","price":5},{"product_id":1,"start_date":"2019-03-01","end_date":"2019-03-22","price":20},{"product_id":2,"start_date":"2019-02-01","end_date":"2019-02-20","price":15},{"product_id":2,"start_date":"2019-02-21","end_date":"2019-03-31","price":30},{"product_id":3,"start_date":"2019-01-01","end_date":"2019-12-31","price":99}],"units_sold":[{"product_id":1,"purchase_date":"2019-02-25","units":100},{"product_id":1,"purchase_date":"2019-03-01","units":15},{"product_id":2,"purchase_date":"2019-02-10","units":200},{"product_id":2,"purchase_date":"2019-02-28","units":30}]}'

test('1251 sample averages match the hand computation', () => {
  const result = run(sample)
  // Product 1: (100*5 + 15*20) / 115 = 800 / 115 = 6.96. Product 2: (200*15 + 30*30) / 230 = 3900 / 230 = 16.96.
  assert.deepEqual(result.result, [
    { product_id: 1, average_price: 6.96 },
    { product_id: 2, average_price: 16.96 },
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
