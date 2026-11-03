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

const run = text => buildTrace(parseInput(text))
const row = (id, product, spend, date) => ({ transaction_id: id, product_id: product, spend, transaction_date: date })

test('3214 pairs each product-year with the year before', () => {
  const sample = JSON.stringify({ user_transactions: [
    row(1, 1, 100, '2022-05-01'), row(2, 1, 50, '2022-08-10'), row(3, 1, 180, '2023-02-02'),
    row(4, 2, 40, '2022-01-15'), row(5, 2, 30, '2023-03-03'), row(6, 2, 10, '2023-04-04'),
    row(7, 3, 75, '2023-06-06'), row(8, 3, 60, '2024-01-01'),
    row(9, 4, 10, '2021-12-31'), row(10, 4, 5, '2023-01-01'),
  ] })
  const trace = run(sample)
  assert.deepEqual(trace.result, [
    { product_id: 1, year: 2023, current_spend: 180, prior_spend: 150, yoy_growth: 20 },
    { product_id: 2, year: 2023, current_spend: 40, prior_spend: 40, yoy_growth: 0 },
    { product_id: 3, year: 2024, current_spend: 60, prior_spend: 75, yoy_growth: -20 },
  ])
  assertFrames(trace)
})

test('3214 rounds growth to two decimals', () => {
  const trace = run('{"user_transactions":[{"transaction_id":1,"product_id":9,"spend":3,"transaction_date":"2022-01-01"},{"transaction_id":2,"product_id":9,"spend":4,"transaction_date":"2023-01-01"}]}')
  assert.equal(trace.result[0].yoy_growth, 33.33)
})

test('3214 rejects a malformed date', () => {
  assert.throws(() => parseInput('{"user_transactions":[{"transaction_id":1,"product_id":9,"spend":3,"transaction_date":"2022/01/01"}]}'))
})
