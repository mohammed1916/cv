import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

const SAMPLE = '{"Transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2025-05-01","amount":100},{"transaction_id":2,"customer_id":1,"transaction_date":"2025-05-02","amount":150},{"transaction_id":3,"customer_id":1,"transaction_date":"2025-05-03","amount":170},{"transaction_id":4,"customer_id":1,"transaction_date":"2025-05-04","amount":160},{"transaction_id":5,"customer_id":2,"transaction_date":"2025-05-01","amount":50},{"transaction_id":6,"customer_id":2,"transaction_date":"2025-05-02","amount":60},{"transaction_id":7,"customer_id":2,"transaction_date":"2025-05-04","amount":70},{"transaction_id":8,"customer_id":2,"transaction_date":"2025-05-05","amount":80},{"transaction_id":9,"customer_id":3,"transaction_date":"2025-05-10","amount":5},{"transaction_id":10,"customer_id":3,"transaction_date":"2025-05-11","amount":6},{"transaction_id":11,"customer_id":3,"transaction_date":"2025-05-12","amount":7},{"transaction_id":12,"customer_id":3,"transaction_date":"2025-05-13","amount":8},{"transaction_id":13,"customer_id":4,"transaction_date":"2025-05-02","amount":10},{"transaction_id":14,"customer_id":4,"transaction_date":"2025-05-03","amount":9},{"transaction_id":15,"customer_id":4,"transaction_date":"2025-05-04","amount":11},{"transaction_id":16,"customer_id":4,"transaction_date":"2025-05-05","amount":12}]}'

test('2701 sample keeps the three qualifying runs', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { customer_id: 1, start_date: '2025-05-01', end_date: '2025-05-03' },
    { customer_id: 3, start_date: '2025-05-10', end_date: '2025-05-13' },
    { customer_id: 4, start_date: '2025-05-03', end_date: '2025-05-05' },
  ])
})

test('2701 a gap of two days breaks a run of two', () => {
  const trace = run('{"Transactions":[{"transaction_id":1,"customer_id":5,"transaction_date":"2025-06-01","amount":1},{"transaction_id":2,"customer_id":5,"transaction_date":"2025-06-02","amount":2},{"transaction_id":3,"customer_id":5,"transaction_date":"2025-06-04","amount":3}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('2701 rejects two transactions for one customer on the same day', () => {
  assert.throws(() => parseInput('{"Transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2025-06-01","amount":1},{"transaction_id":2,"customer_id":1,"transaction_date":"2025-06-01","amount":2}]}'))
})
