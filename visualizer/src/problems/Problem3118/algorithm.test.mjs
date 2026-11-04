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

const SAMPLE = '{"Users":[{"user_id":1,"membership":"Premium"},{"user_id":2,"membership":"VIP"},{"user_id":3,"membership":"Standard"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":1126},{"user_id":2,"purchase_date":"2023-11-10","amount_spend":7473},{"user_id":3,"purchase_date":"2023-11-03","amount_spend":999},{"user_id":2,"purchase_date":"2023-11-24","amount_spend":14933},{"user_id":1,"purchase_date":"2023-11-24","amount_spend":5117}]}'

test('3118 sample: Premium and VIP only, every week and membership listed', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { week_of_month: 1, membership: 'Premium', total_amount: 1126 },
    { week_of_month: 1, membership: 'VIP', total_amount: 0 },
    { week_of_month: 2, membership: 'Premium', total_amount: 0 },
    { week_of_month: 2, membership: 'VIP', total_amount: 7473 },
    { week_of_month: 3, membership: 'Premium', total_amount: 0 },
    { week_of_month: 3, membership: 'VIP', total_amount: 0 },
    { week_of_month: 4, membership: 'Premium', total_amount: 5117 },
    { week_of_month: 4, membership: 'VIP', total_amount: 14933 },
  ])
})

test('3118 a Standard member and a non-Friday purchase are ignored', () => {
  const trace = run('{"Users":[{"user_id":1,"membership":"Standard"},{"user_id":2,"membership":"Premium"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":50},{"user_id":2,"purchase_date":"2023-11-04","amount_spend":70}]}')
  checkFrames(trace)
  assert.ok(trace.result.every(row => row.total_amount === 0))
})

test('3118 rejects an unknown membership', () => {
  assert.throws(() => parseInput('{"Users":[{"user_id":1,"membership":"Gold"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":5}]}'))
})
