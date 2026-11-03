import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const SAMPLE = '{"Accounts":[{"account_id":1,"max_income":700},{"account_id":2,"max_income":500},{"account_id":3,"max_income":300},{"account_id":4,"max_income":300},{"account_id":5,"max_income":100}],"Transactions":[{"transaction_id":1,"account_id":1,"type":"Creditor","amount":800,"day":"2020-01-05"},{"transaction_id":2,"account_id":1,"type":"Creditor","amount":800,"day":"2020-02-10"},{"transaction_id":3,"account_id":1,"type":"Debtor","amount":100,"day":"2020-03-01"},{"transaction_id":4,"account_id":2,"type":"Creditor","amount":600,"day":"2020-01-20"},{"transaction_id":5,"account_id":2,"type":"Debtor","amount":600,"day":"2020-02-21"},{"transaction_id":6,"account_id":2,"type":"Creditor","amount":600,"day":"2020-03-03"},{"transaction_id":7,"account_id":3,"type":"Creditor","amount":200,"day":"2020-01-02"},{"transaction_id":8,"account_id":3,"type":"Creditor","amount":150,"day":"2020-01-09"},{"transaction_id":9,"account_id":3,"type":"Creditor","amount":100,"day":"2020-02-14"},{"transaction_id":10,"account_id":4,"type":"Creditor","amount":300,"day":"2020-01-01"},{"transaction_id":11,"account_id":4,"type":"Creditor","amount":301,"day":"2020-02-01"},{"transaction_id":12,"account_id":5,"type":"Creditor","amount":150,"day":"2020-01-30"},{"transaction_id":13,"account_id":5,"type":"Creditor","amount":200,"day":"2020-02-02"}]}'

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

test('1843 sample flags accounts 1 and 5 only', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ account_id: 1 }, { account_id: 5 }])
})

test('1843 a total exactly equal to max_income is not over the line', () => {
  const trace = buildTrace(parseInput('{"Accounts":[{"account_id":8,"max_income":300}],"Transactions":[{"transaction_id":1,"account_id":8,"type":"Creditor","amount":300,"day":"2020-04-01"},{"transaction_id":2,"account_id":8,"type":"Creditor","amount":300,"day":"2020-05-01"}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1843 rejects a day that is not a calendar date', () => {
  assert.throws(() => parseInput('{"Accounts":[{"account_id":1,"max_income":5}],"Transactions":[{"transaction_id":1,"account_id":1,"type":"Creditor","amount":9,"day":"Jan 5"}]}'))
})
