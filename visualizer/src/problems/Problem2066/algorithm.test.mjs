import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)

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

const sample = '{"Transactions":[{"account_id":1,"day":5,"type":"Deposit","amount":50},{"account_id":2,"day":3,"type":"Deposit","amount":200},{"account_id":1,"day":1,"type":"Deposit","amount":100},{"account_id":2,"day":4,"type":"Withdraw","amount":80},{"account_id":1,"day":2,"type":"Withdraw","amount":30}]}'

test('2066 sample accumulates each account in day order', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { account_id: 1, day: 1, balance: 100 },
    { account_id: 1, day: 2, balance: 70 },
    { account_id: 1, day: 5, balance: 120 },
    { account_id: 2, day: 3, balance: 200 },
    { account_id: 2, day: 4, balance: 120 },
  ])
})

test('2066 a withdrawal can leave an account at zero', () => {
  const trace = buildTrace(parseInput('{"Transactions":[{"account_id":7,"day":1,"type":"Deposit","amount":40},{"account_id":7,"day":2,"type":"Withdraw","amount":40}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result.at(-1), { account_id: 7, day: 2, balance: 0 })
})

test('2066 rejects an unknown transaction type', () => {
  assert.throws(() => parseInput('{"Transactions":[{"account_id":1,"day":1,"type":"Refund","amount":5}]}'))
})
