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

const SAMPLE = '{"Users":[{"user_id":1,"membership":"basic"},{"user_id":2,"membership":"plus"},{"user_id":3,"membership":"pro"},{"user_id":4,"membership":"basic"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":20},{"user_id":1,"purchase_date":"2023-11-04","amount_spend":50},{"user_id":2,"purchase_date":"2023-11-10","amount_spend":15},{"user_id":2,"purchase_date":"2023-11-17","amount_spend":35},{"user_id":4,"purchase_date":"2023-11-24","amount_spend":5},{"user_id":3,"purchase_date":"2023-10-27","amount_spend":99},{"user_id":3,"purchase_date":"2023-12-01","amount_spend":99},{"user_id":2,"purchase_date":"2023-11-12","amount_spend":40}]}'

test('3118 sample totals only November Friday purchases per membership', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { membership: 'basic', total_spend: 25 },
    { membership: 'plus', total_spend: 50 },
    { membership: 'pro', total_spend: 0 },
  ])
})

test('3118 a membership with only non-Friday purchases still appears as zero', () => {
  const trace = run('{"Users":[{"user_id":7,"membership":"gold"}],"Purchases":[{"user_id":7,"purchase_date":"2023-11-04","amount_spend":12}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ membership: 'gold', total_spend: 0 }])
})

test('3118 rejects a purchase from a user missing in Users', () => {
  assert.throws(() => parseInput('{"Users":[{"user_id":1,"membership":"basic"}],"Purchases":[{"user_id":2,"purchase_date":"2023-11-03","amount_spend":5}]}'))
})
